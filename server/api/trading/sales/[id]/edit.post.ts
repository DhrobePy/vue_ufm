import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  isAdminRole, getUserActionLimit, getCreditWorkflowSettings, queuePendingRequest,
} from '~/server/utils/creditOrders'
import { postCommoditySale, restoreCommodityStock } from '~/server/utils/commodityTrading'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * POST /api/trading/sales/:id/edit — correct a posted commodity sale.
 *
 * Deliberately NOT an in-place field edit: a posted journal should never be
 * silently mutated. Instead an atomic REVERSE-OLD + RECREATE-NEW in one
 * transaction and one recycle batch — the old version stays restorable, the
 * new one is a real traceable posting. A commodity_sale_edits row records
 * the attempt (diff, reason, who) and links old→new for the timeline.
 *
 * Approval mirrors sale creation: admins apply immediately (self-decided
 * edits row); non-admins queue as request_type 'commodity_sale_edit' unless
 * within their commodity_sale cap with the approval policy off.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid sale ID' })
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const reason = String(body?.reason ?? '').trim()
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'A reason is required for every correction' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[sale]] = await conn.query<any>(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`, [id],
    )
    if (!sale) throw createError({ statusCode: 404, statusMessage: 'Sale not found' })
    if (Number(sale.amount_paid) > 0.005)
      throw createError({ statusCode: 409, statusMessage: 'This sale has payments — reverse them before correcting it' })
    const [[pendingEdit]] = await conn.query<any>(
      `SELECT id FROM commodity_sale_edits WHERE old_sale_id = ? AND status = 'pending_approval' LIMIT 1`, [id],
    )
    if (pendingEdit && !body?.is_checker_review)
      throw createError({ statusCode: 409, statusMessage: 'A correction is already pending approval on this sale' })

    const proposed = {
      customer_id:  Number(body?.customer_id ?? sale.customer_id),
      commodity_id: Number(body?.commodity_id ?? sale.commodity_id),
      branch_id:    body?.branch_id !== undefined ? (body.branch_id ? Number(body.branch_id) : null) : sale.branch_id,
      origin:       body?.origin !== undefined ? String(body.origin ?? '') : (sale.origin ?? ''),
      sale_date:    String(body?.sale_date ?? sale.sale_date).slice(0, 10),
      quantity:     Number(body?.quantity ?? sale.quantity),
      unit_price:   Number(body?.unit_price ?? sale.unit_price),
      notes:        body?.notes !== undefined ? body.notes : sale.notes,
      source_purchase_order_id: body?.source_purchase_order_id !== undefined
        ? (body.source_purchase_order_id ? Number(body.source_purchase_order_id) : null)
        : sale.source_purchase_order_id,
    }
    const newTotal = Math.round(proposed.quantity * proposed.unit_price * 100) / 100

    // Field diff for the timeline
    const diff: Record<string, { from: any; to: any }> = {}
    for (const k of Object.keys(proposed) as (keyof typeof proposed)[]) {
      const oldV = k === 'sale_date' ? String(sale[k]).slice(0, 10) : sale[k]
      if (String(oldV ?? '') !== String(proposed[k] ?? '')) diff[k] = { from: oldV, to: proposed[k] }
    }
    if (!Object.keys(diff).length)
      throw createError({ statusCode: 400, statusMessage: 'Nothing changed' })

    // ── Maker/checker gate (same policy as creating a sale) ────────────────
    if (!isAdminRole(role) && !body?.is_checker_review) {
      const { paymentRequireApproval } = await getCreditWorkflowSettings(conn)
      const saleCap = await getUserActionLimit(conn, userId, 'commodity_sale')
        ?? await getUserActionLimit(conn, userId, 'approve_order')
      const withinCap = saleCap !== null && newTotal <= saleCap
      if (paymentRequireApproval || !withinCap) {
        const [editRes] = await conn.query<any>(
          `INSERT INTO commodity_sale_edits
             (old_sale_id, old_sale_number, change_summary, reason, status, requested_by_user_id)
           VALUES (?, ?, ?, ?, 'pending_approval', ?)`,
          [id, sale.sale_number, JSON.stringify(diff), reason, userId],
        )
        const reqId = await queuePendingRequest(conn, {
          requestType: 'commodity_sale_edit',
          payload: { ...body, sale_id: id, edit_id: editRes.insertId },
          customerId: sale.customer_id,
          amount: newTotal,
          referenceLabel: `EDIT ${sale.sale_number} — ${sale.customer_name} → ৳${newTotal.toLocaleString()}`,
          requestedBy: userId,
          requestedReason: `Correction to ${sale.sale_number}: ${reason.slice(0, 120)}`,
        })
        await conn.commit()
        sendTelegram(
          `⏳ <b>Sale Correction Queued</b>\n${sale.sale_number} — ${sale.customer_name}\nRequested by ${userName}\nReason: ${reason}`,
          'orders')
        return { ok: true, queued: true, pending_request_id: reqId, message: 'Correction queued for a checker\'s approval.' }
      }
    }

    // ── Apply: reverse old + recreate new, one batch, one transaction ──────
    const batchId = await recycleBegin(conn, {
      entityType: 'commodity_sale_edit',
      label: `EDIT ${sale.sale_number} — ${sale.customer_name}`,
      customerId: sale.customer_id, userId, userName,
    })

    await recycleSnapshotBefore(conn, batchId, 'commodity_inventory', 'commodity_id', sale.commodity_id)
    await restoreCommodityStock(conn, {
      commodityId: sale.commodity_id, branchId: Number(sale.branch_id ?? 0),
      origin: sale.origin ?? '', qty: Number(sale.quantity),
    })
    if (sale.customer_ledger_id) {
      await recycleArchiveDelete(conn, batchId, 'customer_ledger', 'id', sale.customer_ledger_id)
    }
    if (sale.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', sale.journal_entry_id)
      await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', sale.journal_entry_id)
    }
    await recycleArchiveDelete(conn, batchId, 'commodity_sales', 'id', id)

    const result = await postCommoditySale(conn, {
      customerId: proposed.customer_id, commodityId: proposed.commodity_id,
      branchId: proposed.branch_id, origin: proposed.origin, saleDate: proposed.sale_date,
      quantity: proposed.quantity, unitPrice: proposed.unit_price,
      stockOverride: true, // correction reposts must never be blocked by a transient stock dip
      sourcePurchaseOrderId: proposed.source_purchase_order_id, notes: proposed.notes, userId,
    })
    await recycleFinalize(conn, batchId)

    // Rebuild BOTH customers' cached balances when the customer changed
    for (const cid of new Set([sale.customer_id, proposed.customer_id])) {
      const [[bal]] = await conn.query<any>(
        `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS b FROM customer_ledger WHERE customer_id = ?`, [cid],
      )
      await conn.query(`UPDATE customers SET current_balance = GREATEST(0, ?) WHERE id = ?`, [Number(bal.b), cid])
    }

    // Record / resolve the edits-chain row
    if (body?.edit_id) {
      await conn.query(
        `UPDATE commodity_sale_edits
         SET status = 'approved', new_sale_id = ?, new_sale_number = ?, decided_by_user_id = ?, decided_at = NOW()
         WHERE id = ?`,
        [result.saleId, result.saleNumber, userId, Number(body.edit_id)],
      )
    } else {
      await conn.query(
        `INSERT INTO commodity_sale_edits
           (old_sale_id, old_sale_number, new_sale_id, new_sale_number, change_summary, reason,
            status, requested_by_user_id, decided_by_user_id, decided_at)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, ?, NOW())`,
        [id, sale.sale_number, result.saleId, result.saleNumber, JSON.stringify(diff), reason, userId, userId],
      )
    }

    await auditLog(conn, {
      userId, action: 'updated', module: 'trading', recordType: 'commodity_sale',
      recordId: result.saleId, referenceNumber: result.saleNumber,
      description: `Sale corrected: ${sale.sale_number} → ${result.saleNumber} (batch #${batchId}) — ${reason}`,
      severity: 'warning',
    })
    await conn.commit()
    sendTelegram(
      `✏️ <b>Commodity Sale Corrected</b>\n${sale.sale_number} → ${result.saleNumber}\n৳${result.totalAmount.toLocaleString()} · by ${userName}\nReason: ${reason}`,
      'orders')
    return { ok: true, id: result.saleId, sale_number: result.saleNumber }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'
import { restoreCommodityStock } from '~/server/utils/commodityTrading'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'
import { userCanAction } from '~/server/utils/permissions'

/**
 * DELETE /api/trading/sales/:id — recycle-bin-backed reversal of a
 * commodity sale. Blocked if any payment has been collected (reverse the
 * payments first, same precedent as credit-order deletion). Restores stock
 * into the sale's exact origin pool, archives+reverses the ledger invoice
 * row (with a balancing credit entry), archives the JE + sale row.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid sale ID' })
  const body    = await readBody(event).catch(() => ({}))
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const canDelete = ADMIN_ROLES.includes(role) || await userCanAction({
    userId, role, module: 'trading', page: 'sales', action: 'delete_sale', roleFallback: ADMIN_ROLES,
  })
  if (!canDelete) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to delete commodity sales' })

  const reason = String(body?.reason ?? '').trim()
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'A reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[sale]] = await conn.query<any>(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`, [id],
    )
    if (!sale) throw createError({ statusCode: 404, statusMessage: 'Sale not found' })
    if (Number(sale.amount_paid) > 0.005)
      throw createError({ statusCode: 409, statusMessage: 'This sale has payments recorded — reverse those first, then delete' })
    const [[pendingEdit]] = await conn.query<any>(
      `SELECT id FROM commodity_sale_edits WHERE old_sale_id = ? AND status = 'pending_approval' LIMIT 1`, [id],
    )
    if (pendingEdit) throw createError({ statusCode: 409, statusMessage: 'A correction is pending approval on this sale — decide it first' })

    const batchId = await recycleBegin(conn, {
      entityType: 'commodity_sale',
      label: `${sale.sale_number} — ${sale.customer_name} — ৳${Number(sale.total_amount).toLocaleString()}`,
      customerId: sale.customer_id, userId, userName,
    })

    // Stock back into the exact origin pool (snapshot the inventory row first)
    await recycleSnapshotBefore(conn, batchId, 'commodity_inventory', 'commodity_id', sale.commodity_id)
    await restoreCommodityStock(conn, {
      commodityId: sale.commodity_id, branchId: Number(sale.branch_id ?? 0),
      origin: sale.origin ?? '', qty: Number(sale.quantity),
    })

    // Option A (matches the Recycle Bin convention everywhere else): archive
    // the ORIGINAL ledger row + journal rather than posting a reversal entry
    // on top — archiving alone already removes the sale's effect, and a
    // reversal entry PLUS the archive would double-reverse the GL.
    if (sale.customer_ledger_id) {
      await recycleArchiveDelete(conn, batchId, 'customer_ledger', 'id', sale.customer_ledger_id)
      // Rebuild the customer's cached balance from ledger truth
      const [[bal]] = await conn.query<any>(
        `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS b FROM customer_ledger WHERE customer_id = ?`,
        [sale.customer_id],
      )
      await conn.query(`UPDATE customers SET current_balance = GREATEST(0, ?) WHERE id = ?`, [Number(bal.b), sale.customer_id])
    }

    // Archive the original JE + its lines, then the sale row itself
    if (sale.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', sale.journal_entry_id)
      await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', sale.journal_entry_id)
    }
    await recycleArchiveDelete(conn, batchId, 'commodity_sales', 'id', id)
    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId, action: 'deleted', module: 'trading', recordType: 'commodity_sale',
      recordId: id, referenceNumber: sale.sale_number,
      description: `Commodity sale ${sale.sale_number} deleted (recycle batch #${batchId}) — ${reason}`,
      severity: 'critical',
    })
    await conn.commit()
    sendTelegram(
      `🗑️ <b>Commodity Sale Deleted</b>\n${sale.sale_number} — ${sale.customer_name}\n৳${Number(sale.total_amount).toLocaleString()} · by ${userName}\nReason: ${reason}`,
      'orders')
    return { ok: true, recycle_batch_id: batchId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

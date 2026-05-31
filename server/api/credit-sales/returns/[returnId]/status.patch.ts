import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * PATCH /api/credit-sales/returns/:returnId/status
 * Body: { action: 'approve' | 'reject', notes?: string }
 * Admin / superadmin only.
 */
export default defineEventHandler(async (event) => {
  const returnId = Number(getRouterParam(event, 'returnId'))
  if (!returnId) throw createError({ statusCode: 400, statusMessage: 'Invalid return ID' })

  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required to approve returns' })
  }

  const body      = await readBody(event)
  const action    = body?.action as 'approve' | 'reject'
  const notes     = body?.notes as string | undefined
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!['approve', 'reject'].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Load the return
    const [[ret]] = await conn.query<any>(
      `SELECT r.*, o.order_number, o.customer_id
       FROM credit_order_returns r
       JOIN credit_orders o ON o.id = r.order_id
       WHERE r.id = ?`,
      [returnId],
    )
    if (!ret) throw createError({ statusCode: 404, statusMessage: 'Return not found' })

    if (ret.status !== 'pending') {
      throw createError({ statusCode: 409, statusMessage: `Return is already ${ret.status}` })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update the return record
    await conn.query(
      `UPDATE credit_order_returns
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(),
           notes = CASE WHEN ? IS NOT NULL THEN CONCAT(COALESCE(notes,''), ' | Admin note: ', ?) ELSE notes END,
           updated_at = NOW()
       WHERE id = ?`,
      [newStatus, userId, notes ?? null, notes ?? null, returnId],
    )

    if (action === 'approve') {
      const totalRetAmount = Number(ret.total_returned_amount)
      const retDate        = ret.return_date

      // ── Ledger: credit note reduces customer balance ──────────
      const [[lastLedger]] = await conn.query<any>(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [ret.customer_id],
      )
      const prevBal = Number(lastLedger?.bal ?? 0)
      const newBal  = Math.max(0, prevBal - totalRetAmount)

      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
         VALUES (?, ?, 'credit_note', 'credit_order_return', ?, ?, ?, 0, ?, ?, ?)`,
        [
          ret.customer_id, retDate, returnId, ret.return_number,
          `Goods Return Credit Note — ${ret.return_number} (Order ${ret.order_number})`,
          totalRetAmount, newBal, userId,
        ],
      )

      // ── Reduce order total_amount and balance_due ─────────────
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, ret.order_id],
      )

      // ── Reduce customer running balance ───────────────────────
      await conn.query(
        `UPDATE customers
         SET current_balance = GREATEST(0, current_balance - ?),
             updated_at = NOW()
         WHERE id = ?`,
        [totalRetAmount, ret.customer_id],
      )
    }

    // ── Workflow timeline entry ────────────────────────────
    const wfAction  = action === 'approve' ? 'return_approved' : 'return_rejected'
    const wfComment = `${action === 'approve' ? 'Approved' : 'Rejected'} return ${ret.return_number} — ৳${Number(ret.total_returned_amount).toLocaleString()}${notes ? ` | ${notes}` : ''}`
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [ret.order_id, ret.status ?? 'delivered', ret.status ?? 'delivered', wfAction, userId, wfComment],
    )

    // ── System audit log ───────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          wfAction,       // 'return_approved'→'approved', 'return_rejected'→'rejected'
      module:          'credit_sales',
      recordType:      'credit_order_return',
      recordId:        returnId,
      referenceNumber: ret.return_number,
      description:     `${action === 'approve' ? 'Approved' : 'Rejected'} return ${ret.return_number} (Order ${ret.order_number}) — ৳${Number(ret.total_returned_amount).toLocaleString()}${notes ? ` · ${notes}` : ''}`,
      severity:        action === 'approve' ? 'info' : 'warning',
      ipAddress,
    })

    await conn.commit()
    return { ok: true, status: newStatus, return_id: returnId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

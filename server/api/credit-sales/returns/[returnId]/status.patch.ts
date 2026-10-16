import { postCustomerLedger } from '~/server/utils/creditOrders'
import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { requireAction } from '~/server/utils/permissions'

/**
 * PATCH /api/credit-sales/returns/:returnId/status
 * Body: { action: 'approve' | 'reject', notes?: string }
 * Admin / superadmin, or a user explicitly granted "Approve / Reject Returns".
 */
export default defineEventHandler(async (event) => {
  const returnId = Number(getRouterParam(event, 'returnId'))
  if (!returnId) throw createError({ statusCode: 400, statusMessage: 'Invalid return ID' })

  const { userId } = await requireAction(event,
    { module: 'credit_sales', page: 'all', action: 'approve_return', roleFallback: [], explicit: true },
    'Only admin / superadmin, or a user granted "Approve / Reject Returns", may decide returns')

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
    // Maker/checker separation (spec §2.9): the person who filed the return
    // cannot be the one who approves/rejects it, even if they're admin.
    if (Number(ret.created_by_user_id) === Number(userId)) {
      throw createError({ statusCode: 403, statusMessage: 'You filed this return — a different authorised user must decide it' })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update the return record
    await conn.query(
      `UPDATE credit_order_returns
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(),
           notes = CASE WHEN ? IS NOT NULL THEN CONCAT(COALESCE(notes,''), ' | Admin note: ', ?) ELSE notes END
       WHERE id = ?`,
      [newStatus, userId, notes ?? null, notes ?? null, returnId],
    )

    if (action === 'approve') {
      const totalRetAmount = Number(ret.total_returned_amount)
      const retDate        = ret.return_date

      // ── Ledger: credit note reduces customer balance ──────────
      await postCustomerLedger(conn, {
        customerId: ret.customer_id, date: retDate, transactionType: 'credit_note',
        referenceType: 'credit_order_return', referenceId: returnId, invoiceNumber: ret.return_number,
        description: `Goods Return Credit Note — ${ret.return_number} (Order ${ret.order_number})`,
        debit: 0, credit: totalRetAmount, userId,
      })

      // ── Reduce order total_amount and balance_due ─────────────
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, ret.order_id],
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
      recordId:        ret.order_id,  // credit order id — audit page links to /credit-sales/{id}
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

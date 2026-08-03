import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole } from '~/server/utils/creditOrders'
import { postPosSale } from '~/server/utils/posSale'

/**
 * POST /api/pos/pending-approvals/:id/approve — checker approves a queued
 * POS request. Two distinct request types share this queue:
 *   - pos_exit_release: accounts+admin can approve — clears an EXISTING order.
 *   - pos_credit_sale: admin-ONLY (legacy's explicit rule) — the order was
 *     never created; approving actually POSTS the sale now from the stored
 *     payload, bypassing the credit-limit check (the approval itself is the
 *     override).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number(session.user.id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const isAdmin  = isAdminRole(role)
  if (!isAdmin && !['accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })

  const reqId = Number(getRouterParam(event, 'id'))
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[reqRow]] = await conn.query<any>(
      `SELECT * FROM credit_pending_requests WHERE id = ? AND request_type IN ('pos_exit_release', 'pos_credit_sale') FOR UPDATE`, [reqId],
    )
    if (!reqRow) throw createError({ statusCode: 404, statusMessage: 'Request not found' })
    if (reqRow.status !== 'pending') throw createError({ statusCode: 409, statusMessage: `Already ${reqRow.status}` })

    if (reqRow.request_type === 'pos_credit_sale') {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'POS credit-sale approval is admin-only' })
      const payload = JSON.parse(reqRow.payload)
      const result = await postPosSale(conn, {
        branchId: payload.branch_id ?? 1, customerId: payload.customer_id ?? null,
        items: payload.items ?? [], discount: Number(payload.discount || 0),
        paymentMethod: payload.payment_method ?? 'Cash',
        cashAmount: payload.cash_amount ?? null, creditAmount: Number(payload.credit_amount ?? 0),
        cashAccountId: payload.cash_account_id ?? null, bankAccountId: payload.bank_account_id ?? null,
        paymentReference: payload.payment_reference ?? null,
        userId: reqRow.requested_by_user_id, isAdmin: true, // admin approval is the override
      })
      await conn.query(
        `UPDATE credit_pending_requests SET status = 'approved', decided_by_user_id = ?, decided_at = NOW(), result_payment_id = ? WHERE id = ?`,
        [userId, result.orderId, reqId],
      )
      await auditLog(conn, {
        userId, action: 'approved', module: 'other', recordType: 'pos_order', recordId: result.orderId,
        referenceNumber: result.orderNumber,
        description: `POS credit sale ${result.orderNumber} approved + posted by ${userName} (over customer credit limit)`,
        severity: 'warning',
      })
      await conn.commit()
      sendTelegram(`🟢 <b>POS Credit Sale Approved</b>\n${result.orderNumber}${result.customerName ? ` — ${result.customerName}` : ''}\n৳${result.creditAmount.toLocaleString()} on credit — by ${userName}`, 'orders')
      return { ok: true, order_id: result.orderId, order_number: result.orderNumber }
    }

    // pos_exit_release — clears an existing order.
    const [[order]] = await conn.query<any>(
      `SELECT * FROM orders WHERE id = ? AND order_type = 'POS' FOR UPDATE`, [reqRow.order_id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    await conn.query(
      `UPDATE orders SET exit_status = 'cleared', exit_cleared_by_user_id = ?, exit_cleared_at = NOW() WHERE id = ?`,
      [userId, order.id],
    )
    await conn.query(
      `UPDATE credit_pending_requests SET status = 'approved', decided_by_user_id = ?, decided_at = NOW() WHERE id = ?`,
      [userId, reqId],
    )
    await auditLog(conn, {
      userId, action: 'approved', module: 'other', recordType: 'pos_order', recordId: order.id,
      referenceNumber: order.order_number,
      description: `POS exit release approved for ${order.order_number} by ${userName}`,
      severity: 'info',
    })
    await conn.commit()
    sendTelegram(`🟢 <b>POS Exit Release Approved</b>\n${order.order_number} — by ${userName}`, 'dispatch')
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

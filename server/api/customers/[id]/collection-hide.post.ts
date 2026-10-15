import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { requireAction } from '~/server/utils/permissions'

/**
 * POST /api/customers/:id/collection-hide   body: { order_id, hide: boolean, reason? }
 * Hide / recall one outstanding invoice from the Collect Payment list. Visibility only —
 * never touches money or the ledger. Admin, or a user explicitly granted "Hide / Recall Invoice".
 */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  const { userId } = await requireAction(event,
    { module: 'credit_sales', page: 'collect', action: 'hide_invoice', roleFallback: [], explicit: true },
    'Only admin, or a user granted "Hide / Recall Invoice", may do this')
  const body = await readBody(event)
  const orderId = Number(body?.order_id)
  const hide = body?.hide !== false
  const reason = String(body?.reason ?? '').trim().slice(0, 255) || null
  if (!customerId || !orderId) throw createError({ statusCode: 400, statusMessage: 'customer and order_id required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[o]] = await conn.query<any>(`SELECT id, order_number, status FROM credit_orders WHERE id = ? AND customer_id = ?`, [orderId, customerId])
    if (!o) throw createError({ statusCode: 404, statusMessage: 'Order not found for this customer' })
    if (hide) {
      await conn.query(
        `INSERT INTO credit_order_collection_hides (order_id, customer_id, hidden_by_user_id, reason) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE hidden_by_user_id = VALUES(hidden_by_user_id), hidden_at = CURRENT_TIMESTAMP, reason = VALUES(reason)`,
        [orderId, customerId, userId, reason])
    } else {
      await conn.query(`DELETE FROM credit_order_collection_hides WHERE order_id = ?`, [orderId])
    }
    const action = hide ? 'hidden_from_collection' : 'unhidden_from_collection'
    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [orderId, o.status, o.status, action, userId,
       hide ? `Hidden from Collect Payment outstanding list${reason ? ` — ${reason}` : ''}` : 'Recalled into Collect Payment outstanding list'])
    await auditLog(conn, { userId, action: 'other', module: 'credit_sales', recordType: 'credit_order', recordId: orderId,
      referenceNumber: o.order_number, description: `Order ${o.order_number} ${hide ? 'hidden from' : 'recalled into'} Collect Payment${reason ? ` — ${reason}` : ''}` })
    await conn.commit()
    return { ok: true }
  } catch (e: any) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

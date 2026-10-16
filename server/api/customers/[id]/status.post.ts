import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { requireAction } from '~/server/utils/permissions'
import { ACCOUNTS_ROLES } from '~/server/utils/creditOrders'

/**
 * POST /api/customers/:id/status  { status: 'active'|'inactive'|'blacklisted', reason }
 * A blacklisted or inactive customer cannot be given new orders. The reason is mandatory and is kept
 * as a permanent entry in the customer's notes plus the audit log.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const { userId } = await requireAction(event, { module: 'customers', page: 'list', action: 'blacklist', roleFallback: ACCOUNTS_ROLES },
    'Only Accounts / admin (or a user granted Customers → Blacklist) may change a customer\'s status')
  const body = await readBody(event)
  const status = String(body?.status ?? '')
  const reason = String(body?.reason ?? '').trim().slice(0, 500)
  if (!['active', 'inactive', 'blacklisted'].includes(status)) throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  if (reason.length < 3) throw createError({ statusCode: 400, statusMessage: 'A reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[c]] = await conn.query<any>(`SELECT id, name, status FROM customers WHERE id = ? FOR UPDATE`, [id])
    if (!c) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
    if (c.status === status) throw createError({ statusCode: 409, statusMessage: `Customer is already ${status}` })
    await conn.query(`UPDATE customers SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id])
    await conn.query(`INSERT INTO customer_notes (customer_id, note, kind, created_by_user_id) VALUES (?, ?, 'status', ?)`,
      [id, `${c.status} → ${status}: ${reason}`, userId])
    await auditLog(conn, { userId, action: 'status_changed', module: 'customers', recordType: 'customer', recordId: id, referenceNumber: c.name,
      description: `Customer ${c.name}: ${c.status} → ${status} — ${reason}`, severity: status === 'blacklisted' ? 'warning' : 'info' })
    await conn.commit()
    return { ok: true, status }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})

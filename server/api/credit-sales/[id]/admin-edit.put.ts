import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'

/**
 * Admin-only header edits (dates, priority, address, notes, delivery type).
 * Money fields are NOT editable here — those go through amendments so the
 * ledger/GL stay consistent. Old/new snapshot lands in the workflow trail.
 */
const EDITABLE = ['required_date', 'priority', 'shipping_address', 'special_instructions'] as const

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  const userId  = Number((session?.user as any)?.id ?? 0)
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[order]] = await conn.query<any>(
      `SELECT * FROM credit_orders WHERE id = ? FOR UPDATE`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const changes: Record<string, { from: any; to: any }> = {}
    const sets: string[] = []
    const params: any[] = []
    for (const f of EDITABLE) {
      if (body[f] !== undefined && String(body[f] ?? '') !== String(order[f] ?? '')) {
        changes[f] = { from: order[f], to: body[f] }
        sets.push(`${f} = ?`)
        params.push(body[f] === '' ? null : body[f])
      }
    }
    if (!sets.length) { await conn.rollback(); return { ok: true, message: 'No changes' } }

    params.push(id)
    await conn.query(`UPDATE credit_orders SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`, params)

    const summary = Object.entries(changes)
      .map(([f, c]) => `${f}: "${c.from ?? '—'}" → "${c.to ?? '—'}"`)
      .join(' · ')
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, 'admin_edit', ?, ?, NOW())`,
      [id, order.status, order.status, userId, `Admin edit — ${summary}`.slice(0, 500)],
    )
    await auditLog(conn, {
      userId, action: 'updated', module: 'credit_sales',
      recordType: 'credit_order', recordId: id, referenceNumber: order.order_number,
      description: `Admin edit on ${order.order_number}: ${summary}`,
      severity: 'warning',
    })
    await conn.commit()
    return { ok: true, changed: Object.keys(changes) }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

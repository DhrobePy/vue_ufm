import { getDb } from '~/server/utils/db'
import { getUserBranchScope, PRODUCTION_ROLES, isAdminRole, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'

/**
 * POST /api/production/requirement
 * Body: { date, branch_id, variant_id, action: 'set_in_hand'|'add_produced', qty }
 *
 * set_in_hand overwrites production_daily_stock.in_hand_qty (a physical
 * count). add_produced accumulates onto produced_qty (each call adds, it
 * doesn't overwrite). Both append an audit row to production_daily_log.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const userName = (session.user as any).display_name ?? (session.user as any).name ?? ''
  const role = ((session.user as any).role ?? '').toLowerCase()

  const allowed = isAdminRole(role) || ACCOUNTS_ROLES.includes(role) || PRODUCTION_ROLES.includes(role)
  if (!allowed) throw createError({ statusCode: 403, statusMessage: 'Production or admin role required' })

  const body = await readBody(event)
  const date       = String(body.date || '')
  const branchId   = Number(body.branch_id)
  const variantId  = Number(body.variant_id)
  const action     = String(body.action || '')
  const qty        = Number(body.qty)

  if (!date || !branchId || !variantId || !['set_in_hand', 'add_produced'].includes(action) || !Number.isFinite(qty) || qty < 0)
    throw createError({ statusCode: 400, statusMessage: 'date, branch_id, variant_id, action, qty required' })

  const conn = await getDb().getConnection()
  try {
    const scope = await getUserBranchScope(conn, userId, role)
    if (scope !== null && scope !== branchId)
      throw createError({ statusCode: 403, statusMessage: 'Not your branch' })

    await conn.beginTransaction()

    if (action === 'set_in_hand') {
      await conn.query(
        `INSERT INTO production_daily_stock (production_date, branch_id, variant_id, in_hand_qty)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE in_hand_qty = VALUES(in_hand_qty)`,
        [date, branchId, variantId, qty],
      )
    } else {
      await conn.query(
        `INSERT INTO production_daily_stock (production_date, branch_id, variant_id, produced_qty)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE produced_qty = produced_qty + VALUES(produced_qty)`,
        [date, branchId, variantId, qty],
      )
    }

    await conn.query(
      `INSERT INTO production_daily_log
         (production_date, branch_id, variant_id, event_type, qty, performed_by_user_id, performed_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, branchId, variantId, action === 'set_in_hand' ? 'in_hand_set' : 'produced_added', qty, userId, userName],
    )

    await conn.commit()
    return { success: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

import { query } from '~/server/utils/db'
import { PRODUCTION_ROLES, ADMIN_ROLES, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (![...PRODUCTION_ROLES, ...ADMIN_ROLES, ...ACCOUNTS_ROLES].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body    = await readBody(event)
  const userId  = session?.user?.id ?? 1

  const {
    order_id,
    branch_id = 1,
    scheduled_date,
    priority_order = 0,
    notes,
    target_bags = null,
    start_immediately = false,
  } = body ?? {}

  if (!order_id || !scheduled_date)
    throw createError({ statusCode: 400, statusMessage: 'order_id and scheduled_date are required' })

  // Check not already scheduled
  const existing = await query(
    `SELECT id FROM production_schedule WHERE order_id = ? AND status != 'completed' LIMIT 1`,
    [Number(order_id)],
  ) as any[]

  if (existing.length > 0)
    throw createError({ statusCode: 409, statusMessage: 'This order is already in the production schedule' })

  const status = start_immediately ? 'in_progress' : 'pending'
  const result = await query(
    `INSERT INTO production_schedule
       (order_id, branch_id, scheduled_date, status, priority_order,
        production_manager_id, notes, target_bags, production_started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${start_immediately ? 'NOW()' : 'NULL'})`,
    [
      Number(order_id),
      Number(branch_id),
      scheduled_date,
      status,
      Number(priority_order),
      userId,
      notes || null,
      target_bags ? Number(target_bags) : null,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})

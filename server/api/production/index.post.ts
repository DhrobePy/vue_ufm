import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    order_id,
    branch_id = 1,
    scheduled_date,
    priority_order = 0,
    notes,
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

  const result = await query(
    `INSERT INTO production_schedule
       (order_id, branch_id, scheduled_date, status, priority_order,
        production_manager_id, notes)
     VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
    [
      Number(order_id),
      Number(branch_id),
      scheduled_date,
      Number(priority_order),
      userId,
      notes || null,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})

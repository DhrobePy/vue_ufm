import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { status } = body

  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status))
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })

  const updates: Record<string, any> = { status }
  if (status === 'completed') updates.completed_date = new Date().toISOString().slice(0, 10)

  await query(
    `UPDATE maintenance_requests SET status = ?, completed_date = ${status === 'completed' ? 'CURDATE()' : 'completed_date'} WHERE id = ?`,
    [status, id],
  )

  // If vehicle was in repair and maintenance is completed, set back to available
  if (status === 'completed') {
    const [maint] = await query<any>(`SELECT vehicle_id FROM maintenance_requests WHERE id = ?`, [id])
    if (maint) {
      await query(
        `UPDATE fleet_vehicles SET status = 'available' WHERE id = ? AND status = 'repair'`,
        [maint.vehicle_id],
      )
    }
  }

  return { ok: true }
})

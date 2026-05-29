import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    vehicle_id,
    driver_id,
    trip_date,
    scheduled_time,
    trip_type = 'single',
    total_orders = 1,
    total_weight_kg = 0,
    route_summary,
    notes,
  } = body ?? {}

  if (!vehicle_id || !driver_id || !trip_date)
    throw createError({ statusCode: 400, statusMessage: 'vehicle_id, driver_id, and trip_date are required' })

  // Fetch vehicle capacity to compute remaining_capacity_kg
  const vehicles = await query(
    `SELECT capacity_kg FROM vehicles WHERE id = ? LIMIT 1`,
    [Number(vehicle_id)],
  ) as any[]
  const vehicleCapacityKg = Number(vehicles[0]?.capacity_kg ?? 0)
  const remainingCapacity = Math.max(0, vehicleCapacityKg - Number(total_weight_kg))

  const result = await query(
    `INSERT INTO trip_assignments
       (vehicle_id, driver_id, trip_date, scheduled_time, trip_type,
        total_orders, total_weight_kg, remaining_capacity_kg,
        route_summary, notes, status, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
    [
      Number(vehicle_id),
      Number(driver_id),
      trip_date,
      scheduled_time || null,
      trip_type,
      Number(total_orders),
      Number(total_weight_kg),
      remainingCapacity,
      route_summary || null,
      notes         || null,
      userId,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})

import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readBody(event)
  const {
    registration_no, vehicle_type, make, model, engine_no, chassis_no,
    year_of_mfg, fuel_type, ownership_type, weight_capacity_kg,
    current_odometer, status, assigned_driver_id, remarks,
  } = body ?? {}

  await query(
    `UPDATE fleet_vehicles SET
       registration_no   = ?, vehicle_type      = ?, make              = ?,
       model             = ?, engine_no         = ?, chassis_no        = ?,
       year_of_mfg       = ?, fuel_type         = ?, ownership_type    = ?,
       weight_capacity_kg = ?, current_odometer  = ?, status            = ?,
       assigned_driver_id = ?, remarks          = ?
     WHERE id = ?`,
    [
      registration_no?.trim().toUpperCase() || null,
      vehicle_type   || 'TRUCK',
      make           || null,
      model          || null,
      engine_no      || null,
      chassis_no     || null,
      year_of_mfg    || null,
      fuel_type      || 'DIESEL',
      ownership_type || 'OWNED',
      weight_capacity_kg ? Number(weight_capacity_kg) : null,
      current_odometer   ? Number(current_odometer)   : 0,
      status         || 'available',
      assigned_driver_id ? Number(assigned_driver_id) : null,
      remarks        || null,
      id,
    ],
  )

  return { ok: true }
})

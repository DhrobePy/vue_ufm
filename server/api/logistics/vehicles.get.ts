import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const vehicles = await query(
    `SELECT v.id, v.vehicle_number, v.vehicle_type, v.category,
            v.capacity_kg, v.status, v.next_service_due_date,
            d.driver_name, d.phone_number AS driver_phone
     FROM vehicles v
     LEFT JOIN drivers d ON d.assigned_vehicle_id = v.id AND d.status = 'Active'
     WHERE v.status != 'Inactive'
     ORDER BY v.vehicle_number`,
  ) as any[]

  return { vehicles }
})

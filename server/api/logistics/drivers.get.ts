import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const drivers = await query(
    `SELECT d.id, d.driver_name, d.phone_number, d.license_number, d.license_type,
            d.license_expiry_date, d.driver_type, d.status, d.rating, d.total_trips,
            d.salary, d.join_date,
            v.vehicle_number AS assigned_vehicle
     FROM drivers d
     LEFT JOIN vehicles v ON v.id = d.assigned_vehicle_id
     WHERE d.status != 'Inactive'
     ORDER BY d.driver_name`,
  ) as any[]

  const stats = {
    total:    drivers.length,
    active:   drivers.filter((d: any) => d.status === 'Active').length,
    on_leave: drivers.filter((d: any) => d.status === 'On Leave').length,
  }

  return { drivers, stats }
})

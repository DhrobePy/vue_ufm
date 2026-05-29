import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [logs, stats] = await Promise.all([
    query(
      `SELECT ml.id, ml.maintenance_date AS date, ml.maintenance_type,
              ml.description, ml.cost, ml.service_provider, ml.odometer_reading,
              ml.next_service_date, ml.invoice_number,
              v.vehicle_number AS vehicle
       FROM maintenance_logs ml
       JOIN vehicles v ON v.id = ml.vehicle_id
       ORDER BY ml.maintenance_date DESC, ml.id DESC
       LIMIT 100`,
    ) as any[],

    queryOne(
      `SELECT
         COUNT(*) AS total_logs,
         COALESCE(SUM(cost), 0) AS total_cost,
         COALESCE(SUM(CASE WHEN MONTH(maintenance_date) = MONTH(CURDATE()) THEN cost ELSE 0 END), 0) AS this_month,
         COUNT(CASE WHEN next_service_date <= CURDATE() + INTERVAL 7 DAY THEN 1 END) AS due_soon
       FROM maintenance_logs`,
    ) as any,
  ])

  return { logs, stats }
})

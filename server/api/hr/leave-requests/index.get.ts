import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const status     = q.status as string | undefined
  const employeeId = q.employeeId ? Number(q.employeeId) : null

  let sql = `
    SELECT lr.*, e.first_name, e.last_name,
           p.name AS position_name, d.name AS department_name,
           DATEDIFF(lr.end_date, lr.start_date) + 1 AS days_count
    FROM hr_leaves lr
    JOIN hr_employees e ON lr.employee_id = e.id
    LEFT JOIN hr_positions p ON e.position_id = p.id
    LEFT JOIN hr_departments d ON p.department_id = d.id
    WHERE 1=1
  `
  const params: any[] = []
  if (status)     { sql += ' AND lr.status = ?';      params.push(status) }
  if (employeeId) { sql += ' AND lr.employee_id = ?'; params.push(employeeId) }
  sql += ' ORDER BY lr.created_at DESC'

  const requests = await query(sql, params)
  return { requests }
})

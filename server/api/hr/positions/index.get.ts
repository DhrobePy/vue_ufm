import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q           = getQuery(event)
  const departmentId = q.departmentId ? Number(q.departmentId) : null

  let sql = `
    SELECT p.*, d.name AS department_name
    FROM hr_positions p
    LEFT JOIN hr_departments d ON p.department_id = d.id
    WHERE 1=1
  `
  const params: any[] = []
  if (departmentId) { sql += ' AND p.department_id = ?'; params.push(departmentId) }
  sql += ' ORDER BY d.name, p.name'

  const positions = await query(sql, params)
  return { positions }
})

import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const status     = q.status as string | undefined
  const employeeId = q.employeeId ? Number(q.employeeId) : null
  const month      = q.month as string | undefined

  let sql = `
    SELECT ot.*, e.first_name, e.last_name
    FROM hr_overtime_records ot
    JOIN hr_employees e ON ot.employee_id = e.id
    WHERE 1=1
  `
  const params: any[] = []
  if (status)     { sql += ' AND ot.status = ?';      params.push(status) }
  if (employeeId) { sql += ' AND ot.employee_id = ?'; params.push(employeeId) }
  if (month) {
    const [y, m] = month.split('-')
    sql += ' AND YEAR(ot.ot_date)=? AND MONTH(ot.ot_date)=?'
    params.push(y, m)
  }
  sql += ' ORDER BY ot.ot_date DESC LIMIT 200'

  const records = await query(sql, params)
  const settings = await queryOne('SELECT * FROM hr_overtime_settings WHERE id = 1')
  return { records, settings }
})

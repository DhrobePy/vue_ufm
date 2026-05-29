import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const date       = (q.date as string) || new Date().toISOString().slice(0, 10)
  const employeeId = q.employeeId ? Number(q.employeeId) : null
  const month      = q.month as string | undefined  // YYYY-MM
  const view       = (q.view as string) || 'daily'  // daily | employee | monthly

  // ── SINGLE EMPLOYEE HISTORY ──────────────────────────────
  if (view === 'employee' && employeeId) {
    const rows = await query(`
      SELECT a.*, e.first_name, e.last_name
      FROM hr_attendance a
      JOIN hr_employees e ON a.employee_id = e.id
      WHERE a.employee_id = ?
      ORDER BY a.date DESC
      LIMIT 90
    `, [employeeId])
    return { attendance: rows }
  }

  // ── MONTHLY SUMMARY ───────────────────────────────────────
  if (view === 'monthly' && month) {
    const [y, m] = month.split('-')
    const rows = await query(`
      SELECT a.*, e.first_name, e.last_name, e.id AS emp_id
      FROM hr_attendance a
      JOIN hr_employees e ON a.employee_id = e.id
      WHERE YEAR(a.date) = ? AND MONTH(a.date) = ?
      ORDER BY a.date DESC, e.first_name
    `, [y, m])
    return { attendance: rows }
  }

  // ── DAILY VIEW (default) ──────────────────────────────────
  const rows = await query(`
    SELECT a.*, e.first_name, e.last_name
    FROM hr_attendance a
    JOIN hr_employees e ON a.employee_id = e.id
    WHERE a.date = ?
    ORDER BY e.first_name
  `, [date])

  // All active employees so we can highlight absent ones
  const allActive = await query(`
    SELECT id, first_name, last_name, status FROM hr_employees
    WHERE status = 'active' ORDER BY first_name
  `)

  return { attendance: rows, employees: allActive, date }
})

import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const today = new Date().toISOString().slice(0, 10)
  const month = today.slice(0, 7)   // YYYY-MM
  const [y, m] = month.split('-')

  // ── Find latest date with attendance data ─────────────────────
  // Fall back gracefully when today has no records yet
  const latestAttRow = await queryOne(
    'SELECT MAX(date) AS latest FROM hr_attendance'
  ) as any
  const latestDate: string = latestAttRow?.latest?.toISOString?.()?.slice(0, 10)
    ?? latestAttRow?.latest?.toString?.()?.slice(0, 10)
    ?? today

  // Use current month if there's data, else fall back to the latest month with payroll
  const latestPayrollRow = await queryOne(
    "SELECT DATE_FORMAT(MAX(pay_period_start),'%Y-%m') AS latest FROM hr_payrolls"
  ) as any
  const payrollMonth: string = latestPayrollRow?.latest ?? month

  // ── All stats in parallel ─────────────────────────────────────
  const [
    [empRow],
    [attRow],
    [leaveRow],
    [payrollRow],
    [advRow],
    [loanRow],
    [holidayRow],
  ] = await Promise.all([
    // Employee counts
    query(`SELECT
        COUNT(*) AS total,
        SUM(status = 'active')     AS active,
        SUM(status = 'on_leave')   AS on_leave,
        SUM(status = 'terminated') AS ex_count
      FROM hr_employees`),

    // Attendance for the LATEST available date
    query(`SELECT
        COUNT(*)                   AS today_total,
        SUM(status = 'present')    AS present,
        SUM(status = 'absent')     AS absent,
        SUM(status = 'late')       AS late
      FROM hr_attendance WHERE date = ?`, [latestDate]),

    // Leaves this month
    query(`SELECT
        COUNT(*) AS total,
        SUM(status = 'pending')  AS pending,
        SUM(status = 'approved') AS approved
      FROM hr_leaves
      WHERE MONTH(start_date) = ? AND YEAR(start_date) = ?`, [m, y]),

    // Payrolls for the latest month with data
    query(`SELECT
        COUNT(*)                          AS total,
        SUM(status = 'pending_approval')  AS pending,
        SUM(status = 'approved')          AS approved,
        SUM(status = 'paid')              AS paid
      FROM hr_payrolls
      WHERE DATE_FORMAT(pay_period_start, '%Y-%m') = ?`, [payrollMonth]),

    // Advances — all-time pending/approved
    query(`SELECT
        COUNT(*)                   AS total,
        SUM(status = 'pending')    AS pending,
        SUM(status = 'approved')   AS approved,
        SUM(status = 'deducted')   AS deducted
      FROM hr_salary_advances`),

    // Active loans
    query("SELECT COUNT(*) AS total, SUM(status = 'active') AS active FROM hr_loans"),

    // Upcoming holidays (next 30 days)
    query(`SELECT COUNT(*) AS upcoming
      FROM hr_holidays
      WHERE holiday_date >= ? AND holiday_date <= DATE_ADD(?, INTERVAL 30 DAY)`,
      [today, today]),
  ]) as any[][]

  // ── Recent attendance (latest date, up to 15 rows) ────────────
  const recentAttendance = await query(`
    SELECT a.id, a.date, a.clock_in, a.clock_out, a.status,
           e.first_name, e.last_name
    FROM hr_attendance a
    JOIN hr_employees e ON a.employee_id = e.id
    WHERE a.date = ?
    ORDER BY a.clock_in DESC
    LIMIT 15
  `, [latestDate])

  // ── Upcoming approved leaves ───────────────────────────────────
  const upcomingLeaves = await query(`
    SELECT lr.id, lr.start_date, lr.end_date, lr.leave_type,
           e.first_name, e.last_name
    FROM hr_leaves lr
    JOIN hr_employees e ON lr.employee_id = e.id
    WHERE lr.status = 'approved' AND lr.end_date >= ?
    ORDER BY lr.start_date
    LIMIT 5
  `, [today])

  // ── Monthly payroll summary (last 6 months) ───────────────────
  const payrollTrend = await query(`
    SELECT
      DATE_FORMAT(pay_period_start, '%Y-%m') AS month,
      COUNT(*)                               AS emp_count,
      SUM(net_salary)                        AS total_net,
      status
    FROM hr_payrolls
    WHERE pay_period_start >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(pay_period_start, '%Y-%m'), status
    ORDER BY month DESC
  `)

  // ── Dept breakdown ────────────────────────────────────────────
  const deptBreakdown = await query(`
    SELECT d.name AS dept, COUNT(e.id) AS cnt
    FROM hr_employees e
    JOIN hr_positions p ON p.id = e.position_id
    JOIN hr_departments d ON d.id = p.department_id
    WHERE e.status = 'active'
    GROUP BY d.id, d.name
    ORDER BY cnt DESC
    LIMIT 8
  `)

  return {
    employees:         empRow,
    attendance:        attRow,
    attendance_date:   latestDate,
    leaves:            leaveRow,
    payroll:           payrollRow,
    payroll_month:     payrollMonth,
    advances:          advRow,
    loans:             loanRow,
    holidays:          holidayRow,
    recent_attendance: recentAttendance,
    upcoming_leaves:   upcomingLeaves,
    payroll_trend:     payrollTrend,
    dept_breakdown:    deptBreakdown,
  }
})

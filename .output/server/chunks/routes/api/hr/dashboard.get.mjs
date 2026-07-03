import { j as defineEventHandler, Z as queryOne, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const [y, m] = month.split("-");
  const latestAttRow = await queryOne(
    "SELECT MAX(date) AS latest FROM hr_attendance"
  );
  const latestDate = (_h = (_g = (_c = (_b = (_a = latestAttRow == null ? void 0 : latestAttRow.latest) == null ? void 0 : _a.toISOString) == null ? void 0 : _b.call(_a)) == null ? void 0 : _c.slice(0, 10)) != null ? _g : (_f = (_e = (_d = latestAttRow == null ? void 0 : latestAttRow.latest) == null ? void 0 : _d.toString) == null ? void 0 : _e.call(_d)) == null ? void 0 : _f.slice(0, 10)) != null ? _h : today;
  const latestPayrollRow = await queryOne(
    "SELECT DATE_FORMAT(MAX(pay_period_start),'%Y-%m') AS latest FROM hr_payrolls"
  );
  const payrollMonth = (_i = latestPayrollRow == null ? void 0 : latestPayrollRow.latest) != null ? _i : month;
  const [
    [empRow],
    [attRow],
    [leaveRow],
    [payrollRow],
    [advRow],
    [loanRow],
    [holidayRow]
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
    query(
      `SELECT COUNT(*) AS upcoming
      FROM hr_holidays
      WHERE holiday_date >= ? AND holiday_date <= DATE_ADD(?, INTERVAL 30 DAY)`,
      [today, today]
    )
  ]);
  const recentAttendance = await query(`
    SELECT a.id, a.date, a.clock_in, a.clock_out, a.status,
           e.first_name, e.last_name
    FROM hr_attendance a
    JOIN hr_employees e ON a.employee_id = e.id
    WHERE a.date = ?
    ORDER BY a.clock_in DESC
    LIMIT 15
  `, [latestDate]);
  const upcomingLeaves = await query(`
    SELECT lr.id, lr.start_date, lr.end_date, lr.leave_type,
           e.first_name, e.last_name
    FROM hr_leaves lr
    JOIN hr_employees e ON lr.employee_id = e.id
    WHERE lr.status = 'approved' AND lr.end_date >= ?
    ORDER BY lr.start_date
    LIMIT 5
  `, [today]);
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
  `);
  const deptBreakdown = await query(`
    SELECT d.name AS dept, COUNT(e.id) AS cnt
    FROM hr_employees e
    JOIN hr_positions p ON p.id = e.position_id
    JOIN hr_departments d ON d.id = p.department_id
    WHERE e.status = 'active'
    GROUP BY d.id, d.name
    ORDER BY cnt DESC
    LIMIT 8
  `);
  return {
    employees: empRow,
    attendance: attRow,
    attendance_date: latestDate,
    leaves: leaveRow,
    payroll: payrollRow,
    payroll_month: payrollMonth,
    advances: advRow,
    loans: loanRow,
    holidays: holidayRow,
    recent_attendance: recentAttendance,
    upcoming_leaves: upcomingLeaves,
    payroll_trend: payrollTrend,
    dept_breakdown: deptBreakdown
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map

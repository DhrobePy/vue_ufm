import { o as defineEventHandler, ac as readBody, k as createError, w as getDb, aa as queryOne } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const clockIn_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const body = await readBody(event);
  const employeeId = parseInt((_a = body.employee_id) != null ? _a : 0);
  const branchId = parseInt((_c = (_b = body.device_id) != null ? _b : body.branch_id) != null ? _c : 1);
  if (!employeeId) throw createError({ statusCode: 400, statusMessage: "employee_id required" });
  const db = getDb();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const now = /* @__PURE__ */ new Date();
  const timeOnly = now.toTimeString().slice(0, 8);
  let workStart = "09:00:00";
  let workEnd = "18:00:00";
  let lateMin = 15;
  let otThreshold = 0;
  let autoApprove = 0;
  try {
    const [settings] = await db.query(
      "SELECT name, value FROM hr_settings WHERE name IN ('work_start','work_end','late_threshold','ot_threshold')"
    );
    for (const s of settings || []) {
      if (s.name === "work_start") workStart = s.value.length === 5 ? s.value + ":00" : s.value;
      if (s.name === "work_end") workEnd = s.value.length === 5 ? s.value + ":00" : s.value;
      if (s.name === "late_threshold") lateMin = parseInt(s.value);
      if (s.name === "ot_threshold") otThreshold = parseInt(s.value);
    }
    const [otRow] = await db.query("SELECT auto_approve FROM hr_overtime_settings WHERE id=1");
    if (otRow == null ? void 0 : otRow[0]) autoApprove = parseInt(otRow[0].auto_approve);
  } catch {
  }
  try {
    await db.query(`
      INSERT IGNORE INTO hr_attendance_punches (employee_id, date, punch_time, source)
      VALUES (?, ?, ?, 'kiosk')
    `, [employeeId, today, timeOnly]);
  } catch {
  }
  let punches = [];
  let punchCount = 1;
  try {
    const [rows] = await db.query(`
      SELECT punch_time FROM hr_attendance_punches
      WHERE employee_id = ? AND date = ?
      ORDER BY punch_time ASC
    `, [employeeId, today]);
    punches = (rows || []).map((r) => r.punch_time);
    punchCount = punches.length || 1;
    if (!punches.length) punches = [timeOnly];
  } catch {
    punches = [timeOnly];
    punchCount = 1;
  }
  const earliestPunch = punches[0];
  const latestPunch = punches[punches.length - 1];
  const punchTs = (/* @__PURE__ */ new Date(`${today}T${earliestPunch}`)).getTime();
  const startTs = (/* @__PURE__ */ new Date(`${today}T${workStart}`)).getTime();
  const attStatus = punchTs > startTs + lateMin * 6e4 ? "late" : "present";
  try {
    await db.query(`
      INSERT INTO hr_attendance (employee_id, date, clock_in, clock_out, status, branch_id, manual_entry)
      VALUES (?, ?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE
        clock_in  = LEAST(clock_in, VALUES(clock_in)),
        clock_out = IF(VALUES(clock_out) IS NOT NULL AND (clock_out IS NULL OR VALUES(clock_out) > clock_out),
                       VALUES(clock_out), clock_out),
        status    = VALUES(status)
    `, [
      employeeId,
      today,
      earliestPunch,
      punchCount > 1 ? latestPunch : null,
      attStatus,
      branchId
    ]);
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: "Attendance save failed: " + e.message });
  }
  let otCreated = false;
  if (punchCount > 1) {
    const endTs = (/* @__PURE__ */ new Date(`${today}T${workEnd}`)).getTime();
    const latestTs = (/* @__PURE__ */ new Date(`${today}T${latestPunch}`)).getTime();
    const otSecs = latestTs - endTs - otThreshold * 6e4;
    if (otSecs > 6e4) {
      const otHours = Math.min(otSecs / 36e5, 4);
      let hourly = 0;
      try {
        const [empRows] = await db.query(
          "SELECT basic_salary FROM hr_employees WHERE id=?",
          [employeeId]
        );
        const salary = parseFloat(((_d = empRows == null ? void 0 : empRows[0]) == null ? void 0 : _d.basic_salary) || 0);
        if (salary > 0) hourly = salary / 26 / 8;
      } catch {
      }
      const otAmount = Math.round(hourly * 1.5 * otHours * 100) / 100;
      const otStatus = autoApprove ? "approved" : "pending";
      try {
        await db.query(`
          INSERT INTO hr_overtime_records
            (employee_id, ot_date, ot_hours, rate_type, amount, reason, status)
          VALUES (?, ?, ?, '1.5x', ?, 'Auto-detected from kiosk punch', ?)
          ON DUPLICATE KEY UPDATE
            ot_hours = VALUES(ot_hours),
            amount   = VALUES(amount)
        `, [employeeId, today, Math.round(otHours * 100) / 100, otAmount, otStatus]);
        otCreated = true;
      } catch {
      }
    }
  }
  let action;
  let message;
  if (punchCount === 1) {
    action = "clock_in";
    message = "Clocked In";
  } else {
    const endTs = (/* @__PURE__ */ new Date(`${today}T${workEnd}`)).getTime();
    const latestTs = (/* @__PURE__ */ new Date(`${today}T${latestPunch}`)).getTime();
    if (latestTs >= endTs) {
      action = "clock_out";
      message = "Clocked Out";
    } else {
      action = "returning";
      message = "Welcome Back";
    }
  }
  const emp = await queryOne(
    "SELECT CONCAT(first_name,' ',last_name) AS name FROM hr_employees WHERE id=?",
    [employeeId]
  );
  const employeeName = (emp == null ? void 0 : emp.name) || `Employee #${employeeId}`;
  return {
    success: true,
    action,
    message,
    employee_name: employeeName,
    time: `${today} ${timeOnly}`,
    punch_count: punchCount,
    clock_in: earliestPunch,
    clock_out: punchCount > 1 ? latestPunch : null,
    overtime: otCreated
  };
});

export { clockIn_post as default };
//# sourceMappingURL=clock-in.post.mjs.map

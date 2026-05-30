import { g as defineEventHandler, K as setResponseHeader, n as getMethod, o as getQuery, p as getRequestURL, I as readRawBody, m as getDb, F as queryOne } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const adms = defineEventHandler(async (event) => {
  var _a;
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  const method = getMethod(event);
  const qp = getQuery(event);
  const url = getRequestURL(event);
  const sn = String(qp.SN || qp.sn || "").trim();
  const table = String(qp.table || "").toUpperCase();
  let serialNo = sn;
  if (!serialNo && method === "POST") {
    const raw = await readRawBody(event) || "";
    const m = raw.match(/SN=([A-Za-z0-9\-_]+)/i);
    if (m) serialNo = m[1];
  }
  if (!serialNo) {
    return "ERROR: No SN";
  }
  const db = getDb();
  try {
    const pushver = qp.pushver;
    await db.query(`
      INSERT INTO hr_biometric_devices (serial_no, firmware_version, status, last_seen)
      VALUES (?, ?, 'online', NOW())
      ON DUPLICATE KEY UPDATE
        status = 'online', last_seen = NOW(),
        firmware_version = COALESCE(?, firmware_version)
    `, [serialNo, pushver || null, pushver || null]);
  } catch {
  }
  if (url.pathname.includes("getrequest") || qp.getrequest !== void 0) {
    return "";
  }
  if (method === "POST" && table === "ATTLOG") {
    const rawBody = await readRawBody(event) || "";
    const count = await processAttlog(serialNo, rawBody, db);
    if (count > 0) {
      try {
        await db.query(
          "UPDATE hr_biometric_devices SET total_records = total_records + ?, last_sync = NOW() WHERE serial_no = ?",
          [count, serialNo]
        );
      } catch {
      }
    }
    return `OK: ${count}`;
  }
  if (method === "GET") {
    let tz = 6;
    try {
      const tzRow = await queryOne("SELECT value FROM hr_settings WHERE name = 'timezone'");
      const tzMap = { "Asia/Dhaka": 6, "Asia/Karachi": 5, "Asia/Kolkata": 5, "UTC": 0 };
      if (tzRow == null ? void 0 : tzRow.value) tz = (_a = tzMap[tzRow.value]) != null ? _a : 6;
    } catch {
    }
    return [
      `GET OPTION FROM: ${serialNo}`,
      "ATTLOGStamp=0",
      "OperLogStamp=9999",
      "ErrorDelay=30",
      "Delay=1",
      "TransTimes=00:00;14:05",
      "TransInterval=1",
      "TransFlag=TransData AttLog OpLog",
      `TimeZone=${tz}`,
      "Realtime=1",
      "Encrypt=None",
      ""
    ].join("\r\n");
  }
  return "";
});
async function processAttlog(sn, raw, db) {
  var _a, _b;
  const lines = raw.trim().split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("	");
    if (parts.length < 2) continue;
    let pin = (_a = parts[0]) == null ? void 0 : _a.trim();
    let datetime = (_b = parts[1]) == null ? void 0 : _b.trim();
    const verifyType = parseInt(parts[2] || "1");
    const inout = parseInt(parts[3] || "0");
    const workCode = parseInt(parts[4] || "0");
    if (!pin || !datetime) continue;
    datetime = datetime.replace(/\//g, "-");
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) continue;
    const empId = await findEmployee(pin, db);
    try {
      await db.query(`
        INSERT IGNORE INTO hr_device_punch_log
          (device_serial, pin, employee_id, punch_time, punch_type, verify_type, work_code, raw_line)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [sn, pin, empId, datetime, inout, verifyType, workCode, trimmed]);
      count++;
      if (empId) {
        await syncAttendance(empId, datetime, inout, sn, db);
      }
    } catch {
    }
  }
  return count;
}
async function findEmployee(pin, db) {
  try {
    const [rows] = await db.query(
      "SELECT id FROM hr_employees WHERE device_pin = ? AND status = 'active' LIMIT 1",
      [pin]
    );
    if (rows == null ? void 0 : rows.length) return rows[0].id;
  } catch {
  }
  if (/^\d+$/.test(pin)) {
    try {
      const [rows] = await db.query(
        "SELECT id FROM hr_employees WHERE id = ? AND status = 'active' LIMIT 1",
        [parseInt(pin)]
      );
      if (rows == null ? void 0 : rows.length) return rows[0].id;
    } catch {
    }
  }
  return null;
}
async function syncAttendance(empId, datetime, inout, sn, db) {
  var _a, _b, _c;
  const date = datetime.slice(0, 10);
  const time = datetime.slice(11, 19);
  let branchId = null;
  try {
    const [rows] = await db.query(
      "SELECT branch_id FROM hr_biometric_devices WHERE serial_no = ?",
      [sn]
    );
    branchId = ((_a = rows == null ? void 0 : rows[0]) == null ? void 0 : _a.branch_id) || null;
  } catch {
  }
  let workStart = "09:00:00";
  let workEnd = "18:00:00";
  let lateMinutes = 15;
  let otThreshold = 0;
  let autoApprove = 0;
  try {
    const [settings] = await db.query(
      "SELECT name, value FROM hr_settings WHERE name IN ('work_start','work_end','late_threshold','ot_threshold')"
    );
    for (const s of settings || []) {
      if (s.name === "work_start") workStart = s.value.length === 5 ? s.value + ":00" : s.value;
      if (s.name === "work_end") workEnd = s.value.length === 5 ? s.value + ":00" : s.value;
      if (s.name === "late_threshold") lateMinutes = parseInt(s.value);
      if (s.name === "ot_threshold") otThreshold = parseInt(s.value);
    }
    const [otSettings] = await db.query(
      "SELECT auto_approve FROM hr_overtime_settings WHERE id = 1"
    );
    autoApprove = parseInt(((_b = otSettings == null ? void 0 : otSettings[0]) == null ? void 0 : _b.auto_approve) || "0");
  } catch {
  }
  try {
    await db.query(`
      INSERT IGNORE INTO hr_attendance_punches (employee_id, date, punch_time, source, device_serial)
      VALUES (?, ?, ?, 'device', ?)
    `, [empId, date, time, sn]);
  } catch {
  }
  let earliest = time;
  let latest = null;
  let punchCount = 1;
  try {
    const [agg] = await db.query(`
      SELECT MIN(punch_time) AS earliest, MAX(punch_time) AS latest, COUNT(*) AS cnt
      FROM hr_attendance_punches
      WHERE employee_id = ? AND date = ?
    `, [empId, date]);
    if ((_c = agg == null ? void 0 : agg[0]) == null ? void 0 : _c.cnt) {
      earliest = agg[0].earliest;
      latest = agg[0].cnt > 1 ? agg[0].latest : null;
      punchCount = parseInt(agg[0].cnt);
    }
  } catch {
    if (inout === 1) {
      latest = time;
    } else {
      earliest = time;
    }
  }
  const punchTs = (/* @__PURE__ */ new Date(`${date}T${earliest}`)).getTime();
  const startTs = (/* @__PURE__ */ new Date(`${date}T${workStart}`)).getTime();
  const status = punchTs > startTs + lateMinutes * 6e4 ? "late" : "present";
  try {
    await db.query(`
      INSERT INTO hr_attendance (employee_id, date, clock_in, clock_out, status, branch_id, manual_entry)
      VALUES (?, ?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE
        clock_in  = LEAST(clock_in, VALUES(clock_in)),
        clock_out = IF(VALUES(clock_out) IS NOT NULL AND (clock_out IS NULL OR VALUES(clock_out) > clock_out),
                       VALUES(clock_out), clock_out),
        status    = VALUES(status)
    `, [empId, date, earliest, latest, status, branchId]);
  } catch {
  }
  if (punchCount >= 2 && latest) {
    try {
      const endTs = (/* @__PURE__ */ new Date(`${date}T${workEnd}`)).getTime();
      const latestTs = (/* @__PURE__ */ new Date(`${date}T${latest}`)).getTime();
      const otSecs = latestTs - endTs - otThreshold * 6e4;
      if (otSecs > 6e4) {
        const otHours = Math.min(otSecs / 36e5, 4);
        const otStatus = autoApprove ? "approved" : "pending";
        await db.query(`
          INSERT INTO hr_overtime_records
            (employee_id, ot_date, ot_hours, rate_type, amount, reason, status)
          VALUES (?, ?, ?, '1.5x', 0, 'Auto-detected from device punch', ?)
          ON DUPLICATE KEY UPDATE
            ot_hours = VALUES(ot_hours)
        `, [empId, date, Math.round(otHours * 100) / 100, otStatus]);
      }
    } catch {
    }
  }
}

export { adms as default };
//# sourceMappingURL=adms.mjs.map

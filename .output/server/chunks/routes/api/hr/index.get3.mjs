import { q as defineEventHandler, J as getQuery, ar as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const view = q.view || "devices";
  const serial = q.serial;
  const from = q.from || new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const to = q.to || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const limit = Math.min(Number(q.limit) || 100, 500);
  const offset = Number(q.offset) || 0;
  if (view === "punch_log") {
    let where = "WHERE p.punch_time BETWEEN ? AND ?";
    const params = [`${from} 00:00:00`, `${to} 23:59:59`];
    if (serial) {
      where += " AND p.device_serial = ?";
      params.push(serial);
    }
    const logs = await query(`
      SELECT p.id, p.device_serial, p.pin, p.punch_time,
             p.punch_type, p.verify_type, p.processed,
             CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
             e.id AS employee_id
      FROM hr_device_punch_log p
      LEFT JOIN hr_employees e ON e.id = p.employee_id
      ${where}
      ORDER BY p.punch_time DESC
      LIMIT ${limit} OFFSET ${offset}
    `, params);
    const [{ total }] = await query(
      `SELECT COUNT(*) AS total FROM hr_device_punch_log p ${where}`,
      params
    );
    return { logs, total: Number(total) };
  }
  if (view === "unmatched") {
    const unmatched = await query(`
      SELECT p.id, p.device_serial, p.pin, p.punch_time, p.raw_line
      FROM hr_device_punch_log p
      WHERE p.employee_id IS NULL
      ORDER BY p.punch_time DESC
      LIMIT 500
    `);
    return { unmatched };
  }
  const devices = await query(`
    SELECT d.*, b.name AS branch_name
    FROM hr_biometric_devices d
    LEFT JOIN branches b ON b.id = d.branch_id
    ORDER BY d.created_at DESC
  `);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  for (const dev of devices) {
    const [{ cnt }] = await query(
      "SELECT COUNT(*) AS cnt FROM hr_device_punch_log WHERE device_serial = ? AND DATE(punch_time) = ?",
      [dev.serial_no, today]
    );
    dev.today_punches = Number(cnt);
  }
  return { devices };
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map

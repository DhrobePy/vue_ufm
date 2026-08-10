import { q as defineEventHandler, as as readBody, m as createError, z as getDb, ap as query } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "save_device") {
    const { id, serial_no, device_name, brand, model, branch_id, ip_address, notes } = body;
    if (!(serial_no == null ? void 0 : serial_no.trim())) throw createError({ statusCode: 400, statusMessage: "Serial number required" });
    const db = getDb();
    if (id) {
      await db.query(
        "UPDATE hr_biometric_devices SET serial_no=?, device_name=?, brand=?, model=?, branch_id=?, ip_address=?, notes=? WHERE id=?",
        [serial_no, device_name || null, brand || "Unknown", model || null, branch_id || null, ip_address || null, notes || null, id]
      );
    } else {
      await db.query(`
        INSERT INTO hr_biometric_devices (serial_no, device_name, brand, model, branch_id, ip_address, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          device_name = VALUES(device_name), brand = VALUES(brand),
          model = VALUES(model), branch_id = VALUES(branch_id),
          ip_address = VALUES(ip_address), notes = VALUES(notes)
      `, [serial_no, device_name || null, brand || "Unknown", model || null, branch_id || null, ip_address || null, notes || null]);
    }
    return { ok: true, message: "Device saved." };
  }
  if (action === "delete_device") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("DELETE FROM hr_biometric_devices WHERE id = ?", [id]);
    return { ok: true, message: "Device deleted." };
  }
  if (action === "assign_pin") {
    const { employee_id, device_pin } = body;
    if (!employee_id || !String(device_pin).trim())
      throw createError({ statusCode: 400, statusMessage: "employee_id and device_pin required" });
    await query("UPDATE hr_employees SET device_pin = ? WHERE id = ?", [String(device_pin).trim(), employee_id]);
    return { ok: true, message: "Device PIN assigned." };
  }
  if (action === "mark_offline") {
    const { id } = body;
    await query("UPDATE hr_biometric_devices SET status = 'offline' WHERE id = ?", [id]);
    return { ok: true, message: "Device marked offline." };
  }
  if (action === "clear_log") {
    const { serial_no } = body;
    if (serial_no) await query("DELETE FROM hr_device_punch_log WHERE device_serial = ?", [serial_no]);
    return { ok: true, message: "Punch log cleared." };
  }
  if (action === "reprocess_unmatched") {
    const unmatched = await query(
      "SELECT id, device_serial, pin, punch_time, punch_type FROM hr_device_punch_log WHERE employee_id IS NULL"
    );
    let updated = 0;
    const db = getDb();
    for (const r of unmatched) {
      let empId = null;
      const [byPin] = await query(
        "SELECT id FROM hr_employees WHERE device_pin = ? AND status = 'active' LIMIT 1",
        [r.pin]
      );
      if (byPin) empId = byPin.id;
      if (!empId && /^\d+$/.test(r.pin)) {
        const [byId] = await query(
          "SELECT id FROM hr_employees WHERE id = ? AND status = 'active' LIMIT 1",
          [parseInt(r.pin)]
        );
        if (byId) empId = byId.id;
      }
      if (empId) {
        await db.query("UPDATE hr_device_punch_log SET employee_id = ? WHERE id = ?", [empId, r.id]);
        const date = String(r.punch_time).slice(0, 10);
        const timeStr = String(r.punch_time).slice(11, 19);
        await db.query(`
          INSERT INTO hr_attendance (employee_id, date, clock_in, status, branch_id, manual_entry)
          VALUES (?, ?, ?, 'present', NULL, 0)
          ON DUPLICATE KEY UPDATE
            clock_in  = LEAST(clock_in, VALUES(clock_in)),
            clock_out = IF(? = 1 AND (clock_out IS NULL OR ? > clock_out), ?, clock_out)
        `, [empId, date, timeStr, r.punch_type, timeStr, timeStr]);
        updated++;
      }
    }
    return { ok: true, updated, message: `${updated} records matched and synced.` };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map

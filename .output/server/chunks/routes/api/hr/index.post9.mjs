import { n as defineEventHandler, a7 as readBody, j as createError, a4 as query, u as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "create") {
    const { employee_id, ot_date, ot_hours, rate_type, reason } = body;
    if (!employee_id || !ot_date) throw createError({ statusCode: 400, statusMessage: "employee_id and ot_date required" });
    const [set] = await query("SELECT * FROM hr_overtime_settings WHERE id = 1");
    const rateMap = { "1.5x": (set == null ? void 0 : set.normal_rate) || 1.5, "2x": (set == null ? void 0 : set.holiday_rate) || 2, "flat": 1 };
    const rate = rateMap[rate_type || "1.5x"] || 1.5;
    const [empRow] = await query(`
      SELECT e.base_salary FROM hr_employees e WHERE e.id = ?
    `, [employee_id]);
    const hourlyRate = (Number(empRow == null ? void 0 : empRow.base_salary) || 0) / 30 / 8;
    const hours = Number(ot_hours) || 0;
    const amount = Math.round(hourlyRate * rate * hours * 100) / 100;
    await getDb().query(
      `INSERT INTO hr_overtime_records (employee_id, ot_date, ot_hours, rate_type, amount, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        ot_date,
        hours,
        rate_type || "1.5x",
        amount,
        reason || null,
        (set == null ? void 0 : set.auto_approve) ? "approved" : "pending"
      ]
    );
    return { ok: true, amount, message: "Overtime recorded." };
  }
  if (action === "update_status") {
    const { id, status } = body;
    if (!id || !["approved", "rejected", "paid", "pending"].includes(status))
      throw createError({ statusCode: 400, statusMessage: "Invalid status" });
    await query("UPDATE hr_overtime_records SET status = ? WHERE id = ?", [status, id]);
    return { ok: true, message: `Overtime ${status}.` };
  }
  if (action === "delete") {
    const { id } = body;
    await query("DELETE FROM hr_overtime_records WHERE id = ?", [id]);
    return { ok: true, message: "Record deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post9.mjs.map

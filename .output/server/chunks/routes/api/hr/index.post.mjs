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
  if (action === "create") {
    const { employee_id, amount, advance_month, advance_year, reason } = body;
    if (!employee_id || !amount) throw createError({ statusCode: 400, statusMessage: "employee_id and amount required" });
    await getDb().query(
      `INSERT INTO hr_salary_advances (employee_id, advance_date, amount, advance_month, advance_year, reason, status)
       VALUES (?, CURDATE(), ?, ?, ?, ?, 'pending')`,
      [employee_id, Number(amount), advance_month || null, advance_year || null, reason || null]
    );
    return { ok: true, message: "Advance request submitted." };
  }
  if (action === "update_status") {
    const { id, status } = body;
    if (!id || !["approved", "rejected", "pending", "deducted"].includes(status))
      throw createError({ statusCode: 400, statusMessage: "Invalid status" });
    await query("UPDATE hr_salary_advances SET status = ? WHERE id = ?", [status, id]);
    return { ok: true, message: `Advance ${status}.` };
  }
  if (action === "delete") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("DELETE FROM hr_salary_advances WHERE id = ?", [id]);
    return { ok: true, message: "Advance deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map

import { q as defineEventHandler, aq as readBody, m as createError, z as getDb, an as query } from '../../../nitro/nitro.mjs';
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
    const { employee_id, leave_type, start_date, end_date, reason } = body;
    if (!employee_id || !leave_type || !start_date || !end_date)
      throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
    await getDb().query(
      "INSERT INTO hr_leaves (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)",
      [employee_id, leave_type, start_date, end_date, reason || null]
    );
    return { ok: true, message: "Leave request submitted." };
  }
  if (action === "update_status") {
    const { id, status } = body;
    if (!id || !["approved", "rejected", "pending"].includes(status))
      throw createError({ statusCode: 400, statusMessage: "Invalid status" });
    await query("UPDATE hr_leaves SET status = ? WHERE id = ?", [status, id]);
    if (status === "approved") {
      const [req] = await query("SELECT * FROM hr_leaves WHERE id = ?", [id]);
      if (req) await query("UPDATE hr_employees SET status = 'on_leave' WHERE id = ?", [req.employee_id]);
    }
    if (status === "rejected" || status === "pending") {
      const [req] = await query("SELECT * FROM hr_leaves WHERE id = ?", [id]);
      if (req) {
        const [otherLeave] = await query(
          "SELECT id FROM hr_leaves WHERE employee_id = ? AND status = 'approved' AND id != ? LIMIT 1",
          [req.employee_id, id]
        );
        if (!otherLeave) {
          await query("UPDATE hr_employees SET status = 'active' WHERE id = ? AND status = 'on_leave'", [req.employee_id]);
        }
      }
    }
    return { ok: true, message: `Request ${status}.` };
  }
  if (action === "delete") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("DELETE FROM hr_leaves WHERE id = ?", [id]);
    return { ok: true, message: "Request deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post7.mjs.map

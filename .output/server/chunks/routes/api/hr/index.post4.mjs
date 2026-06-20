import { h as defineEventHandler, M as readBody, e as createError, n as getDb, K as query } from '../../../nitro/nitro.mjs';
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
  if (action === "create_batch") {
    const { name, bonus_type, calc_method, calc_value, eligible_group, disburse_date, notes } = body;
    if (!name) throw createError({ statusCode: 400, statusMessage: "name required" });
    const [res] = await getDb().query(
      `INSERT INTO hr_bonus_batches (name, bonus_type, calc_method, calc_value, eligible_group, disburse_date, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        name,
        bonus_type || "festival",
        calc_method || "flat",
        Number(calc_value) || 0,
        eligible_group || "all",
        disburse_date || null,
        notes || null
      ]
    );
    return { ok: true, id: res.insertId, message: "Bonus batch created." };
  }
  if (action === "generate") {
    const { batch_id } = body;
    if (!batch_id) throw createError({ statusCode: 400, statusMessage: "batch_id required" });
    const [batch] = await query("SELECT * FROM hr_bonus_batches WHERE id = ?", [batch_id]);
    if (!batch) throw createError({ statusCode: 404, statusMessage: "Batch not found" });
    const employees = await query(
      "SELECT e.*, ss.gross_salary FROM hr_employees e LEFT JOIN hr_salary_structures ss ON ss.employee_id = e.id WHERE e.status = 'active'"
    );
    const db = getDb();
    let totalAmount = 0;
    for (const emp of employees) {
      let amount = 0;
      if (batch.calc_method === "flat") amount = Number(batch.calc_value);
      else if (batch.calc_method === "percent") amount = (Number(emp.gross_salary) || 0) * Number(batch.calc_value) / 100;
      amount = Math.round(amount * 100) / 100;
      totalAmount += amount;
      await db.query(
        "INSERT IGNORE INTO hr_employee_bonuses (employee_id, batch_id, amount, bonus_date, status) VALUES (?, ?, ?, ?, 'pending')",
        [emp.id, batch_id, amount, batch.disburse_date || null]
      );
    }
    await db.query(
      "UPDATE hr_bonus_batches SET total_amount = ?, status = ? WHERE id = ?",
      [totalAmount, "approved", batch_id]
    );
    return { ok: true, total_amount: totalAmount, message: "Bonuses generated." };
  }
  if (action === "pay_batch") {
    const { batch_id } = body;
    await query("UPDATE hr_employee_bonuses SET status = 'paid' WHERE batch_id = ?", [batch_id]);
    await query("UPDATE hr_bonus_batches SET status = 'paid' WHERE id = ?", [batch_id]);
    return { ok: true, message: "Batch paid." };
  }
  if (action === "delete_batch") {
    const { id } = body;
    await query("DELETE FROM hr_employee_bonuses WHERE batch_id = ?", [id]);
    await query("DELETE FROM hr_bonus_batches WHERE id = ?", [id]);
    return { ok: true, message: "Batch deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post4.mjs.map

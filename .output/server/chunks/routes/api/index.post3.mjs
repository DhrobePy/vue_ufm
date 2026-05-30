import { g as defineEventHandler, G as readBody, u as getUserSession, d as createError, m as getDb } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    expense_date,
    category_id,
    subcategory_id,
    unit_quantity,
    per_unit_cost,
    total_amount,
    payment_method,
    handled_by_person,
    remarks,
    branch_id
  } = body != null ? body : {};
  if (!expense_date || !category_id || !remarks) {
    throw createError({ statusCode: 400, statusMessage: "expense_date, category_id and remarks are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM expense_vouchers WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const voucherNo = `EXP-${today}-${seq}`;
    const computed_total = total_amount != null ? total_amount : (unit_quantity != null ? unit_quantity : 1) * (per_unit_cost != null ? per_unit_cost : 0);
    const [result] = await conn.query(
      `INSERT INTO expense_vouchers
         (voucher_number, expense_date, category_id, subcategory_id,
          unit_quantity, per_unit_cost, total_amount,
          payment_method, handled_by_person, remarks,
          status, branch_id, created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?,
               'pending', ?, ?, NOW(), NOW())`,
      [
        voucherNo,
        expense_date,
        Number(category_id),
        subcategory_id ? Number(subcategory_id) : null,
        unit_quantity != null ? unit_quantity : null,
        per_unit_cost != null ? per_unit_cost : null,
        computed_total,
        payment_method != null ? payment_method : "Cash",
        handled_by_person != null ? handled_by_person : null,
        remarks,
        branch_id ? Number(branch_id) : null,
        userId
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId, voucher_number: voucherNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map

import { h as defineEventHandler, v as getRouterParam, I as readBody, w as getUserSession, e as createError, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const approve_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { action, reason } = body != null ? body : {};
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  if (!id || !action)
    throw createError({ statusCode: 400, statusMessage: "id and action required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[expense]] = await conn.query(
      `SELECT e.id, e.voucher_number, e.status, e.total_amount,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.id = ?`,
      [id]
    );
    if (!expense) throw createError({ statusCode: 404, statusMessage: "Expense not found" });
    if (action === "approve") {
      if (expense.status !== "pending")
        throw createError({ statusCode: 400, statusMessage: `Cannot approve \u2014 current status is "${expense.status}"` });
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = NULL, updated_at = NOW()
         WHERE id = ?`,
        [userId, id]
      );
      await auditLog(conn, {
        userId,
        action: "approved",
        module: "expenses",
        recordType: "expense_voucher",
        recordId: id,
        referenceNumber: expense.voucher_number,
        description: `Expense ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) approved by ${actorName}`,
        severity: "info"
      });
      await conn.commit();
      return { ok: true, newStatus: "approved" };
    }
    if (action === "reject") {
      if (expense.status !== "pending")
        throw createError({ statusCode: 400, statusMessage: `Cannot reject \u2014 current status is "${expense.status}"` });
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'rejected', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = ?, updated_at = NOW()
         WHERE id = ?`,
        [userId, reason != null ? reason : null, id]
      );
      await auditLog(conn, {
        userId,
        action: "rejected",
        module: "expenses",
        recordType: "expense_voucher",
        recordId: id,
        referenceNumber: expense.voucher_number,
        description: `Expense ${expense.voucher_number} rejected by ${actorName}${reason ? `: ${reason}` : ""}`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, newStatus: "rejected" };
    }
    if (action === "cancel") {
      if (!["approved", "pending"].includes(expense.status))
        throw createError({ statusCode: 400, statusMessage: `Cannot cancel \u2014 current status is "${expense.status}"` });
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'cancelled', rejection_reason = ?, updated_at = NOW()
         WHERE id = ?`,
        [reason != null ? reason : null, id]
      );
      await auditLog(conn, {
        userId,
        action: "cancelled",
        module: "expenses",
        recordType: "expense_voucher",
        recordId: id,
        referenceNumber: expense.voucher_number,
        description: `Expense ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) cancelled/reversed by ${actorName}${reason ? `: ${reason}` : ""}`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, newStatus: "cancelled" };
    }
    throw createError({ statusCode: 400, statusMessage: `Unknown action "${action}"` });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { approve_post as default };
//# sourceMappingURL=approve.post.mjs.map

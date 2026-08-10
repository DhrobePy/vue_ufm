import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, z as getDb, az as recycleBegin, ay as recycleArchiveDelete, aA as recycleFinalize, g as auditLog } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid expense ID" });
  const session = await getUserSession(event);
  const actorId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[expense]] = await conn.query(
      `SELECT id, voucher_number, status, total_amount FROM expense_vouchers WHERE id = ?`,
      [id]
    );
    if (!expense) throw createError({ statusCode: 404, statusMessage: "Expense not found" });
    if (expense.status !== "pending")
      throw createError({ statusCode: 400, statusMessage: `Only pending expenses can be deleted (current status: ${expense.status})` });
    const batchId = await recycleBegin(conn, {
      entityType: "expense_voucher",
      label: expense.voucher_number,
      userId: actorId,
      userName: actorName
    });
    await recycleArchiveDelete(conn, batchId, "expense_vouchers", "id", id);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId: actorId,
      action: "deleted",
      module: "expenses",
      recordType: "expense_voucher",
      recordId: id,
      referenceNumber: expense.voucher_number,
      description: `Expense voucher ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) deleted by ${actorName}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: `${expense.voucher_number} deleted` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

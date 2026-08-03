import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, z as getDb, g as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const toggle_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid transaction ID" });
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1);
  if (!["admin", "superadmin"].includes(role) && !role.includes("account")) {
    throw createError({ statusCode: 403, statusMessage: "Only accounts/admin can reconcile bank transactions" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    const [[txn]] = await conn.query(
      `SELECT id, transaction_number, reconciled_at FROM bank_transactions WHERE id = ?`,
      [id]
    );
    if (!txn) throw createError({ statusCode: 404, statusMessage: "Transaction not found" });
    const nowReconciling = !txn.reconciled_at;
    await conn.query(
      `UPDATE bank_transactions
       SET reconciled_at = ?, reconciled_by_user_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [nowReconciling ? /* @__PURE__ */ new Date() : null, nowReconciling ? userId : null, id]
    );
    await auditLog(conn, {
      userId,
      action: "other",
      module: "bank",
      recordType: "bank_transaction",
      recordId: id,
      referenceNumber: txn.transaction_number,
      description: `${txn.transaction_number} marked ${nowReconciling ? "reconciled" : "unreconciled"}`,
      severity: "info"
    });
    return { ok: true, reconciled: nowReconciling };
  } finally {
    conn.release();
  }
});

export { toggle_post as default };
//# sourceMappingURL=toggle.post.mjs.map

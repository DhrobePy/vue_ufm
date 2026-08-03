import { q as defineEventHandler, X as getUserSession, m as createError, a1 as isAdminRole, R as getRouterParam, aq as readBody, z as getDb, g as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reject_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAdminRole(role) && !["accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const reqId = Number(getRouterParam(event, "id"));
  const body = await readBody(event).catch(() => ({}));
  const reason = String((_b = body == null ? void 0 : body.reason) != null ? _b : "").trim();
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[reqRow]] = await conn.query(
      `SELECT * FROM credit_pending_requests WHERE id = ? AND request_type IN ('pos_exit_release', 'pos_credit_sale') FOR UPDATE`,
      [reqId]
    );
    if (!reqRow) throw createError({ statusCode: 404, statusMessage: "Request not found" });
    if (reqRow.status !== "pending") throw createError({ statusCode: 409, statusMessage: `Already ${reqRow.status}` });
    if (reqRow.request_type === "pos_credit_sale" && !isAdminRole(role))
      throw createError({ statusCode: 403, statusMessage: "POS credit-sale rejection is admin-only" });
    await conn.query(
      `UPDATE credit_pending_requests SET status = 'rejected', decided_by_user_id = ?, decided_at = NOW(), decision_note = ? WHERE id = ?`,
      [userId, reason || null, reqId]
    );
    await auditLog(conn, {
      userId,
      action: "rejected",
      module: "other",
      recordType: "pos_order",
      recordId: reqRow.order_id,
      description: `POS exit release rejected \u2014 ${reason || "no reason given"}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { reject_post as default };
//# sourceMappingURL=reject.post.mjs.map

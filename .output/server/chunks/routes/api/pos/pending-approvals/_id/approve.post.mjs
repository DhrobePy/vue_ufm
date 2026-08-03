import { p as defineEventHandler, V as getUserSession, l as createError, _ as isAdminRole, O as getRouterParam, y as getDb, f as auditLog, aC as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const approve_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!isAdminRole(role) && !["accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const reqId = Number(getRouterParam(event, "id"));
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[reqRow]] = await conn.query(
      `SELECT * FROM credit_pending_requests WHERE id = ? AND request_type = 'pos_exit_release' FOR UPDATE`,
      [reqId]
    );
    if (!reqRow) throw createError({ statusCode: 404, statusMessage: "Request not found" });
    if (reqRow.status !== "pending") throw createError({ statusCode: 409, statusMessage: `Already ${reqRow.status}` });
    const [[order]] = await conn.query(
      `SELECT * FROM orders WHERE id = ? AND order_type = 'POS' FOR UPDATE`,
      [reqRow.order_id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    await conn.query(
      `UPDATE orders SET exit_status = 'cleared', exit_cleared_by_user_id = ?, exit_cleared_at = NOW() WHERE id = ?`,
      [userId, order.id]
    );
    await conn.query(
      `UPDATE credit_pending_requests SET status = 'approved', decided_by_user_id = ?, decided_at = NOW() WHERE id = ?`,
      [userId, reqId]
    );
    await auditLog(conn, {
      userId,
      action: "approved",
      module: "other",
      recordType: "pos_order",
      recordId: order.id,
      referenceNumber: order.order_number,
      description: `POS exit release approved for ${order.order_number} by ${userName}`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(`\u{1F7E2} <b>POS Exit Release Approved</b>
${order.order_number} \u2014 by ${userName}`, "dispatch");
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { approve_post as default };
//# sourceMappingURL=approve.post.mjs.map

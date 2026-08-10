import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, z as getDb, a1 as isAdminRole, U as getUserActionLimit, g as auditLog, aK as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const clear_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const orderId = Number(getRouterParam(event, "order"));
  if (!orderId) throw createError({ statusCode: 400, statusMessage: "Invalid order" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.*, c.name AS customer_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? AND o.order_type = 'POS' FOR UPDATE`,
      [orderId]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (order.exit_status === "cleared") {
      await conn.commit();
      return { ok: true, already_cleared: true };
    }
    if (!isAdminRole(role)) {
      const cap = await getUserActionLimit(conn, userId, "pos_exit_release");
      const creditAmt = Number(order.credit_amount);
      if (cap === null || creditAmt > cap)
        throw createError({
          statusCode: 403,
          statusMessage: cap === null ? "No exit-release limit has been delegated to your account \u2014 request approval instead" : `Exceeds your exit-release limit of \u09F3${cap.toLocaleString()} \u2014 request approval instead`
        });
    }
    await conn.query(
      `UPDATE orders SET exit_status = 'cleared', exit_cleared_by_user_id = ?, exit_cleared_at = NOW() WHERE id = ?`,
      [userId, orderId]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "other",
      recordType: "pos_order",
      recordId: orderId,
      referenceNumber: order.order_number,
      description: `POS exit cleared for ${order.order_number} \u2014 \u09F3${Number(order.credit_amount).toLocaleString()} on credit \u2014 by ${userName}`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F7E2} <b>POS Exit Cleared</b>
${order.order_number}${order.customer_name ? ` \u2014 ${order.customer_name}` : ""}
\u09F3${Number(order.credit_amount).toLocaleString()} on credit \u2014 cleared by ${userName}`,
      "dispatch"
    );
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { clear_post as default };
//# sourceMappingURL=clear.post.mjs.map

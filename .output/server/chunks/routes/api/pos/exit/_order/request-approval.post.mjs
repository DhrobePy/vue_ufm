import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, z as getDb, ar as queuePendingRequest, aK as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const requestApproval_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
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
    const reqId = await queuePendingRequest(conn, {
      requestType: "pos_exit_release",
      payload: { order_id: orderId },
      orderId,
      customerId: order.customer_id,
      amount: Number(order.credit_amount),
      referenceLabel: `${order.order_number}${order.customer_name ? ` \u2014 ${order.customer_name}` : " \u2014 walk-in"} \u2014 \u09F3${Number(order.credit_amount).toLocaleString()} on credit`,
      requestedBy: userId,
      requestedReason: "POS exit-release requested by gate staff"
    });
    await conn.query(
      `UPDATE orders SET exit_requested_by_user_id = ?, exit_requested_at = NOW() WHERE id = ?`,
      [userId, orderId]
    );
    await conn.commit();
    sendTelegram(
      `\u23F3 <b>POS Exit Release Requested</b>
${order.order_number}${order.customer_name ? ` \u2014 ${order.customer_name}` : ""}
\u09F3${Number(order.credit_amount).toLocaleString()} on credit \u2014 requested by ${userName}`,
      "dispatch"
    );
    return { ok: true, pending_request_id: reqId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { requestApproval_post as default };
//# sourceMappingURL=request-approval.post.mjs.map

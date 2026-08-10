import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, z as getDb, an as postPosSale, g as auditLog, aJ as sendTelegram, a1 as isAdminRole } from '../../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const isAdmin = isAdminRole(role);
  if (!isAdmin && !["accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const reqId = Number(getRouterParam(event, "id"));
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[reqRow]] = await conn.query(
      `SELECT * FROM credit_pending_requests WHERE id = ? AND request_type IN ('pos_exit_release', 'pos_credit_sale') FOR UPDATE`,
      [reqId]
    );
    if (!reqRow) throw createError({ statusCode: 404, statusMessage: "Request not found" });
    if (reqRow.status !== "pending") throw createError({ statusCode: 409, statusMessage: `Already ${reqRow.status}` });
    if (reqRow.request_type === "pos_credit_sale") {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "POS credit-sale approval is admin-only" });
      const payload = JSON.parse(reqRow.payload);
      const result = await postPosSale(conn, {
        branchId: (_c = payload.branch_id) != null ? _c : 1,
        customerId: (_d = payload.customer_id) != null ? _d : null,
        items: (_e = payload.items) != null ? _e : [],
        discount: Number(payload.discount || 0),
        paymentMethod: (_f = payload.payment_method) != null ? _f : "Cash",
        cashAmount: (_g = payload.cash_amount) != null ? _g : null,
        creditAmount: Number((_h = payload.credit_amount) != null ? _h : 0),
        cashAccountId: (_i = payload.cash_account_id) != null ? _i : null,
        bankAccountId: (_j = payload.bank_account_id) != null ? _j : null,
        paymentReference: (_k = payload.payment_reference) != null ? _k : null,
        userId: reqRow.requested_by_user_id,
        isAdmin: true
        // admin approval is the override
      });
      await conn.query(
        `UPDATE credit_pending_requests SET status = 'approved', decided_by_user_id = ?, decided_at = NOW(), result_payment_id = ? WHERE id = ?`,
        [userId, result.orderId, reqId]
      );
      await auditLog(conn, {
        userId,
        action: "approved",
        module: "other",
        recordType: "pos_order",
        recordId: result.orderId,
        referenceNumber: result.orderNumber,
        description: `POS credit sale ${result.orderNumber} approved + posted by ${userName} (over customer credit limit)`,
        severity: "warning"
      });
      await conn.commit();
      sendTelegram(`\u{1F7E2} <b>POS Credit Sale Approved</b>
${result.orderNumber}${result.customerName ? ` \u2014 ${result.customerName}` : ""}
\u09F3${result.creditAmount.toLocaleString()} on credit \u2014 by ${userName}`, "orders");
      return { ok: true, order_id: result.orderId, order_number: result.orderNumber };
    }
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

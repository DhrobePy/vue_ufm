import { q as defineEventHandler, R as getRouterParam, as as readBody, X as getUserSession, m as createError, a0 as isAccountsRole, z as getDb, d as AMD_PRE_STATUSES, c as AMD_POST_STATUSES, V as getUserApprovalLimit, a6 as nextDocNumber, f as applyAmendment, g as auditLog, aJ as sendTelegram } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const amendments_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!isAccountsRole(role) && !["sales-srg", "sales-demra", "sales-other"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Your role cannot request amendments" });
  const amendType = String((_c = body == null ? void 0 : body.amend_type) != null ? _c : "correction");
  const description = (body == null ? void 0 : body.description) ? String(body.description).slice(0, 500) : null;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.*, c.name AS customer_name FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const regime = AMD_PRE_STATUSES.includes(order.status) ? "pre" : AMD_POST_STATUSES.includes(order.status) ? "post" : null;
    if (!regime)
      throw createError({ statusCode: 409, statusMessage: `Order status "${order.status}" cannot be amended` });
    let delta = 0;
    let oldValues = null;
    let newValues = null;
    let flatAmount = null;
    if (regime === "pre") {
      const newItems = body == null ? void 0 : body.new_items;
      if (!Array.isArray(newItems) || !newItems.length)
        throw createError({ statusCode: 400, statusMessage: "new_items required for pre-dispatch amendment" });
      const [oldItems] = await conn.query(
        `SELECT id, product_id, variant_id, quantity, unit_price, discount_amount, line_total
         FROM credit_order_items WHERE order_id = ?`,
        [id]
      );
      const newTotal = newItems.reduce((s, it) => {
        var _a2;
        return s + Number(it.quantity) * Number(it.unit_price) - Number((_a2 = it.discount_amount) != null ? _a2 : 0);
      }, 0);
      delta = newTotal - Number(order.total_amount);
      oldValues = { items: oldItems, total_amount: Number(order.total_amount) };
      newValues = { items: newItems, total_amount: newTotal };
    } else {
      flatAmount = Number((_d = body == null ? void 0 : body.flat_amount) != null ? _d : 0);
      if (!flatAmount || Math.abs(flatAmount) < 0.01)
        throw createError({ statusCode: 400, statusMessage: "flat_amount (\xB1) required for post-dispatch amendment" });
      if (amendType === "rebate" && flatAmount > 0) flatAmount = -flatAmount;
      delta = flatAmount;
      oldValues = { total_amount: Number(order.total_amount), balance_due: Number(order.balance_due) };
      newValues = { flat_amount: flatAmount };
    }
    const { limit, source } = await getUserApprovalLimit(conn, userId, role);
    const canAutoApply = source === "admin" || source === "personal" && (delta <= 0 || delta <= limit);
    const amdNo = await nextDocNumber(conn, "AMD", "order_amendments", "amendment_number");
    const [res] = await conn.query(
      `INSERT INTO order_amendments
         (amendment_number, order_id, regime, amend_type, description,
          old_values, new_values, flat_amount, status, requested_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        amdNo,
        id,
        regime,
        amendType,
        description,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        flatAmount,
        canAutoApply ? "approved" : "pending",
        userId
      ]
    );
    const amendmentId = res.insertId;
    if (canAutoApply) {
      await applyAmendment(conn, { amendmentId, order, regime, flatAmount, newValues, amdNo, userId });
      await conn.query(
        `UPDATE order_amendments SET decided_by = ?, decided_at = NOW(),
           decision_note = ? WHERE id = ?`,
        [userId, source === "admin" ? "Auto-applied (admin)" : `Auto-applied (delegated limit \u09F3${limit.toLocaleString()})`, amendmentId]
      );
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        order.status,
        order.status,
        canAutoApply ? "amendment_applied" : "amendment_requested",
        userId,
        `${amdNo} (${regime}-dispatch, ${amendType}) \u0394\u09F3${delta.toLocaleString()}${description ? ` \u2014 ${description}` : ""}`
      ]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "order_amendment",
      recordId: amendmentId,
      referenceNumber: amdNo,
      description: `Amendment ${amdNo} on ${order.order_number} (${regime}, ${amendType}) \u0394\u09F3${delta.toLocaleString()} \u2014 ${canAutoApply ? "applied" : "pending approval"}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4DD} <b>Order Amendment ${canAutoApply ? "Applied" : "Requested"}</b>
${amdNo} on ${order.order_number} \u2014 ${order.customer_name}
${regime}-dispatch \xB7 ${amendType} \xB7 \u0394\u09F3${delta.toLocaleString()}
by ${userName}` + (description ? `
${description}` : "")
    );
    return { ok: true, id: amendmentId, amendment_number: amdNo, status: canAutoApply ? "approved" : "pending", delta };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { amendments_post as default };
//# sourceMappingURL=amendments.post.mjs.map

import { u as defineEventHandler, a0 as getRouterParam, a5 as getUserSession, r as createError, b as ADMIN_ROLES, aF as readBody, I as getDb, d as AMD_PRE_STATUSES, c as AMD_POST_STATUSES, af as nextDocNumber, h as applyAmendment, k as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
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

const revert_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const amendmentId = Number(getRouterParam(event, "amendmentId"));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role)) throw createError({ statusCode: 403, statusMessage: "Only admin / superadmin may revert an amendment" });
  const body = await readBody(event);
  const why = String((_b = body == null ? void 0 : body.reason) != null ? _b : "").trim();
  if (why.length < 3) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[amd]] = await conn.query(`SELECT * FROM order_amendments WHERE id = ? FOR UPDATE`, [amendmentId]);
    if (!amd) throw createError({ statusCode: 404, statusMessage: "Amendment not found" });
    if (amd.status !== "approved") throw createError({ statusCode: 409, statusMessage: "Only an applied (approved) amendment can be reverted" });
    if (amd.reverts_amendment_id) throw createError({ statusCode: 409, statusMessage: "This amendment is itself a revert \u2014 raise a new amendment instead" });
    const [[already]] = await conn.query(`SELECT COUNT(*) c FROM order_amendments WHERE reverts_amendment_id = ? AND status <> 'rejected'`, [amendmentId]);
    if (Number(already.c) > 0) throw createError({ statusCode: 409, statusMessage: "This amendment has already been reverted" });
    const [[order]] = await conn.query(`SELECT o.*, c.name customer_name FROM credit_orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = ? FOR UPDATE`, [amd.order_id]);
    const regimeNow = AMD_PRE_STATUSES.includes(order.status) ? "pre" : AMD_POST_STATUSES.includes(order.status) ? "post" : null;
    if (regimeNow !== amd.regime)
      throw createError({ statusCode: 409, statusMessage: `The order has moved on (now "${order.status}") \u2014 it can no longer be reverted automatically. Raise a new amendment for the difference.` });
    const consent = String((_c = body == null ? void 0 : body.consent_note) != null ? _c : "").trim().slice(0, 255);
    if (amd.regime === "post" && !consent)
      throw createError({ statusCode: 400, statusMessage: "Note how/when the customer agreed to this change (it alters an invoice they already owe)" });
    const [later] = await conn.query(`SELECT id FROM order_amendments WHERE order_id = ? AND id > ? AND status = 'approved' AND regime = ?`, [amd.order_id, amendmentId, amd.regime]);
    if (later.length) throw createError({ statusCode: 409, statusMessage: "A later amendment exists on this order \u2014 revert that one first" });
    const oldV = amd.old_values ? JSON.parse(amd.old_values) : {};
    const newV = amd.new_values ? JSON.parse(amd.new_values) : {};
    let newValues, flat = null, delta;
    if (Array.isArray(oldV.items) && oldV.items.length && Array.isArray(newV.items)) {
      const items = oldV.items.map((o) => {
        var _a2;
        return {
          item_id: o.id,
          product_id: o.product_id,
          variant_id: o.variant_id,
          quantity: Number(o.quantity),
          unit_price: Number(o.unit_price),
          discount_amount: Number((_a2 = o.discount_amount) != null ? _a2 : 0)
        };
      });
      const [cur] = await conn.query(`SELECT line_total FROM credit_order_items WHERE order_id = ?`, [amd.order_id]);
      const curSub = cur.reduce((s, i) => s + Number(i.line_total), 0);
      const backSub = items.reduce((s, i) => s + i.quantity * i.unit_price - i.discount_amount, 0);
      delta = Math.round((backSub - curSub) * 100) / 100;
      newValues = { items, new_subtotal: backSub, total_amount: Number(order.total_amount) + delta };
      if (amd.regime === "post") flat = delta;
    } else if (amd.flat_amount != null) {
      flat = -Number(amd.flat_amount);
      delta = flat;
      newValues = { flat_amount: flat };
    } else throw createError({ statusCode: 409, statusMessage: "Nothing to revert on this amendment" });
    const amdNo = await nextDocNumber(conn, "AMD", "order_amendments", "amendment_number");
    const [res] = await conn.query(
      `INSERT INTO order_amendments (amendment_number, order_id, regime, amend_type, description, old_values, new_values, flat_amount,
         status, requested_by, decided_by, decided_at, decision_note, customer_consent_note, reverts_amendment_id)
       VALUES (?, ?, ?, 'revert', ?, ?, ?, ?, 'approved', ?, ?, NOW(), ?, ?, ?)`,
      [
        amdNo,
        amd.order_id,
        amd.regime,
        `Revert of ${amd.amendment_number}: ${why}`.slice(0, 500),
        JSON.stringify({ total_amount: Number(order.total_amount) }),
        JSON.stringify(newValues),
        flat,
        userId,
        userId,
        "Reverted by admin",
        consent || null,
        amendmentId
      ]
    );
    await applyAmendment(conn, { amendmentId: res.insertId, order, regime: amd.regime, flatAmount: flat, newValues, amdNo, userId, reason: `revert of ${amd.amendment_number} \u2014 ${why}` });
    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, 'amendment_reverted', ?, ?, NOW())`,
      [amd.order_id, order.status, order.status, userId, `${amdNo} reverts ${amd.amendment_number} (\u0394\u09F3${delta.toLocaleString()}) \u2014 ${why}`]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "order_amendment",
      recordId: res.insertId,
      referenceNumber: amdNo,
      description: `Amendment ${amd.amendment_number} on ${order.order_number} reverted by ${amdNo} (\u0394\u09F3${delta.toLocaleString()}) \u2014 ${why}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, amendment_number: amdNo, delta };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { revert_post as default };
//# sourceMappingURL=revert.post.mjs.map

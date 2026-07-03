import { j as defineEventHandler, C as getRouterParam, _ as readBody, F as getUserSession, f as createError, J as isAccountsRole, q as getDb, E as getUserApprovalLimit, N as nextDocNumber, b as auditLog, a4 as sendTelegram, r as getGLAccountId, W as postJournalEntry, V as postCustomerLedger } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PRE_STATUSES = ["pending_approval", "escalated", "approved", "in_production", "ready_to_ship"];
const POST_STATUSES = ["shipped", "dispatched", "delivered", "completed"];
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
    const regime = PRE_STATUSES.includes(order.status) ? "pre" : POST_STATUSES.includes(order.status) ? "post" : null;
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
    const amdNo = await nextDocNumber(conn, "AMD", "order_amendments");
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
      await applyAmendment(conn, { amendmentId, order, regime, flatAmount, newValues, amdNo, userId, userName });
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
async function applyAmendment(conn, opts) {
  var _a, _b, _c, _d, _e;
  const { order, regime, flatAmount, newValues, amdNo, userId } = opts;
  if (regime === "pre") {
    const [[fresh]] = await conn.query(
      `SELECT status, advance_paid, amount_paid FROM credit_orders WHERE id = ? FOR UPDATE`,
      [order.id]
    );
    if (!PRE_STATUSES.includes(fresh.status))
      throw createError({ statusCode: 409, statusMessage: "Order was dispatched after this amendment was requested \u2014 use a post-dispatch amendment instead" });
    await conn.query(`DELETE FROM credit_order_items WHERE order_id = ?`, [order.id]);
    for (const it of newValues.items) {
      const lineTotal = Number(it.quantity) * Number(it.unit_price) - Number((_a = it.discount_amount) != null ? _a : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          it.product_id,
          (_b = it.variant_id) != null ? _b : null,
          Number(it.quantity),
          Number(it.unit_price),
          Number((_c = it.discount_amount) != null ? _c : 0),
          lineTotal
        ]
      );
    }
    const newTotal = Number(newValues.total_amount);
    const newBalance = Math.max(0, newTotal - Number((_d = fresh.advance_paid) != null ? _d : 0) - Number((_e = fresh.amount_paid) != null ? _e : 0));
    await conn.query(
      `UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newTotal, newTotal, newBalance, order.id]
    );
    return;
  }
  const amt = Number(flatAmount);
  const abs = Math.abs(amt);
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const arId = await getGLAccountId(conn, "Accounts Receivable");
  const revId = await getGLAccountId(conn, "Revenue");
  let jeId = null;
  if (arId && revId) {
    jeId = await postJournalEntry(conn, {
      date,
      description: `${amt > 0 ? "Debit" : "Credit"} note ${amdNo} \u2014 Order ${order.order_number}`,
      docType: "OrderAmendment",
      docId: opts.amendmentId,
      userId,
      lines: amt > 0 ? [
        { accountId: arId, debit: abs, credit: 0, memo: amdNo },
        { accountId: revId, debit: 0, credit: abs, memo: amdNo }
      ] : [
        { accountId: revId, debit: abs, credit: 0, memo: amdNo },
        { accountId: arId, debit: 0, credit: abs, memo: amdNo }
      ]
    });
  }
  await postCustomerLedger(conn, {
    customerId: order.customer_id,
    date,
    transactionType: amt > 0 ? "debit_note" : "credit_note",
    referenceType: "order_amendment",
    referenceId: opts.amendmentId,
    invoiceNumber: amdNo,
    description: `${amt > 0 ? "Debit" : "Credit"} note ${amdNo} \u2014 Order ${order.order_number}`,
    debit: amt > 0 ? abs : 0,
    credit: amt < 0 ? abs : 0,
    journalEntryId: jeId,
    userId
  });
  await conn.query(
    `UPDATE order_amendments SET journal_entry_id = ? WHERE id = ?`,
    [jeId, opts.amendmentId]
  );
  await conn.query(
    `UPDATE credit_orders
     SET total_amount = GREATEST(0, total_amount + ?),
         balance_due  = GREATEST(0, balance_due + ?),
         updated_at   = NOW()
     WHERE id = ?`,
    [amt, amt, order.id]
  );
}

export { applyAmendment, amendments_post as default };
//# sourceMappingURL=amendments.post.mjs.map

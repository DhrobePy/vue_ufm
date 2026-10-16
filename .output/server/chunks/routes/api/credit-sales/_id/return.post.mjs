import { t as defineEventHandler, Y as getRouterParam, q as createError, aC as readBody, a2 as getUserSession, O as getRequestHeader, b5 as userCanAction, A as ACCOUNTS_ROLES, D as DISPATCH_ROLES, F as getDb, ac as nextDocNumber, ao as postCustomerLedger, j as auditLog } from '../../../../nitro/nitro.mjs';
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

const return_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user))
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const ipAddress = (_c = (_b = getRequestHeader(event, "x-forwarded-for")) != null ? _b : getRequestHeader(event, "x-real-ip")) != null ? _c : void 0;
  const canRecord = await userCanAction({
    userId,
    role,
    module: "credit_sales",
    page: "all",
    action: "record_return",
    roleFallback: [...ACCOUNTS_ROLES, ...DISPATCH_ROLES]
  });
  if (!canRecord)
    throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to record returns" });
  const {
    return_date,
    return_type = "partial",
    return_reason,
    notes,
    items
    // [{ order_item_id, product_id, variant_id, original_qty, returned_qty, unit_price }]
  } = body != null ? body : {};
  if (!(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "No return items provided" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, order_number, balance_due, amount_paid, total_amount, status
       FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (!["goods_on_board", "shipped", "delivered", "completed"].includes(order.status))
      throw createError({ statusCode: 409, statusMessage: `Order is "${order.status}" \u2014 returns can only be recorded once the goods are on board or delivered` });
    const lines = [];
    for (const sub of items) {
      const qty = Number(sub.returned_qty);
      if (!(qty > 0)) continue;
      const [[li]] = await conn.query(
        `SELECT coi.id, coi.product_id, coi.variant_id, coi.quantity, coi.unit_price, COALESCE(p.base_name, 'item') AS product_name
         FROM credit_order_items coi LEFT JOIN products p ON p.id = coi.product_id WHERE coi.id = ? AND coi.order_id = ?`,
        [Number(sub.order_item_id), id]
      );
      if (!li) throw createError({ statusCode: 400, statusMessage: "A returned line does not belong to this order" });
      const [[done]] = await conn.query(
        `SELECT COALESCE(SUM(ri.returned_qty), 0) q FROM credit_order_return_items ri
         JOIN credit_order_returns r ON r.id = ri.return_id WHERE ri.order_item_id = ? AND r.status <> 'rejected'`,
        [li.id]
      );
      const returnable = Number(li.quantity) - Number(done.q);
      if (qty > returnable + 1e-3)
        throw createError({ statusCode: 400, statusMessage: `Return qty (${qty}) for '${li.product_name}' exceeds the returnable qty (${returnable})` });
      lines.push({ order_item_id: li.id, product_id: li.product_id, variant_id: li.variant_id, original_qty: Number(li.quantity), returned_qty: qty, unit_price: Number(li.unit_price) });
    }
    if (!lines.length) throw createError({ statusCode: 400, statusMessage: "No return quantities entered" });
    const retNo = await nextDocNumber(conn, "RET", "credit_order_returns", "return_number");
    const retDate = return_date != null ? return_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const totalRetQty = lines.reduce((s, i) => s + Number(i.returned_qty), 0);
    const totalRetAmount = lines.reduce(
      (s, i) => s + Number(i.returned_qty) * Number(i.unit_price),
      0
    );
    const autoApprove = false;
    const retStatus = "pending";
    const [result] = await conn.query(
      `INSERT INTO credit_order_returns
         (return_number, order_id, customer_id, return_date, return_type,
          return_reason, total_returned_amount, total_returned_qty,
          status, approved_by_user_id, approved_at, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        retNo,
        id,
        order.customer_id,
        retDate,
        return_type,
        return_reason != null ? return_reason : null,
        totalRetAmount,
        totalRetQty,
        retStatus,
        autoApprove ? userId : null,
        autoApprove ? /* @__PURE__ */ new Date() : null,
        notes != null ? notes : null,
        userId
      ]
    );
    const returnId = result.insertId;
    for (const item of lines) {
      await conn.query(
        `INSERT INTO credit_order_return_items
           (return_id, order_item_id, product_id, variant_id,
            original_qty, returned_qty, unit_price, returned_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          returnId,
          item.order_item_id,
          item.product_id,
          (_d = item.variant_id) != null ? _d : null,
          Number((_e = item.original_qty) != null ? _e : 0),
          Number(item.returned_qty),
          Number(item.unit_price),
          Number(item.returned_qty) * Number(item.unit_price)
        ]
      );
    }
    if (autoApprove) ;
    const wfAction = autoApprove ? "return_approved" : "return_submitted";
    const wfComment = `Return ${retNo} \u2014 ${totalRetQty} bags \xB7 \u09F3${totalRetAmount.toLocaleString()} (${return_reason != null ? return_reason : "no reason"})${autoApprove ? " \xB7 Auto-approved" : " \xB7 Pending approval"}`;
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, (_f = order.status) != null ? _f : "delivered", (_g = order.status) != null ? _g : "delivered", wfAction, userId, wfComment]
    );
    await auditLog(conn, {
      userId,
      action: wfAction,
      // 'return_submitted'→'other', 'return_approved'→'approved'
      module: "credit_sales",
      recordType: "credit_order_return",
      recordId: id,
      // store the CREDIT ORDER id so audit page can link to /credit-sales/{id}
      referenceNumber: retNo,
      description: `Return ${retNo} for Order ${order.order_number} \u2014 ${totalRetQty} bags \xB7 \u09F3${totalRetAmount.toLocaleString()} \xB7 ${autoApprove ? "auto-approved" : "pending approval"}`,
      severity: autoApprove ? "info" : "warning",
      ipAddress
    });
    await conn.commit();
    return {
      ok: true,
      return_number: retNo,
      return_id: returnId,
      status: retStatus,
      amount: totalRetAmount
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { return_post as default };
//# sourceMappingURL=return.post.mjs.map

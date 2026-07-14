import { n as defineEventHandler, I as getRouterParam, j as createError, a9 as readBody, L as getUserSession, B as getRequestHeader, u as getDb, e as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const return_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user))
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const ipAddress = (_b = (_a = getRequestHeader(event, "x-forwarded-for")) != null ? _a : getRequestHeader(event, "x-real-ip")) != null ? _b : void 0;
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
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_order_returns WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const retNo = `RET-${today}-${seq}`;
    const retDate = return_date != null ? return_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const totalRetQty = items.reduce((s, i) => s + Number(i.returned_qty), 0);
    const totalRetAmount = items.reduce(
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
    for (const item of items) {
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
      [id, (_g = order.status) != null ? _g : "delivered", (_h = order.status) != null ? _h : "delivered", wfAction, userId, wfComment]
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

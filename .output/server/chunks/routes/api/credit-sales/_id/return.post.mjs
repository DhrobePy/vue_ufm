import { h as defineEventHandler, v as getRouterParam, e as createError, I as readBody, w as getUserSession, q as getRequestHeader, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const return_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
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
    const seq = String(((_g = cnt.n) != null ? _g : 0) + 1).padStart(4, "0");
    const retNo = `RET-${today}-${seq}`;
    const retDate = return_date != null ? return_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const totalRetQty = items.reduce((s, i) => s + Number(i.returned_qty), 0);
    const totalRetAmount = items.reduce(
      (s, i) => s + Number(i.returned_qty) * Number(i.unit_price),
      0
    );
    const autoApprove = ["admin", "superadmin"].includes(role);
    const retStatus = autoApprove ? "approved" : "pending";
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
          (_h = item.variant_id) != null ? _h : null,
          Number((_i = item.original_qty) != null ? _i : 0),
          Number(item.returned_qty),
          Number(item.unit_price),
          Number(item.returned_qty) * Number(item.unit_price)
        ]
      );
    }
    if (autoApprove) {
      const [[lastLedger]] = await conn.query(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [order.customer_id]
      );
      const prevBal = Number((_j = lastLedger == null ? void 0 : lastLedger.bal) != null ? _j : 0);
      const newBal = Math.max(0, prevBal - totalRetAmount);
      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
         VALUES (?, ?, 'credit_note', 'credit_order_return', ?, ?, ?, 0, ?, ?, ?)`,
        [
          order.customer_id,
          retDate,
          returnId,
          retNo,
          `Goods Return Credit Note \u2014 ${retNo} (Order ${order.order_number})`,
          totalRetAmount,
          newBal,
          userId
        ]
      );
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, id]
      );
      await conn.query(
        `UPDATE customers
         SET current_balance = GREATEST(0, current_balance - ?),
             updated_at = NOW()
         WHERE id = ?`,
        [totalRetAmount, order.customer_id]
      );
    }
    const wfAction = autoApprove ? "return_approved" : "return_submitted";
    const wfComment = `Return ${retNo} \u2014 ${totalRetQty} bags \xB7 \u09F3${totalRetAmount.toLocaleString()} (${return_reason != null ? return_reason : "no reason"})${autoApprove ? " \xB7 Auto-approved" : " \xB7 Pending approval"}`;
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, (_k = order.status) != null ? _k : "delivered", (_l = order.status) != null ? _l : "delivered", wfAction, userId, wfComment]
    );
    await auditLog(conn, {
      userId,
      action: wfAction,
      // 'return_submitted'→'other', 'return_approved'→'approved'
      module: "credit_sales",
      recordType: "credit_order_return",
      recordId: returnId,
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

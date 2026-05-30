import { g as defineEventHandler, t as getRouterParam, d as createError, G as readBody, u as getUserSession, m as getDb } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
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
      `SELECT id, customer_id, balance_due, amount_paid FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_order_returns WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const retNo = `RET-${today}-${seq}`;
    const totalQty = items.reduce((s, i) => s + Number(i.returned_qty), 0);
    const totalAmount = items.reduce((s, i) => s + Number(i.returned_qty) * Number(i.unit_price), 0);
    const [result] = await conn.query(
      `INSERT INTO credit_order_returns
         (return_number, order_id, customer_id, return_date, return_type,
          return_reason, total_returned_amount, total_returned_qty,
          status, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        retNo,
        id,
        order.customer_id,
        return_date != null ? return_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        return_type,
        return_reason != null ? return_reason : null,
        totalAmount,
        totalQty,
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
    await conn.commit();
    return { ok: true, return_number: retNo, return_id: returnId, status: "pending" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { return_post as default };
//# sourceMappingURL=return.post.mjs.map

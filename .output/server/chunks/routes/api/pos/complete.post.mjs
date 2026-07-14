import { n as defineEventHandler, a9 as readBody, L as getUserSession, j as createError, u as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const complete_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    branch_id = 1,
    customer_id = null,
    items = [],
    // [{ variant_id, quantity, unit_price }]
    discount = 0,
    payment_method = "Cash",
    payment_reference = null
  } = body != null ? body : {};
  if (!(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "No items in cart" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM orders WHERE DATE(order_date) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const orderNumber = `ORD-${today}-${seq}`;
    const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0);
    const total = Math.max(0, subtotal - Number(discount || 0));
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (order_number, branch_id, customer_id, order_date, order_type,
          subtotal, discount_amount, total_amount,
          payment_method, payment_reference,
          payment_status, order_status, created_by_user_id)
       VALUES (?, ?, ?, NOW(), 'POS', ?, ?, ?, ?, ?, 'Paid', 'Completed', ?)`,
      [
        orderNumber,
        branch_id,
        customer_id || null,
        subtotal,
        Number(discount || 0),
        total,
        payment_method,
        payment_reference || null,
        userId
      ]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      const lineTotal = Number(item.unit_price) * Number(item.quantity);
      await conn.query(
        `INSERT INTO order_items
           (order_id, variant_id, quantity, unit_price, subtotal, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.variant_id, item.quantity, item.unit_price, lineTotal, lineTotal]
      );
      await conn.query(
        `UPDATE product_variants
         SET stock_qty = GREATEST(0, stock_qty - ?)
         WHERE id = ?`,
        [item.quantity, item.variant_id]
      );
    }
    await conn.commit();
    return { ok: true, order_number: orderNumber, order_id: orderId, total };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { complete_post as default };
//# sourceMappingURL=complete.post.mjs.map

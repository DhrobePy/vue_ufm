import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, n as getDb } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    customer_id,
    branch_id,
    // maps to assigned_branch_id in DB
    order_date,
    required_date,
    priority,
    delivery_address,
    // maps to shipping_address in DB
    special_notes,
    // maps to special_instructions in DB
    amount_paid,
    // advance payment
    items
    // [{ product_id, variant_id, qty_bags→quantity, unit_price, discount_amount }]
  } = body != null ? body : {};
  if (!customer_id || !(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "customer_id and items are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_orders WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const orderNo = `CR-${today}-${seq}`;
    let subtotal = 0;
    for (const it of items) {
      const qty = Number((_e = (_d = it.qty_bags) != null ? _d : it.quantity) != null ? _e : 0);
      const line = qty * Number(it.unit_price) - Number((_f = it.discount_amount) != null ? _f : 0);
      subtotal += line;
    }
    const totalAmount = subtotal;
    const advancePaid = Number(amount_paid != null ? amount_paid : 0);
    const balanceDue = Math.max(0, totalAmount - advancePaid);
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`,
          [it.variant_id]
        );
        it.product_id = (_g = pv == null ? void 0 : pv.product_id) != null ? _g : null;
      }
    }
    const [result] = await conn.query(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_approval', ?, ?,
               ?, ?, ?, ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo,
        customer_id,
        branch_id != null ? branch_id : null,
        order_date,
        required_date || null,
        priority != null ? priority : "normal",
        delivery_address || null,
        special_notes || null,
        totalAmount,
        totalAmount,
        advancePaid,
        advancePaid,
        balanceDue,
        userId
      ]
    );
    const orderId = result.insertId;
    for (const it of items) {
      const qty = Number((_i = (_h = it.qty_bags) != null ? _h : it.quantity) != null ? _i : 0);
      const lineTotal = qty * Number(it.unit_price) - Number((_j = it.discount_amount) != null ? _j : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,
          // NOT NULL in DB — looked up above if missing
          (_k = it.variant_id) != null ? _k : null,
          qty,
          Number(it.unit_price),
          Number((_l = it.discount_amount) != null ? _l : 0),
          lineTotal
        ]
      );
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', 'pending_approval', 'submit', ?, 'Order created and submitted for approval', NOW())`,
      [orderId, userId]
    );
    await conn.commit();
    return { ok: true, id: orderId, order_number: orderNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map

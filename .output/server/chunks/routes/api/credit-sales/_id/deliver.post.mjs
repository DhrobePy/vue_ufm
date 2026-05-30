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

const deliver_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    delivery_date,
    truck_number,
    driver_name,
    driver_contact,
    is_final,
    notes,
    items
    // [{ order_item_id, product_id, variant_id, qty_delivered, unit_price }]
  } = body != null ? body : {};
  if (!(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "No delivery items provided" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, status FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_order_deliveries WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const delNo = `DEL-${today}-${seq}`;
    const totalQty = items.reduce((s, i) => s + Number(i.qty_delivered), 0);
    const totalAmount = items.reduce((s, i) => s + Number(i.qty_delivered) * Number(i.unit_price), 0);
    const [result] = await conn.query(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        delNo,
        id,
        order.customer_id,
        delivery_date != null ? delivery_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        truck_number != null ? truck_number : null,
        driver_name != null ? driver_name : null,
        driver_contact != null ? driver_contact : null,
        totalQty,
        totalAmount,
        is_final ? 1 : 0,
        notes != null ? notes : null,
        userId
      ]
    );
    const deliveryId = result.insertId;
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_order_delivery_items
           (delivery_id, order_item_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          deliveryId,
          item.order_item_id,
          item.product_id,
          (_d = item.variant_id) != null ? _d : null,
          Number(item.qty_delivered),
          Number(item.unit_price),
          Number(item.qty_delivered) * Number(item.unit_price)
        ]
      );
    }
    if (is_final) {
      await conn.query(
        `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`,
        [id]
      );
    } else {
      await conn.query(
        `UPDATE credit_orders SET status = CASE WHEN status = 'in_production' THEN 'produced' ELSE status END,
                                  updated_at = NOW() WHERE id = ?`,
        [id]
      );
    }
    await conn.commit();
    return { ok: true, delivery_number: delNo, delivery_id: deliveryId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { deliver_post as default };
//# sourceMappingURL=deliver.post.mjs.map

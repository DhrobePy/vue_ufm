import { q as defineEventHandler, R as getRouterParam, m as createError, J as getQuery, X as getUserSession, z as getDb, B as getDeliveryQrSecret, t as deliveryQrSignature } from '../../../../nitro/nitro.mjs';
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

const dispatchSlip_get = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const deliveryId = Number(getQuery(event).delivery_id) || null;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const conn = await getDb().getConnection();
  try {
    const [[order]] = await conn.query(
      `SELECT o.id, o.order_number, o.status, o.order_date, o.required_date, o.priority,
              o.shipping_address, o.delivery_type, o.total_weight_kg,
              c.name AS customer_name, c.phone_number AS customer_phone,
              b.name AS branch_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    let delivery = null;
    let items;
    if (deliveryId) {
      const [[d]] = await conn.query(
        `SELECT id, delivery_number, delivery_date, truck_number, driver_name, driver_contact, is_final
         FROM credit_order_deliveries WHERE id = ? AND order_id = ?`,
        [deliveryId, id]
      );
      if (!d) throw createError({ statusCode: 404, statusMessage: "Delivery record not found for this order" });
      delivery = d;
      const [deliveryItems] = await conn.query(
        `SELECT di.qty_delivered AS quantity, p.base_name AS product_name, pv.weight_variant, pv.grade
         FROM credit_order_delivery_items di
         JOIN credit_order_items coi ON coi.id = di.order_item_id
         JOIN products p ON p.id = coi.product_id
         LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE di.delivery_id = ?`,
        [deliveryId]
      );
      items = deliveryItems;
    } else {
      const [orderItems] = await conn.query(
        `SELECT coi.quantity, p.base_name AS product_name, pv.weight_variant, pv.grade
         FROM credit_order_items coi
         JOIN products p ON p.id = coi.product_id
         LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE coi.order_id = ?`,
        [id]
      );
      items = orderItems;
    }
    const confParams = deliveryId ? [id, deliveryId] : [id];
    const confSql = deliveryId ? `SELECT gate_out_at, gate_out_by_name, driver_name, vehicle_number, gate_note,
                confirmed_at, confirmed_by_name, received_by
         FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id <=> ?` : `SELECT gate_out_at, gate_out_by_name, driver_name, vehicle_number, gate_note,
                confirmed_at, confirmed_by_name, received_by
         FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id IS NULL`;
    const [[conf]] = await conn.query(confSql, confParams);
    let qrSig = "";
    try {
      const secret = await getDeliveryQrSecret(conn);
      qrSig = deliveryQrSignature(order.order_number, secret, deliveryId);
    } catch (e) {
      console.warn("[dispatch-slip] qr_sig generation failed:", e);
    }
    return {
      order: {
        ...order,
        order_date: String((_a = order.order_date) != null ? _a : "").slice(0, 10),
        required_date: order.required_date ? String(order.required_date).slice(0, 10) : null
      },
      delivery: delivery ? {
        id: delivery.id,
        delivery_number: delivery.delivery_number,
        delivery_date: String((_b = delivery.delivery_date) != null ? _b : "").slice(0, 10),
        truck_number: delivery.truck_number,
        driver_name: delivery.driver_name,
        driver_contact: delivery.driver_contact,
        is_final: !!delivery.is_final
      } : null,
      items: items.map((i) => {
        var _a2, _b2, _c, _d;
        return {
          product_name: (_a2 = i.product_name) != null ? _a2 : "Product",
          weight_variant: (_b2 = i.weight_variant) != null ? _b2 : null,
          grade: (_c = i.grade) != null ? _c : null,
          quantity: Number((_d = i.quantity) != null ? _d : 0)
        };
      }),
      confirmation: conf != null ? conf : null,
      qr_sig: qrSig,
      delivery_id: deliveryId
    };
  } finally {
    conn.release();
  }
});

export { dispatchSlip_get as default };
//# sourceMappingURL=dispatch-slip.get.mjs.map

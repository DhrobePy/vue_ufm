import { o as defineEventHandler, M as getRouterParam, k as createError, Q as getUserSession, x as getDb, y as getDeliveryQrSecret, r as deliveryQrSignature } from '../../../../nitro/nitro.mjs';
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
  var _a;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
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
    const [items] = await conn.query(
      `SELECT coi.quantity, p.base_name AS product_name, pv.weight_variant, pv.grade
       FROM credit_order_items coi
       JOIN products p ON p.id = coi.product_id
       LEFT JOIN product_variants pv ON pv.id = coi.variant_id
       WHERE coi.order_id = ?`,
      [id]
    );
    const [[conf]] = await conn.query(
      `SELECT gate_out_at, gate_out_by_name, driver_name, vehicle_number, gate_note,
              confirmed_at, confirmed_by_name, received_by
       FROM cr_delivery_confirmations WHERE order_id = ?`,
      [id]
    );
    let qrSig = "";
    try {
      const secret = await getDeliveryQrSecret(conn);
      qrSig = deliveryQrSignature(order.order_number, secret);
    } catch (e) {
      console.warn("[dispatch-slip] qr_sig generation failed:", e);
    }
    return {
      order: {
        ...order,
        order_date: String((_a = order.order_date) != null ? _a : "").slice(0, 10),
        required_date: order.required_date ? String(order.required_date).slice(0, 10) : null
      },
      items: items.map((i) => {
        var _a2, _b, _c, _d;
        return {
          product_name: (_a2 = i.product_name) != null ? _a2 : "Product",
          weight_variant: (_b = i.weight_variant) != null ? _b : null,
          grade: (_c = i.grade) != null ? _c : null,
          quantity: Number((_d = i.quantity) != null ? _d : 0)
        };
      }),
      confirmation: conf != null ? conf : null,
      qr_sig: qrSig
    };
  } finally {
    conn.release();
  }
});

export { dispatchSlip_get as default };
//# sourceMappingURL=dispatch-slip.get.mjs.map

import { j as defineEventHandler, F as getUserSession, f as createError, Y as query, v as getRequestHeader, q as getDb, b as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const deliver_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const orderNumber = ((_b = (_a = event.context.params) == null ? void 0 : _a.order) != null ? _b : "").trim().toUpperCase();
  const session = await getUserSession(event);
  const user = session == null ? void 0 : session.user;
  if (!(user == null ? void 0 : user.id)) {
    throw createError({ statusCode: 401, statusMessage: "Login required to confirm delivery" });
  }
  const role = ((_c = user.role) != null ? _c : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`
    );
    let ids = [];
    try {
      ids = ((_d = rows[0]) == null ? void 0 : _d.setting_value) ? (_e = JSON.parse(rows[0].setting_value).delivery_confirm_user_ids) != null ? _e : [] : [];
    } catch {
    }
    if (!ids.map(Number).includes(Number(user.id))) {
      throw createError({ statusCode: 403, statusMessage: "You are not authorized to confirm deliveries" });
    }
  }
  const userId = Number(user.id);
  const userName = (_g = (_f = user.display_name) != null ? _f : user.name) != null ? _g : `user #${userId}`;
  const ip = (_i = (_h = getRequestHeader(event, "x-forwarded-for")) != null ? _h : getRequestHeader(event, "x-real-ip")) != null ? _i : void 0;
  const ua = (_j = getRequestHeader(event, "user-agent")) != null ? _j : null;
  const orders = await query(
    `SELECT id, customer_id, status, order_number, order_date
     FROM credit_orders WHERE order_number = ? LIMIT 1`,
    [orderNumber]
  );
  if (!orders.length) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  const order = orders[0];
  if (order.status !== "dispatched") {
    throw createError({
      statusCode: 400,
      statusMessage: order.status === "delivered" || order.status === "completed" ? "Order is already delivered" : `Order must be dispatched first (current status: ${order.status})`
    });
  }
  const items = await query(
    `SELECT oi.id AS order_item_id, oi.product_id, oi.variant_id,
            oi.quantity, oi.unit_price,
            COALESCE((
              SELECT SUM(di.qty_delivered)
              FROM credit_order_delivery_items di
              JOIN credit_order_deliveries d ON d.id = di.delivery_id
              WHERE di.order_item_id = oi.id AND d.order_id = oi.order_id
            ), 0) AS qty_already_delivered
     FROM credit_order_items oi
     WHERE oi.order_id = ?`,
    [order.id]
  );
  const remaining = items.map((i) => ({ ...i, qty_remaining: Number(i.quantity) - Number(i.qty_already_delivered) })).filter((i) => i.qty_remaining > 0);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let delNo = null;
    if (remaining.length) {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      const [[cnt]] = await conn.query(
        `SELECT COUNT(*) AS n FROM credit_order_deliveries WHERE DATE(created_at) = CURDATE()`
      );
      delNo = `DEL-${today}-${String(((_k = cnt.n) != null ? _k : 0) + 1).padStart(4, "0")}`;
      const totalQty = remaining.reduce((s, i) => s + i.qty_remaining, 0);
      const totalAmount = remaining.reduce((s, i) => s + i.qty_remaining * Number(i.unit_price), 0);
      const delivDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const [result] = await conn.query(
        `INSERT INTO credit_order_deliveries
           (delivery_number, order_id, customer_id, delivery_date,
            truck_number, driver_name, driver_contact,
            total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
         VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, ?, 1, ?, ?)`,
        [
          delNo,
          order.id,
          order.customer_id,
          delivDate,
          totalQty,
          totalAmount,
          `Final delivery confirmed via QR scan by ${userName}`,
          userId
        ]
      );
      const deliveryId = result.insertId;
      for (const item of remaining) {
        await conn.query(
          `INSERT INTO credit_order_delivery_items
             (delivery_id, order_item_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            deliveryId,
            item.order_item_id,
            item.product_id,
            (_l = item.variant_id) != null ? _l : null,
            item.qty_remaining,
            Number(item.unit_price),
            item.qty_remaining * Number(item.unit_price)
          ]
        );
      }
    }
    await conn.query(
      `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`,
      [order.id]
    );
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, 'delivered', 'delivered', ?, ?, NOW())`,
      [
        order.id,
        order.status,
        userId,
        delNo ? `Final delivery ${delNo} confirmed via QR scan` : "Delivery confirmed via QR scan (all items already delivered)"
      ]
    );
    await auditLog(conn, {
      userId,
      action: "delivered",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: order.id,
      referenceNumber: delNo != null ? delNo : order.order_number,
      description: `Final delivery for Order ${order.order_number} confirmed via QR scan by ${userName}`,
      severity: "info",
      ipAddress: ip
    });
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  try {
    await getDb().query(
      `INSERT INTO order_delivery_scans
         (order_id, order_number, scan_type, pin_used, pin_correct, ip_address, user_agent, notes)
       VALUES (?, ?, 'delivery', NULL, 1, ?, ?, ?)`,
      [
        order.id,
        orderNumber,
        ip != null ? ip : null,
        ua ? ua.slice(0, 500) : null,
        `Delivery confirmed by ${userName}`
      ]
    );
  } catch (scanErr) {
    console.warn("[verify/deliver] scan audit log skipped:", scanErr == null ? void 0 : scanErr.message);
  }
  return {
    ok: true,
    new_status: "delivered",
    message: "\u2705 Delivery confirmed \u2014 order marked as delivered."
  };
});

export { deliver_post as default };
//# sourceMappingURL=deliver.post.mjs.map

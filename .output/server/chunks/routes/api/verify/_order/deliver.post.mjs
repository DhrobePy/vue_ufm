import { q as defineEventHandler, as as readBody, X as getUserSession, m as createError, ap as query, K as getRequestHeader, aR as verifyDeliveryQrSignature, z as getDb, a6 as nextDocNumber, g as auditLog, aJ as sendTelegram, ax as recordQrScan } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const deliver_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const orderNumber = ((_b = (_a = event.context.params) == null ? void 0 : _a.order) != null ? _b : "").trim().toUpperCase();
  const body = await readBody(event);
  const sig = String((_c = body == null ? void 0 : body.sig) != null ? _c : "").trim();
  const receivedBy = (body == null ? void 0 : body.received_by) ? String(body.received_by).trim().slice(0, 150) : null;
  const note = (body == null ? void 0 : body.note) ? String(body.note).trim().slice(0, 500) : null;
  const session = await getUserSession(event);
  const user = session == null ? void 0 : session.user;
  if (!(user == null ? void 0 : user.id)) {
    throw createError({ statusCode: 401, statusMessage: "Login required to confirm delivery" });
  }
  const role = ((_d = user.role) != null ? _d : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`
    );
    let ids = [];
    try {
      ids = ((_e = rows[0]) == null ? void 0 : _e.setting_value) ? (_f = JSON.parse(rows[0].setting_value).delivery_confirm_user_ids) != null ? _f : [] : [];
    } catch {
    }
    if (!ids.map(Number).includes(Number(user.id))) {
      throw createError({ statusCode: 403, statusMessage: "You are not authorized to confirm deliveries" });
    }
  }
  const userId = Number(user.id);
  const userName = (_h = (_g = user.display_name) != null ? _g : user.name) != null ? _h : `user #${userId}`;
  const ip = (_j = (_i = getRequestHeader(event, "x-forwarded-for")) != null ? _i : getRequestHeader(event, "x-real-ip")) != null ? _j : void 0;
  if (!sig) throw createError({ statusCode: 400, statusMessage: "Missing verification parameters" });
  const sigValid = await verifyDeliveryQrSignature(getDb(), orderNumber, sig);
  if (!sigValid) throw createError({ statusCode: 403, statusMessage: "Invalid or altered QR code" });
  const orders = await query(
    `SELECT o.id, o.customer_id, o.status, o.order_number, o.order_date, c.name AS customer_name
     FROM credit_orders o JOIN customers c ON c.id = o.customer_id
     WHERE o.order_number = ? LIMIT 1`,
    [orderNumber]
  );
  if (!orders.length) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  const order = orders[0];
  if (!["goods_on_board", "shipped"].includes(order.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: order.status === "delivered" || order.status === "completed" ? "Order is already delivered" : `Order must be goods-on-board or shipped first (current status: ${order.status})`
    });
  }
  const [confRows] = await getDb().query(
    `SELECT gate_out_at, confirmed_at FROM cr_delivery_confirmations WHERE order_id = ?`,
    [order.id]
  );
  const conf = confRows == null ? void 0 : confRows[0];
  if (!(conf == null ? void 0 : conf.gate_out_at))
    throw createError({ statusCode: 409, statusMessage: "Gate pass has not been recorded for this order yet \u2014 scan at the gate first." });
  if (conf.confirmed_at)
    throw createError({ statusCode: 409, statusMessage: "Delivery already confirmed for this order" });
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
      delNo = await nextDocNumber(conn, "DEL", "credit_order_deliveries", "delivery_number");
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
            (_k = item.variant_id) != null ? _k : null,
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
    await conn.query(
      `UPDATE cr_delivery_confirmations
       SET confirmed_at = NOW(), confirmed_by_user_id = ?, confirmed_by_name = ?, received_by = ?, note = ?
       WHERE order_id = ? AND confirmed_at IS NULL`,
      [userId, userName, receivedBy, note, order.id]
    );
    await auditLog(conn, {
      userId,
      action: "delivered",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: order.id,
      referenceNumber: delNo != null ? delNo : order.order_number,
      description: `Final delivery for Order ${order.order_number} confirmed via QR scan by ${userName}` + (receivedBy ? ` \u2014 received by ${receivedBy}` : ""),
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
  sendTelegram(
    `\u2705 <b>Delivery Confirmed</b>
${order.order_number} \u2014 ${(_l = order.customer_name) != null ? _l : ""}
By ${userName}${receivedBy ? ` \xB7 Received by ${receivedBy}` : ""}`,
    "dispatch"
  );
  try {
    await recordQrScan(getDb(), {
      orderId: order.id,
      orderNumber,
      stage: "delivery",
      scannerId: userId,
      scannerName: userName,
      ip: ip != null ? ip : null
    });
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

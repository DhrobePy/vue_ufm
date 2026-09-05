import { q as defineEventHandler, X as getUserSession, m as createError, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, D as DISPATCH_ROLES, e as PRODUCTION_ROLES, au as readBody, K as getRequestHeader, z as getDb, aW as verifyDeliveryQrSignature, H as getOrderGateState, g as auditLog, az as recordQrScan, aO as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const GATE_ROLES = [...ADMIN_ROLES, ...ACCOUNTS_ROLES, ...DISPATCH_ROLES, ...PRODUCTION_ROLES];
const gate_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Please sign in to continue" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!GATE_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Your role is not authorised to release goods at the gate" });
  const orderNumber = ((_d = (_c = event.context.params) == null ? void 0 : _c.order) != null ? _d : "").trim().toUpperCase();
  const body = await readBody(event);
  const sig = String((_e = body == null ? void 0 : body.sig) != null ? _e : "").trim();
  const driverName = String((_f = body == null ? void 0 : body.driver_name) != null ? _f : "").trim();
  const vehicleNumber = String((_g = body == null ? void 0 : body.vehicle_number) != null ? _g : "").trim();
  const gateNote = (body == null ? void 0 : body.gate_note) ? String(body.gate_note).trim().slice(0, 500) : null;
  const deliveryId = Number(body == null ? void 0 : body.delivery_id) || null;
  const ip = (_i = (_h = getRequestHeader(event, "x-forwarded-for")) != null ? _h : getRequestHeader(event, "x-real-ip")) != null ? _i : void 0;
  if (!sig) throw createError({ statusCode: 400, statusMessage: "Missing verification parameters" });
  if (!driverName || !vehicleNumber)
    throw createError({ statusCode: 400, statusMessage: "Enter the driver name and vehicle number to release the goods" });
  const conn = await getDb().getConnection();
  let committedOrder = null;
  try {
    const sigValid = await verifyDeliveryQrSignature(conn, orderNumber, sig, deliveryId);
    if (!sigValid)
      throw createError({ statusCode: 403, statusMessage: "Invalid or altered QR code" });
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, order_number, status FROM credit_orders WHERE order_number = ? LIMIT 1 FOR UPDATE`,
      [orderNumber]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const allowedStatuses = deliveryId ? ["goods_on_board", "shipped"] : ["goods_on_board"];
    if (!allowedStatuses.includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `This order is not ready to leave the gate (status: ${order.status.replace(/_/g, " ")})`
      });
    const gate = await getOrderGateState(conn, order.id);
    if (gate.dispatchHold && !gate.dispatchCleared)
      throw createError({ statusCode: 423, statusMessage: "DO NOT RELEASE \u2014 this order is HELD and not cleared for dispatch. Clear it in Payment Watch first." });
    if (deliveryId) {
      const [[delivery]] = await conn.query(
        `SELECT id FROM credit_order_deliveries WHERE id = ? AND order_id = ?`,
        [deliveryId, order.id]
      );
      if (!delivery) throw createError({ statusCode: 404, statusMessage: "Delivery record not found for this order" });
    }
    const [[existing]] = await conn.query(
      deliveryId ? `SELECT gate_out_at FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id <=> ?` : `SELECT gate_out_at FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id IS NULL`,
      deliveryId ? [order.id, deliveryId] : [order.id]
    );
    if (existing == null ? void 0 : existing.gate_out_at)
      throw createError({ statusCode: 409, statusMessage: deliveryId ? "Gate pass already recorded for this delivery" : "Gate pass already recorded for this order" });
    if (existing) {
      await conn.query(
        deliveryId ? `UPDATE cr_delivery_confirmations
             SET gate_out_at = NOW(), gate_out_by_user_id = ?, gate_out_by_name = ?,
                 driver_name = ?, vehicle_number = ?, gate_note = ?
             WHERE order_id = ? AND delivery_id <=> ?` : `UPDATE cr_delivery_confirmations
             SET gate_out_at = NOW(), gate_out_by_user_id = ?, gate_out_by_name = ?,
                 driver_name = ?, vehicle_number = ?, gate_note = ?
             WHERE order_id = ? AND delivery_id IS NULL`,
        deliveryId ? [userId, userName, driverName, vehicleNumber, gateNote, order.id, deliveryId] : [userId, userName, driverName, vehicleNumber, gateNote, order.id]
      );
    } else {
      await conn.query(
        `INSERT INTO cr_delivery_confirmations
           (order_id, order_number, delivery_id, gate_out_at, gate_out_by_user_id, gate_out_by_name, driver_name, vehicle_number, gate_note)
         VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [order.id, order.order_number, deliveryId, userId, userName, driverName, vehicleNumber, gateNote]
      );
    }
    if (order.status !== "shipped")
      await conn.query(`UPDATE credit_orders SET status = 'shipped', updated_at = NOW() WHERE id = ?`, [order.id]);
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, 'shipped', 'gate_out', ?, ?, NOW())`,
      [order.id, order.status, userId, `Gate pass \u2014 goods released by ${userName} (driver ${driverName}, vehicle ${vehicleNumber})${deliveryId ? ` \xB7 delivery #${deliveryId}` : ""}`]
    );
    await auditLog(conn, {
      userId,
      action: "other",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: order.id,
      referenceNumber: order.order_number,
      description: `Gate pass \u2014 goods released by ${userName} (driver ${driverName}, vehicle ${vehicleNumber})${deliveryId ? ` \xB7 delivery #${deliveryId}` : ""}`,
      severity: "info",
      ipAddress: ip
    });
    await conn.commit();
    committedOrder = { id: order.id, order_number: order.order_number };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  try {
    await recordQrScan(getDb(), {
      orderId: committedOrder.id,
      orderNumber: committedOrder.order_number,
      stage: "gate",
      scannerId: userId,
      scannerName: userName,
      ip: ip != null ? ip : null
    });
  } catch (scanErr) {
    console.warn("[verify/gate] scan log failed:", scanErr == null ? void 0 : scanErr.message);
  }
  sendTelegram(
    `\u{1F6AA} <b>Gate Pass \u2014 Goods Released</b>
${committedOrder.order_number}
Driver: ${driverName} \xB7 Vehicle: ${vehicleNumber}
By ${userName}`,
    "dispatch"
  );
  return { ok: true, message: "Gate pass recorded \u2014 goods released. Scan again at the customer to confirm delivery." };
});

export { gate_post as default };
//# sourceMappingURL=gate.post.mjs.map

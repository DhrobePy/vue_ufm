import { o as defineEventHandler, Q as getUserSession, k as createError, a as ADMIN_ROLES, A as ACCOUNTS_ROLES, D as DISPATCH_ROLES, P as PRODUCTION_ROLES, af as readBody, G as getRequestHeader, x as getDb, aC as verifyDeliveryQrSignature, E as getOrderGateState, e as auditLog, aj as recordQrScan, au as sendTelegram } from '../../../../nitro/nitro.mjs';
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
  const ip = (_i = (_h = getRequestHeader(event, "x-forwarded-for")) != null ? _h : getRequestHeader(event, "x-real-ip")) != null ? _i : void 0;
  if (!sig) throw createError({ statusCode: 400, statusMessage: "Missing verification parameters" });
  if (!driverName || !vehicleNumber)
    throw createError({ statusCode: 400, statusMessage: "Enter the driver name and vehicle number to release the goods" });
  const conn = await getDb().getConnection();
  let committedOrder = null;
  try {
    const sigValid = await verifyDeliveryQrSignature(conn, orderNumber, sig);
    if (!sigValid)
      throw createError({ statusCode: 403, statusMessage: "Invalid or altered QR code" });
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, order_number, status FROM credit_orders WHERE order_number = ? LIMIT 1 FOR UPDATE`,
      [orderNumber]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (order.status !== "goods_on_board")
      throw createError({
        statusCode: 409,
        statusMessage: `This order is not ready to leave the gate (status: ${order.status.replace(/_/g, " ")})`
      });
    const gate = await getOrderGateState(conn, order.id);
    if (gate.dispatchHold && !gate.dispatchCleared)
      throw createError({ statusCode: 423, statusMessage: "DO NOT RELEASE \u2014 this order is HELD and not cleared for dispatch. Clear it in Payment Watch first." });
    const [[existing]] = await conn.query(
      `SELECT gate_out_at FROM cr_delivery_confirmations WHERE order_id = ?`,
      [order.id]
    );
    if (existing == null ? void 0 : existing.gate_out_at)
      throw createError({ statusCode: 409, statusMessage: "Gate pass already recorded for this order" });
    await conn.query(
      `INSERT INTO cr_delivery_confirmations
         (order_id, order_number, gate_out_at, gate_out_by_user_id, gate_out_by_name, driver_name, vehicle_number, gate_note)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         gate_out_at = NOW(), gate_out_by_user_id = VALUES(gate_out_by_user_id),
         gate_out_by_name = VALUES(gate_out_by_name), driver_name = VALUES(driver_name),
         vehicle_number = VALUES(vehicle_number), gate_note = VALUES(gate_note)`,
      [order.id, order.order_number, userId, userName, driverName, vehicleNumber, gateNote]
    );
    await conn.query(`UPDATE credit_orders SET status = 'shipped', updated_at = NOW() WHERE id = ?`, [order.id]);
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'goods_on_board', 'shipped', 'gate_out', ?, ?, NOW())`,
      [order.id, userId, `Gate pass \u2014 goods released by ${userName} (driver ${driverName}, vehicle ${vehicleNumber})`]
    );
    await auditLog(conn, {
      userId,
      action: "other",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: order.id,
      referenceNumber: order.order_number,
      description: `Gate pass \u2014 goods released by ${userName} (driver ${driverName}, vehicle ${vehicleNumber})`,
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
By ${userName}`
  );
  return { ok: true, message: "Gate pass recorded \u2014 goods released. Scan again at the customer to confirm delivery." };
});

export { gate_post as default };
//# sourceMappingURL=gate.post.mjs.map

import { o as defineEventHandler, O as getUserSession, k as createError, E as getQuery, w as getDb, ay as verifyDeliveryQrSignature, C as getOrderGateState, F as getRequestHeader, ag as recordQrScan, a as ADMIN_ROLES, A as ACCOUNTS_ROLES, D as DISPATCH_ROLES, P as PRODUCTION_ROLES } from '../../../nitro/nitro.mjs';
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
const _order__get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Please sign in to continue" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const orderNumber = ((_d = (_c = event.context.params) == null ? void 0 : _c.order) != null ? _d : "").trim().toUpperCase();
  const sig = String((_e = getQuery(event).sig) != null ? _e : "").trim();
  if (!orderNumber || !sig)
    throw createError({ statusCode: 400, statusMessage: "Missing verification parameters" });
  const conn = await getDb().getConnection();
  try {
    const sigValid = await verifyDeliveryQrSignature(conn, orderNumber, sig);
    if (!sigValid)
      throw createError({ statusCode: 403, statusMessage: "Invalid or altered QR code \u2014 this is not a genuine dispatch slip" });
    const [[order]] = await conn.query(
      `SELECT o.id, o.order_number, o.status, o.order_date, o.required_date, o.created_at,
              c.name AS customer_name, b.name AS branch_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.order_number = ? LIMIT 1`,
      [orderNumber]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "No order found for this code" });
    const [items] = await conn.query(
      `SELECT coi.quantity, p.base_name AS product_name, pv.weight_variant, pv.grade
       FROM credit_order_items coi
       JOIN products p ON p.id = coi.product_id
       LEFT JOIN product_variants pv ON pv.id = coi.variant_id
       WHERE coi.order_id = ?`,
      [order.id]
    );
    const [[conf]] = await conn.query(
      `SELECT * FROM cr_delivery_confirmations WHERE order_id = ?`,
      [order.id]
    );
    const gateOut = !!(conf == null ? void 0 : conf.gate_out_at);
    const delivered = !!(conf == null ? void 0 : conf.confirmed_at);
    const stage = delivered ? "done" : gateOut ? "delivery" : "gate";
    const gate = await getOrderGateState(conn, order.id);
    const dispatchOk = !gate.dispatchHold || gate.dispatchCleared;
    const [scans] = await conn.query(
      `SELECT stage, reused, scanned_by_name, scanned_at FROM cr_qr_scan_log
       WHERE order_id = ? ORDER BY scanned_at DESC LIMIT 20`,
      [order.id]
    );
    const ip = (_g = (_f = getRequestHeader(event, "x-forwarded-for")) != null ? _f : getRequestHeader(event, "x-real-ip")) != null ? _g : null;
    const scanTotal = await recordQrScan(conn, {
      orderId: order.id,
      orderNumber: order.order_number,
      stage,
      scannerId: userId,
      scannerName: userName,
      ip
    });
    const isGateRole = ADMIN_ROLES.includes(role) || GATE_ROLES.includes(role);
    let canDeliver = ADMIN_ROLES.includes(role);
    if (!canDeliver) {
      try {
        const [[settingsRow]] = await conn.query(
          `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`
        );
        const ids = (settingsRow == null ? void 0 : settingsRow.setting_value) ? (_h = JSON.parse(settingsRow.setting_value).delivery_confirm_user_ids) != null ? _h : [] : [];
        canDeliver = ids.map(Number).includes(userId);
      } catch {
      }
    }
    return {
      stage,
      order: {
        order_number: order.order_number,
        status: order.status,
        order_date: String((_i = order.order_date) != null ? _i : "").slice(0, 10),
        required_date: order.required_date ? String(order.required_date).slice(0, 10) : null,
        customer_name: (_j = order.customer_name) != null ? _j : "\u2014",
        branch_name: (_k = order.branch_name) != null ? _k : "\u2014"
      },
      items: items.map((i) => {
        var _a2, _b2, _c2, _d2;
        return {
          product_name: (_a2 = i.product_name) != null ? _a2 : "Product",
          weight_variant: (_b2 = i.weight_variant) != null ? _b2 : null,
          grade: (_c2 = i.grade) != null ? _c2 : null,
          quantity: Number((_d2 = i.quantity) != null ? _d2 : 0)
        };
      }),
      confirmation: conf ? {
        gate_out_at: conf.gate_out_at,
        gate_out_by_name: conf.gate_out_by_name,
        driver_name: conf.driver_name,
        vehicle_number: conf.vehicle_number,
        gate_note: conf.gate_note,
        confirmed_at: conf.confirmed_at,
        confirmed_by_name: conf.confirmed_by_name,
        received_by: conf.received_by,
        note: conf.note
      } : null,
      dispatch_ok: dispatchOk,
      can_gate: isGateRole,
      can_deliver: canDeliver,
      scan_total: scanTotal,
      is_reuse: stage === "done",
      scans: scans.map((s) => ({
        stage: s.stage,
        reused: !!s.reused,
        scanned_by_name: s.scanned_by_name,
        scanned_at: s.scanned_at
      }))
    };
  } finally {
    conn.release();
  }
});

export { _order__get as default };
//# sourceMappingURL=_order_.get.mjs.map

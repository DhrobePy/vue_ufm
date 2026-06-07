import { h as defineEventHandler, e as createError, J as query, q as getRequestHeader } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _order__get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const orderNumber = ((_b = (_a = event.context.params) == null ? void 0 : _a.order) != null ? _b : "").trim().toUpperCase();
  if (!orderNumber) {
    throw createError({ statusCode: 400, statusMessage: "Order number is required" });
  }
  const orders = await query(
    `SELECT o.id, o.order_number, o.status, o.order_date, o.required_date,
            o.total_amount, o.amount_paid, o.balance_due,
            o.shipping_address, o.special_instructions,
            o.dispatch_pin IS NOT NULL AS has_dispatch_pin,
            o.created_at,
            c.name AS customer_name,
            b.name AS branch_name
     FROM credit_orders o
     LEFT JOIN customers  c ON c.id = o.customer_id
     LEFT JOIN branches   b ON b.id = o.assigned_branch_id
     WHERE o.order_number = ?
     LIMIT 1`,
    [orderNumber]
  );
  if (!orders.length) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }
  const order = orders[0];
  const scans = await query(
    `SELECT scan_type, pin_correct, scanned_at, notes
     FROM order_delivery_scans
     WHERE order_number = ?
     ORDER BY scanned_at DESC
     LIMIT 30`,
    [orderNumber]
  );
  const ip = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : null;
  const ua = (_e = getRequestHeader(event, "user-agent")) != null ? _e : null;
  query(
    `INSERT INTO order_delivery_scans (order_id, order_number, scan_type, pin_correct, ip_address, user_agent)
     VALUES (?, ?, 'view', 0, ?, ?)`,
    [order.id, orderNumber, ip, ua ? ua.slice(0, 500) : null]
  ).catch(() => {
  });
  return {
    order: {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      order_date: String((_f = order.order_date) != null ? _f : "").slice(0, 10),
      required_date: order.required_date ? String(order.required_date).slice(0, 10) : null,
      total_amount: Number((_g = order.total_amount) != null ? _g : 0),
      amount_paid: Number((_h = order.amount_paid) != null ? _h : 0),
      balance_due: Number((_i = order.balance_due) != null ? _i : 0),
      customer_name: (_j = order.customer_name) != null ? _j : "\u2014",
      branch_name: (_k = order.branch_name) != null ? _k : "\u2014",
      has_dispatch_pin: !!order.has_dispatch_pin,
      created_at: order.created_at
    },
    scans: scans.map((s) => {
      var _a2;
      return {
        scan_type: s.scan_type,
        pin_correct: !!s.pin_correct,
        scanned_at: s.scanned_at,
        notes: (_a2 = s.notes) != null ? _a2 : null
      };
    })
  };
});

export { _order__get as default };
//# sourceMappingURL=_order_.get.mjs.map

import { h as defineEventHandler, L as readBody, e as createError, q as getRequestHeader, J as query, n as getDb } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const confirm_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const orderNumber = ((_b = (_a = event.context.params) == null ? void 0 : _a.order) != null ? _b : "").trim().toUpperCase();
  const body = await readBody(event);
  const { pin, scan_type = "dispatch" } = body != null ? body : {};
  if (!pin) {
    throw createError({ statusCode: 400, statusMessage: "PIN is required" });
  }
  if (!["dispatch", "delivery"].includes(scan_type)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid scan_type" });
  }
  const ip = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : null;
  const ua = (_e = getRequestHeader(event, "user-agent")) != null ? _e : null;
  const orders = await query(
    `SELECT id, status, dispatch_pin, delivery_pin FROM credit_orders WHERE order_number = ? LIMIT 1`,
    [orderNumber]
  );
  if (!orders.length) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }
  const order = orders[0];
  const pinField = scan_type === "delivery" ? "delivery_pin" : "dispatch_pin";
  const storedPin = order[pinField];
  const pinCorrect = storedPin && String(pin).trim() === String(storedPin).trim();
  let newStatus = null;
  let transitionNote = "";
  if (pinCorrect) {
    if (scan_type === "dispatch" && order.status === "ready_to_ship") {
      newStatus = "dispatched";
      transitionNote = "Dispatch confirmed via QR PIN scan";
    } else if (scan_type === "dispatch" && order.status === "dispatched") {
      transitionNote = "Re-scan: order already dispatched";
    } else if (scan_type === "delivery" && order.status === "dispatched") {
      newStatus = "delivered";
      transitionNote = "Delivery confirmed via QR PIN scan";
    }
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (newStatus) {
      await conn.query(
        `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
        [newStatus, order.id]
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  try {
    const pool = getDb();
    await pool.query(
      `INSERT INTO order_delivery_scans
         (order_id, order_number, scan_type, pin_used, pin_correct, ip_address, user_agent, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        orderNumber,
        scan_type,
        String(pin).slice(0, 10),
        pinCorrect ? 1 : 0,
        ip,
        ua ? ua.slice(0, 500) : null,
        transitionNote || null
      ]
    );
  } catch (scanErr) {
    console.warn("[verify/confirm] scan audit log skipped (table may not exist yet):", scanErr == null ? void 0 : scanErr.message);
  }
  if (!pinCorrect) {
    return {
      ok: false,
      pin_correct: false,
      message: "Incorrect PIN. Please check the invoice and try again."
    };
  }
  return {
    ok: true,
    pin_correct: true,
    status_updated: !!newStatus,
    new_status: newStatus != null ? newStatus : order.status,
    message: newStatus ? scan_type === "dispatch" ? "\u2705 Dispatch confirmed \u2014 goods have left the warehouse." : "\u2705 Delivery confirmed \u2014 order marked as delivered." : scan_type === "dispatch" ? `\u2705 PIN verified. Order is already marked as "${order.status}".` : `\u2705 PIN verified. Current status: "${order.status}".`
  };
});

export { confirm_post as default };
//# sourceMappingURL=confirm.post.mjs.map

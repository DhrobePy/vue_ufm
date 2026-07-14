import { n as defineEventHandler, a7 as readBody, j as createError, z as getRequestHeader, u as getDb, a1 as postGoodsOnBoardInvoice, S as SYSTEM_USER_ID } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
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
  const db = getDb();
  const conn = await db.getConnection();
  let newStatus = null;
  let transitionNote = "";
  let pinCorrect = false;
  let gateBlockedMessage = null;
  let orderForLog = null;
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.id, o.status, o.dispatch_pin, o.delivery_pin, o.order_number,
              o.customer_id, o.total_amount, o.balance_due, c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number = ? LIMIT 1 FOR UPDATE`,
      [orderNumber]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    orderForLog = order;
    const pinField = scan_type === "delivery" ? "delivery_pin" : "dispatch_pin";
    const storedPin = order[pinField];
    pinCorrect = !!storedPin && String(pin).trim() === String(storedPin).trim();
    if (pinCorrect) {
      if (scan_type === "dispatch" && order.status === "ready_to_ship") {
        try {
          const result = await postGoodsOnBoardInvoice(conn, {
            orderId: order.id,
            orderNumber: order.order_number,
            customerId: order.customer_id,
            customerName: order.customer_name,
            totalAmount: Number(order.total_amount),
            balanceDue: Number(order.balance_due),
            userId: SYSTEM_USER_ID,
            userName: "QR Gate Scan"
          });
          newStatus = "goods_on_board";
          transitionNote = "Goods on board confirmed via QR PIN scan";
          if (!result.alreadyPosted) transitionNote += " \u2014 invoice posted to ledger";
        } catch (gateErr) {
          gateBlockedMessage = (_f = gateErr == null ? void 0 : gateErr.statusMessage) != null ? _f : "Dispatch is on hold \u2014 see accounts";
          transitionNote = `Scan refused: ${gateBlockedMessage}`;
        }
      } else if (scan_type === "dispatch" && order.status === "goods_on_board") {
        transitionNote = "Re-scan: order already goods on board";
      }
      if (newStatus) {
        await conn.query(
          `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
          [newStatus, order.id]
        );
        await conn.query(
          `INSERT INTO credit_order_workflow
             (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
           VALUES (?, ?, ?, 'goods_on_board', ?, ?, NOW())`,
          [order.id, order.status, newStatus, SYSTEM_USER_ID, transitionNote]
        );
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    throw createError({ statusCode: 500, statusMessage: (_h = (_g = e == null ? void 0 : e.sqlMessage) != null ? _g : e == null ? void 0 : e.message) != null ? _h : "Scan failed" });
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
        (_i = orderForLog == null ? void 0 : orderForLog.id) != null ? _i : null,
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
  if (gateBlockedMessage) {
    return {
      ok: false,
      pin_correct: true,
      status_updated: false,
      new_status: (_j = orderForLog == null ? void 0 : orderForLog.status) != null ? _j : null,
      message: `\u26D4 ${gateBlockedMessage}`
    };
  }
  return {
    ok: true,
    pin_correct: true,
    status_updated: !!newStatus,
    new_status: newStatus != null ? newStatus : orderForLog == null ? void 0 : orderForLog.status,
    message: newStatus ? scan_type === "dispatch" ? "\u2705 Goods on board confirmed \u2014 invoice posted, goods have left the warehouse." : "\u2705 Delivery confirmed \u2014 order marked as delivered." : scan_type === "dispatch" ? `\u2705 PIN verified. Order is already marked as "${orderForLog == null ? void 0 : orderForLog.status}".` : `\u2705 PIN verified. Current status: "${orderForLog == null ? void 0 : orderForLog.status}".`
  };
});

export { confirm_post as default };
//# sourceMappingURL=confirm.post.mjs.map

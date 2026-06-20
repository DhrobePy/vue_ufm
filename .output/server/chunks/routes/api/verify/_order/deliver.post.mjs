import { h as defineEventHandler, x as getUserSession, e as createError, K as query, q as getRequestHeader, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
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
      const [[lastLedger]] = await conn.query(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [order.customer_id]
      );
      const newBal = Number((_m = lastLedger == null ? void 0 : lastLedger.bal) != null ? _m : 0) + totalAmount;
      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
         VALUES (?, ?, 'invoice', 'credit_order_delivery', ?, ?, ?, ?, 0, ?, ?)`,
        [
          order.customer_id,
          delivDate,
          deliveryId,
          delNo,
          `Full Delivery \u2014 ${delNo} (Order ${order.order_number}, via QR)`,
          totalAmount,
          newBal,
          userId
        ]
      );
      await conn.query(
        `UPDATE customers SET current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?`,
        [totalAmount, order.customer_id]
      );
      try {
        const [[arAccount]] = await conn.query(
          `SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Receivable' ORDER BY id ASC LIMIT 1`
        );
        const [[revenueAccount]] = await conn.query(
          `SELECT id FROM chart_of_accounts WHERE account_type = 'Revenue' ORDER BY id ASC LIMIT 1`
        );
        if ((arAccount == null ? void 0 : arAccount.id) && (revenueAccount == null ? void 0 : revenueAccount.id)) {
          const jeDesc = `Sales \u2014 ${delNo} (Order ${order.order_number}, Final Delivery via QR)`;
          const [jeRes] = await conn.query(
            `INSERT INTO journal_entries
               (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
             VALUES (?, ?, 'CreditOrderDelivery', ?, ?)`,
            [delivDate, jeDesc.slice(0, 255), deliveryId, userId]
          );
          await conn.query(
            `INSERT INTO transaction_lines
               (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, 0.00, ?)`,
            [jeRes.insertId, arAccount.id, totalAmount, delNo]
          );
          await conn.query(
            `INSERT INTO transaction_lines
               (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, 0.00, ?, ?)`,
            [jeRes.insertId, revenueAccount.id, totalAmount, delNo]
          );
          await conn.query(
            `UPDATE customer_ledger SET journal_entry_id = ?
             WHERE reference_type = 'credit_order_delivery' AND reference_id = ?`,
            [jeRes.insertId, deliveryId]
          );
        }
      } catch (jeErr) {
        console.warn(`[verify/deliver] JE creation failed for ${delNo}:`, jeErr);
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

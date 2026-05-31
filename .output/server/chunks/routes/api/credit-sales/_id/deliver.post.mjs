import { h as defineEventHandler, v as getRouterParam, e as createError, I as readBody, w as getUserSession, q as getRequestHeader, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const deliver_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
  const {
    delivery_date,
    truck_number,
    driver_name,
    driver_contact,
    is_final,
    notes,
    items
    // [{ order_item_id, product_id, variant_id, qty_delivered, unit_price }]
  } = body != null ? body : {};
  if (!(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "No delivery items provided" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.id, o.customer_id, o.status, o.order_number, o.order_date
       FROM credit_orders o WHERE o.id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_order_deliveries WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_e = cnt.n) != null ? _e : 0) + 1).padStart(4, "0");
    const delNo = `DEL-${today}-${seq}`;
    const totalQty = items.reduce((s, i) => s + Number(i.qty_delivered), 0);
    const totalAmount = items.reduce((s, i) => s + Number(i.qty_delivered) * Number(i.unit_price), 0);
    const delivDate = delivery_date != null ? delivery_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const [result] = await conn.query(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        delNo,
        id,
        order.customer_id,
        delivDate,
        truck_number != null ? truck_number : null,
        driver_name != null ? driver_name : null,
        driver_contact != null ? driver_contact : null,
        totalQty,
        totalAmount,
        is_final ? 1 : 0,
        notes != null ? notes : null,
        userId
      ]
    );
    const deliveryId = result.insertId;
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_order_delivery_items
           (delivery_id, order_item_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          deliveryId,
          item.order_item_id,
          item.product_id,
          (_f = item.variant_id) != null ? _f : null,
          Number(item.qty_delivered),
          Number(item.unit_price),
          Number(item.qty_delivered) * Number(item.unit_price)
        ]
      );
    }
    const [[lastLedger]] = await conn.query(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [order.customer_id]
    );
    const prevBal = Number((_g = lastLedger == null ? void 0 : lastLedger.bal) != null ? _g : 0);
    const newBal = prevBal + totalAmount;
    const shipType = is_final ? "Full Delivery" : "Partial Delivery";
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
        `${shipType} \u2014 ${delNo} (Order ${order.order_number})`,
        totalAmount,
        newBal,
        userId
      ]
    );
    await conn.query(
      `UPDATE customers SET current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?`,
      [totalAmount, order.customer_id]
    );
    const wfToStatus = is_final ? "delivered" : order.status;
    const wfAction = is_final ? "delivered" : "partial_delivery";
    const wfComment = `${is_final ? "Final" : "Partial"} delivery ${delNo} \u2014 ${totalQty} bags \xB7 \u09F3${totalAmount.toLocaleString()}${truck_number ? ` \xB7 Truck ${truck_number}` : ""}`;
    if (is_final) {
      await conn.query(
        `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`,
        [id]
      );
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, wfToStatus, wfAction, userId, wfComment]
    );
    await auditLog(conn, {
      userId,
      action: wfAction,
      module: "credit_sales",
      recordType: "credit_order",
      referenceNumber: delNo,
      description: `${is_final ? "Final" : "Partial"} delivery ${delNo} for Order ${order.order_number} \u2014 ${totalQty} bags \xB7 \u09F3${totalAmount.toLocaleString()}${truck_number ? ` \xB7 Truck ${truck_number}` : ""}`,
      severity: "info",
      status: wfToStatus,
      ipAddress
    });
    await conn.commit();
    return { ok: true, delivery_number: delNo, delivery_id: deliveryId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { deliver_post as default };
//# sourceMappingURL=deliver.post.mjs.map

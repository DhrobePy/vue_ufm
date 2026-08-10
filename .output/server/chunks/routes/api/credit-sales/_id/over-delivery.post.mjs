import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, X as getUserSession, aQ as userCanAction, A as ACCOUNTS_ROLES, D as DISPATCH_ROLES, z as getDb, a6 as nextDocNumber, g as auditLog, aJ as sendTelegram } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ELIGIBLE = ["goods_on_board", "shipped", "dispatched", "delivered"];
const overDelivery_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const canRecord = await userCanAction({
    userId,
    role,
    module: "credit_sales",
    page: "all",
    action: "record_over_delivery",
    roleFallback: [...ACCOUNTS_ROLES, ...DISPATCH_ROLES]
  });
  if (!canRecord)
    throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to record over-deliveries" });
  const {
    od_date,
    resolution = "bill",
    notes,
    items
    // [{ order_item_id, product_id, variant_id, extra_qty, unit_price }]
  } = body != null ? body : {};
  if (!["bill", "retrieve", "writeoff"].includes(resolution))
    throw createError({ statusCode: 400, statusMessage: "resolution must be bill | retrieve | writeoff" });
  if (!(items == null ? void 0 : items.length))
    throw createError({ statusCode: 400, statusMessage: "No over-delivery items provided" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, order_number, status FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (!ELIGIBLE.includes(order.status))
      throw createError({ statusCode: 409, statusMessage: `Order must be goods-on-board or later (current: ${order.status})` });
    const odNo = await nextDocNumber(conn, "OD", "credit_order_over_deliveries", "od_number");
    const odDate = od_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const totalQty = items.reduce((s, i) => s + Number(i.extra_qty), 0);
    const totalAmount = items.reduce((s, i) => s + Number(i.extra_qty) * Number(i.unit_price), 0);
    if (totalQty <= 0) throw createError({ statusCode: 400, statusMessage: "Enter at least one extra quantity" });
    const [res] = await conn.query(
      `INSERT INTO credit_order_over_deliveries
         (od_number, order_id, customer_id, od_date, total_extra_qty, total_extra_amount,
          resolution, notes, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [odNo, id, order.customer_id, odDate, totalQty, totalAmount, resolution, notes != null ? notes : null, userId]
    );
    const odId = res.insertId;
    for (const it of items) {
      await conn.query(
        `INSERT INTO credit_order_over_delivery_items
           (od_id, order_item_id, product_id, variant_id, extra_qty, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          odId,
          (_b = it.order_item_id) != null ? _b : null,
          (_c = it.product_id) != null ? _c : null,
          (_d = it.variant_id) != null ? _d : null,
          Number(it.extra_qty),
          Number(it.unit_price),
          Number(it.extra_qty) * Number(it.unit_price)
        ]
      );
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, 'over_delivery_submitted', ?, ?, NOW())`,
      [
        id,
        order.status,
        order.status,
        userId,
        `${odNo} \u2014 ${totalQty} bags extra \xB7 \u09F3${totalAmount.toLocaleString()} \xB7 resolution: ${resolution} \xB7 pending approval`
      ]
    );
    await auditLog(conn, {
      userId,
      action: "other",
      module: "credit_sales",
      recordType: "credit_order_over_delivery",
      recordId: id,
      referenceNumber: odNo,
      description: `Over-delivery ${odNo} for Order ${order.order_number} \u2014 ${totalQty} bags \xB7 \u09F3${totalAmount.toLocaleString()} (${resolution}) \xB7 pending approval`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4E6} <b>Over-Delivery Recorded</b>
${odNo} \u2014 Order ${order.order_number}
${totalQty} bags extra \xB7 \u09F3${totalAmount.toLocaleString()} \xB7 resolution: ${resolution}
Pending approval`
    );
    return { ok: true, od_number: odNo, od_id: odId, status: "pending", amount: totalAmount };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { overDelivery_post as default };
//# sourceMappingURL=over-delivery.post.mjs.map

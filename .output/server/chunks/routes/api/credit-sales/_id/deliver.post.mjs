import { u as defineEventHandler, a0 as getRouterParam, r as createError, aF as readBody, a5 as getUserSession, V as getRequestHeader, I as getDb, af as nextDocNumber, a1 as getUserActionLimit, B as generateDeliverySlipNumber, L as getGLAccountId, av as postJournalEntry, ar as postCustomerLedger, aa as isAdminRole, b8 as transitionOrder, k as auditLog } from '../../../../nitro/nitro.mjs';
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

const deliver_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user))
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const canDeliver = [
    "admin",
    "superadmin",
    "accounts",
    "accounts-srg",
    "accounts-demra",
    "dispatch-srg",
    "dispatch-demra",
    "dispatchpos-srg",
    "dispatchpos-demra"
  ].includes(role);
  if (!canDeliver)
    throw createError({ statusCode: 403, statusMessage: "Your role cannot record deliveries" });
  const ipAddress = (_c = (_b = getRequestHeader(event, "x-forwarded-for")) != null ? _b : getRequestHeader(event, "x-real-ip")) != null ? _c : void 0;
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
       FROM credit_orders o WHERE o.id = ? FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (!["goods_on_board", "shipped", "delivered"].includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `Order is "${order.status}" \u2014 mark goods on board first (deliveries only after that)`
      });
    const delNo = await nextDocNumber(conn, "DEL", "credit_order_deliveries", "delivery_number");
    const lines = [];
    for (const sub of items) {
      const qty = Number(sub.qty_delivered);
      if (!(qty > 0)) continue;
      const [[li]] = await conn.query(
        `SELECT coi.id, coi.product_id, coi.variant_id, coi.quantity, coi.unit_price, COALESCE(p.base_name, 'item') AS product_name
         FROM credit_order_items coi LEFT JOIN products p ON p.id = coi.product_id WHERE coi.id = ? AND coi.order_id = ?`,
        [Number(sub.order_item_id), id]
      );
      if (!li) throw createError({ statusCode: 400, statusMessage: "A delivered line does not belong to this order" });
      const [[done]] = await conn.query(`SELECT COALESCE(SUM(qty_delivered), 0) q FROM credit_order_delivery_items WHERE order_item_id = ?`, [li.id]);
      const remaining = Number(li.quantity) - Number(done.q);
      if (qty > remaining + 1e-3)
        throw createError({ statusCode: 400, statusMessage: `Delivery qty (${qty}) for '${li.product_name}' exceeds the remaining qty (${remaining}) \u2014 use Over-Delivery for extra bags` });
      lines.push({ order_item_id: li.id, product_id: li.product_id, variant_id: li.variant_id, qty_delivered: qty, unit_price: Number(li.unit_price) });
    }
    if (!lines.length) throw createError({ statusCode: 400, statusMessage: "No delivery quantities entered" });
    items.splice(0, items.length, ...lines);
    const totalQty = items.reduce((s, i) => s + Number(i.qty_delivered), 0);
    const totalAmount = items.reduce((s, i) => s + Number(i.qty_delivered) * Number(i.unit_price), 0);
    const delivDate = delivery_date != null ? delivery_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    if (!["admin", "superadmin"].includes(role)) {
      const deliveryCap = await getUserActionLimit(conn, userId, "partial_delivery");
      if (deliveryCap !== null && totalAmount > deliveryCap) {
        throw createError({
          statusCode: 403,
          statusMessage: `Delivery value \u09F3${totalAmount.toLocaleString()} exceeds your partial-delivery limit of \u09F3${deliveryCap.toLocaleString()} \u2014 ask a user with higher authority to record it`
        });
      }
    }
    const [[ordBranch]] = await conn.query(`SELECT assigned_branch_id FROM credit_orders WHERE id = ?`, [id]);
    const [[prevDel]] = await conn.query(`SELECT COUNT(*) n FROM credit_order_deliveries WHERE order_id = ?`, [id]);
    const [[ship]] = await conn.query(`SELECT delivery_slip_number FROM credit_order_shipping WHERE order_id = ? LIMIT 1`, [id]);
    const slipNo = Number(prevDel.n) === 0 && (ship == null ? void 0 : ship.delivery_slip_number) ? ship.delivery_slip_number : await generateDeliverySlipNumber(conn, (_d = ordBranch == null ? void 0 : ordBranch.assigned_branch_id) != null ? _d : null, delivDate);
    const bags = Math.max(0, Math.floor(Number((_e = body == null ? void 0 : body.bags_boarded) != null ? _e : 0))) || null;
    const bagKg = Math.max(0, Number((_f = body == null ? void 0 : body.bag_size_kg) != null ? _f : 0)) || null;
    const [result] = await conn.query(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id,
          delivery_slip_number, bags_boarded, bag_size_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        userId,
        slipNo,
        bags,
        bagKg
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
          (_g = item.variant_id) != null ? _g : null,
          Number(item.qty_delivered),
          Number(item.unit_price),
          Number(item.qty_delivered) * Number(item.unit_price)
        ]
      );
    }
    const extraDisc = Math.round(Number((_h = body == null ? void 0 : body.extra_discount_amount) != null ? _h : 0) * 100) / 100;
    const extraReason = String((_i = body == null ? void 0 : body.extra_discount_reason) != null ? _i : "").trim();
    let discountNote = "";
    if (extraDisc < 0) throw createError({ statusCode: 400, statusMessage: "Discount amount cannot be negative" });
    if (extraDisc > 0) {
      if (!extraReason) throw createError({ statusCode: 400, statusMessage: "Please enter a reason for the additional discount" });
      if (extraDisc > totalAmount)
        throw createError({ statusCode: 400, statusMessage: `Discount (\u09F3${extraDisc.toLocaleString()}) cannot exceed this delivery's amount (\u09F3${totalAmount.toLocaleString()})` });
      const [[ord]] = await conn.query(`SELECT order_number, customer_id FROM credit_orders WHERE id = ?`, [id]);
      const [[cust]] = await conn.query(`SELECT name FROM customers WHERE id = ?`, [ord.customer_id]);
      const arId = await getGLAccountId(conn, "Accounts Receivable");
      const revId = await getGLAccountId(conn, "Revenue");
      let jeId = null;
      if (arId && revId)
        jeId = await postJournalEntry(conn, {
          date: delivDate,
          description: `Delivery discount \u2014 ${delNo} (${ord.order_number}, ${(_j = cust == null ? void 0 : cust.name) != null ? _j : ""}): ${extraReason}`,
          docType: "CreditOrderDiscount",
          docId: deliveryId,
          userId,
          lines: [
            { accountId: revId, debit: extraDisc, credit: 0, memo: delNo },
            { accountId: arId, debit: 0, credit: extraDisc, memo: delNo }
          ]
        });
      await postCustomerLedger(conn, {
        customerId: ord.customer_id,
        date: delivDate,
        transactionType: "credit_note",
        referenceType: "credit_order_delivery",
        referenceId: deliveryId,
        invoiceNumber: delNo,
        description: `Delivery discount \u2014 ${delNo} (Order ${ord.order_number}): ${extraReason}`.slice(0, 250),
        debit: 0,
        credit: extraDisc,
        journalEntryId: jeId,
        userId
      });
      await conn.query(
        `UPDATE credit_orders
         SET discount_amount = discount_amount + ?, total_amount = GREATEST(0, total_amount - ?),
             balance_due = GREATEST(0, balance_due - ?), updated_at = NOW() WHERE id = ?`,
        [extraDisc, extraDisc, extraDisc, id]
      );
      await conn.query(
        `UPDATE credit_order_deliveries SET extra_discount_amount = ?, extra_discount_reason = ?,
           extra_discount_by_user_id = ?, extra_discount_at = NOW() WHERE id = ?`,
        [extraDisc, extraReason, userId, deliveryId]
      );
      discountNote = ` \xB7 discount \u09F3${extraDisc.toLocaleString()} (${extraReason})`;
    }
    let shortfallItems = [];
    if (is_final) {
      const [allItems] = await conn.query(
        `SELECT oi.id AS order_item_id, oi.product_id, oi.variant_id, oi.quantity,
                COALESCE((
                  SELECT SUM(di.qty_delivered)
                  FROM credit_order_delivery_items di
                  JOIN credit_order_deliveries d ON d.id = di.delivery_id
                  WHERE di.order_item_id = oi.id AND d.order_id = oi.order_id
                ), 0) AS qty_delivered_prior
         FROM credit_order_items oi WHERE oi.order_id = ?`,
        [id]
      );
      const thisSubmission = /* @__PURE__ */ new Map();
      for (const it of items) thisSubmission.set(Number(it.order_item_id), ((_k = thisSubmission.get(Number(it.order_item_id))) != null ? _k : 0) + Number(it.qty_delivered));
      shortfallItems = allItems.map((oi) => {
        var _a2;
        return {
          product_id: oi.product_id,
          variant_id: oi.variant_id,
          qty_short: Number(oi.quantity) - Number(oi.qty_delivered_prior) - ((_a2 = thisSubmission.get(oi.order_item_id)) != null ? _a2 : 0)
        };
      }).filter((oi) => oi.qty_short > 5e-3);
      if (shortfallItems.length) {
        const totalShort = shortfallItems.reduce((s, i) => s + i.qty_short, 0);
        if (!isAdminRole(role)) {
          throw createError({
            statusCode: 409,
            statusMessage: `${totalShort.toLocaleString()} units across ${shortfallItems.length} item(s) are still undelivered \u2014 record another partial delivery instead of marking this final, or ask an admin to override.`
          });
        }
        if (!(body == null ? void 0 : body.confirm_shortfall)) {
          throw createError({
            statusCode: 409,
            statusMessage: `${totalShort.toLocaleString()} units are still undelivered. Confirm you intend to close this order anyway (confirm_shortfall) \u2014 the shortfall will be recorded, not hidden.`
          });
        }
      }
    }
    const wfToStatus = is_final ? "delivered" : order.status;
    const wfAction = is_final ? "delivered" : "partial_delivery";
    const wfComment = `${is_final ? "Final" : "Partial"} delivery ${delNo} \u2014 ${totalQty} bags \xB7 \u09F3${totalAmount.toLocaleString()}${truck_number ? ` \xB7 Truck ${truck_number}` : ""}${discountNote}` + (shortfallItems.length ? ` \xB7 \u26A0 closed with ${shortfallItems.reduce((s, i) => s + i.qty_short, 0).toLocaleString()} units short (admin override, confirmed)` : "");
    await transitionOrder(conn, { orderId: id, from: order.status, to: wfToStatus, action: wfAction, userId, comment: wfComment });
    await auditLog(conn, {
      userId,
      action: wfAction,
      // 'delivered' or 'partial_delivery' → maps to 'dispatched'
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: delNo,
      description: `${is_final ? "Final" : "Partial"} delivery ${delNo} for Order ${order.order_number} \u2014 ${totalQty} bags \xB7 \u09F3${totalAmount.toLocaleString()}${truck_number ? ` \xB7 Truck ${truck_number}` : ""}`,
      severity: "info",
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

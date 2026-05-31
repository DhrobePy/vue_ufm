import { h as defineEventHandler, I as readBody, w as getUserSession, q as getRequestHeader, e as createError, n as getDb, a as auditLog } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
  const {
    customer_id,
    branch_id,
    // maps to assigned_branch_id in DB
    order_date,
    required_date,
    priority,
    delivery_address,
    // maps to shipping_address in DB
    special_notes,
    // maps to special_instructions in DB
    amount_paid,
    // advance payment
    items
    // [{ product_id, variant_id, qty_bags→quantity, unit_price, discount_amount }]
  } = body != null ? body : {};
  if (!customer_id || !(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "customer_id and items are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_orders WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_g = cnt.n) != null ? _g : 0) + 1).padStart(4, "0");
    const orderNo = `CR-${today}-${seq}`;
    let subtotal = 0;
    for (const it of items) {
      const qty = Number((_i = (_h = it.qty_bags) != null ? _h : it.quantity) != null ? _i : 0);
      const line = qty * Number(it.unit_price) - Number((_j = it.discount_amount) != null ? _j : 0);
      subtotal += line;
    }
    const totalAmount = subtotal;
    const advancePaid = Number(amount_paid != null ? amount_paid : 0);
    const balanceDue = Math.max(0, totalAmount - advancePaid);
    const [[customer]] = await conn.query(
      `SELECT credit_limit, current_balance FROM customers WHERE id = ?`,
      [customer_id]
    );
    const creditLimit = Number((_k = customer == null ? void 0 : customer.credit_limit) != null ? _k : 0);
    const currentBalance = Number((_l = customer == null ? void 0 : customer.current_balance) != null ? _l : 0);
    const [[expRow]] = await conn.query(
      `SELECT COALESCE(SUM(balance_due), 0) AS pending
       FROM credit_orders
       WHERE customer_id = ?
         AND status IN ('pending_approval','escalated','approved',
                        'in_production','produced','ready_to_ship','shipped')`,
      [customer_id]
    );
    const pendingExposure = Number((_m = expRow == null ? void 0 : expRow.pending) != null ? _m : 0);
    const totalExposure = currentBalance + pendingExposure + balanceDue;
    const overLimit = creditLimit > 0 && totalExposure > creditLimit;
    const excessAmount = overLimit ? Math.round(totalExposure - creditLimit) : 0;
    let orderStatus;
    let wfAction;
    let wfComment;
    if (overLimit) {
      orderStatus = "escalated";
      wfAction = "escalated";
      wfComment = `Order created \u2014 ESCALATED \xB7 \u09F3${totalAmount.toLocaleString()} \xB7 credit limit \u09F3${creditLimit.toLocaleString()} exceeded by \u09F3${excessAmount.toLocaleString()}`;
    } else if (isAdmin) {
      orderStatus = "approved";
      wfAction = "approved";
      wfComment = `Order created and auto-approved \u2014 \u09F3${totalAmount.toLocaleString()} (${role})`;
    } else {
      orderStatus = "pending_approval";
      wfAction = "submit";
      wfComment = `Order created and submitted for approval \u2014 \u09F3${totalAmount.toLocaleString()}`;
    }
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`,
          [it.variant_id]
        );
        it.product_id = (_n = pv == null ? void 0 : pv.product_id) != null ? _n : null;
      }
    }
    const [result] = await conn.query(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo,
        customer_id,
        branch_id != null ? branch_id : null,
        order_date,
        required_date || null,
        priority != null ? priority : "normal",
        orderStatus,
        delivery_address || null,
        special_notes || null,
        totalAmount,
        totalAmount,
        advancePaid,
        advancePaid,
        balanceDue,
        userId
      ]
    );
    const orderId = result.insertId;
    for (const it of items) {
      const qty = Number((_p = (_o = it.qty_bags) != null ? _o : it.quantity) != null ? _p : 0);
      const lineTotal = qty * Number(it.unit_price) - Number((_q = it.discount_amount) != null ? _q : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,
          // NOT NULL in DB — looked up above if missing
          (_r = it.variant_id) != null ? _r : null,
          qty,
          Number(it.unit_price),
          Number((_s = it.discount_amount) != null ? _s : 0),
          lineTotal
        ]
      );
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', ?, ?, ?, ?, NOW())`,
      [orderId, orderStatus, wfAction, userId, wfComment]
    );
    await auditLog(conn, {
      userId,
      action: overLimit ? "other" : isAdmin ? "approved" : "other",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: orderId,
      referenceNumber: orderNo,
      description: overLimit ? `Order ${orderNo} created \u2014 ESCALATED, credit limit exceeded by \u09F3${excessAmount.toLocaleString()} (total exposure \u09F3${totalExposure.toLocaleString()} vs limit \u09F3${creditLimit.toLocaleString()})` : isAdmin ? `Order ${orderNo} created and auto-approved \u2014 \u09F3${totalAmount.toLocaleString()} (${role})` : `Order ${orderNo} created, pending approval \u2014 \u09F3${totalAmount.toLocaleString()}`,
      severity: overLimit ? "warning" : "info",
      ipAddress
    });
    await conn.commit();
    return {
      ok: true,
      id: orderId,
      order_number: orderNo,
      status: orderStatus,
      over_limit: overLimit,
      ...overLimit ? { excess_amount: excessAmount } : {}
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map

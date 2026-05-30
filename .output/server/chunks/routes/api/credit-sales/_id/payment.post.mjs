import { g as defineEventHandler, t as getRouterParam, d as createError, G as readBody, u as getUserSession, m as getDb } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const payment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    amount,
    payment_method,
    reference_number,
    bank_account_id,
    payment_date,
    notes
  } = body != null ? body : {};
  if (!amount || Number(amount) <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Payment amount must be greater than zero" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, balance_due, amount_paid FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const pmtAmount = Number(amount);
    const newPaid = Number((_c = order.amount_paid) != null ? _c : 0) + pmtAmount;
    const newBalance = Math.max(0, Number((_d = order.balance_due) != null ? _d : 0) - pmtAmount);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_e = cnt.n) != null ? _e : 0) + 1).padStart(4, "0");
    const autoRef = reference_number || `PMT-${today}-${seq}`;
    const [result] = await conn.query(
      `INSERT INTO customer_payments
         (customer_id, credit_order_id, payment_date, amount, payment_method,
          reference_number, bank_account_id,
          collected_by_user_id, allocation_status, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?,
               ?, ?,
               ?, 'unallocated', ?, ?)`,
      [
        order.customer_id,
        id,
        payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        pmtAmount,
        payment_method != null ? payment_method : "cash",
        autoRef,
        bank_account_id ? Number(bank_account_id) : null,
        userId,
        notes != null ? notes : null,
        userId
      ]
    );
    await conn.query(
      `UPDATE credit_orders SET amount_paid = ?, balance_due = ?, updated_at = NOW() WHERE id = ?`,
      [newPaid, newBalance, id]
    );
    await conn.query(
      `UPDATE customers SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW() WHERE id = ?`,
      [pmtAmount, order.customer_id]
    );
    const [[lastLedger]] = await conn.query(
      `SELECT COALESCE(running_balance, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [order.customer_id]
    );
    const prevBal = Number((_f = lastLedger == null ? void 0 : lastLedger.bal) != null ? _f : 0);
    const newBal = Math.max(0, prevBal - pmtAmount);
    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, entry_date, entry_type, reference_number,
          description, debit_amount, credit_amount, running_balance)
       VALUES (?, ?, 'Payment Received', ?, ?, 0, ?, ?)`,
      [
        order.customer_id,
        payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        autoRef,
        `Payment received \u2014 ${autoRef} (${payment_method != null ? payment_method : "cash"})`,
        pmtAmount,
        newBal
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId, reference_number: autoRef, new_balance: newBalance };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { payment_post as default };
//# sourceMappingURL=payment.post.mjs.map

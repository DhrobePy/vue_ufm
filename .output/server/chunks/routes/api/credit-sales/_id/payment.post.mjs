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

const payment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
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
  const methodMap = {
    cash: "Cash",
    bkash: "Mobile Banking",
    nagad: "Mobile Banking",
    bank: "Bank Transfer"
  };
  const mappedMethod = (_e = methodMap[payment_method != null ? payment_method : ""]) != null ? _e : "Cash";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, balance_due, amount_paid, status FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const pmtAmount = Number(amount);
    const newPaid = Number((_f = order.amount_paid) != null ? _f : 0) + pmtAmount;
    const newBalance = Math.max(0, Number((_g = order.balance_due) != null ? _g : 0) - pmtAmount);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_h = cnt.n) != null ? _h : 0) + 1).padStart(4, "0");
    const payNo = `PAY-${today}-${seq}`;
    const autoRef = reference_number || payNo;
    const [result] = await conn.query(
      `INSERT INTO customer_payments
         (payment_number, customer_id, payment_date, amount, payment_method,
          payment_type, reference_number, bank_account_id,
          allocation_status, allocated_amount, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?,
               'invoice_payment', ?, ?,
               'unallocated', 0, ?, ?)`,
      [
        payNo,
        order.customer_id,
        payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        pmtAmount,
        mappedMethod,
        autoRef,
        bank_account_id ? Number(bank_account_id) : null,
        notes != null ? notes : null,
        userId
      ]
    );
    const isNowComplete = newBalance === 0 && order.status === "delivered";
    await conn.query(
      `UPDATE credit_orders
       SET amount_paid = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newPaid, newBalance, id]
    );
    await conn.query(
      `UPDATE customers SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW() WHERE id = ?`,
      [pmtAmount, order.customer_id]
    );
    const [[lastLedger]] = await conn.query(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [order.customer_id]
    );
    const prevBal = Number((_i = lastLedger == null ? void 0 : lastLedger.bal) != null ? _i : 0);
    const newBal = Math.max(0, prevBal - pmtAmount);
    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, transaction_date, transaction_type, reference_type, reference_id,
          invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
       VALUES (?, ?, 'payment', 'customer_payment', ?,
               ?, ?, 0, ?, ?, ?)`,
      [
        order.customer_id,
        payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        result.insertId,
        autoRef,
        `Payment received \u2014 ${payNo} (${mappedMethod})`,
        pmtAmount,
        newBal,
        userId
      ]
    );
    const wfToStatus = isNowComplete ? "completed" : order.status;
    const wfAction = isNowComplete ? "completed" : "payment_received";
    const wfComments = `Payment ${payNo} received \u2014 \u09F3${pmtAmount.toLocaleString()} via ${mappedMethod}${isNowComplete ? " \xB7 Order fully paid" : ""}`;
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, wfToStatus, wfAction, userId, wfComments]
    );
    await auditLog(conn, {
      userId,
      action: isNowComplete ? "order_completed" : "payment_received",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: payNo,
      description: isNowComplete ? `Order fully paid & completed \u2014 ${payNo} \xB7 \u09F3${pmtAmount.toLocaleString()} via ${mappedMethod}` : `Payment received \u2014 ${payNo} \xB7 \u09F3${pmtAmount.toLocaleString()} via ${mappedMethod} \xB7 balance \u09F3${newBalance.toLocaleString()} remaining`,
      severity: "info",
      ipAddress
    });
    await conn.commit();
    return {
      ok: true,
      id: result.insertId,
      reference_number: payNo,
      new_balance: newBalance,
      completed: isNowComplete
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { payment_post as default };
//# sourceMappingURL=payment.post.mjs.map

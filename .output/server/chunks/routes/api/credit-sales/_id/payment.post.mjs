import { h as defineEventHandler, v as getRouterParam, e as createError, I as readBody, w as getUserSession, q as getRequestHeader, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const payment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
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
    cash_account_id,
    // petty cash account when method = cash
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
  const mappedMethod = (_f = (_e = methodMap[payment_method != null ? payment_method : ""]) != null ? _e : payment_method) != null ? _f : "Cash";
  const db = getDb();
  const conn = await db.getConnection();
  const pmtDate = payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, balance_due, amount_paid, status FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const pmtAmount = Number(amount);
    const newPaid = Number((_g = order.amount_paid) != null ? _g : 0) + pmtAmount;
    const newBalance = Math.max(0, Number((_h = order.balance_due) != null ? _h : 0) - pmtAmount);
    const [[seq_row]] = await conn.query(
      `SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d,
              COUNT(*) AS n
       FROM   customer_payments
       WHERE  DATE(created_at) = CURDATE()`
    );
    const today = seq_row.d;
    const seq = String(((_i = seq_row.n) != null ? _i : 0) + 1).padStart(4, "0");
    const payNo = `PAY-${today}-${seq}`;
    const autoRef = reference_number || payNo;
    const [result] = await conn.query(
      `INSERT INTO customer_payments
         (order_id, payment_number, customer_id, payment_date, amount, payment_method,
          payment_type, reference_number, bank_account_id, cash_account_id,
          allocation_status, allocated_amount, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?,
               'invoice_payment', ?, ?, ?,
               'allocated', ?, ?, ?)`,
      [
        id,
        payNo,
        order.customer_id,
        pmtDate,
        pmtAmount,
        mappedMethod,
        autoRef,
        bank_account_id ? Number(bank_account_id) : null,
        cash_account_id ? Number(cash_account_id) : null,
        pmtAmount,
        notes != null ? notes : null,
        userId
      ]
    );
    const paymentId = result.insertId;
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
    const prevBal = Number((_j = lastLedger == null ? void 0 : lastLedger.bal) != null ? _j : 0);
    const newBal = Math.max(0, prevBal - pmtAmount);
    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, transaction_date, transaction_type, reference_type, reference_id,
          invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
       VALUES (?, ?, 'payment', 'customer_payment', ?,
               ?, ?, 0, ?, ?, ?)`,
      [
        order.customer_id,
        pmtDate,
        paymentId,
        autoRef.slice(0, 50),
        // invoice_number VARCHAR(50) — truncate long refs
        `Payment received \u2014 ${payNo} (${mappedMethod})`,
        pmtAmount,
        newBal,
        userId
      ]
    );
    try {
      let drAccountId = null;
      if (mappedMethod === "Cash" && cash_account_id) {
        const [[ca]] = await conn.query(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [Number(cash_account_id)]
        );
        drAccountId = (_k = ca == null ? void 0 : ca.chart_of_account_id) != null ? _k : null;
      } else if (["Bank Transfer", "Cheque", "Card"].includes(mappedMethod) && bank_account_id) {
        const [[ba]] = await conn.query(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)]
        );
        drAccountId = (_l = ba == null ? void 0 : ba.chart_of_account_id) != null ? _l : null;
      } else if (mappedMethod === "Mobile Banking" && bank_account_id) {
        const [[ba]] = await conn.query(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)]
        );
        drAccountId = (_m = ba == null ? void 0 : ba.chart_of_account_id) != null ? _m : null;
      }
      const [[ar]] = await conn.query(
        `SELECT id FROM chart_of_accounts
         WHERE account_type = 'Accounts Receivable'
         ORDER BY id ASC LIMIT 1`
      );
      const crAccountId = (_n = ar == null ? void 0 : ar.id) != null ? _n : null;
      if (drAccountId && crAccountId) {
        const jeDesc = `Payment received \u2014 ${payNo} (Order ${id}, ${mappedMethod})`;
        const [jeRes] = await conn.query(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
           VALUES (?, ?, 'CustomerPayment', ?, ?)`,
          [pmtDate, jeDesc.slice(0, 255), paymentId, userId]
        );
        const jeId = jeRes.insertId;
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, drAccountId, pmtAmount, payNo]
        );
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, crAccountId, pmtAmount, payNo]
        );
        await conn.query(
          `UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`,
          [jeId, paymentId]
        );
        if (mappedMethod === "Cash" && cash_account_id) {
          const [[pcAcc]] = await conn.query(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [Number(cash_account_id)]
          );
          const pcBal = Number((_o = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _o : 0);
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions
               (account_id, branch_id, transaction_type, amount, balance_after,
                reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
            [
              Number(cash_account_id),
              (_p = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _p : null,
              pmtAmount,
              pcBal + pmtAmount,
              paymentId,
              `Payment ${payNo} from order ${id}`,
              userId,
              pmtDate
            ]
          );
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [pmtAmount, Number(cash_account_id)]
          );
        }
      } else {
        console.warn(`[payment] Skipping JE for ${payNo}: drAccountId=${drAccountId}, crAccountId=${crAccountId}`);
      }
    } catch (jeErr) {
      console.warn(`[payment] JE creation failed for ${payNo}:`, jeErr);
    }
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
      id: paymentId,
      reference_number: payNo,
      new_balance: newBalance,
      completed: isNowComplete
    };
  } catch (e) {
    await conn.rollback();
    console.error("[payment] Transaction failed:", e == null ? void 0 : e.message, "| errno:", e == null ? void 0 : e.errno, "| code:", e == null ? void 0 : e.code);
    throw createError({
      statusCode: 500,
      statusMessage: (_r = (_q = e == null ? void 0 : e.sqlMessage) != null ? _q : e == null ? void 0 : e.message) != null ? _r : "Payment transaction failed"
    });
  } finally {
    conn.release();
  }
});

export { payment_post as default };
//# sourceMappingURL=payment.post.mjs.map

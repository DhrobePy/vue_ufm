import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, X as getUserSession, K as getRequestHeader, aR as userCanAction, A as ACCOUNTS_ROLES, z as getDb, k as checkTransactionLimit, ar as queuePendingRequest, aK as sendTelegram, a6 as nextDocNumber, E as getGLAccountId, al as postJournalEntry, ai as postCustomerLedger, g as auditLog, i as bridgeCustomerPayment } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const payment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
  const canCollect = await userCanAction({
    userId,
    role,
    module: "credit_sales",
    page: "all",
    action: "collect_payment",
    roleFallback: [...ACCOUNTS_ROLES, "collector"]
  });
  if (!canCollect) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to collect payments" });
  const amount = Number((_e = body == null ? void 0 : body.amount) != null ? _e : 0);
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: "Payment amount must be positive" });
  const validMethods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking", "Card"];
  const method = validMethods.includes(body == null ? void 0 : body.payment_method) ? body.payment_method : "Cash";
  const pmtDate = (_f = body == null ? void 0 : body.payment_date) != null ? _f : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[sale]] = await conn.query(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`,
      [id]
    );
    if (!sale) throw createError({ statusCode: 404, statusMessage: "Sale not found" });
    if (sale.status !== "posted") throw createError({ statusCode: 409, statusMessage: `Sale is ${sale.status} \u2014 cannot collect against it` });
    if (amount > Number(sale.balance_due) + 5e-3)
      throw createError({ statusCode: 400, statusMessage: `\u09F3${amount.toLocaleString()} exceeds the sale's balance due of \u09F3${Number(sale.balance_due).toLocaleString()}` });
    const limitCheck = await checkTransactionLimit(conn, userId, role, amount, Boolean(body == null ? void 0 : body.is_checker_review));
    if (!limitCheck.allowed) {
      const reqId = await queuePendingRequest(conn, {
        requestType: "commodity_payment",
        payload: { ...body, sale_id: id },
        customerId: sale.customer_id,
        amount,
        referenceLabel: `${sale.sale_number} \u2014 ${sale.customer_name} \u2014 \u09F3${amount.toLocaleString()}`,
        requestedBy: userId,
        requestedReason: limitCheck.reason === "policy" ? "Payment approval policy (all payments)" : limitCheck.cap > 0 ? `Exceeds transaction limit of \u09F3${limitCheck.cap.toLocaleString()}` : "No transaction limit configured"
      });
      await conn.commit();
      sendTelegram(
        `\u23F3 <b>Commodity Payment Queued</b>
${sale.sale_number} \u2014 ${sale.customer_name}
\u09F3${amount.toLocaleString()} \xB7 Requested by ${userName}`,
        "payment_received"
      );
      return { ok: true, queued: true, pending_request_id: reqId, message: `\u09F3${amount.toLocaleString()} queued for a checker's approval.` };
    }
    const payNo = await nextDocNumber(conn, "CTP", "commodity_sale_payments", "payment_number");
    let drAccountId = null;
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      const [[ca]] = await conn.query(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [Number(body.cash_account_id)]
      );
      drAccountId = (_g = ca == null ? void 0 : ca.chart_of_account_id) != null ? _g : null;
    } else if (body == null ? void 0 : body.bank_account_id) {
      const [[ba]] = await conn.query(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
        [Number(body.bank_account_id)]
      );
      drAccountId = (_h = ba == null ? void 0 : ba.chart_of_account_id) != null ? _h : null;
    }
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    let jeId = null;
    if (drAccountId && arId) {
      jeId = await postJournalEntry(conn, {
        date: pmtDate,
        description: `Commodity payment \u2014 ${payNo} (${sale.sale_number})`,
        docType: "CommoditySalePayment",
        docId: 0,
        userId,
        lines: [
          { accountId: drAccountId, debit: amount, credit: 0, memo: payNo },
          { accountId: arId, debit: 0, credit: amount, memo: payNo }
        ]
      });
    }
    const ledgerId = await postCustomerLedger(conn, {
      customerId: sale.customer_id,
      date: pmtDate,
      transactionType: "payment",
      referenceType: "commodity_sale_payment",
      referenceId: id,
      invoiceNumber: payNo,
      description: `Payment \u2014 ${payNo} against ${sale.sale_number} via ${method}`,
      debit: 0,
      credit: amount,
      journalEntryId: jeId,
      userId
    });
    const [payRes] = await conn.query(
      `INSERT INTO commodity_sale_payments
         (payment_number, sale_id, customer_id, payment_date, amount, payment_method,
          bank_account_id, cash_account_id, reference_number, journal_entry_id,
          customer_ledger_id, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payNo,
        id,
        sale.customer_id,
        pmtDate,
        amount,
        method,
        (body == null ? void 0 : body.bank_account_id) ? Number(body.bank_account_id) : null,
        (body == null ? void 0 : body.cash_account_id) ? Number(body.cash_account_id) : null,
        (body == null ? void 0 : body.reference_number) || payNo,
        jeId,
        ledgerId,
        (_i = body == null ? void 0 : body.notes) != null ? _i : null,
        userId
      ]
    );
    const paymentId = payRes.insertId;
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [paymentId, jeId]);
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      const cashId = Number(body.cash_account_id);
      const [[pcAcc]] = await conn.query(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [cashId]
      );
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_in', ?, ?, 'commodity_sale_payment', ?, ?, ?, ?)`,
        [
          cashId,
          (_j = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _j : null,
          amount,
          Number((_k = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _k : 0) + amount,
          paymentId,
          `Commodity payment ${payNo} (${sale.sale_number})`,
          userId,
          pmtDate
        ]
      );
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
        [amount, cashId]
      );
    }
    const newPaid = Number(sale.amount_paid) + amount;
    const newBalance = Math.max(0, Number(sale.total_amount) - Number(sale.advance_paid) - newPaid);
    await conn.query(
      `UPDATE commodity_sales SET amount_paid = ?, balance_due = ? WHERE id = ?`,
      [newPaid, newBalance, id]
    );
    await auditLog(conn, {
      userId,
      action: "payment_received",
      module: "trading",
      recordType: "commodity_sale_payment",
      recordId: paymentId,
      referenceNumber: payNo,
      description: `Commodity payment ${payNo} \u2014 \u09F3${amount.toLocaleString()} against ${sale.sale_number} \xB7 balance \u09F3${newBalance.toLocaleString()}`,
      severity: "info",
      ipAddress
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4B0} <b>Commodity Payment</b>
${payNo} \u2014 ${sale.customer_name} (${sale.sale_number})
\u09F3${amount.toLocaleString()} via ${method} \xB7 balance \u09F3${newBalance.toLocaleString()}`,
      "payment_received"
    );
    if (method !== "Cash" && (body == null ? void 0 : body.bank_account_id)) {
      bridgeCustomerPayment(getDb(), {
        paymentId,
        bankAccountId: Number(body.bank_account_id),
        method,
        amount,
        date: pmtDate,
        payerName: sale.customer_name,
        referenceNumber: body == null ? void 0 : body.reference_number,
        userId
      });
    }
    return { ok: true, id: paymentId, payment_number: payNo, new_balance: newBalance };
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    console.error("[trading/payment] failed:", e == null ? void 0 : e.message);
    throw createError({ statusCode: 500, statusMessage: (_m = (_l = e == null ? void 0 : e.sqlMessage) != null ? _l : e == null ? void 0 : e.message) != null ? _m : "Payment failed" });
  } finally {
    conn.release();
  }
});

export { payment_post as default };
//# sourceMappingURL=payment.post.mjs.map

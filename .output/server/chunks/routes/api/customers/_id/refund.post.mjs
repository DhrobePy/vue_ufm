import { w as defineEventHandler, a3 as getRouterParam, aV as requireAction, aI as readBody, t as createError, L as getDb, ai as nextDocNumber, O as getGLAccountId, ay as postJournalEntry, au as postCustomerLedger, F as getAdvanceCredit, bb as syncPaymentAllocation, l as auditLog, b5 as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const refund_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const customerId = Number(getRouterParam(event, "id"));
  const { userId } = await requireAction(
    event,
    { module: "credit_sales", page: "all", action: "refund_customer", roleFallback: [], explicit: true },
    'Only admin / superadmin, or a user granted "Refund customer", may refund money'
  );
  const body = await readBody(event);
  const amount = Math.round(Number((_a = body == null ? void 0 : body.amount) != null ? _a : 0) * 100) / 100;
  if (!customerId || !(amount > 0)) throw createError({ statusCode: 400, statusMessage: "A customer and a positive amount are required" });
  const method = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking"].includes(body == null ? void 0 : body.payment_method) ? body.payment_method : "Cash";
  const cashId = (body == null ? void 0 : body.cash_account_id) ? Number(body.cash_account_id) : null;
  const bankId = (body == null ? void 0 : body.bank_account_id) ? Number(body.bank_account_id) : null;
  if (method === "Cash" && !cashId) throw createError({ statusCode: 400, statusMessage: "Choose the cash account the refund is paid from" });
  if (method !== "Cash" && !bankId) throw createError({ statusCode: 400, statusMessage: "Choose the bank account the refund is paid from" });
  const date = (_b = body == null ? void 0 : body.refund_date) != null ? _b : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[cust]] = await conn.query(`SELECT id, name, initial_due FROM customers WHERE id = ? FOR UPDATE`, [customerId]);
    if (!cust) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const [[bal]] = await conn.query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) b FROM customer_ledger WHERE customer_id = ? AND reference_type <> 'initial_due'`,
      [customerId]
    );
    const credit = Math.max(0, -(Number((_c = cust.initial_due) != null ? _c : 0) + Number(bal.b)));
    if (amount > credit + 5e-3)
      throw createError({ statusCode: 400, statusMessage: credit > 0 ? `${cust.name} holds only \u09F3${credit.toLocaleString()} in credit \u2014 a refund cannot be more than that` : `${cust.name} has no credit to refund (their account is not in credit)` });
    let drAcc = null;
    if (method === "Cash") {
      const [[ca]] = await conn.query(`SELECT chart_of_account_id, current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ? FOR UPDATE`, [cashId]);
      if (!ca) throw createError({ statusCode: 400, statusMessage: "Cash account not found" });
      if (Number(ca.current_balance) < amount) throw createError({ statusCode: 400, statusMessage: `That cash account holds only \u09F3${Number(ca.current_balance).toLocaleString()}` });
      drAcc = ca.chart_of_account_id;
    } else {
      const [[ba]] = await conn.query(`SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [bankId]);
      if (!ba) throw createError({ statusCode: 400, statusMessage: "Bank account not found" });
      drAcc = ba.chart_of_account_id;
    }
    const no = await nextDocNumber(conn, "RFD", "customer_refunds", "refund_number");
    const [res] = await conn.query(
      `INSERT INTO customer_refunds (refund_number, customer_id, return_id, order_id, refund_date, amount, payment_method,
         bank_account_id, cash_account_id, reference_number, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        no,
        customerId,
        (body == null ? void 0 : body.return_id) ? Number(body.return_id) : null,
        (body == null ? void 0 : body.order_id) ? Number(body.order_id) : null,
        date,
        amount,
        method,
        bankId,
        cashId,
        (_d = body == null ? void 0 : body.reference_number) != null ? _d : null,
        (body == null ? void 0 : body.notes) ? String(body.notes).slice(0, 500) : null,
        userId
      ]
    );
    const refundId = res.insertId;
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    let jeId = null;
    if (drAcc && arId) {
      jeId = await postJournalEntry(conn, {
        date,
        description: `Customer refund ${no} \u2014 ${cust.name} (${method})`,
        docType: "CustomerRefund",
        docId: refundId,
        userId,
        lines: [
          { accountId: arId, debit: amount, credit: 0, memo: no },
          // we owe the customer less
          { accountId: drAcc, debit: 0, credit: amount, memo: no }
          // cash / bank goes out
        ]
      });
      await conn.query(`UPDATE customer_refunds SET journal_entry_id = ? WHERE id = ?`, [jeId, refundId]);
    }
    if (method === "Cash") {
      const [[pc]] = await conn.query(`SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId]);
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_out', ?, ?, 'customer_refund', ?, ?, ?, ?)`,
        [cashId, (_e = pc == null ? void 0 : pc.branch_id) != null ? _e : null, amount, Number(pc.current_balance) - amount, refundId, `Customer refund ${no} \u2014 ${cust.name}`, userId, date]
      );
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`, [amount, cashId]);
    }
    await postCustomerLedger(conn, {
      customerId,
      date,
      transactionType: "refund",
      referenceType: "customer_refund",
      referenceId: refundId,
      invoiceNumber: no,
      description: `Refund ${no} paid to customer (${method})${(body == null ? void 0 : body.notes) ? ` \u2014 ${body.notes}` : ""}`,
      debit: amount,
      credit: 0,
      journalEntryId: jeId,
      userId
    });
    let left = amount;
    for (const p of (await getAdvanceCredit(conn, customerId, true)).payments) {
      if (left <= 5e-3) break;
      const take = Math.min(left, p.remaining);
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance, target, allocated_by_user_id)
         VALUES (?, 0, ?, 0, 'refund', ?)`,
        [p.id, take, userId]
      );
      await syncPaymentAllocation(conn, p.id);
      left = Math.round((left - take) * 100) / 100;
    }
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "customer_refund",
      recordId: refundId,
      referenceNumber: no,
      description: `Refund ${no}: \u09F3${amount.toLocaleString()} paid back to ${cust.name} via ${method}${(body == null ? void 0 : body.return_id) ? ` (return #${body.return_id})` : ""}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(`\u21A9\uFE0F <b>Customer Refund</b>
${no} \u2014 ${cust.name}
\u09F3${amount.toLocaleString()} via ${method}`, "payment_received");
    return { ok: true, id: refundId, refund_number: no, credit_left: Math.round((credit - amount) * 100) / 100 };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { refund_post as default };
//# sourceMappingURL=refund.post.mjs.map

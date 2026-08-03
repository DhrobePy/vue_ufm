import { p as defineEventHandler, O as getRouterParam, l as createError, am as readBody, V as getUserSession, aJ as userCanAction, A as ACCOUNTS_ROLES, y as getDb, j as checkTransactionLimit, al as queuePendingRequest, aC as sendTelegram, a3 as nextDocNumber, E as getLoansReceivableAccountId, ag as postJournalEntry, f as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const repay_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid loan ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const canCollect = await userCanAction({
    userId,
    role,
    module: "credit_sales",
    page: "all",
    action: "collect_payment",
    roleFallback: [...ACCOUNTS_ROLES, "collector"]
  });
  if (!canCollect) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to collect payments" });
  const amount = Number((_c = body == null ? void 0 : body.amount) != null ? _c : 0);
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: "Amount must be positive" });
  const validMethods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking"];
  const method = validMethods.includes(body == null ? void 0 : body.payment_method) ? body.payment_method : "Cash";
  const payDate = String((_d = body == null ? void 0 : body.repayment_date) != null ? _d : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[loan]] = await conn.query(
      `SELECT l.*, c.name AS customer_name, s.company_name AS supplier_name
       FROM loans l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN suppliers s ON s.id = l.supplier_id
       WHERE l.id = ? FOR UPDATE`,
      [id]
    );
    if (!loan) throw createError({ statusCode: 404, statusMessage: "Loan not found" });
    if (loan.status !== "active") throw createError({ statusCode: 409, statusMessage: `Loan is ${loan.status}` });
    if (amount > Number(loan.balance_due) + 5e-3)
      throw createError({ statusCode: 400, statusMessage: `\u09F3${amount.toLocaleString()} exceeds the balance due of \u09F3${Number(loan.balance_due).toLocaleString()}` });
    const borrowerName = (_f = (_e = loan.customer_name) != null ? _e : loan.supplier_name) != null ? _f : "\u2014";
    const limitCheck = await checkTransactionLimit(conn, userId, role, amount, Boolean(body == null ? void 0 : body.is_checker_review));
    if (!limitCheck.allowed) {
      const reqId = await queuePendingRequest(conn, {
        requestType: "loan_repayment",
        payload: { ...body, loan_id: id },
        customerId: (_g = loan.customer_id) != null ? _g : null,
        amount,
        referenceLabel: `${loan.loan_number} \u2014 ${borrowerName} \u2014 \u09F3${amount.toLocaleString()}`,
        requestedBy: userId,
        requestedReason: limitCheck.reason === "policy" ? "Payment approval policy (all payments)" : limitCheck.cap > 0 ? `Exceeds transaction limit of \u09F3${limitCheck.cap.toLocaleString()}` : "No transaction limit configured"
      });
      await conn.commit();
      sendTelegram(
        `\u23F3 <b>Loan Repayment Queued</b>
${loan.loan_number} \u2014 ${borrowerName}
\u09F3${amount.toLocaleString()} \xB7 Requested by ${userName}`,
        "payment_received"
      );
      return { ok: true, queued: true, pending_request_id: reqId, message: `\u09F3${amount.toLocaleString()} queued for a checker's approval.` };
    }
    const repayNo = await nextDocNumber(conn, "LRP", "loan_repayments", "repayment_number");
    let drAccountId = null;
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      const [[ca]] = await conn.query(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [Number(body.cash_account_id)]
      );
      drAccountId = (_h = ca == null ? void 0 : ca.chart_of_account_id) != null ? _h : null;
    } else if (body == null ? void 0 : body.bank_account_id) {
      const [[ba]] = await conn.query(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
        [Number(body.bank_account_id)]
      );
      drAccountId = (_i = ba == null ? void 0 : ba.chart_of_account_id) != null ? _i : null;
    }
    const loansAcct = await getLoansReceivableAccountId(conn);
    let jeId = null;
    if (drAccountId) {
      jeId = await postJournalEntry(conn, {
        date: payDate,
        description: `Loan repayment \u2014 ${repayNo} (${loan.loan_number}, ${borrowerName})`,
        docType: "LoanRepayment",
        docId: 0,
        userId,
        lines: [
          { accountId: drAccountId, debit: amount, credit: 0, memo: repayNo },
          { accountId: loansAcct, debit: 0, credit: amount, memo: repayNo }
        ]
      });
    }
    const [res] = await conn.query(
      `INSERT INTO loan_repayments
         (repayment_number, loan_id, customer_id, supplier_id, amount, repayment_date,
          payment_method, bank_account_id, cash_account_id, reference_number,
          journal_entry_id, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repayNo,
        id,
        loan.customer_id,
        loan.supplier_id,
        amount,
        payDate,
        method,
        (body == null ? void 0 : body.bank_account_id) ? Number(body.bank_account_id) : null,
        (body == null ? void 0 : body.cash_account_id) ? Number(body.cash_account_id) : null,
        (body == null ? void 0 : body.reference_number) || repayNo,
        jeId,
        (_j = body == null ? void 0 : body.notes) != null ? _j : null,
        userId
      ]
    );
    const repayId = res.insertId;
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [repayId, jeId]);
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
         VALUES (?, ?, 'cash_in', ?, ?, 'loan_repayment', ?, ?, ?, ?)`,
        [
          cashId,
          (_k = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _k : null,
          amount,
          Number((_l = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _l : 0) + amount,
          repayId,
          `Loan repayment ${repayNo} (${loan.loan_number})`,
          userId,
          payDate
        ]
      );
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [amount, cashId]);
    }
    const newRepaid = Number(loan.amount_repaid) + amount;
    const newBalance = Math.max(0, Number(loan.principal_amount) - newRepaid);
    await conn.query(
      `UPDATE loans SET amount_repaid = ?, balance_due = ?, status = ? WHERE id = ?`,
      [newRepaid, newBalance, newBalance <= 5e-3 ? "closed" : "active", id]
    );
    await auditLog(conn, {
      userId,
      action: "payment_received",
      module: "loans",
      recordType: "loan_repayment",
      recordId: repayId,
      referenceNumber: repayNo,
      description: `Loan repayment ${repayNo} \u2014 \u09F3${amount.toLocaleString()} against ${loan.loan_number} \xB7 balance \u09F3${newBalance.toLocaleString()}${newBalance <= 5e-3 ? " \xB7 LOAN CLOSED" : ""}`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4B5} <b>Loan Repayment</b>
${repayNo} \u2014 ${borrowerName} (${loan.loan_number})
\u09F3${amount.toLocaleString()} via ${method} \xB7 balance \u09F3${newBalance.toLocaleString()}` + (newBalance <= 5e-3 ? "\n\u2705 Loan fully repaid & closed" : ""),
      "payment_received"
    );
    return { ok: true, id: repayId, repayment_number: repayNo, new_balance: newBalance, closed: newBalance <= 5e-3 };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { repay_post as default };
//# sourceMappingURL=repay.post.mjs.map

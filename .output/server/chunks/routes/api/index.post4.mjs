import { q as defineEventHandler, ar as readBody, X as getUserSession, m as createError, aO as userCanAction, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, z as getDb, a1 as isAdminRole, x as getCreditWorkflowSettings, U as getUserActionLimit, aq as queuePendingRequest, aH as sendTelegram, a5 as nextDocNumber, F as getLoansReceivableAccountId, ak as postJournalEntry, g as auditLog } from '../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const canDisburse = await userCanAction({
    userId,
    role,
    module: "loans",
    page: "loans",
    action: "disburse",
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES]
  });
  if (!canDisburse) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to disburse loans" });
  const customerId = (body == null ? void 0 : body.customer_id) ? Number(body.customer_id) : null;
  const supplierId = (body == null ? void 0 : body.supplier_id) ? Number(body.supplier_id) : null;
  const amount = Number((_c = body == null ? void 0 : body.amount) != null ? _c : 0);
  if (!customerId && !supplierId || customerId && supplierId)
    throw createError({ statusCode: 400, statusMessage: "Pick exactly ONE borrower \u2014 a customer or a supplier" });
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: "Amount must be positive" });
  const validMethods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking"];
  const method = validMethods.includes(body == null ? void 0 : body.payment_method) ? body.payment_method : "Cash";
  const loanDate = String((_d = body == null ? void 0 : body.loan_date) != null ? _d : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    let borrowerName = "";
    if (customerId) {
      const [[c]] = await conn.query(`SELECT name FROM customers WHERE id = ?`, [customerId]);
      if (!c) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
      borrowerName = c.name;
    } else {
      const [[s]] = await conn.query(`SELECT company_name FROM suppliers WHERE id = ?`, [supplierId]);
      if (!s) throw createError({ statusCode: 404, statusMessage: "Supplier not found" });
      borrowerName = s.company_name;
    }
    if (!isAdminRole(role) && !(body == null ? void 0 : body.is_checker_review)) {
      const { paymentRequireApproval } = await getCreditWorkflowSettings(conn);
      const cap = await getUserActionLimit(conn, userId, "loan_disbursement");
      const withinCap = cap !== null && amount <= cap;
      if (paymentRequireApproval || !withinCap) {
        const reqId = await queuePendingRequest(conn, {
          requestType: "loan_disbursement",
          payload: body,
          customerId: customerId != null ? customerId : null,
          amount,
          referenceLabel: `LOAN \u2014 ${borrowerName} \u2014 \u09F3${amount.toLocaleString()}`,
          requestedBy: userId,
          requestedReason: cap === null ? "No loan-disbursement limit configured" : `Exceeds loan limit of \u09F3${cap.toLocaleString()}`
        });
        await conn.commit();
        sendTelegram(
          `\u23F3 <b>Loan Disbursement Queued</b>
${borrowerName} \u2014 \u09F3${amount.toLocaleString()}
Requested by ${userName}`,
          "payment"
        );
        return { ok: true, queued: true, pending_request_id: reqId, message: `Loan of \u09F3${amount.toLocaleString()} queued for a checker's approval.` };
      }
    }
    const loanNo = await nextDocNumber(conn, "LN", "loans", "loan_number");
    let crAccountId = null;
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      const [[ca]] = await conn.query(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [Number(body.cash_account_id)]
      );
      crAccountId = (_e = ca == null ? void 0 : ca.chart_of_account_id) != null ? _e : null;
    } else if (body == null ? void 0 : body.bank_account_id) {
      const [[ba]] = await conn.query(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
        [Number(body.bank_account_id)]
      );
      crAccountId = (_f = ba == null ? void 0 : ba.chart_of_account_id) != null ? _f : null;
    }
    const loansAcct = await getLoansReceivableAccountId(conn);
    let jeId = null;
    if (crAccountId) {
      jeId = await postJournalEntry(conn, {
        date: loanDate,
        description: `Loan disbursed \u2014 ${loanNo} to ${borrowerName}`,
        docType: "Loan",
        docId: 0,
        userId,
        lines: [
          { accountId: loansAcct, debit: amount, credit: 0, memo: loanNo },
          { accountId: crAccountId, debit: 0, credit: amount, memo: loanNo }
        ]
      });
    }
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      const cashId = Number(body.cash_account_id);
      const [[pcAcc]] = await conn.query(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [cashId]
      );
      const bal = Number((_g = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _g : 0);
      if (bal < amount) throw createError({ statusCode: 400, statusMessage: `Petty cash only has \u09F3${bal.toLocaleString()}` });
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_out', ?, ?, 'loan', 0, ?, ?, ?)`,
        [cashId, (_h = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _h : null, amount, bal - amount, `Loan ${loanNo} to ${borrowerName}`, userId, loanDate]
      );
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`, [amount, cashId]);
    }
    const [res] = await conn.query(
      `INSERT INTO loans
         (loan_number, customer_id, supplier_id, principal_amount, balance_due,
          loan_date, expected_return_date, purpose, payment_method,
          bank_account_id, cash_account_id, reference_number, status,
          journal_entry_id, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        loanNo,
        customerId,
        supplierId,
        amount,
        amount,
        loanDate,
        (body == null ? void 0 : body.expected_return_date) || null,
        (_i = body == null ? void 0 : body.purpose) != null ? _i : null,
        method,
        (body == null ? void 0 : body.bank_account_id) ? Number(body.bank_account_id) : null,
        (body == null ? void 0 : body.cash_account_id) ? Number(body.cash_account_id) : null,
        (body == null ? void 0 : body.reference_number) || loanNo,
        jeId,
        userId
      ]
    );
    const loanId = res.insertId;
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [loanId, jeId]);
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      await conn.query(
        `UPDATE branch_petty_cash_transactions SET reference_id = ?
         WHERE reference_type = 'loan' AND reference_id = 0 AND description LIKE ?`,
        [loanId, `Loan ${loanNo}%`]
      );
    }
    await auditLog(conn, {
      userId,
      action: "created",
      module: "loans",
      recordType: "loan",
      recordId: loanId,
      referenceNumber: loanNo,
      description: `Loan ${loanNo} \u2014 \u09F3${amount.toLocaleString()} to ${borrowerName} (${customerId ? "customer" : "supplier"}) via ${method}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F91D} <b>Loan Disbursed</b>
${loanNo} \u2014 ${borrowerName}
\u09F3${amount.toLocaleString()} via ${method} \xB7 by ${userName}` + ((body == null ? void 0 : body.expected_return_date) ? `
Expected return: ${body.expected_return_date}` : ""),
      "payment"
    );
    return { ok: true, id: loanId, loan_number: loanNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post4.mjs.map

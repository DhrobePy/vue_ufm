import { q as defineEventHandler, R as getRouterParam, as as readBody, X as getUserSession, m as createError, z as getDb, k as checkTransactionLimit, ar as queuePendingRequest, aK as sendTelegram, E as getGLAccountId, al as postJournalEntry, g as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const collectPayment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const customerId = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const amount = Number((_c = body == null ? void 0 : body.amount) != null ? _c : 0);
  if (!customerId || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: "customer id and a positive amount are required" });
  const validMethods = ["Cash", "Bank Transfer", "Card", "Mobile Banking"];
  const method = validMethods.includes(body == null ? void 0 : body.payment_method) ? body.payment_method : "Cash";
  const pmtDate = (_d = body == null ? void 0 : body.payment_date) != null ? _d : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[customer]] = await conn.query(`SELECT id, name FROM customers WHERE id = ? FOR UPDATE`, [customerId]);
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const limitCheck = await checkTransactionLimit(conn, userId, role, amount, Boolean(body == null ? void 0 : body.is_checker_review));
    if (!limitCheck.allowed) {
      const limitDesc = limitCheck.reason === "policy" ? "payment approval policy \u2014 every payment needs a checker" : limitCheck.cap > 0 ? `exceeds your transaction limit of \u09F3${limitCheck.cap.toLocaleString()}` : "no transaction limit has been delegated to your account yet";
      const reqId = await queuePendingRequest(conn, {
        requestType: "collect_payment",
        payload: { ...body, pos: true },
        customerId,
        amount,
        referenceLabel: `POS: ${customer.name} \u2014 \u09F3${amount.toLocaleString()} via ${method}`,
        requestedBy: userId,
        requestedReason: limitCheck.reason === "policy" ? "Payment approval policy (all payments)" : `Exceeds/no transaction limit`
      });
      await conn.commit();
      sendTelegram(`\u23F3 <b>POS Payment Queued</b>
${customer.name} \u2014 \u09F3${amount.toLocaleString()} via ${method}
Requested by ${userName} (${limitDesc})`, "payment_received");
      return { ok: true, queued: true, pending_request_id: reqId, message: `\u09F3${amount.toLocaleString()} ${limitDesc} \u2014 queued for a checker's approval.` };
    }
    const [[ledgerRes]] = await conn.query(
      `INSERT INTO pos_customer_ledger (customer_id, transaction_date, transaction_type, description, debit_amount, credit_amount, reference_number, created_by_user_id)
       VALUES (?, ?, 'payment', ?, 0, ?, ?, ?)`,
      [customerId, pmtDate, `POS credit payment via ${method}`, amount, (body == null ? void 0 : body.reference_number) || null, userId]
    );
    const ledgerId = ledgerRes.insertId;
    let jeId = null;
    let drAccountId = null;
    if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
      const [[ca]] = await conn.query(`SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(body.cash_account_id)]);
      drAccountId = (_e = ca == null ? void 0 : ca.chart_of_account_id) != null ? _e : null;
    } else if (body == null ? void 0 : body.bank_account_id) {
      const [[ba]] = await conn.query(`SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(body.bank_account_id)]);
      drAccountId = (_f = ba == null ? void 0 : ba.chart_of_account_id) != null ? _f : null;
    }
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    if (drAccountId && arId) {
      jeId = await postJournalEntry(conn, {
        date: pmtDate,
        description: `POS credit payment \u2014 ${customer.name} (${method})`,
        docType: "PosPayment",
        docId: ledgerId,
        userId,
        lines: [{ accountId: drAccountId, debit: amount, credit: 0 }, { accountId: arId, debit: 0, credit: amount }]
      });
      if (method === "Cash" && (body == null ? void 0 : body.cash_account_id)) {
        const cashId = Number(body.cash_account_id);
        const [[pcAcc]] = await conn.query(`SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId]);
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_in', ?, ?, 'pos_payment', ?, ?, ?, ?)`,
          [cashId, (_g = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _g : null, amount, Number((_h = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _h : 0) + amount, ledgerId, `POS credit payment \u2014 ${customer.name}`, userId, pmtDate]
        );
        await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [amount, cashId]);
      }
    } else {
      console.warn(`[pos/collect-payment] Skipping JE: dr=${drAccountId}, ar=${arId}`);
    }
    await auditLog(conn, {
      userId,
      action: "payment_received",
      module: "other",
      recordType: "pos_customer_ledger",
      recordId: ledgerId,
      description: `POS credit payment \u2014 ${customer.name} \u09F3${amount.toLocaleString()} via ${method}`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(`\u{1F4B0} <b>POS Credit Payment</b>
${customer.name}
\u09F3${amount.toLocaleString()} via ${method}
by ${userName}`, "payment_received");
    return { ok: true, id: ledgerId, journal_entry_id: jeId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { collectPayment_post as default };
//# sourceMappingURL=collect-payment.post.mjs.map

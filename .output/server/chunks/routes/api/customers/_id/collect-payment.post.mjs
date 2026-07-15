import { n as defineEventHandler, K as getRouterParam, ab as readBody, N as getUserSession, j as createError, T as isAccountsRole, v as getDb, h as checkTransactionLimit, aa as queuePendingRequest, ap as sendTelegram, Y as nextDocNumber, B as getOrderGateState, y as getGLAccountId, a6 as postJournalEntry, a4 as postCustomerLedger, e as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DISPATCHED = ["goods_on_board", "shipped", "dispatched", "delivered", "completed"];
const collectPayment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const customerId = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!isAccountsRole(role) && role !== "collector")
    throw createError({ statusCode: 403, statusMessage: "Accounts family, collector or admin only" });
  const amount = Number((_c = body == null ? void 0 : body.amount) != null ? _c : 0);
  if (!customerId || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: "customer id and a positive amount are required" });
  const allocations = (Array.isArray(body == null ? void 0 : body.allocations) ? body.allocations : []).map((a) => ({ order_id: Number(a.order_id), amount: Number(a.amount) })).filter((a) => a.order_id && a.amount > 0);
  const allocatedTotal = allocations.reduce((s, a) => s + a.amount, 0);
  if (allocatedTotal - amount > 5e-3)
    throw createError({ statusCode: 400, statusMessage: `Allocations (\u09F3${allocatedTotal.toLocaleString()}) exceed the payment amount` });
  const validMethods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking", "Card"];
  const method = validMethods.includes(body == null ? void 0 : body.payment_method) ? body.payment_method : "Cash";
  const pmtDate = (_d = body == null ? void 0 : body.payment_date) != null ? _d : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[customer]] = await conn.query(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`,
      [customerId]
    );
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const limitCheck = await checkTransactionLimit(conn, userId, role, amount);
    if (!limitCheck.allowed) {
      const reqId = await queuePendingRequest(conn, {
        requestType: "collect_payment",
        payload: body,
        customerId,
        amount,
        referenceLabel: `${customer.name} \u2014 \u09F3${amount.toLocaleString()} via ${method}`,
        requestedBy: userId,
        requestedReason: `Exceeds your transaction limit of \u09F3${limitCheck.cap.toLocaleString()}`
      });
      await conn.commit();
      sendTelegram(
        `\u23F3 <b>Payment Queued for Approval</b>
${customer.name} \u2014 \u09F3${amount.toLocaleString()} via ${method}
Requested by ${userName} (over their \u09F3${limitCheck.cap.toLocaleString()} limit)`
      );
      return {
        ok: true,
        queued: true,
        pending_request_id: reqId,
        message: `\u09F3${amount.toLocaleString()} exceeds your transaction limit of \u09F3${limitCheck.cap.toLocaleString()} \u2014 queued for a checker's approval.`
      };
    }
    const payNo = await nextDocNumber(conn, "PAY", "customer_payments");
    const [payRes] = await conn.query(
      `INSERT INTO customer_payments
         (order_id, payment_number, customer_id, payment_date, amount, payment_method,
          payment_type, reference_number, bank_account_id, cash_account_id,
          cheque_number, cheque_date, bank_transaction_type,
          allocation_status, allocated_amount, notes, created_by_user_id)
       VALUES (NULL, ?, ?, ?, ?, ?, 'invoice_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payNo,
        customerId,
        pmtDate,
        amount,
        method,
        (body == null ? void 0 : body.reference_number) || payNo,
        (body == null ? void 0 : body.bank_account_id) ? Number(body.bank_account_id) : null,
        (body == null ? void 0 : body.cash_account_id) ? Number(body.cash_account_id) : null,
        (body == null ? void 0 : body.cheque_number) || null,
        (body == null ? void 0 : body.cheque_date) || null,
        (body == null ? void 0 : body.bank_tx_type) || null,
        allocatedTotal >= amount - 5e-3 ? "allocated" : allocatedTotal > 0 ? "partial" : "unallocated",
        allocatedTotal,
        (_e = body == null ? void 0 : body.notes) != null ? _e : null,
        userId
      ]
    );
    const paymentId = payRes.insertId;
    const autoReleasedOrders = [];
    for (const a of allocations) {
      const [[o]] = await conn.query(
        `SELECT id, order_number, customer_id, status, total_amount, amount_paid, advance_paid, balance_due
         FROM credit_orders WHERE id = ? FOR UPDATE`,
        [a.order_id]
      );
      if (!o || o.customer_id !== customerId)
        throw createError({ statusCode: 400, statusMessage: `Order ${a.order_id} does not belong to this customer` });
      const asAdvance = !DISPATCHED.includes(o.status);
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance)
         VALUES (?, ?, ?, ?)`,
        [paymentId, a.order_id, a.amount, asAdvance ? 1 : 0]
      );
      const newPaid = Number((_f = o.amount_paid) != null ? _f : 0) + (asAdvance ? 0 : a.amount);
      const newAdvance = Number((_g = o.advance_paid) != null ? _g : 0) + (asAdvance ? a.amount : 0);
      const newBalance = Math.max(0, Number(o.total_amount) - newPaid - newAdvance);
      const nowComplete = newBalance === 0 && o.status === "delivered";
      await conn.query(
        `UPDATE credit_orders
         SET amount_paid = ?, advance_paid = ?, balance_due = ?,
             status = ?, updated_at = NOW()
         WHERE id = ?`,
        [newPaid, newAdvance, newBalance, nowComplete ? "completed" : o.status, a.order_id]
      );
      await conn.query(
        `INSERT INTO credit_order_workflow
           (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          a.order_id,
          o.status,
          nowComplete ? "completed" : o.status,
          nowComplete ? "completed" : "payment_received",
          userId,
          `${payNo} \u2014 \u09F3${a.amount.toLocaleString()} allocated${asAdvance ? " as ADVANCE (not dispatched yet)" : ""} via ${method}`
        ]
      );
      const gate = await getOrderGateState(conn, a.order_id);
      if (gate.dispatchHold && !gate.dispatchCleared && gate.autoRelease && gate.conditionMet) {
        await conn.query(
          `UPDATE order_approval_conditions
           SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
               dispatch_cleared_note = ?
           WHERE order_id = ?`,
          [userId, `Auto-released \u2014 ${payNo} satisfied ${gate.conditionType}`, a.order_id]
        );
        autoReleasedOrders.push(o.order_number);
      }
    }
    let jeId = null;
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
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    if (drAccountId && arId) {
      jeId = await postJournalEntry(conn, {
        date: pmtDate,
        description: `Customer payment ${payNo} \u2014 ${customer.name} (${method})`,
        docType: "CustomerPayment",
        docId: paymentId,
        userId,
        lines: [
          { accountId: drAccountId, debit: amount, credit: 0, memo: payNo },
          { accountId: arId, debit: 0, credit: amount, memo: payNo }
        ]
      });
      await conn.query(`UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`, [jeId, paymentId]);
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
           VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
          [
            cashId,
            (_j = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _j : null,
            amount,
            Number((_k = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _k : 0) + amount,
            paymentId,
            `Customer payment ${payNo} \u2014 ${customer.name}`,
            userId,
            pmtDate
          ]
        );
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
          [amount, cashId]
        );
      }
    } else {
      console.warn(`[collect-payment] Skipping JE for ${payNo}: dr=${drAccountId}, ar=${arId}`);
    }
    await postCustomerLedger(conn, {
      customerId,
      date: pmtDate,
      transactionType: "payment",
      referenceType: "customer_payment",
      referenceId: paymentId,
      invoiceNumber: payNo,
      description: `Payment ${payNo} via ${method}` + (allocations.length ? ` \u2014 allocated to ${allocations.length} order(s)` : " \u2014 on account"),
      debit: 0,
      credit: amount,
      journalEntryId: jeId,
      userId
    });
    await auditLog(conn, {
      userId,
      action: "payment_received",
      module: "credit_sales",
      recordType: "customer_payment",
      recordId: paymentId,
      referenceNumber: payNo,
      description: `Customer payment ${payNo} \u2014 ${customer.name} \u09F3${amount.toLocaleString()} via ${method}, ${allocations.length} allocation(s)`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4B0} <b>Customer Payment</b>
${payNo} \u2014 ${customer.name}
\u09F3${amount.toLocaleString()} via ${method} \xB7 ${allocations.length} order(s) allocated` + (allocatedTotal < amount ? `
\u09F3${(amount - allocatedTotal).toLocaleString()} on account` : "") + (autoReleasedOrders.length ? `
\u{1F7E2} Auto-released: ${autoReleasedOrders.join(", ")}` : "") + `
by ${userName}`
    );
    return { ok: true, id: paymentId, payment_number: payNo, auto_released: autoReleasedOrders };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { collectPayment_post as default };
//# sourceMappingURL=collect-payment.post.mjs.map

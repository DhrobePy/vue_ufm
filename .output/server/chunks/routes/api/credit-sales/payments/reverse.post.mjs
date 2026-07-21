import { o as defineEventHandler, af as readBody, Q as getUserSession, k as createError, G as getRequestHeader, a as ADMIN_ROLES, x as getDb, aa as postJournalEntry, a8 as postCustomerLedger, aD as voidBridgedTransaction, e as auditLog, au as sendTelegram } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reverse_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can reverse payments" });
  const { payment_id, reason } = body != null ? body : {};
  if (!payment_id) throw createError({ statusCode: 400, statusMessage: "payment_id is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[pmt]] = await conn.query(
      `SELECT p.*, c.name AS customer_name
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = ? FOR UPDATE`,
      [payment_id]
    );
    if (!pmt) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
    if (pmt.reversed_at) throw createError({ statusCode: 409, statusMessage: "Payment is already reversed" });
    const pmtAmount = Number(pmt.amount);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const refNo = `REV-${(_e = pmt.payment_number) != null ? _e : pmt.id}`;
    const affected = [];
    if (pmt.order_id) {
      affected.push({ orderId: pmt.order_id, amount: pmtAmount, asAdvance: false });
    } else {
      const [allocs] = await conn.query(
        `SELECT order_id, allocated_amount, as_advance
         FROM payment_allocations WHERE payment_id = ? AND reversed = 0`,
        [payment_id]
      );
      for (const a of allocs)
        affected.push({ orderId: a.order_id, amount: Number(a.allocated_amount), asAdvance: !!Number(a.as_advance) });
    }
    const orderSummaries = [];
    for (const a of affected) {
      const [[o]] = await conn.query(
        `SELECT id, order_number, status, total_amount, amount_paid, advance_paid
         FROM credit_orders WHERE id = ? FOR UPDATE`,
        [a.orderId]
      );
      if (!o) continue;
      const newPaid = a.asAdvance ? Number(o.amount_paid) : Math.max(0, Number(o.amount_paid) - a.amount);
      const newAdvance = a.asAdvance ? Math.max(0, Number(o.advance_paid) - a.amount) : Number(o.advance_paid);
      const newBalance = Math.max(0, Number(o.total_amount) - newPaid - newAdvance);
      const newStatus = o.status === "completed" && newBalance > 0 ? "delivered" : o.status;
      await conn.query(
        `UPDATE credit_orders
         SET amount_paid = ?, advance_paid = ?, balance_due = ?, status = ?, updated_at = NOW()
         WHERE id = ?`,
        [newPaid, newAdvance, newBalance, newStatus, a.orderId]
      );
      await conn.query(
        `INSERT INTO credit_order_workflow
           (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, 'payment_reversed', ?, ?, NOW())`,
        [
          a.orderId,
          o.status,
          newStatus,
          userId,
          `${refNo} \u2014 \u09F3${a.amount.toLocaleString()} reversed${reason ? ` (${reason})` : ""}`
        ]
      );
      orderSummaries.push(`${o.order_number} -\u09F3${a.amount.toLocaleString()}`);
    }
    if (!pmt.order_id)
      await conn.query(`UPDATE payment_allocations SET reversed = 1 WHERE payment_id = ?`, [payment_id]);
    let reversalJeId = null;
    if (pmt.journal_entry_id) {
      const [origLines] = await conn.query(
        `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
        [pmt.journal_entry_id]
      );
      if (origLines.length) {
        reversalJeId = await postJournalEntry(conn, {
          date: today,
          description: `Reversal of ${pmt.payment_number} \u2014 ${pmt.customer_name}${reason ? ` (${reason})` : ""}`,
          docType: "CustomerPaymentReversal",
          docId: Number(payment_id),
          userId,
          lines: origLines.map((l) => ({
            accountId: l.account_id,
            debit: Number(l.credit_amount),
            credit: Number(l.debit_amount)
          }))
        });
      }
    }
    if (pmt.cash_account_id) {
      const [[pcAcc]] = await conn.query(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [pmt.cash_account_id]
      );
      if (pcAcc) {
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_out', ?, ?, 'customer_payment_reversal', ?, ?, ?, ?)`,
          [
            pmt.cash_account_id,
            pcAcc.branch_id,
            pmtAmount,
            Number(pcAcc.current_balance) - pmtAmount,
            payment_id,
            `Reversal of ${pmt.payment_number} \u2014 ${pmt.customer_name}`,
            userId,
            today
          ]
        );
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
          [pmtAmount, pmt.cash_account_id]
        );
      }
    }
    await postCustomerLedger(conn, {
      customerId: pmt.customer_id,
      date: today,
      transactionType: "debit_note",
      referenceType: "payment_reversal",
      referenceId: Number(payment_id),
      invoiceNumber: refNo,
      description: `Payment Reversal \u2014 ${refNo}${reason ? ` (${reason})` : ""}`,
      debit: pmtAmount,
      credit: 0,
      journalEntryId: reversalJeId,
      userId
    });
    await conn.query(
      `UPDATE customer_payments
       SET reversed_at = NOW(), reversed_by_user_id = ?, reversal_reason = ?,
           reversal_journal_entry_id = ?, allocation_status = 'unallocated', updated_at = NOW()
       WHERE id = ?`,
      [userId, reason != null ? reason : null, reversalJeId, payment_id]
    );
    await voidBridgedTransaction(conn, Number(payment_id));
    await auditLog(conn, {
      userId,
      action: "other",
      module: "credit_sales",
      recordType: "customer_payment",
      recordId: Number(payment_id),
      referenceNumber: refNo,
      description: `Payment reversed \u2014 ${refNo} \xB7 \u09F3${pmtAmount.toLocaleString()} for ${pmt.customer_name}` + (orderSummaries.length ? ` \xB7 ${orderSummaries.join(", ")}` : "") + (reason ? ` \xB7 Reason: ${reason}` : ""),
      severity: "warning",
      ipAddress
    });
    await conn.commit();
    sendTelegram(
      `\u21A9\uFE0F <b>Payment Reversed</b>
${pmt.payment_number} \u2014 \u09F3${pmtAmount.toLocaleString()} for ${pmt.customer_name}
` + (orderSummaries.length ? `${orderSummaries.join(", ")}
` : "") + `by ${userName}${reason ? `
Reason: ${reason}` : ""}`
    );
    return { ok: true, reversed_amount: pmtAmount, reference: refNo, reversal_journal_entry_id: reversalJeId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { reverse_post as default };
//# sourceMappingURL=reverse.post.mjs.map

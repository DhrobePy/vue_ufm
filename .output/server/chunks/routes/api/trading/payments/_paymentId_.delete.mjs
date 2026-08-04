import { q as defineEventHandler, R as getRouterParam, m as createError, ar as readBody, X as getUserSession, b as ADMIN_ROLES, z as getDb, ax as recycleBegin, aB as recycleSnapshotBefore, aw as recycleArchiveDelete, ay as recycleFinalize, g as auditLog, aH as sendTelegram } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _paymentId__delete = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const paymentId = Number(getRouterParam(event, "paymentId"));
  if (!paymentId) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const body = await readBody(event).catch(() => ({}));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Payment reversal is admin/superadmin only" });
  const reason = String((_c = body == null ? void 0 : body.reason) != null ? _c : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[pay]] = await conn.query(
      `SELECT p.*, s.sale_number, s.total_amount, s.advance_paid, s.amount_paid AS sale_paid,
              c.name AS customer_name
       FROM commodity_sale_payments p
       JOIN commodity_sales s ON s.id = p.sale_id
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = ? FOR UPDATE`,
      [paymentId]
    );
    if (!pay) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
    const batchId = await recycleBegin(conn, {
      entityType: "commodity_payment",
      label: `${pay.payment_number} \u2014 ${pay.customer_name} \u2014 \u09F3${Number(pay.amount).toLocaleString()}`,
      customerId: pay.customer_id,
      userId,
      userName
    });
    await recycleSnapshotBefore(conn, batchId, "commodity_sales", "id", pay.sale_id);
    const newPaid = Math.max(0, Number(pay.sale_paid) - Number(pay.amount));
    const newBalance = Math.max(0, Number(pay.total_amount) - Number(pay.advance_paid) - newPaid);
    await conn.query(
      `UPDATE commodity_sales SET amount_paid = ?, balance_due = ? WHERE id = ?`,
      [newPaid, newBalance, pay.sale_id]
    );
    if (pay.cash_account_id) {
      await recycleSnapshotBefore(conn, batchId, "branch_petty_cash_accounts", "id", pay.cash_account_id);
      const [pcTxns] = await conn.query(
        `SELECT id FROM branch_petty_cash_transactions
         WHERE reference_type = 'commodity_sale_payment' AND reference_id = ?`,
        [paymentId]
      );
      for (const t of pcTxns) {
        await recycleArchiveDelete(conn, batchId, "branch_petty_cash_transactions", "id", t.id);
      }
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
        [Number(pay.amount), pay.cash_account_id]
      );
    }
    try {
      await recycleSnapshotBefore(conn, batchId, "bank_transactions", "source_payment_id", paymentId);
      await conn.query(
        `UPDATE bank_transactions SET status = 'rejected'
         WHERE source_payment_id = ? AND status = 'pending'`,
        [paymentId]
      );
    } catch {
    }
    if (pay.customer_ledger_id) {
      await recycleArchiveDelete(conn, batchId, "customer_ledger", "id", pay.customer_ledger_id);
      const [[bal]] = await conn.query(
        `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS b FROM customer_ledger WHERE customer_id = ?`,
        [pay.customer_id]
      );
      await conn.query(`UPDATE customers SET current_balance = GREATEST(0, ?) WHERE id = ?`, [Number(bal.b), pay.customer_id]);
    }
    if (pay.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", pay.journal_entry_id);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", pay.journal_entry_id);
    }
    await recycleArchiveDelete(conn, batchId, "commodity_sale_payments", "id", paymentId);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "trading",
      recordType: "commodity_sale_payment",
      recordId: paymentId,
      referenceNumber: pay.payment_number,
      description: `Commodity payment ${pay.payment_number} reversed (batch #${batchId}) \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(
      `\u21A9\uFE0F <b>Commodity Payment Reversed</b>
${pay.payment_number} \u2014 ${pay.customer_name} (${pay.sale_number})
\u09F3${Number(pay.amount).toLocaleString()} \xB7 by ${userName}
Reason: ${reason}`,
      "payment_received"
    );
    return { ok: true, recycle_batch_id: batchId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _paymentId__delete as default };
//# sourceMappingURL=_paymentId_.delete.mjs.map

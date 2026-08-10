import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, X as getUserSession, b as ADMIN_ROLES, z as getDb, az as recycleBegin, aD as recycleSnapshotBefore, ay as recycleArchiveDelete, aA as recycleFinalize, g as auditLog, aK as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const _repayId__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const repayId = Number(getRouterParam(event, "repayId"));
  if (!repayId) throw createError({ statusCode: 400, statusMessage: "Invalid repayment ID" });
  const body = await readBody(event).catch(() => ({}));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Repayment reversal is admin/superadmin only" });
  const reason = String((_c = body == null ? void 0 : body.reason) != null ? _c : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[rep]] = await conn.query(
      `SELECT r.*, l.loan_number, l.amount_repaid AS loan_repaid, l.principal_amount,
              COALESCE(c.name, s.company_name) AS borrower_name
       FROM loan_repayments r
       JOIN loans l ON l.id = r.loan_id
       LEFT JOIN customers c ON c.id = r.customer_id
       LEFT JOIN suppliers s ON s.id = r.supplier_id
       WHERE r.id = ? FOR UPDATE`,
      [repayId]
    );
    if (!rep) throw createError({ statusCode: 404, statusMessage: "Repayment not found" });
    const batchId = await recycleBegin(conn, {
      entityType: "loan_repayment",
      label: `${rep.repayment_number} \u2014 ${rep.borrower_name} \u2014 \u09F3${Number(rep.amount).toLocaleString()}`,
      customerId: (_d = rep.customer_id) != null ? _d : null,
      userId,
      userName
    });
    await recycleSnapshotBefore(conn, batchId, "loans", "id", rep.loan_id);
    const newRepaid = Math.max(0, Number(rep.loan_repaid) - Number(rep.amount));
    await conn.query(
      `UPDATE loans SET amount_repaid = ?, balance_due = ?, status = 'active' WHERE id = ?`,
      [newRepaid, Math.max(0, Number(rep.principal_amount) - newRepaid), rep.loan_id]
    );
    if (rep.cash_account_id) {
      await recycleSnapshotBefore(conn, batchId, "branch_petty_cash_accounts", "id", rep.cash_account_id);
      const [pcTxns] = await conn.query(
        `SELECT id FROM branch_petty_cash_transactions WHERE reference_type = 'loan_repayment' AND reference_id = ?`,
        [repayId]
      );
      for (const t of pcTxns) await recycleArchiveDelete(conn, batchId, "branch_petty_cash_transactions", "id", t.id);
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
        [Number(rep.amount), rep.cash_account_id]
      );
    }
    if (rep.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", rep.journal_entry_id);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", rep.journal_entry_id);
    }
    await recycleArchiveDelete(conn, batchId, "loan_repayments", "id", repayId);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "loans",
      recordType: "loan_repayment",
      recordId: repayId,
      referenceNumber: rep.repayment_number,
      description: `Loan repayment ${rep.repayment_number} reversed (batch #${batchId}) \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(
      `\u21A9\uFE0F <b>Loan Repayment Reversed</b>
${rep.repayment_number} \u2014 ${rep.borrower_name} (${rep.loan_number})
\u09F3${Number(rep.amount).toLocaleString()} \xB7 by ${userName}
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

export { _repayId__delete as default };
//# sourceMappingURL=_repayId_.delete.mjs.map

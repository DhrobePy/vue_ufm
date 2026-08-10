import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, X as getUserSession, b as ADMIN_ROLES, z as getDb, az as recycleBegin, aD as recycleSnapshotBefore, ay as recycleArchiveDelete, aA as recycleFinalize, g as auditLog, aK as sendTelegram } from '../../../nitro/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid loan ID" });
  const body = await readBody(event).catch(() => ({}));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Loan deletion is admin/superadmin only" });
  const reason = String((_c = body == null ? void 0 : body.reason) != null ? _c : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
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
    if (Number(loan.amount_repaid) > 5e-3)
      throw createError({ statusCode: 409, statusMessage: "This loan has repayments \u2014 reverse those first, then delete" });
    const borrowerName = (_e = (_d = loan.customer_name) != null ? _d : loan.supplier_name) != null ? _e : "\u2014";
    const batchId = await recycleBegin(conn, {
      entityType: "loan",
      label: `${loan.loan_number} \u2014 ${borrowerName} \u2014 \u09F3${Number(loan.principal_amount).toLocaleString()}`,
      customerId: (_f = loan.customer_id) != null ? _f : null,
      userId,
      userName
    });
    if (loan.cash_account_id) {
      await recycleSnapshotBefore(conn, batchId, "branch_petty_cash_accounts", "id", loan.cash_account_id);
      const [pcTxns] = await conn.query(
        `SELECT id FROM branch_petty_cash_transactions WHERE reference_type = 'loan' AND reference_id = ?`,
        [id]
      );
      for (const t of pcTxns) await recycleArchiveDelete(conn, batchId, "branch_petty_cash_transactions", "id", t.id);
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
        [Number(loan.principal_amount), loan.cash_account_id]
      );
    }
    if (loan.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", loan.journal_entry_id);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", loan.journal_entry_id);
    }
    await recycleArchiveDelete(conn, batchId, "loans", "id", id);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "loans",
      recordType: "loan",
      recordId: id,
      referenceNumber: loan.loan_number,
      description: `Loan ${loan.loan_number} deleted (batch #${batchId}) \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F5D1}\uFE0F <b>Loan Deleted</b>
${loan.loan_number} \u2014 ${borrowerName}
\u09F3${Number(loan.principal_amount).toLocaleString()} \xB7 by ${userName}
Reason: ${reason}`,
      "payment"
    );
    return { ok: true, recycle_batch_id: batchId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

import { J as defineEventHandler, aZ as readBody, al as getUserSession, C as createError, a1 as getDb, q as auditLog } from '../../../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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

const transfer_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const b = await readBody(event);
  const session = await getUserSession(event);
  const userId = Number((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1);
  const fromId = Number(b == null ? void 0 : b.from_account_id), toId = Number(b == null ? void 0 : b.to_account_id), amount = Number(b == null ? void 0 : b.amount), empId = Number(b == null ? void 0 : b.responsible_employee_id);
  const memo = String((_c = b == null ? void 0 : b.memo) != null ? _c : "").trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String((_d = b == null ? void 0 : b.transfer_date) != null ? _d : "")) ? String(b.transfer_date) : new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
  if (!(amount > 0)) throw createError({ statusCode: 400, statusMessage: "Transfer amount must be positive." });
  if (!fromId || !toId || !empId) throw createError({ statusCode: 400, statusMessage: "Please select source account, destination account, and responsible employee." });
  if (fromId === toId) throw createError({ statusCode: 400, statusMessage: "Source and Destination accounts cannot be the same." });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[from]] = await conn.query(`SELECT id, name, account_type, branch_id FROM chart_of_accounts WHERE id = ?`, [fromId]);
    const [[to]] = await conn.query(`SELECT id, name, account_type, branch_id FROM chart_of_accounts WHERE id = ?`, [toId]);
    if (!from || !to) throw createError({ statusCode: 400, statusMessage: "Invalid source or destination account selected." });
    const [[emp]] = await conn.query(`SELECT id FROM employees WHERE id = ?`, [empId]);
    if (!emp) throw createError({ statusCode: 400, statusMessage: "Responsible employee not found." });
    const desc = `Internal Transfer: ${from.name} to ${to.name}${memo ? " - " + memo : ""}`.slice(0, 255);
    const [je] = await conn.query(
      `INSERT INTO journal_entries (transaction_date, description, related_document_type, created_by_user_id, responsible_employee_id) VALUES (?, ?, 'InternalTransfer', ?, ?)`,
      [date, desc, userId, empId]
    );
    const jeId = je.insertId;
    await conn.query(`INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES (?, ?, ?, 0, ?)`, [jeId, toId, amount, memo || "Internal transfer received"]);
    await conn.query(`INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES (?, ?, 0, ?, ?)`, [jeId, fromId, amount, memo || "Internal transfer sent"]);
    const moveTill = async (acct, delta, kind) => {
      let [[pc]] = await conn.query(`SELECT id, branch_id, current_balance FROM branch_petty_cash_accounts WHERE chart_of_account_id = ? AND status = 'active' LIMIT 1`, [acct.id]);
      if (!pc && ["Petty Cash", "Cash"].includes(acct.account_type) && acct.branch_id)
        [[pc]] = await conn.query(`SELECT id, branch_id, current_balance FROM branch_petty_cash_accounts WHERE branch_id = ? AND status = 'active' LIMIT 1`, [acct.branch_id]);
      if (!pc) return;
      const after = Number(pc.current_balance) + delta;
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, ?, ?, ?, 'internal_transfer', ?, ?, ?, ?)`,
        [pc.id, pc.branch_id, kind, amount, after, jeId, `${kind === "transfer_out" ? "Transfer out" : "Transfer in"}: ${desc}`.slice(0, 255), userId, date]
      );
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?`, [after, pc.id]);
    };
    await moveTill(from, -amount, "transfer_out");
    await moveTill(to, amount, "transfer_in");
    await auditLog(conn, { userId, action: "internal_transfer", module: "accounts", recordType: "journal_entry", recordId: jeId, description: `${desc} \xB7 \u09F3${amount.toLocaleString()}`, severity: "info" });
    await conn.commit();
    return { ok: true, id: jeId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { transfer_post as default };
//# sourceMappingURL=transfer.post.mjs.map

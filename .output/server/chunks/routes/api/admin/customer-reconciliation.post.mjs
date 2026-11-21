import { V as defineEventHandler, bb as readBody, av as getUserSession, J as createError, ab as getDb, v as auditLog } from '../../../nitro/nitro.mjs';
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

const customerReconciliation_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const b = await readBody(event);
  const session = await getUserSession(event);
  const userId = Number((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1), userName = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "admin";
  if (!["admin", "superadmin"].includes(((_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.role) != null ? _f : "").toLowerCase()))
    throw createError({ statusCode: 403, statusMessage: "Only admin / superadmin can reconcile customer balances" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    if ((b == null ? void 0 : b.action) === "reconcile") {
      const [[c]] = await conn.query(`SELECT id, name, current_balance FROM customers WHERE id = ? FOR UPDATE`, [Number(b.customer_id)]);
      if (!c) throw createError({ statusCode: 404, statusMessage: "Customer not found." });
      const [[agg]] = await conn.query(`SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS net FROM customer_ledger WHERE customer_id = ?`, [c.id]);
      const trueBal = Math.round(Number(agg.net) * 100) / 100, oldBal = Number(c.current_balance);
      if (Math.abs(trueBal - oldBal) < 0.5) throw createError({ statusCode: 409, statusMessage: `${c.name} is already reconciled \u2014 nothing to do.` });
      await conn.query(`UPDATE customers SET current_balance = ? WHERE id = ?`, [trueBal, c.id]);
      const [h] = await conn.query(`INSERT INTO customer_balance_reconciliations (customer_id, old_balance, new_balance, status, reconciled_by_user_id) VALUES (?, ?, ?, 'active', ?)`, [c.id, oldBal, trueBal, userId]);
      await auditLog(conn, {
        userId,
        action: "balance_reconciled",
        module: "customers",
        recordType: "customer",
        recordId: c.id,
        description: `Reconciled stored balance for ${c.name} (#${c.id}) [history #${h.insertId}]: \u09F3${oldBal.toLocaleString()} \u2192 \u09F3${trueBal.toLocaleString()} by ${userName}`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, message: `${c.name} reconciled: \u09F3${oldBal.toLocaleString()} \u2192 \u09F3${trueBal.toLocaleString()}. This can be undone from the history.` };
    }
    if ((b == null ? void 0 : b.action) === "undo") {
      const [[r]] = await conn.query(`SELECT r.*, c.name FROM customer_balance_reconciliations r JOIN customers c ON c.id = r.customer_id WHERE r.id = ? AND r.status = 'active' FOR UPDATE`, [Number(b.history_id)]);
      if (!r) throw createError({ statusCode: 404, statusMessage: "That reconciliation was not found, or has already been undone." });
      await conn.query(`UPDATE customers SET current_balance = ? WHERE id = ?`, [Number(r.old_balance), r.customer_id]);
      await conn.query(`UPDATE customer_balance_reconciliations SET status = 'reverted', reverted_by_user_id = ?, reverted_at = NOW() WHERE id = ?`, [userId, r.id]);
      await auditLog(conn, {
        userId,
        action: "balance_reconciliation_reverted",
        module: "customers",
        recordType: "customer",
        recordId: r.customer_id,
        description: `Undid reconciliation #${r.id} for ${r.name}: stored balance restored to \u09F3${Number(r.old_balance).toLocaleString()} by ${userName}`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, message: `${r.name}: stored balance restored to \u09F3${Number(r.old_balance).toLocaleString()}.` };
    }
    throw createError({ statusCode: 400, statusMessage: "Unknown action." });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { customerReconciliation_post as default };
//# sourceMappingURL=customer-reconciliation.post.mjs.map

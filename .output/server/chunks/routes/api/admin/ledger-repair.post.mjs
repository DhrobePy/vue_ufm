import { V as defineEventHandler, av as getUserSession, J as createError, bb as readBody, ab as getDb, v as auditLog } from '../../../nitro/nitro.mjs';
import '@opentelemetry/api';
import 'standardwebhooks';
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

const ledgerRepair_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  if (String((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Ledger Repair is for the Superadmin only" });
  const b = await readBody(event);
  if ((b == null ? void 0 : b.action) !== "rebuild_running_balances") throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1);
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const only = Number(b.customer_id) || 0;
    const [bad] = await conn.query(
      `SELECT DISTINCT customer_id FROM (
         SELECT customer_id, balance_after, SUM(debit_amount - credit_amount) OVER (PARTITION BY customer_id ORDER BY transaction_date, id) AS rb FROM customer_ledger ${only ? "WHERE customer_id = ?" : ""}) t
       WHERE ABS(balance_after - rb) >= 0.5`,
      only ? [only] : []
    );
    for (const { customer_id } of bad) {
      await conn.query(
        `UPDATE customer_ledger l JOIN (SELECT id, SUM(debit_amount - credit_amount) OVER (ORDER BY transaction_date, id) AS rb FROM customer_ledger WHERE customer_id = ?) x ON x.id = l.id
         SET l.balance_after = x.rb WHERE l.customer_id = ?`,
        [customer_id, customer_id]
      );
    }
    await auditLog(conn, {
      userId,
      action: "ledger_running_balances_rebuilt",
      module: "customers",
      recordType: "customer_ledger",
      recordId: only || 0,
      description: `Rebuilt running balances in date order for ${bad.length} customer ledger(s)${only ? ` (customer #${only})` : ""}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, customers: bad.length, message: bad.length ? `Running balances rebuilt for ${bad.length} customer(s).` : "Nothing to rebuild \u2014 every running balance is already in order." };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { ledgerRepair_post as default };
//# sourceMappingURL=ledger-repair.post.mjs.map

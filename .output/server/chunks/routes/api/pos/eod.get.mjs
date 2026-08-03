import { q as defineEventHandler, X as getUserSession, m as createError, J as getQuery, an as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const eod_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const branchId = q.branch_id ? Number(q.branch_id) : null;
  const [cashAccounts, history] = await Promise.all([
    query(
      `SELECT ca.id, ca.account_name, ca.branch_id, ca.current_balance, b.name AS branch_name
       FROM branch_petty_cash_accounts ca
       LEFT JOIN branches b ON b.id = ca.branch_id
       WHERE ca.status = 'active' ${branchId ? "AND ca.branch_id = ?" : ""}
       ORDER BY b.name`,
      branchId ? [branchId] : []
    ),
    query(
      `SELECT v.*, b.name AS branch_name, u.display_name AS verified_by_name, w.display_name AS witness_name
       FROM cash_verification_log v
       LEFT JOIN branches b ON b.id = v.branch_id
       LEFT JOIN users u ON u.id = v.verified_by_user_id
       LEFT JOIN users w ON w.id = v.witness_user_id
       ${branchId ? "WHERE v.branch_id = ?" : ""}
       ORDER BY v.verification_date DESC, v.id DESC LIMIT 60`,
      branchId ? [branchId] : []
    )
  ]);
  return { cash_accounts: cashAccounts, history };
});

export { eod_get as default };
//# sourceMappingURL=eod.get.mjs.map

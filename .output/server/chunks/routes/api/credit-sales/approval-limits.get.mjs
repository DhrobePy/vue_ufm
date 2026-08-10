import { q as defineEventHandler, X as getUserSession, b as ADMIN_ROLES, m as createError, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const approvalLimits_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const users = await query(
    `SELECT u.id, u.display_name, u.role,
            ual.max_order_amount, ual.max_transaction_amount,
            ual.updated_at AS limit_updated_at
     FROM users u
     LEFT JOIN user_approval_limits ual ON ual.user_id = u.id
     WHERE u.status = 'active' AND u.role NOT IN ('admin','superadmin')
     ORDER BY ual.max_order_amount DESC, u.display_name`
  );
  try {
    const actionRows = await query(
      `SELECT user_id, action_key, max_amount FROM user_action_limits WHERE max_amount > 0`
    );
    const byUser = {};
    for (const r of actionRows) ((_d = byUser[_c = r.user_id]) != null ? _d : byUser[_c] = []).push({ action_key: r.action_key, max_amount: Number(r.max_amount) });
    for (const u of users) u.action_limits = (_e = byUser[u.id]) != null ? _e : [];
  } catch {
    for (const u of users) u.action_limits = [];
  }
  return { users };
});

export { approvalLimits_get as default };
//# sourceMappingURL=approval-limits.get.mjs.map

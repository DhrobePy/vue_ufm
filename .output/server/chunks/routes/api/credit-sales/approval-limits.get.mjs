import { o as defineEventHandler, O as getUserSession, a as ADMIN_ROLES, k as createError, ab as query } from '../../../nitro/nitro.mjs';
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
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const users = await query(
    `SELECT u.id, u.display_name, u.username, u.role,
            ual.max_order_amount, ual.max_transaction_amount,
            ual.updated_at AS limit_updated_at
     FROM users u
     LEFT JOIN user_approval_limits ual ON ual.user_id = u.id
     WHERE u.status = 'active' AND u.role NOT IN ('admin','superadmin')
     ORDER BY ual.max_order_amount DESC, u.display_name`
  );
  return { users };
});

export { approvalLimits_get as default };
//# sourceMappingURL=approval-limits.get.mjs.map

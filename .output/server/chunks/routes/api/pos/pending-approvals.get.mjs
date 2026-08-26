import { q as defineEventHandler, X as getUserSession, m as createError, aq as query } from '../../../nitro/nitro.mjs';
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

const pendingApprovals_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const requests = await query(
    `SELECT r.*, u.display_name AS requested_by_name, o.order_number, o.total_amount, o.cash_amount
     FROM credit_pending_requests r
     LEFT JOIN users u ON u.id = r.requested_by_user_id
     LEFT JOIN orders o ON o.id = r.order_id AND o.order_type = 'POS'
     WHERE r.request_type IN ('pos_exit_release', 'pos_credit_sale') AND r.status = 'pending'
     ORDER BY r.created_at DESC`
  );
  return { requests };
});

export { pendingApprovals_get as default };
//# sourceMappingURL=pending-approvals.get.mjs.map

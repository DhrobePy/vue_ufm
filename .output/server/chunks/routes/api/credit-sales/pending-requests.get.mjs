import { q as defineEventHandler, X as getUserSession, m as createError, a0 as isAccountsRole, J as getQuery, ao as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const pendingRequests_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  const q = getQuery(event);
  const status = q.status || "pending";
  const requests = await query(
    `SELECT r.id, r.request_type, r.order_id, r.customer_id, r.amount, r.reference_label,
            r.requested_reason, r.status, r.decision_note, r.result_payment_id,
            r.requested_by_user_id, r.payload,
            r.created_at, r.decided_at,
            ru.display_name AS requested_by_name, du.display_name AS decided_by_name,
            o.order_number
     FROM credit_pending_requests r
     LEFT JOIN users ru ON ru.id = r.requested_by_user_id
     LEFT JOIN users du ON du.id = r.decided_by_user_id
     LEFT JOIN credit_orders o ON o.id = r.order_id
     WHERE r.status = ?
     ORDER BY r.created_at DESC
     LIMIT 200`,
    [status]
  );
  for (const r of requests) {
    try {
      r.payload = JSON.parse(r.payload);
    } catch {
      r.payload = null;
    }
  }
  return { requests };
});

export { pendingRequests_get as default };
//# sourceMappingURL=pending-requests.get.mjs.map

import { n as defineEventHandler, L as getUserSession, j as createError, Q as isAccountsRole, z as getQuery, a6 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const overDeliveries_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  const q = getQuery(event);
  const status = q.status || "pending";
  const rows = await query(
    `SELECT od.*, o.order_number, c.name AS customer_name,
            cr.display_name AS created_by_name, ap.display_name AS approved_by_name
     FROM credit_order_over_deliveries od
     JOIN credit_orders o ON o.id = od.order_id
     JOIN customers c ON c.id = od.customer_id
     LEFT JOIN users cr ON cr.id = od.created_by_user_id
     LEFT JOIN users ap ON ap.id = od.approved_by_user_id
     WHERE od.status = ?
     ORDER BY od.created_at DESC
     LIMIT 200`,
    [status]
  );
  return { over_deliveries: rows };
});

export { overDeliveries_get as default };
//# sourceMappingURL=over-deliveries.get.mjs.map

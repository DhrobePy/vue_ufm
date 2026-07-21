import { o as defineEventHandler, ad as queryOne, ac as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async () => {
  const [stats, users, recentAudit] = await Promise.all([
    queryOne(
      `SELECT
         COUNT(*)                AS total_users,
         SUM(status = 'active')  AS active_users,
         SUM(status = 'pending') AS pending_users,
         SUM(status = 'suspended') AS suspended_users
       FROM users`
    ),
    query(
      `SELECT u.id, u.display_name, u.email, u.role, u.status, u.last_login
       FROM users u
       ORDER BY FIELD(u.status,'active','pending','suspended'), u.display_name
       LIMIT 20`
    ),
    // system_audit_log is the real table name
    query(
      `SELECT id, user_id, action, module, description, ip_address, created_at
       FROM system_audit_log
       ORDER BY created_at DESC
       LIMIT 10`
    )
  ]);
  return { stats, users, recentAudit };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map

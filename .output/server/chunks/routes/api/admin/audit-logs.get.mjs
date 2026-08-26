import { q as defineEventHandler, J as getQuery, aq as query, ar as queryOne } from '../../../nitro/nitro.mjs';
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

const auditLogs_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const severity = q.severity || "";
  const userId = q.user || "";
  const module_ = q.module || "";
  const date = q.date || "";
  const page = Math.max(1, Number(q.page || 1));
  const per = Math.min(100, Number(q.per || 50));
  const offset = (page - 1) * per;
  const conditions = [];
  const params = [];
  if (severity) {
    conditions.push("sal.severity = ?");
    params.push(severity);
  }
  if (userId) {
    conditions.push("sal.user_id = ?");
    params.push(userId);
  }
  if (module_) {
    conditions.push("sal.module = ?");
    params.push(module_);
  }
  if (date) {
    conditions.push("DATE(sal.created_at) = ?");
    params.push(date);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows, totalRow, users] = await Promise.all([
    query(
      `SELECT sal.id,
              sal.user_id,
              COALESCE(u.display_name, 'System') AS user_name,
              sal.action,
              sal.module,
              sal.record_type,
              sal.record_id,
              sal.reference_number,
              sal.description,
              sal.severity,
              sal.status,
              sal.ip_address,
              sal.created_at
       FROM system_audit_log sal
       LEFT JOIN users u ON u.id = sal.user_id
       ${where}
       ORDER BY sal.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, per, offset]
    ),
    queryOne(
      `SELECT COUNT(*) AS total FROM system_audit_log sal ${where}`,
      params
    ),
    // Users who have audit entries (for the filter dropdown)
    query(
      `SELECT DISTINCT u.id, u.display_name
       FROM users u
       WHERE EXISTS (SELECT 1 FROM system_audit_log sal WHERE sal.user_id = u.id)
       ORDER BY u.display_name`
    )
  ]);
  return {
    logs: rows,
    total: Number((totalRow == null ? void 0 : totalRow.total) || 0),
    page,
    per,
    users
  };
});

export { auditLogs_get as default };
//# sourceMappingURL=audit-logs.get.mjs.map

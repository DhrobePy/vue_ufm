import { h as defineEventHandler, p as getQuery, G as query, H as queryOne } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
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
    conditions.push("al.severity = ?");
    params.push(severity);
  }
  if (userId) {
    conditions.push("al.user_id = ?");
    params.push(userId);
  }
  if (module_) {
    conditions.push("al.module = ?");
    params.push(module_);
  }
  if (date) {
    conditions.push("DATE(al.created_at) = ?");
    params.push(date);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows, totalRow, users] = await Promise.all([
    query(
      `SELECT al.id, al.user_id, u.display_name AS user_name,
              al.action, al.module, al.record_type, al.reference_number,
              al.description, al.severity, al.status, al.ip_address, al.created_at
       FROM system_audit_log al
       LEFT JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, per, offset]
    ),
    queryOne(`SELECT COUNT(*) AS total FROM system_audit_log al ${where}`, params),
    query(
      `SELECT u.id, u.display_name FROM users u
       WHERE EXISTS (SELECT 1 FROM system_audit_log al WHERE al.user_id = u.id)
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

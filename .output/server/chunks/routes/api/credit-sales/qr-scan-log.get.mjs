import { q as defineEventHandler, X as getUserSession, m as createError, a0 as isAccountsRole, a1 as isAdminRole, J as getQuery, ao as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const qrScanLog_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role) && !isAdminRole(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  const q = getQuery(event);
  const reusedOnly = q.reused_only === "1" || q.reused_only === "true";
  const dateFrom = q.date_from || "";
  const dateTo = q.date_to || "";
  const search = q.search || "";
  const where = [];
  const params = [];
  if (reusedOnly) where.push("l.reused = 1");
  if (dateFrom) {
    where.push("l.scanned_at >= ?");
    params.push(`${dateFrom} 00:00:00`);
  }
  if (dateTo) {
    where.push("l.scanned_at <= ?");
    params.push(`${dateTo} 23:59:59`);
  }
  if (search) {
    where.push("l.order_number LIKE ?");
    params.push(`%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const rows = await query(
    `SELECT l.*, o.id AS credit_order_id
     FROM cr_qr_scan_log l
     LEFT JOIN credit_orders o ON o.order_number = l.order_number
     ${w}
     ORDER BY l.scanned_at DESC
     LIMIT 300`,
    params
  );
  const [[stats]] = await query(
    `SELECT COUNT(*) AS total, SUM(reused = 1) AS reused_total,
            SUM(reused = 1 AND scanned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS reused_7d
     FROM cr_qr_scan_log`
  );
  return { rows, stats };
});

export { qrScanLog_get as default };
//# sourceMappingURL=qr-scan-log.get.mjs.map

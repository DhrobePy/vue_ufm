import { q as defineEventHandler, X as getUserSession, m as createError, aq as queryOne, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const monthStart = `${(/* @__PURE__ */ new Date()).toISOString().slice(0, 7)}-01`;
  const [mtd, todayStats, pendingCount, eodToday, branches] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(cash_amount), 0) AS cash_total, COALESCE(SUM(credit_amount), 0) AS credit_total
       FROM orders WHERE order_type = 'POS' AND DATE(order_date) >= ?`,
      [monthStart]
    ),
    queryOne(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders WHERE order_type = 'POS' AND DATE(order_date) = CURDATE()`
    ),
    queryOne(
      `SELECT COUNT(*) AS c FROM credit_pending_requests WHERE request_type IN ('pos_exit_release', 'pos_credit_sale') AND status = 'pending'`
    ),
    query(
      `SELECT v.*, b.name AS branch_name FROM cash_verification_log v
       LEFT JOIN branches b ON b.id = v.branch_id
       WHERE v.verification_date = CURDATE()`
    ),
    query(`SELECT id, name FROM branches WHERE status = 'active' ORDER BY name`)
  ]);
  return {
    mtd: mtd != null ? mtd : { order_count: 0, revenue: 0, cash_total: 0, credit_total: 0 },
    today: todayStats != null ? todayStats : { order_count: 0, revenue: 0 },
    pending_approvals: Number((_a = pendingCount == null ? void 0 : pendingCount.c) != null ? _a : 0),
    eod_today: eodToday,
    branches
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map

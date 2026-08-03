import { q as defineEventHandler, X as getUserSession, m as createError, J as getQuery, an as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reports_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const branchId = q.branch_id ? Number(q.branch_id) : null;
  const range = String((_a = q.range) != null ? _a : "daily");
  const now = /* @__PURE__ */ new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  let from, to;
  if (range === "custom" && q.date_from && q.date_to) {
    from = String(q.date_from);
    to = String(q.date_to);
  } else if (range === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    from = iso(d);
    to = iso(now);
  } else if (range === "monthly") {
    from = `${now.toISOString().slice(0, 7)}-01`;
    to = iso(now);
  } else {
    from = iso(now);
    to = iso(now);
  }
  const where = [`o.order_type = 'POS'`, `DATE(o.order_date) BETWEEN ? AND ?`];
  const params = [from, to];
  if (branchId) {
    where.push("o.branch_id = ?");
    params.push(branchId);
  }
  const whereSql = where.join(" AND ");
  const [summary, byDay, byMethod, orders] = await Promise.all([
    query(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS total_revenue,
              COALESCE(SUM(cash_amount), 0) AS cash_total, COALESCE(SUM(credit_amount), 0) AS credit_total,
              COALESCE(SUM(discount_amount), 0) AS discount_total
       FROM orders o WHERE ${whereSql}`,
      params
    ),
    query(
      `SELECT DATE(o.order_date) AS d, COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders o WHERE ${whereSql} GROUP BY DATE(o.order_date) ORDER BY d`,
      params
    ),
    query(
      `SELECT o.payment_method, COUNT(*) AS order_count, COALESCE(SUM(cash_amount), 0) AS amount
       FROM orders o WHERE ${whereSql} GROUP BY o.payment_method ORDER BY amount DESC`,
      params
    ),
    query(
      `SELECT o.id, o.order_number, o.order_date, o.total_amount, o.cash_amount, o.credit_amount,
              o.payment_method, o.payment_status, b.name AS branch_name,
              COALESCE(c.name, 'Walk-in') AS customer_name
       FROM orders o
       LEFT JOIN branches b ON b.id = o.branch_id
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE ${whereSql}
       ORDER BY o.order_date DESC LIMIT 500`,
      params
    )
  ]);
  return { period: { from, to, range }, summary: (_b = summary[0]) != null ? _b : {}, by_day: byDay, by_method: byMethod, orders };
});

export { reports_get as default };
//# sourceMappingURL=reports.get.mjs.map

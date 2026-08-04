import { q as defineEventHandler, X as getUserSession, m as createError, J as getQuery, ao as query, ap as queryOne } from '../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const where = [];
  const params = [];
  if (q.status) {
    where.push("l.status = ?");
    params.push(String(q.status));
  }
  if (q.date_from) {
    where.push("l.loan_date >= ?");
    params.push(String(q.date_from));
  }
  if (q.date_to) {
    where.push("l.loan_date <= ?");
    params.push(String(q.date_to));
  }
  if (q.customer_id) {
    where.push("l.customer_id = ?");
    params.push(Number(q.customer_id));
  }
  if (q.supplier_id) {
    where.push("l.supplier_id = ?");
    params.push(Number(q.supplier_id));
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const monthStart = `${(/* @__PURE__ */ new Date()).toISOString().slice(0, 7)}-01`;
  const [loans, stats] = await Promise.all([
    query(
      `SELECT l.*, c.name AS customer_name, s.company_name AS supplier_name,
              u.display_name AS created_by,
              (l.status = 'active' AND l.expected_return_date IS NOT NULL
               AND l.expected_return_date < CURDATE() AND l.balance_due > 0) AS is_overdue
       FROM loans l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN suppliers s ON s.id = l.supplier_id
       LEFT JOIN users u ON u.id = l.created_by_user_id
       ${whereSql}
       ORDER BY l.id DESC LIMIT 200`,
      params
    ),
    queryOne(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'active' THEN balance_due END), 0) AS outstanding,
         COUNT(CASE WHEN status = 'active' AND expected_return_date IS NOT NULL
                     AND expected_return_date < CURDATE() AND balance_due > 0 THEN 1 END) AS overdue_count,
         COALESCE(SUM(CASE WHEN loan_date >= ? THEN principal_amount END), 0) AS disbursed_mtd,
         (SELECT COALESCE(SUM(amount), 0) FROM loan_repayments WHERE repayment_date >= ?) AS repaid_mtd
       FROM loans WHERE status IN ('active', 'closed')`,
      [monthStart, monthStart]
    )
  ]);
  return { loans, stats };
});

export { index_get as default };
//# sourceMappingURL=index.get4.mjs.map

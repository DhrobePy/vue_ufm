import { o as defineEventHandler, E as getQuery, a9 as query, aa as queryOne, a2 as paginate } from '../../nitro/nitro.mjs';
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
  const q = getQuery(event);
  const search = q.search || "";
  const type = q.type || "";
  const page = Number(q.page) || 1;
  const per = Number(q.per) || 30;
  const simple = q.simple === "1" || q.simple === "true";
  const { limit, offset } = paginate(page, per);
  const where = [];
  const params = [];
  if (search) {
    where.push("(c.name LIKE ? OR c.business_name LIKE ? OR c.phone_number LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (type) {
    where.push("c.customer_type = ?");
    params.push(type);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  if (simple) {
    const customers2 = await query(
      `SELECT c.id, c.name, c.business_name, c.phone_number,
              c.customer_type, c.credit_limit, c.current_balance, c.status
       FROM customers c
       ${w}
       ORDER BY c.name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { customers: customers2, total: null, page, perPage: limit, stats: null };
  }
  const [customers, [cnt], stats] = await Promise.all([
    query(
      `SELECT c.id, c.name, c.business_name, c.phone_number, c.email,
              c.customer_type, c.credit_limit, c.current_balance,
              c.status, c.created_at,
              COUNT(DISTINCT o.id) AS total_orders,
              COALESCE(SUM(o.total_amount),0) AS total_sales
       FROM customers c
       LEFT JOIN credit_orders o ON o.customer_id = c.id
       ${w}
       GROUP BY c.id
       ORDER BY c.name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM customers c ${w}`, params),
    queryOne(
      `SELECT
         COUNT(*) AS total_customers,
         SUM(customer_type = 'Credit') AS credit_customers,
         SUM(status = 'blacklisted')   AS blacklisted,
         COALESCE(SUM(current_balance),0) AS total_outstanding
       FROM customers`
    )
  ]);
  return {
    customers,
    total: cnt.total,
    page,
    perPage: limit,
    stats
  };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map

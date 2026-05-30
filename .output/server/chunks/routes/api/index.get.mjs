import { g as defineEventHandler, o as getQuery, E as query, A as paginate } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const page = Number(q.page) || 1;
  const per = Number(q.per) || 25;
  const { limit, offset } = paginate(page, per);
  const whereClauses = [];
  const params = [];
  if (search) {
    whereClauses.push("(o.order_number LIKE ? OR c.name LIKE ? OR c.business_name LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (status) {
    whereClauses.push("o.status = ?");
    params.push(status);
  }
  const where = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";
  const [orders, totals] = await Promise.all([
    query(
      `SELECT o.id, o.order_number, o.order_date, o.required_date, o.status, o.priority,
              o.total_amount, o.balance_due, o.amount_paid, o.total_weight_kg,
              c.id AS customer_id, c.name AS customer_name, c.business_name,
              c.phone_number, c.credit_limit, c.current_balance
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*) AS total FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id ${where}`,
      params
    )
  ]);
  return {
    orders,
    total: totals[0].total,
    page,
    perPage: limit
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

import { m as defineEventHandler, y as getQuery, K as getUserSession, u as getDb, J as getUserBranchScope, a2 as query, X as paginate } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  var _a;
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const page = Number(q.page) || 1;
  const per = Number(q.per) || 25;
  const { limit, offset } = paginate(page, per);
  const whereClauses = [];
  const params = [];
  const session = await getUserSession(event);
  if (session == null ? void 0 : session.user) {
    const conn = await getDb().getConnection();
    try {
      const scope = await getUserBranchScope(
        conn,
        Number(session.user.id),
        ((_a = session.user.role) != null ? _a : "").toLowerCase()
      );
      if (scope !== null) {
        whereClauses.push("o.assigned_branch_id = ?");
        params.push(scope);
      }
    } finally {
      conn.release();
    }
  }
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
      `SELECT o.id, o.order_number,
              DATE_FORMAT(o.order_date, '%d %b %Y') AS order_date,
              o.required_date, o.priority, o.total_amount, o.balance_due, o.amount_paid,
              o.total_weight_kg,
              -- Auto-heal: delivered + fully paid \u2192 completed (even if DB not updated yet)
              CASE WHEN o.status = 'delivered' AND o.balance_due = 0 THEN 'completed'
                   ELSE o.status END AS status,
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

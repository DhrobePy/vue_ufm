import { o as defineEventHandler, F as getQuery, Q as getUserSession, x as getDb, O as getUserBranchScope, ac as query, E as getOrderGateState, a3 as paginate } from '../../nitro/nitro.mjs';
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
  const conn = await getDb().getConnection();
  try {
    if (session == null ? void 0 : session.user) {
      const scope = await getUserBranchScope(
        conn,
        Number(session.user.id),
        ((_a = session.user.role) != null ? _a : "").toLowerCase()
      );
      if (scope !== null) {
        whereClauses.push("o.assigned_branch_id = ?");
        params.push(scope);
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
    const baseSelect = `
      o.id, o.order_number,
      DATE_FORMAT(o.order_date, '%d %b %Y') AS order_date,
      o.required_date, o.priority, o.total_amount, o.balance_due, o.amount_paid,
      o.total_weight_kg,
      -- Auto-heal: delivered + fully paid \u2192 completed (even if DB not updated yet)
      CASE WHEN o.status = 'delivered' AND o.balance_due = 0 THEN 'completed'
           ELSE o.status END AS status,
      c.id AS customer_id, c.name AS customer_name, c.business_name,
      c.phone_number, c.credit_limit, c.current_balance`;
    let orders;
    let gatesAvailable = true;
    try {
      orders = await query(
        `SELECT ${baseSelect},
                oac.production_hold, oac.production_released_at,
                oac.dispatch_hold, oac.dispatch_cleared,
                oac.condition_type, oac.condition_amount, oac.auto_release
         FROM credit_orders o
         JOIN customers c ON c.id = o.customer_id
         LEFT JOIN order_approval_conditions oac ON oac.order_id = o.id
         ${where}
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
    } catch {
      gatesAvailable = false;
      orders = await query(
        `SELECT ${baseSelect}
         FROM credit_orders o
         JOIN customers c ON c.id = o.customer_id
         ${where}
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
    }
    if (gatesAvailable) {
      for (const o of orders) {
        o.production_hold_active = !!o.production_hold && !o.production_released_at;
        if (o.dispatch_hold) {
          const gate = await getOrderGateState(conn, o.id);
          o.condition_met = gate.conditionMet;
          o.current_value = gate.currentValue;
        }
      }
    }
    const [totals] = await Promise.all([
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
  } finally {
    conn.release();
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

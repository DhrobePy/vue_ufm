import { o as defineEventHandler, Q as getUserSession, x as getDb, O as getUserBranchScope, ac as query, ad as queryOne, E as getOrderGateState } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dispatch_get = defineEventHandler(async (event) => {
  var _a;
  let scopeSql = "";
  const scopeParams = [];
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
        scopeSql = " AND o.assigned_branch_id = ?";
        scopeParams.push(scope);
      }
    }
    const [orders, onBoard, stats] = await Promise.all([
      query(
        `SELECT o.id, o.order_number, o.order_date, o.shipping_address AS delivery_address,
                o.total_weight_kg, o.status, o.priority, o.balance_due, o.total_amount,
                c.name AS customer_name, c.phone_number,
                b.name AS branch_name
         FROM credit_orders o
         JOIN customers c ON c.id = o.customer_id
         LEFT JOIN branches b ON b.id = o.assigned_branch_id
         WHERE o.status = 'ready_to_ship'${scopeSql}
         ORDER BY o.priority = 'urgent' DESC, o.priority = 'high' DESC, o.required_date ASC
         LIMIT 50`,
        scopeParams
      ),
      // Goods-on-board orders awaiting "Mark Shipped" (truck physically departs)
      query(
        `SELECT o.id, o.order_number, o.order_date, o.shipping_address AS delivery_address,
                o.total_weight_kg, o.status, o.priority, o.balance_due, o.total_amount,
                c.name AS customer_name, c.phone_number,
                b.name AS branch_name
         FROM credit_orders o
         JOIN customers c ON c.id = o.customer_id
         LEFT JOIN branches b ON b.id = o.assigned_branch_id
         WHERE o.status = 'goods_on_board'${scopeSql}
         ORDER BY o.updated_at ASC
         LIMIT 50`,
        scopeParams
      ),
      queryOne(
        `SELECT
           SUM(status IN ('ready_to_ship','approved','produced'))               AS ready_count,
           SUM(CASE WHEN status IN ('goods_on_board','shipped','dispatched') AND DATE(updated_at) = CURDATE() THEN 1 ELSE 0 END) AS dispatched_today,
           COALESCE(SUM(CASE WHEN status IN ('goods_on_board','shipped','dispatched') AND DATE(updated_at) = CURDATE() THEN total_weight_kg ELSE 0 END), 0) AS dispatched_kg_today
         FROM credit_orders`
      )
    ]);
    for (const o of orders) {
      const gate = await getOrderGateState(conn, o.id);
      o.dispatch_hold = gate.dispatchHold && !gate.dispatchCleared;
      o.gate_condition = gate.conditionType;
      o.gate_amount = gate.conditionAmount;
      o.gate_met = gate.conditionMet;
      o.gate_auto = gate.autoRelease;
    }
    return { orders, onBoard, stats };
  } finally {
    conn.release();
  }
});

export { dispatch_get as default };
//# sourceMappingURL=dispatch.get.mjs.map

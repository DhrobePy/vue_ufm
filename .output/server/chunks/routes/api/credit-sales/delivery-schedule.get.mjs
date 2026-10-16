import { t as defineEventHandler, aO as requireAction, A as ACCOUNTS_ROLES, e as PRODUCTION_ROLES, N as getQuery, k as branchScopeFor, az as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const deliverySchedule_get = defineEventHandler(async (event) => {
  var _a, _b;
  await requireAction(event, { module: "credit_sales", page: "delivery-schedule", action: "view", roleFallback: [...ACCOUNTS_ROLES, ...PRODUCTION_ROLES] });
  const q = getQuery(event);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const tab = q.tab === "overdue" ? "overdue" : "schedule";
  const where = [
    `co.status IN ('approved','in_production','produced','ready_to_ship','shipped')`,
    "co.assigned_branch_id IS NOT NULL",
    `co.required_date ${tab === "overdue" ? "<" : ">="} ?`
  ];
  const params = [today];
  if (q.order) {
    where.push("co.order_number LIKE ?");
    params.push(`%${q.order}%`);
  }
  if (q.customer) {
    where.push("(c.name LIKE ? OR c.phone_number LIKE ?)");
    params.push(`%${q.customer}%`, `%${q.customer}%`);
  }
  if (["big_truck", "mini_truck"].includes(String(q.vehicle))) {
    where.push("co.delivery_type = ?");
    params.push(q.vehicle);
  }
  if (q.from) {
    where.push("co.required_date >= ?");
    params.push(q.from);
  }
  if (q.to) {
    where.push("co.required_date <= ?");
    params.push(q.to);
  }
  if (Number(q.branch)) {
    where.push("co.assigned_branch_id = ?");
    params.push(Number(q.branch));
  }
  const scope = await branchScopeFor(event, "co.assigned_branch_id");
  const orders = await query(
    `SELECT co.id, co.order_number, co.order_date, co.required_date, co.delivery_type, co.status,
            co.assigned_branch_id, co.delivery_priority,
            c.name AS customer_name, c.phone_number AS customer_phone, b.name AS branch_name
     FROM credit_orders co
     JOIN customers c ON c.id = co.customer_id
     LEFT JOIN branches b ON b.id = co.assigned_branch_id
     WHERE ${where.join(" AND ")}${scope.sql}
     ORDER BY co.required_date ASC, co.delivery_priority ASC, co.id ASC
     LIMIT 500`,
    [...params, ...scope.params]
  );
  if (orders.length) {
    const ids = orders.map((o) => o.id);
    const items = await query(
      `SELECT coi.order_id, coi.quantity, p.base_name AS product_name, pv.grade, pv.weight_variant
       FROM credit_order_items coi
       LEFT JOIN products p ON p.id = coi.product_id
       LEFT JOIN product_variants pv ON pv.id = coi.variant_id
       WHERE coi.order_id IN (${ids.map(() => "?").join(",")}) ORDER BY coi.order_id, coi.id`,
      ids
    );
    const by = /* @__PURE__ */ new Map();
    for (const it of items) ((_a = by.get(it.order_id)) != null ? _a : by.set(it.order_id, []).get(it.order_id)).push(it);
    for (const o of orders) o.items = (_b = by.get(o.id)) != null ? _b : [];
  }
  const branches = await query(`SELECT id, name FROM branches WHERE status = 'active' ORDER BY name`);
  return { orders, branches, today };
});

export { deliverySchedule_get as default };
//# sourceMappingURL=delivery-schedule.get.mjs.map

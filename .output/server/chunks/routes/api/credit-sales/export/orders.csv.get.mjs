import { n as defineEventHandler, N as getUserSession, j as createError, C as getQuery, a7 as query, ao as setHeader } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

function csvCell(v) {
  const s = v === null || v === void 0 ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const orders_csv_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const conds = [];
  const params = [];
  if (q.status) {
    conds.push("o.status = ?");
    params.push(String(q.status));
  }
  if (q.customer_id) {
    conds.push("o.customer_id = ?");
    params.push(Number(q.customer_id));
  }
  if (q.from) {
    conds.push("o.order_date >= ?");
    params.push(String(q.from));
  }
  if (q.to) {
    conds.push("o.order_date <= ?");
    params.push(String(q.to));
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const rows = await query(
    `SELECT o.order_number, o.order_date, c.name AS customer, b.name AS branch,
            o.status, o.priority, o.delivery_type,
            o.subtotal, o.mini_truck_surcharge, o.total_amount,
            o.advance_paid, o.amount_paid, o.balance_due
     FROM credit_orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN branches b ON b.id = o.assigned_branch_id
     ${where}
     ORDER BY o.id DESC
     LIMIT 50000`,
    params
  );
  const header = "Order,Date,Customer,Branch,Status,Priority,Delivery,Subtotal,MiniTruckSurcharge,Total,Advance,Paid,Balance";
  const lines = rows.map((r) => [
    r.order_number,
    String(r.order_date).slice(0, 10),
    r.customer,
    r.branch,
    r.status,
    r.priority,
    r.delivery_type,
    r.subtotal,
    r.mini_truck_surcharge,
    r.total_amount,
    r.advance_paid,
    r.amount_paid,
    r.balance_due
  ].map(csvCell).join(","));
  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="credit-orders-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`
  );
  return "\uFEFF" + [header, ...lines].join("\n");
});

export { orders_csv_get as default };
//# sourceMappingURL=orders.csv.get.mjs.map

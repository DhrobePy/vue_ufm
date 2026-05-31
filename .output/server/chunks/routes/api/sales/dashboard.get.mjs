import { h as defineEventHandler, p as getQuery, H as queryOne, G as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const from = q.from || null;
  const to = q.to || null;
  const branchId = q.branch ? Number(q.branch) : null;
  const conditions = ["o.order_status = 'Completed'"];
  const params = [];
  if (from) {
    conditions.push("DATE(o.order_date) >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("DATE(o.order_date) <= ?");
    params.push(to);
  }
  if (branchId) {
    conditions.push("o.branch_id = ?");
    params.push(branchId);
  }
  const where = `WHERE ${conditions.join(" AND ")}`;
  const [stats, transactions, dailyTrend, productBreakdown] = await Promise.all([
    queryOne(
      `SELECT
         COALESCE(SUM(o.total_amount), 0)  AS total_sales,
         COALESCE(SUM(CASE WHEN o.payment_method = 'Cash' THEN o.total_amount END), 0) AS cash_sales,
         COALESCE(SUM(CASE WHEN o.payment_method = 'Mobile Banking' THEN o.total_amount END), 0) AS mobile_sales,
         COUNT(*)                           AS transaction_count,
         CASE WHEN COUNT(DISTINCT DATE(o.order_date)) > 0
              THEN ROUND(SUM(o.total_amount) / COUNT(DISTINCT DATE(o.order_date)))
              ELSE 0 END                    AS avg_daily
       FROM orders o ${where}`,
      params
    ),
    query(
      `SELECT o.id, o.order_number, o.order_date, c.name AS customer_name,
              o.total_amount, o.payment_method, o.order_type,
              u.display_name AS cashier_name,
              b.name AS branch_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u ON u.id = o.created_by_user_id
       LEFT JOIN branches b ON b.id = o.branch_id
       ${where}
       ORDER BY o.order_date DESC
       LIMIT 50`,
      params
    ),
    query(
      `SELECT DATE(o.order_date) AS sale_day,
              COALESCE(SUM(o.total_amount), 0) AS day_total,
              COUNT(*)                          AS txn_count
       FROM orders o ${where}
       GROUP BY DATE(o.order_date)
       ORDER BY sale_day DESC
       LIMIT 7`,
      params
    ),
    // Product breakdown via order_items JOIN
    query(
      `SELECT COALESCE(p.base_name, 'Other') AS product_name,
              SUM(oi.total_amount)            AS total,
              SUM(oi.quantity)                AS total_qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       LEFT JOIN products p ON p.id = pv.product_id
       ${where}
       GROUP BY product_name
       ORDER BY total DESC
       LIMIT 10`,
      params
    )
  ]);
  const grandTotal = productBreakdown.reduce((s, r) => s + Number(r.total), 0);
  const productPct = productBreakdown.map((r) => ({
    name: r.product_name,
    amount: Number(r.total),
    qty: Number(r.total_qty),
    pct: grandTotal > 0 ? Math.round(Number(r.total) / grandTotal * 100) : 0
  }));
  const days = [...dailyTrend].reverse();
  const maxDay = Math.max(...days.map((d) => Number(d.day_total)), 1);
  const dayBars = days.map((d) => ({
    label: new Date(d.sale_day).toLocaleDateString("en-US", { weekday: "short" }),
    value: Number(d.day_total),
    pct: Math.round(Number(d.day_total) / maxDay * 100)
  }));
  return { stats, transactions, dailyBars: dayBars, productBreakdown: productPct };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map

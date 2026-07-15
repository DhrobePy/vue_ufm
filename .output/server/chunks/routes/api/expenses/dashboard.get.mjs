import { n as defineEventHandler, a9 as queryOne, a8 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async () => {
  var _a, _b;
  const COLORS = ["#f59e0b", "#6366f1", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#0ea5e9"];
  const [stats, pendingList, categoryRows, expenses] = await Promise.all([
    // KPI stats
    queryOne(
      `SELECT
         SUM(status = 'pending')  AS pending,
         SUM(CASE WHEN status = 'approved' AND DATE(updated_at) = CURDATE() THEN 1 ELSE 0 END) AS approved_today,
         COALESCE(SUM(CASE WHEN MONTH(expense_date) = MONTH(CURDATE())
                            AND YEAR(expense_date) = YEAR(CURDATE())
                            THEN total_amount ELSE 0 END), 0) AS this_month_total
       FROM expense_vouchers`
    ),
    // Top pending expenses (max 6)
    query(
      `SELECT e.id, e.expense_date, e.total_amount, e.status, e.remarks,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.status = 'pending'
       ORDER BY e.created_at DESC
       LIMIT 6`
    ),
    // Category breakdown this month
    query(
      `SELECT cat.category_name AS label,
              COALESCE(SUM(e.total_amount), 0) AS total
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE MONTH(e.expense_date) = MONTH(CURDATE())
         AND YEAR(e.expense_date)  = YEAR(CURDATE())
       GROUP BY cat.category_name
       ORDER BY total DESC
       LIMIT 7`
    ),
    // Recent expense history
    query(
      `SELECT e.id, e.voucher_number, e.expense_date, e.total_amount,
              e.payment_method, e.status, e.remarks,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT 50`
    )
  ]);
  const grandTotal = categoryRows.reduce((s, r) => s + Number(r.total), 0);
  const categoryBreakdown = categoryRows.map((r, i) => ({
    label: r.label || "Other",
    pct: grandTotal > 0 ? Math.round(Number(r.total) / grandTotal * 100) : 0,
    value: `\u09F3${Number(r.total).toLocaleString()}`,
    color: COLORS[i % COLORS.length]
  }));
  const topCategory = (_b = (_a = categoryRows[0]) == null ? void 0 : _a.label) != null ? _b : null;
  return {
    stats: { ...stats, top_category: topCategory },
    pendingList,
    categoryBreakdown,
    expenses
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map

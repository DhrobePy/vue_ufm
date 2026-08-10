import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ICONS = ["\u{1F69B}", "\u26A1", "\u{1F4CE}", "\u{1F527}", "\u{1F477}", "\u26FD", "\u{1F4E6}", "\u{1F3F7}\uFE0F", "\u{1F4BC}", "\u{1F529}"];
const COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#f97316", "#6b7280", "#ec4899", "#14b8a6", "#a855f7"];
const categories_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const includeSpend = q.spend !== "false";
  const categories = await query(
    `SELECT
       c.id,
       c.category_name  AS name,
       c.category_code  AS code,
       c.description,
       c.chart_of_account_id,
       coa.name AS gl_account_name,
       ${includeSpend ? `
       COALESCE(SUM(CASE
         WHEN MONTH(dv.voucher_date) = MONTH(NOW())
          AND YEAR(dv.voucher_date)  = YEAR(NOW())
          AND dv.status = 'approved'
         THEN dv.amount ELSE 0 END), 0) AS monthly_spend,` : "0 AS monthly_spend,"}
       JSON_ARRAYAGG(
         JSON_OBJECT('id', s.id, 'name', s.subcategory_name, 'chart_of_account_id', s.chart_of_account_id)
       ) AS subcategories_raw
     FROM expense_categories c
     LEFT JOIN chart_of_accounts coa ON coa.id = c.chart_of_account_id
     ${includeSpend ? `LEFT JOIN debit_vouchers dv ON dv.expense_account_id = c.chart_of_account_id` : ""}
     LEFT JOIN expense_subcategories s ON s.category_id = c.id AND s.is_active = 1
     WHERE c.is_active = 1
     GROUP BY c.id
     ORDER BY c.category_code, c.category_name`
  );
  const parsed = categories.map((c, i) => {
    var _a, _b, _c;
    let subs = [];
    try {
      const raw = c.subcategories_raw;
      const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
      subs = (arr != null ? arr : []).filter((s) => s.id !== null);
    } catch {
    }
    return {
      id: c.id,
      name: c.name,
      code: (_a = c.code) != null ? _a : "",
      description: (_b = c.description) != null ? _b : "",
      icon: ICONS[i % ICONS.length],
      color: COLORS[i % COLORS.length],
      monthlySpend: Number(c.monthly_spend) || 0,
      budget: 0,
      // Not in DB schema — UI display only
      chartOfAccountId: c.chart_of_account_id,
      glAccountName: (_c = c.gl_account_name) != null ? _c : "",
      subcategories: subs.map((s) => {
        var _a2;
        return {
          id: s.id,
          name: s.name,
          unit: "",
          // unit_of_measurement loaded separately via /api/expenses/subcategories
          chartOfAccountId: (_a2 = s.chart_of_account_id) != null ? _a2 : null
        };
      })
    };
  });
  return { categories: parsed };
});

export { categories_get as default };
//# sourceMappingURL=categories.get.mjs.map

import { q as defineEventHandler, X as getUserSession, m as createError, ap as query, J as getQuery } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const taxStatement_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const settingsRows = await query(
    `SELECT setting_key, setting_value FROM system_settings
     WHERE setting_key IN ('tax_tin','tax_bin','tax_legal_name','tax_address','tax_fiscal_year_start_month')`
  );
  const sMap = Object.fromEntries(settingsRows.map((r) => [r.setting_key, r.setting_value]));
  const fyStartMonth = Number((_b = sMap.tax_fiscal_year_start_month) != null ? _b : 7);
  const q = getQuery(event);
  const now = /* @__PURE__ */ new Date();
  const defaultStartYear = now.getMonth() + 1 >= fyStartMonth ? now.getFullYear() : now.getFullYear() - 1;
  const startYear = Number(q.fy) || defaultStartYear;
  const pad = (n) => String(n).padStart(2, "0");
  const from = `${startYear}-${pad(fyStartMonth)}-01`;
  const endYear = fyStartMonth === 1 ? startYear : startYear + 1;
  const endMonth = fyStartMonth === 1 ? 12 : fyStartMonth - 1;
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  const to = `${endYear}-${pad(endMonth)}-${pad(lastDay)}`;
  const [plRows, bsRows] = await Promise.all([
    query(
      `SELECT c.account_number AS code, c.name, c.account_type_group AS grp, c.account_type AS type,
              COALESCE(SUM(tl.debit_amount), 0) AS total_debit, COALESCE(SUM(tl.credit_amount), 0) AS total_credit
       FROM chart_of_accounts c
       LEFT JOIN transaction_lines tl ON tl.account_id = c.id
       LEFT JOIN journal_entries je ON je.id = tl.journal_entry_id
         AND je.transaction_date BETWEEN ? AND ? AND je.is_reversed = 0
       WHERE c.is_active = 1 AND c.account_type_group IN ('Revenue','Expense')
       GROUP BY c.id HAVING total_debit > 0 OR total_credit > 0
       ORDER BY c.account_type_group, c.account_number, c.name`,
      [from, to]
    ),
    query(
      `SELECT c.account_number AS code, c.name, c.account_type_group AS grp, c.account_type AS type,
              COALESCE(SUM(tl.debit_amount), 0) AS total_debit, COALESCE(SUM(tl.credit_amount), 0) AS total_credit
       FROM chart_of_accounts c
       LEFT JOIN transaction_lines tl ON tl.account_id = c.id
       LEFT JOIN journal_entries je ON je.id = tl.journal_entry_id AND je.transaction_date <= ? AND je.is_reversed = 0
       WHERE c.is_active = 1 AND c.account_type_group IN ('Asset','Liability','Equity')
       GROUP BY c.id HAVING total_debit > 0 OR total_credit > 0
       ORDER BY c.account_number, c.name`,
      [to]
    )
  ]);
  const revenueRows = plRows.filter((r) => r.grp === "Revenue" || r.type === "Other Income");
  const cogsRows = plRows.filter((r) => r.grp === "Expense" && r.type === "Cost of Goods Sold");
  const opexRows = plRows.filter((r) => r.grp === "Expense" && r.type !== "Cost of Goods Sold");
  const toAmount = (r) => Math.max(0, Number(r.total_credit) - Number(r.total_debit));
  const toCost = (r) => Math.max(0, Number(r.total_debit) - Number(r.total_credit));
  const revenue = revenueRows.map((r) => ({ code: r.code, name: r.name, amount: toAmount(r) }));
  const cogs = cogsRows.map((r) => ({ code: r.code, name: r.name, amount: toCost(r) }));
  const opex = opexRows.map((r) => ({ code: r.code, name: r.name, amount: toCost(r) }));
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalCogs = cogs.reduce((s, r) => s + r.amount, 0);
  const grossProfit = totalRevenue - totalCogs;
  const totalOpex = opex.reduce((s, r) => s + r.amount, 0);
  const netProfit = grossProfit - totalOpex;
  const CURRENT_ASSET_TYPES = /* @__PURE__ */ new Set(["Bank", "Petty Cash", "Cash", "Accounts Receivable", "Other Current Asset"]);
  const CURRENT_LIAB_TYPES = /* @__PURE__ */ new Set(["Accounts Payable"]);
  const toAsset = (r) => Math.max(0, Number(r.total_debit) - Number(r.total_credit));
  const toLiab = (r) => Math.max(0, Number(r.total_credit) - Number(r.total_debit));
  const currentAssets = bsRows.filter((r) => r.grp === "Asset" && CURRENT_ASSET_TYPES.has(r.type)).map((r) => ({ code: r.code, name: r.name, amount: toAsset(r) }));
  const fixedAssets = bsRows.filter((r) => r.grp === "Asset" && !CURRENT_ASSET_TYPES.has(r.type)).map((r) => ({ code: r.code, name: r.name, amount: toAsset(r) }));
  const currentLiabilities = bsRows.filter((r) => r.grp === "Liability" && CURRENT_LIAB_TYPES.has(r.type)).map((r) => ({ code: r.code, name: r.name, amount: toLiab(r) }));
  const longTermLiabilities = bsRows.filter((r) => r.grp === "Liability" && !CURRENT_LIAB_TYPES.has(r.type)).map((r) => ({ code: r.code, name: r.name, amount: toLiab(r) }));
  const equity = bsRows.filter((r) => r.grp === "Equity").map((r) => ({ code: r.code, name: r.name, amount: toLiab(r) }));
  const totalCurrentAssets = currentAssets.reduce((s, r) => s + r.amount, 0);
  const totalFixedAssets = fixedAssets.reduce((s, r) => s + r.amount, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;
  const totalCurrentLiab = currentLiabilities.reduce((s, r) => s + r.amount, 0);
  const totalLongTermLiab = longTermLiabilities.reduce((s, r) => s + r.amount, 0);
  const totalEquity = equity.reduce((s, r) => s + r.amount, 0);
  return {
    company: {
      tin: (_c = sMap.tax_tin) != null ? _c : "",
      bin: (_d = sMap.tax_bin) != null ? _d : "",
      legal_name: (_e = sMap.tax_legal_name) != null ? _e : "",
      address: (_f = sMap.tax_address) != null ? _f : "",
      fiscal_year_start_month: fyStartMonth
    },
    fiscal_year: { label: `FY ${startYear}-${String(endYear).slice(2)}`, from, to, start_year: startYear },
    pl: { revenue, totalRevenue, cogs, totalCogs, grossProfit, opex, totalOpex, netProfit },
    bs: {
      currentAssets,
      totalCurrentAssets,
      fixedAssets,
      totalFixedAssets,
      totalAssets,
      currentLiabilities,
      totalCurrentLiab,
      longTermLiabilities,
      totalLongTermLiab,
      equity,
      totalEquity,
      totalLiabAndEquity: totalCurrentLiab + totalLongTermLiab + totalEquity
    }
  };
});

export { taxStatement_get as default };
//# sourceMappingURL=tax-statement.get.mjs.map

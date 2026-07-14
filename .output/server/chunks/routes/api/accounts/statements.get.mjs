import { n as defineEventHandler, y as getQuery, a4 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PERIOD_DATES = {
  may26: ["2026-05-01", "2026-05-31"],
  apr26: ["2026-04-01", "2026-04-30"],
  q1fy26: ["2026-01-01", "2026-03-31"],
  fy26: ["2025-07-01", "2026-06-30"]
};
const statements_get = defineEventHandler(async (event) => {
  var _a;
  const q = getQuery(event);
  const period = q.period || "may26";
  const [from, to] = (_a = PERIOD_DATES[period]) != null ? _a : PERIOD_DATES.may26;
  const plRows = await query(
    `SELECT
       c.account_number  AS code,
       c.name,
       c.account_type_group AS grp,
       c.account_type        AS type,
       COALESCE(SUM(tl.debit_amount),  0) AS total_debit,
       COALESCE(SUM(tl.credit_amount), 0) AS total_credit
     FROM chart_of_accounts c
     LEFT JOIN transaction_lines tl ON tl.account_id = c.id
     LEFT JOIN journal_entries   je ON je.id = tl.journal_entry_id
       AND je.transaction_date BETWEEN ? AND ?
       AND je.is_reversed = 0
     WHERE c.is_active = 1
       AND c.account_type_group IN ('Revenue','Expense')
     GROUP BY c.id
     HAVING total_debit > 0 OR total_credit > 0
     ORDER BY c.account_type_group, c.account_number, c.name`,
    [from, to]
  );
  const revenueRows = plRows.filter(
    (r) => r.grp === "Revenue" || r.type === "Other Income"
  );
  const cogsRows = plRows.filter(
    (r) => r.grp === "Expense" && r.type === "Cost of Goods Sold"
  );
  const opexRows = plRows.filter(
    (r) => r.grp === "Expense" && r.type !== "Cost of Goods Sold"
  );
  const toAmount = (r) => Math.max(0, Number(r.total_credit) - Number(r.total_debit));
  const toCost = (r) => Math.max(0, Number(r.total_debit) - Number(r.total_credit));
  const revenue = revenueRows.map((r) => ({ name: r.name, amount: toAmount(r) }));
  const cogs = cogsRows.map((r) => ({ name: r.name, amount: toCost(r) }));
  const opex = opexRows.map((r) => ({ name: r.name, amount: toCost(r) }));
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalCogs = cogs.reduce((s, r) => s + r.amount, 0);
  const grossProfit = totalRevenue - totalCogs;
  const totalOpex = opex.reduce((s, r) => s + r.amount, 0);
  const ebit = grossProfit - totalOpex;
  const netProfit = ebit;
  const bsRows = await query(
    `SELECT
       c.account_number  AS code,
       c.name,
       c.account_type_group AS grp,
       c.account_type        AS type,
       COALESCE(SUM(tl.debit_amount),  0) AS total_debit,
       COALESCE(SUM(tl.credit_amount), 0) AS total_credit
     FROM chart_of_accounts c
     LEFT JOIN transaction_lines tl ON tl.account_id = c.id
     LEFT JOIN journal_entries   je ON je.id = tl.journal_entry_id
       AND je.is_reversed = 0
     WHERE c.is_active = 1
       AND c.account_type_group IN ('Asset', 'Liability', 'Equity')
     GROUP BY c.id
     HAVING total_debit > 0 OR total_credit > 0
     ORDER BY c.account_number, c.name`,
    []
  );
  const CURRENT_ASSET_TYPES = /* @__PURE__ */ new Set([
    "Bank",
    "Petty Cash",
    "Cash",
    "Accounts Receivable",
    "Other Current Asset"
  ]);
  const CURRENT_LIAB_TYPES = /* @__PURE__ */ new Set(["Accounts Payable"]);
  const toAsset = (r) => Math.max(0, Number(r.total_debit) - Number(r.total_credit));
  const toLiab = (r) => Math.max(0, Number(r.total_credit) - Number(r.total_debit));
  const currentAssets = bsRows.filter((r) => r.grp === "Asset" && CURRENT_ASSET_TYPES.has(r.type)).map((r) => ({ name: r.name, amount: toAsset(r) }));
  const fixedAssets = bsRows.filter((r) => r.grp === "Asset" && !CURRENT_ASSET_TYPES.has(r.type)).map((r) => ({ name: r.name, amount: toAsset(r) }));
  const currentLiabilities = bsRows.filter((r) => r.grp === "Liability" && CURRENT_LIAB_TYPES.has(r.type)).map((r) => ({ name: r.name, amount: toLiab(r) }));
  const longTermLiabilities = bsRows.filter((r) => r.grp === "Liability" && !CURRENT_LIAB_TYPES.has(r.type)).map((r) => ({ name: r.name, amount: toLiab(r) }));
  const equityAccounts = bsRows.filter((r) => r.grp === "Equity").map((r) => ({ name: r.name, amount: toLiab(r) }));
  const totalCurrentAssets = currentAssets.reduce((s, r) => s + r.amount, 0);
  const totalFixedAssets = fixedAssets.reduce((s, r) => s + r.amount, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;
  const tbRows = await query(
    `SELECT
       c.account_number  AS code,
       c.name,
       COALESCE(SUM(tl.debit_amount),  0) AS total_debit,
       COALESCE(SUM(tl.credit_amount), 0) AS total_credit
     FROM chart_of_accounts c
     LEFT JOIN transaction_lines tl ON tl.account_id = c.id
     LEFT JOIN journal_entries   je ON je.id = tl.journal_entry_id
       AND je.transaction_date BETWEEN ? AND ?
       AND je.is_reversed = 0
     WHERE c.is_active = 1
     GROUP BY c.id
     HAVING total_debit > 0 OR total_credit > 0
     ORDER BY c.account_number, c.name`,
    [from, to]
  );
  const trialBalance = tbRows.map((r) => {
    var _a2;
    const debit = Number(r.total_debit);
    const credit = Number(r.total_credit);
    const net = debit - credit;
    return {
      code: (_a2 = r.code) != null ? _a2 : "",
      name: r.name,
      debit: net > 0 ? net : 0,
      credit: net < 0 ? -net : 0
    };
  });
  return {
    period: { from, to },
    pl: {
      revenue,
      totalRevenue,
      cogs,
      grossProfit,
      opex,
      ebit,
      finance: [],
      netProfit
    },
    bs: {
      currentAssets,
      totalCurrentAssets,
      fixedAssets,
      totalFixedAssets,
      totalAssets,
      currentLiabilities,
      longTermLiabilities,
      equity: equityAccounts
    },
    trialBalance
  };
});

export { statements_get as default };
//# sourceMappingURL=statements.get.mjs.map

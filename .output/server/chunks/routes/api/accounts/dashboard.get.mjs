import { h as defineEventHandler, K as queryOne, J as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async () => {
  var _a, _b, _c, _d;
  const [journalStats, accountSummary, recentEntries] = await Promise.all([
    // Journal entry count for the month
    queryOne(
      `SELECT
         COUNT(*)                                           AS total_entries,
         SUM(MONTH(transaction_date) = MONTH(CURDATE())
           AND YEAR(transaction_date) = YEAR(CURDATE()))   AS this_month
       FROM journal_entries`
    ),
    // Account balances by group (via transaction_lines)
    query(
      `SELECT
         c.account_type_group                                       AS grp,
         COALESCE(SUM(tl.debit_amount  - tl.credit_amount), 0)     AS balance
       FROM chart_of_accounts c
       LEFT JOIN transaction_lines tl ON tl.account_id = c.id
       WHERE c.is_active = 1
       GROUP BY c.account_type_group`
    ),
    // Recent journal entries with total debit
    query(
      `SELECT je.id, je.transaction_date AS date, je.description,
              je.related_document_type AS type,
              u.display_name AS posted_by,
              COALESCE(SUM(tl.debit_amount), 0)  AS debit_total,
              COALESCE(SUM(tl.credit_amount), 0) AS credit_total
       FROM journal_entries je
       LEFT JOIN users u ON u.id = je.created_by_user_id
       LEFT JOIN transaction_lines tl ON tl.journal_entry_id = je.id
       GROUP BY je.id
       ORDER BY je.transaction_date DESC, je.id DESC
       LIMIT 12`
    )
  ]);
  const byGroup = {};
  for (const row of accountSummary) {
    byGroup[(_a = row.grp) != null ? _a : "Other"] = ((_c = byGroup[(_b = row.grp) != null ? _b : "Other"]) != null ? _c : 0) + Number(row.balance);
  }
  const assetBalance = Object.entries(byGroup).filter(([k]) => k === "Asset").reduce((s, [, v]) => s + v, 0);
  const liabilityBalance = Object.entries(byGroup).filter(([k]) => k === "Liability").reduce((s, [, v]) => s + v, 0);
  const equityBalance = Object.entries(byGroup).filter(([k]) => k === "Equity").reduce((s, [, v]) => s + v, 0);
  return {
    stats: {
      total_assets: assetBalance,
      total_liabilities: liabilityBalance,
      net_equity: equityBalance,
      journal_entries: (_d = journalStats == null ? void 0 : journalStats.this_month) != null ? _d : 0
    },
    recentEntries,
    accountSummary: byGroup
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map

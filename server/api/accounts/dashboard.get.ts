import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [journalStats, accountSummary, recentEntries] = await Promise.all([
    // Journal entry count for the month
    queryOne(
      `SELECT
         COUNT(*)                                           AS total_entries,
         SUM(MONTH(transaction_date) = MONTH(CURDATE())
           AND YEAR(transaction_date) = YEAR(CURDATE()))   AS this_month
       FROM journal_entries`,
    ) as any,

    // Account balances by group (via transaction_lines)
    query(
      `SELECT
         c.account_type_group                                       AS grp,
         COALESCE(SUM(tl.debit_amount  - tl.credit_amount), 0)     AS balance
       FROM chart_of_accounts c
       LEFT JOIN transaction_lines tl ON tl.account_id = c.id
       WHERE c.is_active = 1
       GROUP BY c.account_type_group`,
    ) as any[],

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
       LIMIT 12`,
    ) as any[],
  ])

  // Aggregate by group type
  const byGroup: Record<string, number> = {}
  for (const row of accountSummary) {
    byGroup[row.grp ?? 'Other'] = (byGroup[row.grp ?? 'Other'] ?? 0) + Number(row.balance)
  }

  const assetBalance     = Object.entries(byGroup).filter(([k]) => k === 'Asset').reduce((s, [, v]) => s + v, 0)
  const liabilityBalance = Object.entries(byGroup).filter(([k]) => k === 'Liability').reduce((s, [, v]) => s + v, 0)
  const equityBalance    = Object.entries(byGroup).filter(([k]) => k === 'Equity').reduce((s, [, v]) => s + v, 0)

  return {
    stats: {
      total_assets:      assetBalance,
      total_liabilities: liabilityBalance,
      net_equity:        equityBalance,
      journal_entries:   journalStats?.this_month ?? 0,
    },
    recentEntries,
    accountSummary: byGroup,
  }
})

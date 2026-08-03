import { query } from '~/server/utils/db'

/**
 * GET /api/accounts/tax-statement — NBR tax-return DRAFT support: P&L +
 * Balance Sheet for a fiscal year, built on the same opening/period/closing
 * ledger-truth method as accounts/statements.get.ts (chart_of_accounts +
 * transaction_lines), NOT the legacy app's broken balance_sheet.php pattern
 * (which referenced a schema that no longer exists there).
 *
 * Deliberately does NOT compute an actual tax liability — no
 * disallowed-expense adjustments, no depreciation (this system has no
 * fixed-asset/depreciation tracking at all). The worksheet section is left
 * blank for the accountant, same as the legacy draft.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })

  const settingsRows = await query<{ setting_key: string; setting_value: string }>(
    `SELECT setting_key, setting_value FROM system_settings
     WHERE setting_key IN ('tax_tin','tax_bin','tax_legal_name','tax_address','tax_fiscal_year_start_month')`,
  )
  const sMap = Object.fromEntries(settingsRows.map(r => [r.setting_key, r.setting_value]))
  const fyStartMonth = Number(sMap.tax_fiscal_year_start_month ?? 7)

  const q = getQuery(event)
  const now = new Date()
  const defaultStartYear = now.getMonth() + 1 >= fyStartMonth ? now.getFullYear() : now.getFullYear() - 1
  const startYear = Number(q.fy) || defaultStartYear

  const pad = (n: number) => String(n).padStart(2, '0')
  const from = `${startYear}-${pad(fyStartMonth)}-01`
  const endYear  = fyStartMonth === 1 ? startYear : startYear + 1
  const endMonth = fyStartMonth === 1 ? 12 : fyStartMonth - 1
  const lastDay  = new Date(endYear, endMonth, 0).getDate() // day 0 of next month = last day of endMonth
  const to = `${endYear}-${pad(endMonth)}-${pad(lastDay)}`

  const [plRows, bsRows] = await Promise.all([
    query<any>(
      `SELECT c.account_number AS code, c.name, c.account_type_group AS grp, c.account_type AS type,
              COALESCE(SUM(tl.debit_amount), 0) AS total_debit, COALESCE(SUM(tl.credit_amount), 0) AS total_credit
       FROM chart_of_accounts c
       LEFT JOIN transaction_lines tl ON tl.account_id = c.id
       LEFT JOIN journal_entries je ON je.id = tl.journal_entry_id
         AND je.transaction_date BETWEEN ? AND ? AND je.is_reversed = 0
       WHERE c.is_active = 1 AND c.account_type_group IN ('Revenue','Expense')
       GROUP BY c.id HAVING total_debit > 0 OR total_credit > 0
       ORDER BY c.account_type_group, c.account_number, c.name`,
      [from, to]),
    query<any>(
      `SELECT c.account_number AS code, c.name, c.account_type_group AS grp, c.account_type AS type,
              COALESCE(SUM(tl.debit_amount), 0) AS total_debit, COALESCE(SUM(tl.credit_amount), 0) AS total_credit
       FROM chart_of_accounts c
       LEFT JOIN transaction_lines tl ON tl.account_id = c.id
       LEFT JOIN journal_entries je ON je.id = tl.journal_entry_id AND je.transaction_date <= ? AND je.is_reversed = 0
       WHERE c.is_active = 1 AND c.account_type_group IN ('Asset','Liability','Equity')
       GROUP BY c.id HAVING total_debit > 0 OR total_credit > 0
       ORDER BY c.account_number, c.name`,
      [to]),
  ])

  const revenueRows = plRows.filter((r: any) => r.grp === 'Revenue' || r.type === 'Other Income')
  const cogsRows    = plRows.filter((r: any) => r.grp === 'Expense' && r.type === 'Cost of Goods Sold')
  const opexRows    = plRows.filter((r: any) => r.grp === 'Expense' && r.type !== 'Cost of Goods Sold')
  const toAmount = (r: any) => Math.max(0, Number(r.total_credit) - Number(r.total_debit))
  const toCost   = (r: any) => Math.max(0, Number(r.total_debit) - Number(r.total_credit))

  const revenue = revenueRows.map((r: any) => ({ code: r.code, name: r.name, amount: toAmount(r) }))
  const cogs    = cogsRows.map((r: any) => ({ code: r.code, name: r.name, amount: toCost(r) }))
  const opex    = opexRows.map((r: any) => ({ code: r.code, name: r.name, amount: toCost(r) }))
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0)
  const totalCogs    = cogs.reduce((s, r) => s + r.amount, 0)
  const grossProfit  = totalRevenue - totalCogs
  const totalOpex    = opex.reduce((s, r) => s + r.amount, 0)
  const netProfit    = grossProfit - totalOpex

  const CURRENT_ASSET_TYPES = new Set(['Bank', 'Petty Cash', 'Cash', 'Accounts Receivable', 'Other Current Asset'])
  const CURRENT_LIAB_TYPES  = new Set(['Accounts Payable'])
  const toAsset = (r: any) => Math.max(0, Number(r.total_debit) - Number(r.total_credit))
  const toLiab  = (r: any) => Math.max(0, Number(r.total_credit) - Number(r.total_debit))

  const currentAssets       = bsRows.filter((r: any) => r.grp === 'Asset' && CURRENT_ASSET_TYPES.has(r.type)).map((r: any) => ({ code: r.code, name: r.name, amount: toAsset(r) }))
  const fixedAssets         = bsRows.filter((r: any) => r.grp === 'Asset' && !CURRENT_ASSET_TYPES.has(r.type)).map((r: any) => ({ code: r.code, name: r.name, amount: toAsset(r) }))
  const currentLiabilities  = bsRows.filter((r: any) => r.grp === 'Liability' && CURRENT_LIAB_TYPES.has(r.type)).map((r: any) => ({ code: r.code, name: r.name, amount: toLiab(r) }))
  const longTermLiabilities = bsRows.filter((r: any) => r.grp === 'Liability' && !CURRENT_LIAB_TYPES.has(r.type)).map((r: any) => ({ code: r.code, name: r.name, amount: toLiab(r) }))
  const equity              = bsRows.filter((r: any) => r.grp === 'Equity').map((r: any) => ({ code: r.code, name: r.name, amount: toLiab(r) }))

  const totalCurrentAssets  = currentAssets.reduce((s, r) => s + r.amount, 0)
  const totalFixedAssets    = fixedAssets.reduce((s, r) => s + r.amount, 0)
  const totalAssets         = totalCurrentAssets + totalFixedAssets
  const totalCurrentLiab    = currentLiabilities.reduce((s, r) => s + r.amount, 0)
  const totalLongTermLiab   = longTermLiabilities.reduce((s, r) => s + r.amount, 0)
  const totalEquity         = equity.reduce((s, r) => s + r.amount, 0)

  return {
    company: {
      tin: sMap.tax_tin ?? '', bin: sMap.tax_bin ?? '',
      legal_name: sMap.tax_legal_name ?? '', address: sMap.tax_address ?? '',
      fiscal_year_start_month: fyStartMonth,
    },
    fiscal_year: { label: `FY ${startYear}-${String(endYear).slice(2)}`, from, to, start_year: startYear },
    pl: { revenue, totalRevenue, cogs, totalCogs, grossProfit, opex, totalOpex, netProfit },
    bs: {
      currentAssets, totalCurrentAssets, fixedAssets, totalFixedAssets, totalAssets,
      currentLiabilities, totalCurrentLiab, longTermLiabilities, totalLongTermLiab,
      equity, totalEquity,
      totalLiabAndEquity: totalCurrentLiab + totalLongTermLiab + totalEquity,
    },
  }
})

import { query } from '~/server/utils/db'

const ICONS   = ['🚛', '⚡', '📎', '🔧', '👷', '⛽', '📦', '🏷️', '💼', '🔩']
const COLORS  = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f97316', '#6b7280', '#ec4899', '#14b8a6', '#a855f7']

export default defineEventHandler(async (event) => {
  const q           = getQuery(event)
  const includeSpend = (q.spend as string) !== 'false'

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
         THEN dv.amount ELSE 0 END), 0) AS monthly_spend,` : '0 AS monthly_spend,'}
       JSON_ARRAYAGG(
         JSON_OBJECT('id', s.id, 'name', s.subcategory_name, 'chart_of_account_id', s.chart_of_account_id)
       ) AS subcategories_raw
     FROM expense_categories c
     LEFT JOIN chart_of_accounts coa ON coa.id = c.chart_of_account_id
     ${includeSpend ? `LEFT JOIN debit_vouchers dv ON dv.expense_account_id = c.chart_of_account_id` : ''}
     LEFT JOIN expense_subcategories s ON s.category_id = c.id AND s.is_active = 1
     WHERE c.is_active = 1
     GROUP BY c.id
     ORDER BY c.category_code, c.category_name`,
  ) as any[]

  const parsed = categories.map((c: any, i: number) => {
    let subs: any[] = []
    try {
      const raw = c.subcategories_raw
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
      subs = (arr ?? []).filter((s: any) => s.id !== null)
    } catch {}
    return {
      id:           c.id as number,
      name:         c.name  as string,
      code:         (c.code ?? '') as string,
      description:  (c.description ?? '') as string,
      icon:         ICONS[i  % ICONS.length],
      color:        COLORS[i % COLORS.length],
      monthlySpend: Number(c.monthly_spend) || 0,
      budget:       0,   // Not in DB schema — UI display only
      chartOfAccountId: c.chart_of_account_id as number | null,
      glAccountName:    (c.gl_account_name ?? '') as string,
      subcategories: subs.map((s: any) => ({
        id:   s.id,
        name: s.name,
        unit: '',   // unit_of_measurement loaded separately via /api/expenses/subcategories
        chartOfAccountId: s.chart_of_account_id ?? null,
      })),
    }
  })

  return { categories: parsed }
})

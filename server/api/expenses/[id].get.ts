import { queryOne, query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const expense = await queryOne(
    `SELECT e.*,
            cat.category_name, cat.category_code, cat.chart_of_account_id,
            coa.account_number AS gl_account_code, coa.name AS gl_account_name,
            sub.subcategory_name,
            cr.display_name AS created_by_name,
            ap.display_name AS approved_by_name,
            ap.email        AS approved_by_email,
            b.name AS branch_name,
            ba.bank_name, ba.account_number, ba.account_name AS bank_account_name
     FROM expense_vouchers e
     LEFT JOIN expense_categories cat    ON cat.id = e.category_id
     LEFT JOIN chart_of_accounts  coa   ON coa.id = cat.chart_of_account_id
     LEFT JOIN expense_subcategories sub ON sub.id = e.subcategory_id
     LEFT JOIN users cr  ON cr.id = e.created_by_user_id
     LEFT JOIN users ap  ON ap.id = e.approved_by_user_id
     LEFT JOIN branches b ON b.id = e.branch_id
     LEFT JOIN bank_accounts ba ON ba.id = e.bank_account_id
     WHERE e.id = ?`,
    [id],
  )

  if (!expense) throw createError({ statusCode: 404, statusMessage: 'Expense not found' })

  // Try to get unit_of_measurement from subcategory — column may not exist yet
  let unit_type = ''
  if ((expense as any).subcategory_id) {
    try {
      const rows = await query(
        `SELECT unit_of_measurement FROM expense_subcategories WHERE id = ? LIMIT 1`,
        [(expense as any).subcategory_id],
      ) as any[]
      unit_type = rows[0]?.unit_of_measurement ?? ''
    } catch {
      // Column doesn't exist yet — silently ignore
    }
  }

  return { expense: { ...(expense as any), unit_type } }
})

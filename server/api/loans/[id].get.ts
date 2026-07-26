import { queryOne, query } from '~/server/utils/db'

/** GET /api/loans/:id — loan detail + JE lines + repayment history. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid loan ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const loan = await queryOne<any>(
    `SELECT l.*, c.name AS customer_name, s.company_name AS supplier_name,
            u.display_name AS created_by
     FROM loans l
     LEFT JOIN customers c ON c.id = l.customer_id
     LEFT JOIN suppliers s ON s.id = l.supplier_id
     LEFT JOIN users u ON u.id = l.created_by_user_id
     WHERE l.id = ?`, [id],
  )
  if (!loan) throw createError({ statusCode: 404, statusMessage: 'Loan not found' })

  const [jeLines, repayments] = await Promise.all([
    loan.journal_entry_id
      ? query<any>(
          `SELECT tl.debit_amount, tl.credit_amount, tl.description, coa.name AS account_name
           FROM transaction_lines tl JOIN chart_of_accounts coa ON coa.id = tl.account_id
           WHERE tl.journal_entry_id = ?`, [loan.journal_entry_id])
      : Promise.resolve([]),
    query<any>(
      `SELECT r.*, u.display_name AS collected_by
       FROM loan_repayments r LEFT JOIN users u ON u.id = r.created_by_user_id
       WHERE r.loan_id = ? ORDER BY r.repayment_date, r.id`, [id]),
  ])
  return { loan, je_lines: jeLines, repayments }
})

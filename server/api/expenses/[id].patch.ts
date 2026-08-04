import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * PATCH /api/expenses/:id — edit a still-pending expense voucher.
 * Previously only approve/reject/cancel existed; a mistake (wrong category,
 * wrong amount, wrong payment account) had no fix short of cancel + re-create.
 * Locked once approved/rejected/cancelled — those states already have their
 * own (audited, GL-aware) transitions.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid expense ID' })

  const session   = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const userName  = (session.user as any).name ?? `User ${userId}`

  const body = await readBody(event)
  const {
    expense_date, category_id, subcategory_id, unit_quantity, per_unit_cost,
    total_amount, payment_method, bank_account_id, cash_account_id,
    payment_reference, employee_id, handled_by_person, branch_id, remarks,
  } = body ?? {}

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[exp]] = await conn.query<any>(`SELECT * FROM expense_vouchers WHERE id = ? FOR UPDATE`, [id])
    if (!exp) throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
    if (exp.status !== 'pending')
      throw createError({ statusCode: 400, statusMessage: `Cannot edit — voucher is "${exp.status}", only pending vouchers can be edited` })

    const total = total_amount != null ? Number(total_amount) : Number(exp.total_amount)
    if (!total || total <= 0) throw createError({ statusCode: 400, statusMessage: 'total_amount must be greater than 0' })
    if (payment_method === 'cash' && !cash_account_id && !exp.cash_account_id)
      throw createError({ statusCode: 400, statusMessage: 'A petty-cash account is required for cash payment' })
    if (payment_method === 'bank' && !bank_account_id && !exp.bank_account_id)
      throw createError({ statusCode: 400, statusMessage: 'A bank account is required for bank payment' })

    await conn.query(
      `UPDATE expense_vouchers SET
         expense_date       = ?,
         category_id        = ?,
         subcategory_id     = ?,
         unit_quantity      = ?,
         per_unit_cost      = ?,
         total_amount       = ?,
         payment_method     = ?,
         bank_account_id    = ?,
         cash_account_id    = ?,
         payment_reference  = ?,
         employee_id        = ?,
         handled_by_person  = ?,
         branch_id          = ?,
         remarks            = ?,
         updated_at         = NOW()
       WHERE id = ?`,
      [
        expense_date ?? exp.expense_date,
        category_id ?? exp.category_id,
        subcategory_id ?? exp.subcategory_id ?? null,
        unit_quantity ?? exp.unit_quantity ?? null,
        per_unit_cost ?? exp.per_unit_cost ?? null,
        total,
        payment_method ?? exp.payment_method,
        payment_method === 'bank' ? (bank_account_id ?? exp.bank_account_id) : (payment_method === 'cash' ? null : exp.bank_account_id),
        payment_method === 'cash' ? (cash_account_id ?? exp.cash_account_id) : (payment_method === 'bank' ? null : exp.cash_account_id),
        payment_reference ?? exp.payment_reference ?? null,
        employee_id ?? exp.employee_id ?? null,
        handled_by_person ?? exp.handled_by_person ?? null,
        branch_id ?? exp.branch_id ?? null,
        remarks ?? exp.remarks ?? null,
        id,
      ],
    )

    await auditLog(conn, {
      userId, action: 'updated', module: 'expenses', recordType: 'expense_voucher',
      recordId: id, referenceNumber: exp.voucher_number,
      description: `Pending expense ${exp.voucher_number} edited by ${userName}`,
      severity: 'info',
    })

    await conn.commit()
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

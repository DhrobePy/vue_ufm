import { getDb, queryOne } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const body      = await readBody(event)
  const session   = await getUserSession(event)
  const userId    = session?.user?.id   ?? 1
  const actorName = session?.user?.name ?? session?.user?.email ?? 'System'

  const {
    expense_date,
    category_id,
    subcategory_id,
    unit_quantity,
    per_unit_cost,
    total_amount,
    payment_method,        // 'bank' | 'cash'
    bank_account_id,       // required when payment_method = 'bank'
    cash_account_id,       // required when payment_method = 'cash'
    payment_account_name,
    payment_reference,
    employee_id,
    handled_by_person,
    branch_id,
    expense_account_id,
    remarks,
  } = body ?? {}

  // ── Validation ──────────────────────────────────────────────────────────
  if (!expense_date || !category_id || !remarks) {
    throw createError({ statusCode: 400, statusMessage: 'expense_date, category_id and remarks are required' })
  }
  if (!subcategory_id) {
    throw createError({ statusCode: 400, statusMessage: 'subcategory_id is required' })
  }

  // DB ENUM is 'bank' | 'cash' only
  const method = String(payment_method ?? 'cash').toLowerCase() === 'bank' ? 'bank' : 'cash'

  if (method === 'bank' && !bank_account_id) {
    throw createError({ statusCode: 400, statusMessage: 'bank_account_id is required for bank payments' })
  }
  if (method === 'cash' && !cash_account_id) {
    throw createError({ statusCode: 400, statusMessage: 'cash_account_id is required for cash payments' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Generate voucher number: EXP-YYYYMMDD-NNNN
    const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM expense_vouchers WHERE DATE(created_at) = CURDATE()`,
    )
    const seq       = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const voucherNo = `EXP-${today}-${seq}`

    const computed_total = total_amount ?? ((unit_quantity ?? 1) * (per_unit_cost ?? 0))

    // Auto-derive expense_account_id from subcategory (more specific) then category
    let resolvedExpenseAccountId = expense_account_id ? Number(expense_account_id) : null
    if (!resolvedExpenseAccountId) {
      const sub = await queryOne<any>(
        `SELECT chart_of_account_id FROM expense_subcategories WHERE id = ?`, [Number(subcategory_id)],
      )
      resolvedExpenseAccountId = sub?.chart_of_account_id ?? null
    }
    if (!resolvedExpenseAccountId) {
      const cat = await queryOne<any>(
        `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`, [Number(category_id)],
      )
      resolvedExpenseAccountId = cat?.chart_of_account_id ?? null
    }

    // Build payment_account_name from whichever account is selected
    let resolvedPaymentAccountName = payment_account_name ?? null
    if (!resolvedPaymentAccountName) {
      if (method === 'bank' && bank_account_id) {
        const ba = await queryOne<any>(
          `SELECT bank_name, account_name, account_number FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)],
        )
        if (ba) resolvedPaymentAccountName = `${ba.bank_name} – ${ba.account_name} (${ba.account_number})`
      } else if (method === 'cash' && cash_account_id) {
        const ca = await queryOne<any>(
          `SELECT account_name FROM branch_petty_cash_accounts WHERE id = ?`,
          [Number(cash_account_id)],
        )
        if (ca) resolvedPaymentAccountName = ca.account_name
      }
    }

    const [result] = await conn.query<any>(
      `INSERT INTO expense_vouchers
         (voucher_number, expense_date, category_id, subcategory_id,
          unit_quantity, per_unit_cost, total_amount,
          payment_method, bank_account_id, cash_account_id,
          payment_account_name, payment_reference,
          employee_id, handled_by_person,
          expense_account_id, remarks,
          status, branch_id, created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, ?,
               'pending', ?, ?, NOW(), NOW())`,
      [
        voucherNo,
        expense_date,
        Number(category_id),
        Number(subcategory_id),
        unit_quantity  ?? null,
        per_unit_cost  ?? null,
        computed_total,
        method,
        method === 'bank' ? Number(bank_account_id) : null,
        method === 'cash' ? Number(cash_account_id) : null,
        resolvedPaymentAccountName,
        payment_reference  ?? null,
        employee_id        ? Number(employee_id)  : null,
        handled_by_person  ?? null,
        resolvedExpenseAccountId,
        remarks,
        branch_id          ? Number(branch_id)    : null,
        userId,
      ],
    )

    const newId = result.insertId

    await auditLog(conn, {
      userId:          userId,
      action:          'created',
      module:          'expenses',
      recordType:      'expense_voucher',
      recordId:        newId,
      referenceNumber: voucherNo,
      description:     `Expense voucher ${voucherNo} (৳${Number(computed_total).toLocaleString()}) created by ${actorName}`,
      severity:        'info',
    })

    await conn.commit()
    return { ok: true, id: newId, voucher_number: voucherNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

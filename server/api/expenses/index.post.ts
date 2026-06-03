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
    payment_method,
    bank_account_id,
    payment_account_name,
    payment_reference,
    employee_id,
    handled_by_person,
    branch_id,
    expense_account_id,
    remarks,
  } = body ?? {}

  if (!expense_date || !category_id || !remarks) {
    throw createError({ statusCode: 400, statusMessage: 'expense_date, category_id and remarks are required' })
  }

  const method = payment_method ?? 'Cash'

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

    // ── Base INSERT — only confirmed-existing columns ──────────────────────
    const [result] = await conn.query<any>(
      `INSERT INTO expense_vouchers
         (voucher_number, expense_date, category_id, subcategory_id,
          unit_quantity, per_unit_cost, total_amount,
          payment_method, bank_account_id, handled_by_person, remarks,
          status, branch_id, created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?, ?,
               'pending', ?, ?, NOW(), NOW())`,
      [
        voucherNo,
        expense_date,
        Number(category_id),
        subcategory_id ? Number(subcategory_id) : null,
        unit_quantity  ?? null,
        per_unit_cost  ?? null,
        computed_total,
        method,
        bank_account_id ? Number(bank_account_id) : null,
        handled_by_person ?? null,
        remarks,
        branch_id ? Number(branch_id) : null,
        userId,
      ],
    )

    const newId = result.insertId

    // ── Try to set newer columns that may not exist yet ────────────────────
    // Build payment_account_name from bank account if not supplied
    let resolvedPaymentAccountName = payment_account_name ?? null
    if (!resolvedPaymentAccountName && bank_account_id) {
      try {
        const ba = await queryOne<any>(
          `SELECT bank_name, account_number, account_name FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)],
        )
        if (ba) resolvedPaymentAccountName = `${ba.bank_name} – ${ba.account_name} (${ba.account_number})`
      } catch { /* ignore */ }
    }

    // Auto-derive expense_account_id from category if not provided
    let resolvedExpenseAccountId = expense_account_id ? Number(expense_account_id) : null
    if (!resolvedExpenseAccountId && category_id) {
      try {
        const cat = await queryOne<any>(
          `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`, [Number(category_id)],
        )
        resolvedExpenseAccountId = cat?.chart_of_account_id ?? null
      } catch { /* ignore */ }
    }

    // Attempt UPDATE for columns that might not exist — one group at a time
    if (payment_reference || resolvedPaymentAccountName) {
      try {
        await conn.query(
          `UPDATE expense_vouchers SET payment_reference = ?, payment_account_name = ? WHERE id = ?`,
          [payment_reference ?? null, resolvedPaymentAccountName, newId],
        )
      } catch { /* column doesn't exist yet — skip */ }
    }

    if (employee_id) {
      try {
        await conn.query(
          `UPDATE expense_vouchers SET employee_id = ? WHERE id = ?`,
          [Number(employee_id), newId],
        )
      } catch { /* column doesn't exist yet — skip */ }
    }

    if (resolvedExpenseAccountId) {
      try {
        await conn.query(
          `UPDATE expense_vouchers SET expense_account_id = ? WHERE id = ?`,
          [resolvedExpenseAccountId, newId],
        )
      } catch { /* column doesn't exist yet — skip */ }
    }

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

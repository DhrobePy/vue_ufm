import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    voucher_date,
    expense_account_id,
    payment_account_id,
    amount,
    paid_to,
    description,
    reference_number,
    branch_id,
  } = body ?? {}

  if (!voucher_date || !expense_account_id || !payment_account_id || !amount || !paid_to || !description)
    throw createError({ statusCode: 400, statusMessage: 'voucher_date, expense_account_id, payment_account_id, amount, paid_to, and description are required' })

  if (Number(amount) <= 0)
    throw createError({ statusCode: 400, statusMessage: 'Amount must be greater than 0' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Generate voucher number: DV-{YYYYMMDD}-{rand4}
    const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM debit_vouchers WHERE DATE(voucher_date) = CURDATE()`,
    )
    const seq       = String(Math.floor(1000 + Math.random() * 9000))
    const voucherNo = `DV-${today}-${seq}`

    const [result] = await conn.query<any>(
      `INSERT INTO debit_vouchers
         (voucher_number, voucher_date, expense_account_id, payment_account_id,
          amount, paid_to, description, reference_number, branch_id,
          created_by_user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        voucherNo,
        voucher_date,
        Number(expense_account_id),
        Number(payment_account_id),
        Number(amount),
        paid_to,
        description,
        reference_number || null,
        branch_id ? Number(branch_id) : null,
        userId,
      ],
    )

    await conn.commit()
    return { ok: true, id: result.insertId, voucher_number: voucherNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

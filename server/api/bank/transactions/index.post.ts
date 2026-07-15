import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    bank_tx_account_id: number
    transaction_date: string
    description: string
    entry_type: 'credit' | 'debit'
    amount: number
    transaction_type_id?: number
    reference_number?: string
    cheque_number?: string
    payee_payer_name?: string
    special_note?: string
  }

  const {
    bank_tx_account_id, transaction_date, description, entry_type, amount, transaction_type_id,
    reference_number, cheque_number, payee_payer_name, special_note,
  } = body

  if (!bank_tx_account_id || !transaction_date || !description || !entry_type || !amount) {
    throw createError({ statusCode: 422, statusMessage: 'bank_tx_account_id, transaction_date, description, entry_type and amount are required' })
  }

  const session = await getUserSession(event)
  const userId  = Number((session?.user as any)?.id ?? 1)

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Generate transaction number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM bank_transactions WHERE DATE(created_at) = CURDATE()`,
    )
    const seq   = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const txnNo = `BTX-${today}-${seq}`

    // Validate account exists
    const [[acct]] = await conn.query<any>(`SELECT id FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [bank_tx_account_id])
    if (!acct) throw createError({ statusCode: 404, statusMessage: 'Bank account not found or inactive' })

    const [result] = await conn.query<any>(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, transaction_type_id, reference_number, cheque_number, payee_payer_name,
          special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [txnNo, bank_tx_account_id, transaction_date, description,
       entry_type, amount, transaction_type_id || null, reference_number || null,
       cheque_number || null, payee_payer_name || null, special_note || null, userId],
    )

    await conn.commit()
    return { id: result.insertId, transaction_number: txnNo, message: 'Transaction created — pending approval' }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})

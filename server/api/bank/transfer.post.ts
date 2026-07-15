import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    from_account_id: number
    to_account_id: number
    amount: number
    transfer_date: string
    reference_number?: string
    notes?: string
  }

  const { from_account_id, to_account_id, amount, transfer_date, reference_number, notes } = body

  if (!from_account_id || !to_account_id || !amount || !transfer_date) {
    throw createError({ statusCode: 422, statusMessage: 'from_account_id, to_account_id, amount and transfer_date are required' })
  }
  if (from_account_id === to_account_id) {
    throw createError({ statusCode: 422, statusMessage: 'Source and destination accounts must differ' })
  }

  const session = await getUserSession(event)
  const userId  = Number((session?.user as any)?.id ?? 1)

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Validate both accounts exist in bank_tx_accounts
    const [[fromAcct]] = await conn.query<any>(`SELECT id, bank_name, account_name FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [from_account_id])
    const [[toAcct]]   = await conn.query<any>(`SELECT id, bank_name, account_name FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [to_account_id])
    if (!fromAcct) throw createError({ statusCode: 404, statusMessage: 'Source account not found or inactive' })
    if (!toAcct)   throw createError({ statusCode: 404, statusMessage: 'Destination account not found or inactive' })

    // Generate transaction numbers
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM bank_transactions WHERE DATE(created_at) = CURDATE()`,
    )
    const seq1   = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const seq2   = String((cnt.n ?? 0) + 2).padStart(4, '0')
    const txnNo1 = `BTX-${today}-${seq1}`
    const txnNo2 = `BTX-${today}-${seq2}`
    const xferAmt = Number(amount)

    const desc1 = `Transfer to ${toAcct.bank_name} — ${toAcct.account_name}`
    const desc2 = `Transfer from ${fromAcct.bank_name} — ${fromAcct.account_name}`

    // Debit from source
    const [r1] = await conn.query<any>(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, reference_number, special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, 'debit', ?, ?, ?, 'pending', ?)`,
      [txnNo1, from_account_id, transfer_date, desc1, xferAmt, reference_number || null, notes || null, userId],
    )

    // Credit to destination
    const [r2] = await conn.query<any>(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, reference_number, special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, 'credit', ?, ?, ?, 'pending', ?)`,
      [txnNo2, to_account_id, transfer_date, desc2, xferAmt, reference_number || null, notes || null, userId],
    )

    // Link the two legs — both get GL-posted together as one balanced JE
    // whenever either is approved (see [id].patch.ts).
    await conn.query(`UPDATE bank_transactions SET transfer_pair_id = ? WHERE id = ?`, [r2.insertId, r1.insertId])
    await conn.query(`UPDATE bank_transactions SET transfer_pair_id = ? WHERE id = ?`, [r1.insertId, r2.insertId])

    await conn.commit()
    return {
      debit_id:   r1.insertId,
      credit_id:  r2.insertId,
      debit_txn:  txnNo1,
      credit_txn: txnNo2,
      message:    'Transfer created — pending approval',
    }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})

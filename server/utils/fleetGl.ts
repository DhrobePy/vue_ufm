/**
 * Shared DR-expense / CR-cash-or-bank journal posting for fleet fuel and
 * maintenance spend — previously these wrote raw log rows with no GL entry
 * at all. Mirrors the same account-resolution + petty-cash-balance pattern
 * used by expenses/[id]/approve.post.ts.
 */
export interface FleetGlInput {
  conn: any
  expenseAccountName: string          // e.g. 'Fuel Expense' — resolved by name from chart_of_accounts
  paymentMethod: 'cash' | 'bank'
  cashAccountId?: number | null       // branch_petty_cash_accounts.id
  bankAccountId?: number | null       // bank_accounts.id
  amount: number
  date: string
  description: string
  relatedDocumentType: string
  relatedDocumentId: number
  userId: number
}

export async function postFleetExpenseGl(input: FleetGlInput): Promise<number> {
  const { conn } = input
  if (!input.amount || input.amount <= 0.009)
    throw createError({ statusCode: 400, statusMessage: 'A positive amount is required to post this entry' })

  const [[expAcc]] = await conn.query<any>(
    `SELECT id FROM chart_of_accounts WHERE name = ? LIMIT 1`, [input.expenseAccountName],
  )
  if (!expAcc)
    throw createError({ statusCode: 422, statusMessage: `GL account "${input.expenseAccountName}" not found — please seed it in Chart of Accounts first` })

  let paymentAccountId: number | null = null
  let pettyCash: { id: number; branch_id: number | null } | null = null

  if (input.paymentMethod === 'cash') {
    if (!input.cashAccountId)
      throw createError({ statusCode: 400, statusMessage: 'A petty-cash account is required for cash payment' })
    const [[ca]] = await conn.query<any>(
      `SELECT id, branch_id, chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
      [input.cashAccountId],
    )
    if (!ca?.chart_of_account_id)
      throw createError({ statusCode: 422, statusMessage: 'Selected petty-cash account has no GL account mapped' })
    paymentAccountId = ca.chart_of_account_id
    pettyCash = { id: ca.id, branch_id: ca.branch_id }
  } else {
    if (!input.bankAccountId)
      throw createError({ statusCode: 400, statusMessage: 'A bank account is required for bank payment' })
    const [[ba]] = await conn.query<any>(
      `SELECT id, chart_of_account_id FROM bank_accounts WHERE id = ?`, [input.bankAccountId],
    )
    if (!ba?.chart_of_account_id)
      throw createError({ statusCode: 422, statusMessage: 'Selected bank account has no GL account mapped' })
    paymentAccountId = ba.chart_of_account_id
  }

  const [jeResult] = await conn.query<any>(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [input.date, input.description.slice(0, 255), input.relatedDocumentType, input.relatedDocumentId, input.userId],
  )
  const journalEntryId = jeResult.insertId

  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, ?, 0.00, ?)`,
    [journalEntryId, expAcc.id, input.amount, input.description.slice(0, 255)],
  )
  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, 0.00, ?, ?)`,
    [journalEntryId, paymentAccountId, input.amount, input.description.slice(0, 255)],
  )

  if (pettyCash) {
    const [[pc]] = await conn.query<any>(
      `SELECT current_balance FROM branch_petty_cash_accounts WHERE id = ?`, [pettyCash.id],
    )
    const balanceAfter = Number(pc?.current_balance ?? 0) - input.amount
    await conn.query(
      `INSERT INTO branch_petty_cash_transactions
         (account_id, branch_id, transaction_type, amount, balance_after,
          reference_type, reference_id, description, created_by_user_id, transaction_date)
       VALUES (?, ?, 'cash_out', ?, ?, ?, ?, ?, ?, ?)`,
      [
        pettyCash.id, pettyCash.branch_id, input.amount, balanceAfter,
        input.relatedDocumentType, input.relatedDocumentId, input.description.slice(0, 255),
        input.userId, input.date,
      ],
    )
    await conn.query(
      `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
      [input.amount, pettyCash.id],
    )
  } else if (input.paymentMethod === 'bank' && input.bankAccountId) {
    await conn.query(
      `UPDATE bank_accounts SET current_balance = GREATEST(0, COALESCE(current_balance, 0) - ?) WHERE id = ?`,
      [input.amount, input.bankAccountId],
    ).catch(() => {/* column may not exist — GL journal entry is the source of truth */})
  }

  return journalEntryId
}

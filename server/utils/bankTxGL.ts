/**
 * Journal-entry posting for the standalone bank-transaction module
 * (bank_transactions / bank_tx_accounts). Approving a transaction here used
 * to just flip a status flag — invisible to the chart of accounts, trial
 * balance, or any GL report. This makes approval actually post money.
 *
 * Forward-only by design (explicit user decision): only transactions
 * approved from here on post a JE. Historical approved transactions with no
 * journal_entry_id are left as-is — backfilling them would silently shift
 * past-period GL totals, which is an accounting-policy call, not an
 * engineering one.
 */
import { postJournalEntry, type JELine } from '~/server/utils/creditOrders'

/** Resolve the chart_of_accounts.id backing a bank_tx_accounts row, via the
 *  unified bank_accounts.legacy_tx_account_id link. */
export async function resolveBankGLAccount(conn: any, bankTxAccountId: number): Promise<number | null> {
  const [[row]] = await conn.query(
    `SELECT chart_of_account_id FROM bank_accounts WHERE legacy_tx_account_id = ? LIMIT 1`,
    [bankTxAccountId],
  )
  return row?.chart_of_account_id ?? null
}

/**
 * Post the journal entry for one approved bank_transactions row and return
 * the journal_entry_id, or throw if the account/type isn't GL-mapped yet.
 * Caller is responsible for UPDATE-ing bank_transactions.journal_entry_id.
 */
export async function postBankTransactionJE(conn: any, opts: {
  txnId: number
  transactionNumber: string
  bankTxAccountId: number
  entryType: 'credit' | 'debit'
  amount: number
  date: string
  description: string
  transactionTypeId: number | null
  userId: number
}): Promise<number> {
  const bankGLId = await resolveBankGLAccount(conn, opts.bankTxAccountId)
  if (!bankGLId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This bank account isn\'t linked to the chart of accounts yet — link it from Bank Accounts before approving transactions.',
    })
  }

  let offsetGLId: number | null = null
  if (opts.transactionTypeId) {
    const [[type]] = await conn.query(
      `SELECT name, chart_of_account_id FROM bank_tx_transaction_types WHERE id = ?`,
      [opts.transactionTypeId],
    )
    offsetGLId = type?.chart_of_account_id ?? null
    if (type && !offsetGLId) {
      throw createError({
        statusCode: 409,
        statusMessage: `Transaction type "${type.name}" isn't mapped to a GL account yet — set it in Bank > Transaction Types before approving.`,
      })
    }
  }
  if (!offsetGLId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This transaction has no transaction type set — pick one (mapped to a GL account) before approving.',
    })
  }

  const lines: JELine[] = opts.entryType === 'credit'
    ? [{ accountId: bankGLId, debit: opts.amount, credit: 0 }, { accountId: offsetGLId, debit: 0, credit: opts.amount }]
    : [{ accountId: offsetGLId, debit: opts.amount, credit: 0 }, { accountId: bankGLId, debit: 0, credit: opts.amount }]

  return postJournalEntry(conn, {
    date: opts.date,
    description: `${opts.description} — ${opts.transactionNumber}`.slice(0, 255),
    docType: 'BankTransaction',
    docId: opts.txnId,
    userId: opts.userId,
    lines,
  })
}

/** Post a transfer's single balanced 2-line JE (Dr destination bank / Cr source bank). */
export async function postBankTransferJE(conn: any, opts: {
  fromTxnId: number
  toTxnId: number
  fromBankTxAccountId: number
  toBankTxAccountId: number
  amount: number
  date: string
  description: string
  userId: number
}): Promise<number> {
  const fromGLId = await resolveBankGLAccount(conn, opts.fromBankTxAccountId)
  const toGLId   = await resolveBankGLAccount(conn, opts.toBankTxAccountId)
  if (!fromGLId || !toGLId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Both accounts in this transfer need to be linked to the chart of accounts before it can be approved.',
    })
  }

  return postJournalEntry(conn, {
    date: opts.date,
    description: opts.description.slice(0, 255),
    docType: 'BankTransfer',
    docId: opts.fromTxnId,
    userId: opts.userId,
    lines: [
      { accountId: toGLId,   debit: opts.amount, credit: 0 },
      { accountId: fromGLId, debit: 0, credit: opts.amount },
    ],
  })
}

/** Reverse a posted JE with a mirror-image entry (never delete/edit the original). */
export async function reverseBankTransactionJE(conn: any, journalEntryId: number, userId: number, reason: string): Promise<number> {
  const [lines] = await conn.query(
    `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
    [journalEntryId],
  )
  const [[je]] = await conn.query(`SELECT description, transaction_date FROM journal_entries WHERE id = ?`, [journalEntryId])

  const reversalId = await postJournalEntry(conn, {
    date: new Date().toISOString().slice(0, 10),
    description: `Reversal — ${je?.description ?? `JE-${journalEntryId}`} (${reason})`.slice(0, 255),
    docType: 'BankTransactionReversal',
    docId: journalEntryId,
    userId,
    lines: (lines as any[]).map((l: any) => ({
      accountId: l.account_id, debit: Number(l.credit_amount), credit: Number(l.debit_amount),
    })),
  })

  await conn.query(
    `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
    [reversalId, journalEntryId],
  )
  await conn.query(`UPDATE journal_entries SET reverses_entry_id = ? WHERE id = ?`, [journalEntryId, reversalId])

  return reversalId
}

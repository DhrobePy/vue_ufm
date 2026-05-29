import { query } from '~/server/utils/db'

const TYPE_MAP: Record<string, string> = {
  credit_orders:      'sales',
  Order:              'sales',
  customer_payments:  'payment',
  debit_vouchers:     'expense',
  GeneralTransaction: 'general',
  InternalTransfer:   'transfer',
  BankAccount:        'general',
}

export default defineEventHandler(async (event) => {
  const q    = getQuery(event)
  const date = (q.date as string) || new Date().toISOString().slice(0, 10)

  const rows = await query(
    `SELECT
       je.id,
       TIME_FORMAT(je.created_at, '%H:%i')  AS time,
       je.description,
       je.related_document_type             AS doc_type,
       je.related_document_id               AS doc_id,
       tl.debit_amount                      AS debit,
       tl.credit_amount                     AS credit,
       c.name                               AS account,
       c.account_number                     AS code,
       u.display_name                       AS posted_by
     FROM journal_entries je
     JOIN transaction_lines tl ON tl.journal_entry_id = je.id
     JOIN chart_of_accounts c   ON c.id = tl.account_id
     LEFT JOIN users u           ON u.id = je.created_by_user_id
     WHERE je.transaction_date = ?
       AND je.is_reversed = 0
     ORDER BY je.id, tl.id`,
    [date],
  ) as any[]

  // Group lines by journal_entry id
  const map = new Map<number, any>()
  for (const row of rows) {
    if (!map.has(row.id)) {
      const docType = row.doc_type ?? ''
      const ref     = row.doc_id
        ? `${docType}#${row.doc_id}`
        : (docType || `JE-${row.id}`)

      map.set(row.id, {
        id:          row.id,
        time:        row.time  ?? '—',
        description: row.description,
        ref,
        type:        TYPE_MAP[docType] ?? 'general',
        postedBy:    row.posted_by ?? '—',
        lines:       [] as any[],
      })
    }
    map.get(row.id)!.lines.push({
      account: row.account,
      code:    row.code ?? '',
      debit:   Number(row.debit)  || 0,
      credit:  Number(row.credit) || 0,
    })
  }

  return { entries: [...map.values()] }
})

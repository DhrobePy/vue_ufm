import { query } from '~/server/utils/db'

/**
 * GET /api/purchase/bank-statement[?uuid=&from=&to=&type=all|purchase|transfer]
 * A bank account's ledger statement with the purchase payments (voucher, PO, supplier, reference) shown against each line — legacy purchase/bank_statement.php,
 * plus an opening balance and a running balance. With no uuid it lists the bank accounts (with how many purchase payments each has had).
 */
const PURCHASE_TYPES = ['purchase_payment_adnan', 'PurchasePayment', 'PurchasePaymentReversal', 'payment_adnan_edit_reversal']
const TYPE_LABEL: Record<string, string> = {
  purchase_payment_adnan: 'Purchase payment', PurchasePayment: 'Purchase payment', PurchasePaymentReversal: 'Payment reversal', payment_adnan_edit_reversal: 'Payment edit reversal',
  InternalTransfer: 'Internal transfer', BankAccount: 'Opening balance', GeneralTransaction: 'General', credit_orders: 'Sales receipt', customer_payments: 'Customer receipt',
  debit_vouchers: 'Debit voucher', debit_voucher: 'Debit voucher', ExpenseVoucher: 'Expense', BankTransaction: 'Bank transaction',
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const uuid = String(q.uuid ?? '')
  if (!uuid) {
    const accounts = await query<any>(
      `SELECT ba.uuid, ba.bank_name, ba.account_name, ba.account_number, ba.account_type,
              (SELECT COUNT(*) FROM transaction_lines tl JOIN journal_entries je ON je.id = tl.journal_entry_id
               WHERE tl.account_id = ba.chart_of_account_id AND je.related_document_type IN (?)) AS purchase_payments,
              (SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount),0) FROM transaction_lines tl WHERE tl.account_id = ba.chart_of_account_id) AS balance
       FROM bank_accounts ba WHERE ba.chart_of_account_id IS NOT NULL ORDER BY purchase_payments DESC, ba.bank_name, ba.account_name`, [PURCHASE_TYPES])
    return { accounts: accounts.map(a => ({ ...a, purchase_payments: Number(a.purchase_payments), balance: Number(a.balance) })) }
  }

  const [acct] = await query<any>(
    `SELECT ba.id, ba.uuid, ba.bank_name, ba.branch_name, ba.account_name, ba.account_number, coa.id AS coa_id, coa.name AS coa_name, coa.normal_balance
     FROM bank_accounts ba JOIN chart_of_accounts coa ON coa.id = ba.chart_of_account_id WHERE ba.uuid = ? LIMIT 1`, [uuid])
  if (!acct) throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })
  const ok = (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ''))
  const from = ok(q.from) ? String(q.from) : null, to = ok(q.to) ? String(q.to) : null
  const type = ['purchase', 'transfer'].includes(String(q.type)) ? String(q.type) : 'all'
  const debitNormal = String(acct.normal_balance ?? '').toLowerCase() === 'debit'
  const sign = (dr: number, cr: number) => debitNormal ? dr - cr : cr - dr

  let opening = 0
  if (from) {
    const [o] = await query<any>(`SELECT COALESCE(SUM(tl.debit_amount),0) dr, COALESCE(SUM(tl.credit_amount),0) cr FROM transaction_lines tl JOIN journal_entries je ON je.id = tl.journal_entry_id WHERE tl.account_id = ? AND je.transaction_date < ?`, [acct.coa_id, from])
    opening = sign(Number(o.dr), Number(o.cr))
  }
  const where = ['tl.account_id = ?'], params: unknown[] = [acct.coa_id]
  if (from) { where.push('je.transaction_date >= ?'); params.push(from) }
  if (to) { where.push('je.transaction_date <= ?'); params.push(to) }
  if (type === 'purchase') { where.push('je.related_document_type IN (?)'); params.push(PURCHASE_TYPES) }
  if (type === 'transfer') where.push(`je.related_document_type = 'InternalTransfer'`)
  const rows = await query<any>(
    `SELECT je.id AS je_id, je.transaction_date AS date, je.description, je.related_document_type AS doc_type, tl.debit_amount AS debit, tl.credit_amount AS credit,
            ppa.payment_voucher_number AS voucher, ppa.po_number AS po, ppa.supplier_name AS supplier, ppa.reference_number AS reference, ppa.payment_method AS method
     FROM transaction_lines tl JOIN journal_entries je ON je.id = tl.journal_entry_id
     LEFT JOIN purchase_payments_adnan ppa ON ppa.id = je.related_document_id AND je.related_document_type IN (?)
     WHERE ${where.join(' AND ')} ORDER BY je.transaction_date, je.id`, [PURCHASE_TYPES, ...params])

  let run = opening, td = 0, tc = 0
  const lines = rows.map(r => {
    const dr = Number(r.debit), cr = Number(r.credit); td += dr; tc += cr; run += sign(dr, cr)
    return { date: String(r.date).slice(0, 10), type: TYPE_LABEL[r.doc_type] ?? r.doc_type ?? '', description: r.description, voucher: r.voucher ?? '', po: r.po ?? '', supplier: r.supplier ?? '', reference: r.reference ?? '', method: r.method ?? '', debit: dr, credit: cr, balance: Math.round(run * 100) / 100 }
  })
  return { account: { uuid: acct.uuid, bank_name: acct.bank_name, branch_name: acct.branch_name, account_name: acct.account_name, account_number: acct.account_number, ledger_account: acct.coa_name },
    from, to, type, opening: Math.round(opening * 100) / 100, totals: { debit: td, credit: tc, closing: Math.round(run * 100) / 100 }, lines }
})

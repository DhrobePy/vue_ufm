import { query } from '~/server/utils/db'

/**
 * Document-level cross-checks of the customer ledger against the records behind it (orders, payments, returns,
 * amendments, opening dues). READ-ONLY. Each exception is something a person should look at — the line-level
 * decisions (keep / delete) live in Ledger Review; these are the ones that need an explanation or a missing record.
 */
export interface AuditException { code: string; severity: string; customer_id: any; customer: any; ref: string; date: string; amount: any; detail: string }

export const AUDIT_TITLES: Record<string, string> = {
  DISPATCHED_ORDER_NO_INVOICE: 'Delivered order with no invoice in the ledger',
  OB_ORDER_NO_INVOICE_ROW: 'Opening-balance order (covered by the opening line)',
  INVOICE_FOR_UNDISPATCHED_ORDER: 'Invoice for an order that is not shipped',
  INVOICE_AMOUNT_DIFFERS: 'Invoice differs from the order total (after credit/debit notes)',
  PAYMENT_NO_LEDGER_ROW: 'Payment not in the ledger',
  LEDGER_PAYMENT_NO_DOCUMENT: 'Ledger payment with no payment record',
  REVERSED_PAYMENT_STILL_CREDITED: 'Reversed payment still credited',
  APPROVED_RETURN_NO_CREDIT_NOTE: 'Approved return with no credit note',
  RETURN_CREDIT_NOTE_NO_APPROVED_RETURN: 'Credit note without an approved return',
  POST_DISPATCH_AMENDMENT_NO_NOTE: 'Approved amendment with no ledger note',
  AMENDMENT_NOTE_NO_APPROVED_AMENDMENT: 'Ledger note without an approved amendment',
  INITIAL_DUE_NOT_IN_LEDGER: 'Opening due on the customer record, none in the ledger',
  LEDGER_ROW_NO_CUSTOMER: 'Ledger line with no customer',
  POSSIBLE_DUPLICATE_LINE: 'Possible duplicate line',
  LARGE_MANUAL_ADJUSTMENT: 'Large manual adjustment (৳5 lakh or more)',
  STORED_BALANCE_WRONG: 'Stored balance differs from the ledger',
  ORDER_PAID_VS_ALLOCATIONS: 'Order "paid" differs from its payment allocations',
}

export async function runLedgerAudit(): Promise<AuditException[]> {
const DISP = `('goods_on_board','shipped','dispatched','delivered','completed')`
const INV = `('credit_orders','credit_order')`
const exceptions: AuditException[] = []
const add = (code: string, severity: string, r: any) => exceptions.push({ code, severity, customer_id: r.customer_id, customer: r.customer, ref: r.ref ?? '', date: r.date ?? '', amount: r.amount ?? '', detail: r.detail ?? '' })
const run = async (sql: string, p: any[] = []): Promise<any[]> => (await query<any>(sql, p)) as any[]

// 1 ── dispatched order with no invoice row
for (const r of await run(`SELECT o.id, o.order_number ref, o.order_date date, o.total_amount amount, o.customer_id, c.name customer, o.status, o.order_number LIKE 'OB-%' is_ob
    FROM credit_orders o JOIN customers c ON c.id = o.customer_id
    WHERE o.status IN ${DISP} AND o.total_amount > 0
      AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type IN ${INV} AND l.reference_id = o.id AND l.transaction_type = 'invoice')`))
  add(r.is_ob ? 'OB_ORDER_NO_INVOICE_ROW' : 'DISPATCHED_ORDER_NO_INVOICE', r.is_ob ? 'info' : 'high', { ...r, detail: `${r.status} order has no invoice line in the ledger${r.is_ob ? ' (opening-balance order — covered by the opening row?)' : ''}` })
// 2 ── invoice row whose order is not dispatched
for (const r of await run(`SELECT l.id lid, o.order_number ref, l.transaction_date date, l.debit_amount amount, l.customer_id, c.name customer, o.status
    FROM customer_ledger l JOIN credit_orders o ON o.id = l.reference_id JOIN customers c ON c.id = l.customer_id
    WHERE l.reference_type IN ${INV} AND l.transaction_type = 'invoice' AND o.status NOT IN ${DISP}`))
  add('INVOICE_FOR_UNDISPATCHED_ORDER', 'high', { ...r, detail: `ledger invoice exists but the order is "${r.status}"` })
// 3 ── invoice amount ≠ order total, AFTER allowing for the credit/debit notes posted against that order
//      (returns, post-dispatch amendments, order-level notes): invoice − credit notes + debit notes should equal the order total.
for (const r of await run(`SELECT o.order_number ref, o.order_date date, l.debit_amount amount, o.total_amount order_total, o.customer_id, c.name customer,
        COALESCE((SELECT SUM(n.debit_amount - n.credit_amount) FROM customer_ledger n
                  LEFT JOIN credit_order_returns r2 ON n.reference_type IN ('credit_order_returns','credit_order_return') AND r2.id = n.reference_id
                  LEFT JOIN order_amendments a2 ON n.reference_type IN ('order_amendments','order_amendment') AND a2.id = n.reference_id
                  WHERE n.transaction_type IN ('credit_note','debit_note') AND n.customer_id = o.customer_id
                    AND ((n.reference_type IN ('credit_orders','credit_order') AND n.reference_id = o.id) OR r2.order_id = o.id OR a2.order_id = o.id)), 0) notes
    FROM customer_ledger l JOIN credit_orders o ON o.id = l.reference_id JOIN customers c ON c.id = l.customer_id
    WHERE l.reference_type IN ${INV} AND l.transaction_type = 'invoice' AND o.status IN ${DISP}`)) {
  const explained = Number(r.amount) + Number(r.notes)
  if (Math.abs(explained - Number(r.order_total)) > 0.01)
    add('INVOICE_AMOUNT_DIFFERS', Math.abs(explained - r.order_total) > 1000 ? 'high' : 'medium',
      { ...r, amount: Number(explained) - Number(r.order_total), detail: `invoice ৳${r.amount} ${Number(r.notes) ? `(net of notes ৳${explained})` : ''} vs order total ৳${r.order_total}` })
}
// 4 ── payments
for (const r of await run(`SELECT p.payment_number ref, p.payment_date date, p.amount, p.customer_id, c.name customer, p.payment_type
    FROM customer_payments p JOIN customers c ON c.id = p.customer_id
    WHERE p.reversed_at IS NULL AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type = 'customer_payments' AND l.reference_id = p.id AND l.customer_id = p.customer_id)`))
  add('PAYMENT_NO_LEDGER_ROW', 'high', { ...r, detail: `${r.payment_type} payment is not in the customer's ledger` })
for (const r of await run(`SELECT l.invoice_number ref, l.transaction_date date, l.credit_amount amount, l.customer_id, c.name customer, l.id lid
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id LEFT JOIN customer_payments p ON p.id = l.reference_id
    WHERE l.reference_type = 'customer_payments' AND (p.id IS NULL OR p.customer_id <> l.customer_id)`))
  add('LEDGER_PAYMENT_NO_DOCUMENT', 'high', { ...r, detail: 'ledger shows a payment with no matching payment record' })
for (const r of await run(`SELECT p.payment_number ref, p.payment_date date, p.amount, p.customer_id, c.name customer FROM customer_payments p JOIN customers c ON c.id = p.customer_id
    WHERE p.reversed_at IS NOT NULL AND EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type = 'customer_payments' AND l.reference_id = p.id AND l.credit_amount > 0)
      AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type = 'customer_payments' AND l.reference_id = p.id AND l.debit_amount > 0)`))
  add('REVERSED_PAYMENT_STILL_CREDITED', 'high', { ...r, detail: 'payment is marked reversed but its credit is still in the ledger with no reversing entry' })
// 5 ── returns
for (const r of await run(`SELECT r.return_number ref, r.return_date date, r.total_returned_amount amount, r.customer_id, c.name customer, r.status
    FROM credit_order_returns r JOIN customers c ON c.id = r.customer_id
    WHERE r.status = 'approved' AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type IN ('credit_order_returns','credit_order_return') AND l.reference_id = r.id)`))
  add('APPROVED_RETURN_NO_CREDIT_NOTE', 'high', { ...r, detail: 'approved return has no credit note in the ledger' })
for (const r of await run(`SELECT l.invoice_number ref, l.transaction_date date, l.credit_amount amount, l.customer_id, c.name customer
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id LEFT JOIN credit_order_returns r ON r.id = l.reference_id
    WHERE l.reference_type IN ('credit_order_returns','credit_order_return') AND (r.id IS NULL OR r.status <> 'approved')`))
  add('RETURN_CREDIT_NOTE_NO_APPROVED_RETURN', 'high', { ...r, detail: 'credit note refers to a return that is missing or not approved' })
// 6 ── amendments
for (const r of await run(`SELECT a.amendment_number ref, a.created_at date, a.flat_amount amount, o.customer_id, c.name customer, a.regime
    FROM order_amendments a JOIN credit_orders o ON o.id = a.order_id JOIN customers c ON c.id = o.customer_id
    WHERE a.status = 'approved' AND a.regime = 'post' AND a.flat_amount IS NOT NULL AND a.flat_amount <> 0
      AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type IN ('order_amendments','order_amendment') AND l.reference_id = a.id)`))
  add('POST_DISPATCH_AMENDMENT_NO_NOTE', 'medium', { ...r, detail: 'approved post-dispatch amendment has no debit/credit note in the ledger' })
for (const r of await run(`SELECT l.invoice_number ref, l.transaction_date date, GREATEST(l.debit_amount, l.credit_amount) amount, l.customer_id, c.name customer
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id LEFT JOIN order_amendments a ON a.id = l.reference_id
    WHERE l.reference_type IN ('order_amendments','order_amendment') AND (a.id IS NULL OR a.status <> 'approved')`))
  add('AMENDMENT_NOTE_NO_APPROVED_AMENDMENT', 'medium', { ...r, detail: 'ledger note refers to an amendment that is missing or not approved' })
// 7 ── opening dues
for (const r of await run(`SELECT c.id customer_id, c.name customer, c.initial_due amount FROM customers c
    WHERE c.initial_due <> 0 AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.customer_id = c.id AND l.transaction_type = 'opening_balance')`))
  add('INITIAL_DUE_NOT_IN_LEDGER', 'high', { ...r, ref: 'initial_due', detail: `customer record says opening due ৳${r.amount} but the ledger has no opening-balance line — is it owed or already settled?` })
for (const r of await run(`SELECT l.customer_id, IFNULL(c.name, '(no such customer)') customer, l.transaction_date date, l.debit_amount - l.credit_amount amount, l.id ref
    FROM customer_ledger l LEFT JOIN customers c ON c.id = l.customer_id WHERE c.id IS NULL OR l.customer_id = 0`))
  add('LEDGER_ROW_NO_CUSTOMER', 'high', { ...r, detail: 'ledger line is attached to customer 0 / a missing customer' })
// 8 ── duplicates
for (const r of await run(`SELECT l.customer_id, c.name customer, l.transaction_date date, GREATEST(l.debit_amount, l.credit_amount) amount, l.transaction_type ref, COUNT(*) n
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id GROUP BY l.customer_id, c.name, l.transaction_date, l.transaction_type, l.debit_amount, l.credit_amount, l.invoice_number HAVING n > 1`))
  add('POSSIBLE_DUPLICATE_LINE', 'medium', { ...r, detail: `${r.n} identical lines on the same day` })
// 9 ── manual adjustments worth a human look (large)
for (const r of await run(`SELECT l.customer_id, c.name customer, l.transaction_date date, GREATEST(l.debit_amount, l.credit_amount) amount, l.transaction_type ref, l.description
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id WHERE l.reference_type = 'manual_adjustment' AND GREATEST(l.debit_amount, l.credit_amount) >= 500000 ORDER BY amount DESC`))
  add('LARGE_MANUAL_ADJUSTMENT', 'review', { ...r, detail: r.description })
// 10 ── cached balance vs ledger
for (const r of await run(`SELECT c.id customer_id, c.name customer, c.current_balance stored, COALESCE(l.b, 0) ledger FROM customers c
    LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
    WHERE ABS(c.current_balance - COALESCE(l.b, 0)) > 0.01`))
  add('STORED_BALANCE_WRONG', 'medium', { ...r, ref: 'current_balance', amount: Number(r.stored) - Number(r.ledger), detail: `stored ৳${r.stored} vs ledger ৳${Number(r.ledger).toFixed(2)}` })
// 11 ── order paid vs allocations
for (const r of await run(`SELECT o.order_number ref, o.order_date date, o.customer_id, c.name customer, o.amount_paid + o.advance_paid recorded, COALESCE(a.s, 0) allocated
    FROM credit_orders o JOIN customers c ON c.id = o.customer_id
    LEFT JOIN (SELECT pa.order_id, SUM(pa.allocated_amount) s FROM payment_allocations pa WHERE pa.reversed = 0 GROUP BY pa.order_id) a ON a.order_id = o.id
    WHERE o.status IN ${DISP} AND ABS((o.amount_paid + o.advance_paid) - COALESCE(a.s, 0)) > 1`))
  add('ORDER_PAID_VS_ALLOCATIONS', 'medium', { ...r, amount: Number(r.recorded) - Number(r.allocated), detail: `order says paid ৳${r.recorded}, payment allocations add up to ৳${r.allocated}` })

  return exceptions
}

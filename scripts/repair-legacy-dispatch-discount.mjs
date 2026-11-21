#!/usr/bin/env node
/**
 * Repair LEGACY invoices whose ledger / journal still carry the pre-discount amount.
 *
 * Cause (fixed in the legacy app, 21 Nov 2026): a dispatcher discount given at dispatch updated credit_orders
 * but a re-dispatch skipped the once-only invoice post, so customer_ledger + the journal stayed at the old total.
 * Fingerprint: exactly one invoice ledger row, no amendment / return notes, and (order total − ledger) == −discount_amount.
 *
 * What it does per order (same restatement the new PHP helper syncPostedInvoiceToOrderTotal(in_place) performs):
 *   customer_ledger invoice debit → order total (old figure kept in the description)
 *   journal AR debit + Sales credit → order total
 *   balance_after of that row and every later row of the customer shifts by the delta
 *   customers.current_balance = SUM(debit − credit)
 *   invoice_snapshots totals refreshed
 * Nothing is deleted; every changed row's old values are written to scripts/repair-backups/ so it can be reversed.
 *
 *   node scripts/repair-legacy-dispatch-discount.mjs                         # DRY RUN: lists candidates and the exact change
 *   node scripts/repair-legacy-dispatch-discount.mjs --apply CR-…,CR-…       # applies ONLY the named orders, in one transaction each
 * Needs the SSH tunnel on 3307 (see scripts/README.md) and scripts/.env.sync. Take a database backup before --apply.
 */
import mysql from 'mysql2/promise'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(readFileSync(join(here, '.env.sync'), 'utf8').split('\n').map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')]))
const args = process.argv.slice(2), apply = args[0] === '--apply', named = apply ? String(args[1] ?? '').split(',').map(s => s.trim()).filter(Boolean) : []
if (apply && !named.length) { console.error('--apply needs the order numbers, e.g. --apply CR-20261028-0010,CR-20260920-0005'); process.exit(1) }
const money = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const r2 = n => Math.round(n * 100) / 100

const c = await mysql.createConnection({ host: env.LEGACY_DB_HOST === 'localhost' ? '127.0.0.1' : env.LEGACY_DB_HOST, port: env.LEGACY_DB_HOST === 'localhost' ? 3307 : Number(env.LEGACY_DB_PORT || 3306), user: env.LEGACY_DB_USER, password: env.LEGACY_DB_PASS, database: env.LEGACY_DB_NAME, decimalNumbers: true, dateStrings: true })
const q = async (s, p = []) => (await c.query(s, p))[0]

// candidates: one invoice row, nothing else posted against the order (amendments / returns), ledger = total + discount
const cands = await q(`SELECT co.id, co.order_number, co.customer_id, co.status, co.subtotal, co.discount_amount, co.total_amount, co.amount_paid, co.balance_due
  FROM credit_orders co WHERE co.status IN ('goods_on_board','shipped','delivered') AND co.discount_amount > 0
   AND (SELECT COUNT(*) FROM customer_ledger l WHERE l.reference_type='credit_orders' AND l.reference_id=co.id AND l.transaction_type='invoice') = 1
   AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type='credit_orders' AND l.reference_id=co.id AND l.transaction_type <> 'invoice')
   AND NOT EXISTS (SELECT 1 FROM order_amendments a JOIN customer_ledger l ON l.reference_type='order_amendments' AND l.reference_id=a.id WHERE a.order_id=co.id)
   AND NOT EXISTS (SELECT 1 FROM credit_order_returns r WHERE r.order_id=co.id AND r.status='approved')
   AND ABS((SELECT l.debit_amount FROM customer_ledger l WHERE l.reference_type='credit_orders' AND l.reference_id=co.id AND l.transaction_type='invoice') - co.total_amount - co.discount_amount) < 0.01
   AND ABS(co.subtotal - co.discount_amount + co.tax_amount - co.total_amount) < 0.01
  ORDER BY co.id`)

const plans = []
for (const o of cands) {
  const [inv] = await q(`SELECT id, debit_amount, description, journal_entry_id FROM customer_ledger WHERE reference_type='credit_orders' AND reference_id=? AND transaction_type='invoice'`, [o.id])
  const lines = await q(`SELECT id, account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id=? ORDER BY id`, [inv.journal_entry_id])
  const ar = lines.find(l => l.debit_amount > 0), sales = lines.find(l => l.credit_amount > 0)
  const ok = lines.length === 2 && ar && sales && Math.abs(ar.debit_amount - inv.debit_amount) < 0.01 && Math.abs(sales.credit_amount - inv.debit_amount) < 0.01
  const [cust] = await q(`SELECT name, current_balance FROM customers WHERE id=?`, [o.customer_id])
  const [agg] = await q(`SELECT SUM(debit_amount-credit_amount) b, COUNT(*) n FROM customer_ledger WHERE customer_id=?`, [o.customer_id])
  const [later] = await q(`SELECT COUNT(*) n FROM customer_ledger WHERE customer_id=? AND id>?`, [o.customer_id, inv.id])
  const [snap] = await q(`SELECT id, subtotal, discount_amount, total_amount, balance_due FROM invoice_snapshots WHERE order_id=? LIMIT 1`, [o.id])
  const delta = r2(o.total_amount - inv.debit_amount)                       // negative
  plans.push({ o, inv, lines, ar, sales, ok, cust, agg, later: later.n, snap, delta, newBalance: r2(Number(agg.b) + delta) })
}

console.log(`${apply ? 'APPLY' : 'DRY RUN'} — ${cands.length} candidate order(s) match the fingerprint\n`)
for (const p of plans) {
  const { o, inv, cust } = p
  console.log(`${o.order_number}  ${cust.name}  (${o.status}, paid ৳${money(o.amount_paid)}, due ৳${money(o.balance_due)})`)
  console.log(`  ledger invoice #${inv.id}: debit ৳${money(inv.debit_amount)} → ৳${money(o.total_amount)}   (discount ৳${money(o.discount_amount)})`)
  console.log(`  journal #${inv.journal_entry_id}: AR debit and Sales credit ৳${money(inv.debit_amount)} → ৳${money(o.total_amount)}${p.ok ? '' : '   ⚠ journal shape unexpected — will be SKIPPED'}`)
  console.log(`  customer balance: stored ৳${money(cust.current_balance)}, ledger sum ৳${money(p.agg.b)} → ৳${money(p.newBalance)}   (${p.later} later ledger row(s) shift by ${money(p.delta)})`)
  console.log(`  invoice snapshot: ${p.snap ? `total ৳${money(p.snap.total_amount)}, discount ৳${money(p.snap.discount_amount)}${Math.abs(p.snap.total_amount - o.total_amount) > 0.01 ? ' → refreshed' : ' (already right)'}` : 'none'}`)
  if (Math.abs(Number(cust.current_balance) - Number(p.agg.b)) > 0.01) console.log(`  ⚠ stored balance already differs from the ledger sum by ৳${money(cust.current_balance - p.agg.b)} — it will be set to the ledger sum`)
}
if (!apply) { console.log('\nNothing was changed. To apply: take a backup, then re-run with --apply <order numbers>.'); process.exit(0) }

mkdirSync(join(here, 'repair-backups'), { recursive: true })
for (const no of named) {
  const p = plans.find(x => x.o.order_number === no)
  if (!p) { console.log(`\n✖ ${no}: not in the candidate list — skipped`); continue }
  if (!p.ok) { console.log(`\n✖ ${no}: journal shape unexpected — skipped`); continue }
  const { o, inv } = p
  try {
    await c.beginTransaction()
    const before = { order: o.order_number, ledger: await q(`SELECT * FROM customer_ledger WHERE customer_id=? AND id>=?`, [o.customer_id, inv.id]), lines: p.lines, customer: await q(`SELECT id, current_balance FROM customers WHERE id=?`, [o.customer_id]), snapshot: p.snap }
    const note = ` [Net of dispatch discount: ৳${money(inv.debit_amount)} → ৳${money(o.total_amount)}]`
    await c.query(`UPDATE customer_ledger SET debit_amount=?, description=? WHERE id=?`, [o.total_amount, inv.description + note, inv.id])
    await c.query(`UPDATE transaction_lines SET debit_amount=? WHERE id=?`, [o.total_amount, p.ar.id])
    await c.query(`UPDATE transaction_lines SET credit_amount=? WHERE id=?`, [o.total_amount, p.sales.id])
    await c.query(`UPDATE customer_ledger SET balance_after = balance_after + ? WHERE customer_id=? AND id>=?`, [p.delta, o.customer_id, inv.id])
    const [agg] = await q(`SELECT SUM(debit_amount-credit_amount) b FROM customer_ledger WHERE customer_id=?`, [o.customer_id])
    await c.query(`UPDATE customers SET current_balance=? WHERE id=?`, [r2(agg.b), o.customer_id])
    if (p.snap) await c.query(`UPDATE invoice_snapshots SET subtotal=?, discount_amount=?, total_amount=?, balance_due=? WHERE id=?`, [o.subtotal, o.discount_amount, o.total_amount, o.balance_due, p.snap.id])
    // verify before committing: journal balanced, ledger sum = stored balance
    const [jb] = await q(`SELECT SUM(debit_amount) d, SUM(credit_amount) cr FROM transaction_lines WHERE journal_entry_id=?`, [inv.journal_entry_id])
    if (Math.abs(jb.d - jb.cr) > 0.005) throw new Error('journal would be unbalanced')
    await c.commit()
    writeFileSync(join(here, 'repair-backups', `${no}.before.json`), JSON.stringify(before, null, 2))
    console.log(`\n✔ ${no} repaired — customer balance now ৳${money(agg.b)} (before-values saved to scripts/repair-backups/${no}.before.json)`)
  } catch (e) { await c.rollback(); console.log(`\n✖ ${no}: ${e.message} — rolled back, nothing changed`) }
}
await c.end()

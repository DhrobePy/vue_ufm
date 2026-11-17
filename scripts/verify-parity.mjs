#!/usr/bin/env node
/**
 * Cutover check: does the Vue database match legacy?  Read-only.
 *   • every customer's balance (legacy: initial_due + non-opening ledger  vs  Vue: sum of its ledger)
 *   • headline counts / totals of the main tables
 *   • current catalogue prices
 *   ssh -L 3307:localhost:3306 …   then   node scripts/verify-parity.mjs
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const dir = dirname(fileURLToPath(import.meta.url))
const env = { ...Object.fromEntries((existsSync(join(dir, '.env.sync')) ? readFileSync(join(dir, '.env.sync'), 'utf8') : '').split('\n')
  .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])), ...process.env }
const conn = (p) => mysql.createConnection({ host: env[`${p}_DB_HOST`] ?? '127.0.0.1', port: Number(env[`${p}_DB_PORT`] ?? 3307), user: env[`${p}_DB_USER`], password: env[`${p}_DB_PASS`], database: env[`${p}_DB_NAME`], decimalNumbers: true })
const l = await conn('LEGACY'), v = await conn('VUE')
const q = async (c, s) => (await c.query(s))[0]
let problems = 0
const row = (label, ok, detail) => { console.log(`${ok ? '✓' : '✗'} ${label.padEnd(34)} ${detail}`); if (!ok) problems++ }

const lb = new Map((await q(l, `SELECT c.id, c.name, c.initial_due + COALESCE((SELECT SUM(debit_amount - credit_amount) FROM customer_ledger x WHERE x.customer_id = c.id AND x.reference_type <> 'initial_due'), 0) b FROM customers c`)).map(r => [r.id, r]))
const vb = await q(v, `SELECT c.id, c.name, c.current_balance stored, COALESCE((SELECT SUM(debit_amount - credit_amount) FROM customer_ledger x WHERE x.customer_id = c.id), 0) b FROM customers c`)
// Customer 73's legacy record contradicts itself (stored balance ৳26,260, displayed ৳18,000 because an opening line is counted twice);
// this app shows the ledger figure. Listed here so it is not reported as a failure every time.
const KNOWN_LEGACY_QUIRKS = new Set([73])
const diff = vb.filter(r => lb.has(r.id) && Math.abs(lb.get(r.id).b - r.b) > 0.5 && !KNOWN_LEGACY_QUIRKS.has(r.id))
const onlyVue = vb.filter(r => !lb.has(r.id))
row('customer balances equal legacy', diff.length === 0, `${vb.length - diff.length - onlyVue.length} of ${lb.size} identical${diff.length ? ` · ${diff.length} differ: ${diff.slice(0, 5).map(d => `#${d.id} ${d.name} (legacy ${Math.round(lb.get(d.id).b)} / vue ${Math.round(d.b)})`).join('; ')}` : ''}`)
row('stored balance = ledger', vb.every(r => Math.abs(r.stored - r.b) < 0.5), `${vb.filter(r => Math.abs(r.stored - r.b) >= 0.5).length} stored balances off`)
vb.filter(r => KNOWN_LEGACY_QUIRKS.has(r.id) && lb.has(r.id) && Math.abs(lb.get(r.id).b - r.b) > 0.5).forEach(r => console.log(`  (known legacy quirk: #${r.id} ${r.name} legacy shows ${Math.round(lb.get(r.id).b)}, ledger says ${Math.round(r.b)})`))
if (onlyVue.length) console.log(`  (customers only in Vue: ${onlyVue.map(r => `#${r.id} ${r.name} ৳${Math.round(r.b)}`).join(', ')})`)

for (const [label, sql] of [
  ['credit orders', 'SELECT COUNT(*) n, ROUND(SUM(total_amount)) t FROM credit_orders'],
  ['customer payments', 'SELECT COUNT(*) n, ROUND(SUM(amount)) t FROM customer_payments'],
  ['customer ledger rows', `SELECT COUNT(*) n, ROUND(SUM(debit_amount) - SUM(credit_amount)) t FROM customer_ledger WHERE id < 1000000 AND customer_id NOT IN (${onlyVue.map(r => r.id).join(",") || 0})`],   // opening lines added here (id >= 1,000,000) and customers that exist only here are excluded
  ['purchase orders', 'SELECT COUNT(*) n, ROUND(SUM(total_paid)) t FROM purchase_orders_adnan'],
  ['goods received notes', 'SELECT COUNT(*) n, ROUND(SUM(quantity_received_kg)) t FROM goods_received_adnan'],
  ['expense vouchers', 'SELECT COUNT(*) n, ROUND(SUM(total_amount)) t FROM expense_vouchers'],
  ['bank transactions', 'SELECT COUNT(*) n, ROUND(SUM(amount)) t FROM bank_transactions'],
  ['suppliers', 'SELECT COUNT(*) n, 0 t FROM suppliers'],
]) { const [a] = await q(l, sql), [b] = await q(v, sql); row(label, a.n === b.n && a.t === b.t, `legacy ${a.n} / ${a.t}   vue ${b.n} / ${b.t}`) }

const pq = `SELECT variant_id, branch_id, unit_price FROM product_prices p WHERE id = (SELECT MAX(id) FROM product_prices x WHERE x.variant_id = p.variant_id AND x.branch_id = p.branch_id)`
const lp = await q(l, pq), vp = new Map((await q(v, pq)).map(r => [`${r.variant_id}|${r.branch_id}`, r.unit_price]))
const badP = lp.filter(r => !vp.has(`${r.variant_id}|${r.branch_id}`) || Math.abs(vp.get(`${r.variant_id}|${r.branch_id}`) - r.unit_price) > 0.005)
row('current catalogue prices', badP.length === 0, `${lp.length - badP.length} of ${lp.length} match`)
console.log(problems ? `\n${problems} check(s) need attention.` : '\nVue matches legacy on every check.')
await l.end(); await v.end(); process.exit(problems ? 1 : 0)

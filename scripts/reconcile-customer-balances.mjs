#!/usr/bin/env node
/**
 * Re-derive customers.current_balance (a cached figure) from the customer's own ledger:
 *   current_balance = SUM(debit) - SUM(credit)   (negative = the customer holds an advance / credit)
 * Dry run by default (prints every customer whose stored figure is wrong); --apply writes it.
 * Only customers.current_balance is touched — ledger rows are never changed.
 *
 *   ssh -L 3307:localhost:3306 …   then   node scripts/reconcile-customer-balances.mjs [--apply]
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const APPLY = process.argv.includes('--apply')
const dir = dirname(fileURLToPath(import.meta.url))
const env = { ...Object.fromEntries((existsSync(join(dir, '.env.sync')) ? readFileSync(join(dir, '.env.sync'), 'utf8') : '').split('\n')
  .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])), ...process.env }
const db = await mysql.createConnection({ host: env.VUE_DB_HOST ?? '127.0.0.1', port: Number(env.VUE_DB_PORT ?? 3307), user: env.VUE_DB_USER,
  password: env.VUE_DB_PASS, database: env.VUE_DB_NAME, decimalNumbers: false })

const [rows] = await db.query(
  `SELECT c.id, c.name, c.current_balance stored, COALESCE(l.b, 0) ledger
   FROM customers c LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
   WHERE ABS(c.current_balance - COALESCE(l.b, 0)) > 0.005 ORDER BY ABS(c.current_balance - COALESCE(l.b, 0)) DESC`)
console.log(`${rows.length} customer(s) whose stored balance differs from their ledger\n`)
console.table(rows.slice(0, 25).map(r => ({ id: r.id, name: r.name, stored: Number(r.stored), ledger: Number(r.ledger), diff: Number(r.stored) - Number(r.ledger) })))
if (rows.length > 25) console.log(`… and ${rows.length - 25} more`)
if (APPLY && rows.length) {
  await db.beginTransaction()
  try {
    await db.query(`UPDATE customers c JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
                    SET c.current_balance = l.b WHERE ABS(c.current_balance - l.b) > 0.005`)
    await db.query(`UPDATE customers c SET c.current_balance = 0 WHERE NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.customer_id = c.id) AND c.current_balance <> 0`)
    await db.commit()
    console.log('\nApplied.')
  } catch (e) { await db.rollback(); console.error('FAILED, nothing written:', e.message); process.exit(1) }
} else console.log('\nDry run only — nothing written. Re-run with --apply to fix.')
await db.end()

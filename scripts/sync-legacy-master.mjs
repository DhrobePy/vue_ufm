#!/usr/bin/env node
/**
 * Additive sync of the MASTER rows that transactional data points at: customers, products,
 * product_variants and the current (active) prices of newly-added variants.
 * Run this BEFORE scripts/sync-legacy-transactional.mjs so orders never reference a customer or
 * product that does not exist in Vue. Same rules as the transactional sync: dry run by default
 * (--apply to write), only ids missing in Vue are inserted, nothing existing is ever changed,
 * and a row is skipped (with a warning) if its natural key (phone / name / sku) already exists
 * in Vue under another id. Columns are limited to those present in BOTH databases.
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const APPLY = process.argv.includes('--apply')
const dir = dirname(fileURLToPath(import.meta.url))
const env = { ...Object.fromEntries((existsSync(join(dir, '.env.sync')) ? readFileSync(join(dir, '.env.sync'), 'utf8') : '').split('\n')
  .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])), ...process.env }
const open = (p) => mysql.createConnection({ host: env[`${p}_DB_HOST`] ?? '127.0.0.1', port: Number(env[`${p}_DB_PORT`] ?? 3307),
  user: env[`${p}_DB_USER`], password: env[`${p}_DB_PASS`], database: env[`${p}_DB_NAME`], timezone: '+00:00', dateStrings: true, decimalNumbers: false, charset: 'utf8mb4' })
const [legacy, vue] = [await open('LEGACY'), await open('VUE')]

const cols = async (c, t) => new Set((await c.query(`SELECT COLUMN_NAME n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [t]))[0].map(r => r.n))
const rows = []   // report
const warn = []

async function addMissing(table, { naturalKey, filter = () => true }) {
  const [lc, vc] = [await cols(legacy, table), await cols(vue, table)]
  const common = [...lc].filter(c => vc.has(c))
  const [lRows] = await legacy.query(`SELECT ${common.map(c => `\`${c}\``).join(',')} FROM \`${table}\``)
  const [vRows] = await vue.query(`SELECT * FROM \`${table}\``)
  const vIds = new Set(vRows.map(r => String(r.id)))
  const vKeys = new Set(vRows.map(r => naturalKey(r)).filter(Boolean))
  const out = []
  for (const r of lRows) {
    if (vIds.has(String(r.id)) || !filter(r)) continue
    const k = naturalKey(r)
    if (k && vKeys.has(k)) { warn.push(`${table} #${r.id}: "${k}" already exists in vue under another id — skipped`); continue }
    out.push(r)
  }
  rows.push({ table, legacy: lRows.length, vue: vRows.length, inserting: out.length })
  if (APPLY && out.length) {
    const cs = Object.keys(out[0])
    await vue.query(`INSERT INTO \`${table}\` (${cs.map(c => `\`${c}\``).join(',')}) VALUES ${out.map(() => `(${cs.map(() => '?').join(',')})`).join(',')}`,
      out.flatMap(r => cs.map(c => r[c] ?? null)))
  }
  return out
}

await vue.beginTransaction()
try {
  const customers = await addMissing('customers', { naturalKey: r => (r.name ?? '').trim().toLowerCase() })
  const products = await addMissing('products', { naturalKey: r => (r.base_name ?? '').trim().toLowerCase() })
  const variants = await addMissing('product_variants', { naturalKey: r => (r.sku ?? '').trim().toLowerCase() })

  // Current price of each NEW variant, for branches that exist in vue (full price history is not copied).
  const newVariantIds = variants.map(v => v.id)
  if (newVariantIds.length) {
    const [vBranches] = await vue.query('SELECT id FROM branches')
    const okBranch = new Set(vBranches.map(b => String(b.id)))
    const [lc, vc] = [await cols(legacy, 'product_prices'), await cols(vue, 'product_prices')]
    const common = [...lc].filter(c => vc.has(c) && c !== 'id')
    const [prices] = await legacy.query(`SELECT ${common.map(c => `\`${c}\``).join(',')} FROM product_prices WHERE is_active = 1 AND variant_id IN (?)`, [newVariantIds])
    const ins = prices.filter(p => okBranch.has(String(p.branch_id)))
    rows.push({ table: 'product_prices (active, new variants)', legacy: prices.length, vue: '-', inserting: ins.length })
    if (APPLY && ins.length) {
      const cs = Object.keys(ins[0])
      await vue.query(`INSERT INTO product_prices (${cs.map(c => `\`${c}\``).join(',')}) VALUES ${ins.map(() => `(${cs.map(() => '?').join(',')})`).join(',')}`,
        ins.flatMap(r => cs.map(c => r[c] ?? null)))
    }
  }
  if (APPLY) await vue.commit(); else await vue.rollback()
} catch (e) {
  await vue.rollback()
  console.error('FAILED — nothing was written:', e.message)
  process.exit(1)
}

console.table(rows)
if (warn.length) console.log(warn.join('\n'))
console.log(APPLY ? '\nApplied.' : '\nDry run only — no writes made. Re-run with --apply to write.')
await legacy.end(); await vue.end()

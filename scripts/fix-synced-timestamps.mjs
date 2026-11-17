#!/usr/bin/env node
/**
 * CUTOVER STEP: repair timestamps shifted by 6 hours.
 *
 * Rows copied by the EARLY syncs carry date-times exactly 6 hours earlier than legacy (a time-zone slip in that first script —
 * e.g. an entry made at 16:00 shows 10:00). Later syncs are exact. For every table present in both databases, every
 * date-time column (except updated_at) of every row with the same id where legacy is exactly +6h is set to legacy's value.
 * Dates (no time part) are never touched, and only the exact +6h pattern is changed.
 *
 *    Dry run by default;  node scripts/fix-synced-timestamps.mjs --apply
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const APPLY = process.argv.includes('--apply')
const dir = dirname(fileURLToPath(import.meta.url))
const env = { ...Object.fromEntries((existsSync(join(dir, '.env.sync')) ? readFileSync(join(dir, '.env.sync'), 'utf8') : '').split('\n')
  .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])), ...process.env }
const conn = (p) => mysql.createConnection({ host: env[`${p}_DB_HOST`] ?? '127.0.0.1', port: Number(env[`${p}_DB_PORT`] ?? 3307), user: env[`${p}_DB_USER`],
  password: env[`${p}_DB_PASS`], database: env[`${p}_DB_NAME`], dateStrings: true })
const legacy = await conn('LEGACY'), vue = await conn('VUE')
const q = async (c, sql, a = []) => (await c.query(sql, a))[0]
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
const ms = (s) => Date.parse(String(s).replace(' ', 'T') + 'Z')

const tcols = async (c) => {
  const rows = await q(c, `SELECT TABLE_NAME t, COLUMN_NAME c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND DATA_TYPE IN ('datetime','timestamp')
    AND COLUMN_NAME <> 'updated_at' AND TABLE_NAME IN (SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'id' AND COLUMN_KEY = 'PRI')
    AND TABLE_NAME IN (SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE')`)
  const m = new Map(); for (const r of rows) { if (!m.has(r.t)) m.set(r.t, new Set()); m.get(r.t).add(r.c) }
  return m
}
const [lm, vm] = [await tcols(legacy), await tcols(vue)]
const plan = []
for (const [t, lcols] of lm) {
  const vcols = vm.get(t); if (!vcols) continue
  for (const c of lcols) if (vcols.has(c)) plan.push([t, c])
}
const summary = []
let total = 0
if (APPLY) await vue.beginTransaction()
try {
  for (const [t, c] of plan) {
    const lRows = await q(legacy, `SELECT id, \`${c}\` v FROM \`${t}\` WHERE \`${c}\` IS NOT NULL`)
    if (!lRows.length) continue
    const lMap = new Map(lRows.map(r => [String(r.id), r.v]))
    const vRows = await q(vue, `SELECT id, \`${c}\` v FROM \`${t}\` WHERE \`${c}\` IS NOT NULL`)
    const fix = []
    for (const r of vRows) {
      const lv = lMap.get(String(r.id)); if (lv === undefined || lv === r.v) continue
      if (Math.abs((ms(lv) - ms(r.v)) / 3600000 - 6) < 0.001) fix.push([r.id, lv])
    }
    if (!fix.length) continue
    total += fix.length; summary.push({ table: t, column: c, rows_to_fix: fix.length })
    if (APPLY) {
      await vue.query(`CREATE TEMPORARY TABLE IF NOT EXISTS _ts_fix (id BIGINT UNSIGNED PRIMARY KEY, v DATETIME)`)
      await vue.query('TRUNCATE _ts_fix')
      for (const part of chunk(fix, 2000)) await vue.query(`INSERT INTO _ts_fix (id, v) VALUES ${part.map(() => '(?, ?)').join(',')}`, part.flat())
      await vue.query(`UPDATE \`${t}\` x JOIN _ts_fix f ON f.id = x.id SET x.\`${c}\` = f.v`)
    }
  }
  if (APPLY) await vue.commit()
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'} — ${total} date-time value(s) in ${summary.length} column(s) are exactly 6h early\n`)
  console.table(summary)
  if (!APPLY) console.log('\nDry run only — re-run with --apply.')
} catch (e) { if (APPLY) await vue.rollback(); console.error('FAILED:', e.message); process.exitCode = 1 }
await legacy.end(); await vue.end()

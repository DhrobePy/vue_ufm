#!/usr/bin/env node
/**
 * CUTOVER STEP: make the general ledger agree with legacy.
 *
 * The additive sync skips a legacy journal entry whose id is already used here by an unrelated entry, and Vue renumbered some bank/cash
 * GL accounts. So after syncing:
 *   (1) some legacy entries have no twin here           → inserted (new id, legacy uuid kept, lines mapped to this app's account ids)
 *   (2) some entries exist here but with a line missing → their lines are replaced with legacy's (only when legacy's entry is balanced
 *       and this one is not)
 *   (3) source rows pointing at an entry (customer ledger, GRN, supplier payment) are linked when the link is empty
 * Entries that exist only here (POS sales, expense vouchers legacy never posted) are LEFT ALONE and listed — they are real postings
 * that this app makes on purpose (legacy keeps POS in separate tables).
 *
 * "Same document" = same (related_document_type, related_document_id); an entry is "the same" when its lines match after account mapping.
 *    Dry run by default;  node scripts/repair-gl-parity.mjs --apply
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
  password: env[`${p}_DB_PASS`], database: env[`${p}_DB_NAME`], decimalNumbers: true, dateStrings: true })
const legacy = await conn('LEGACY'), vue = await conn('VUE')
const q = async (c, sql, a = []) => (await c.query(sql, a))[0]
const n2 = (x) => Number(x).toFixed(2)

// legacy account id → vue account id, by (name, account_number)
const lAcc = await q(legacy, 'SELECT id, name, account_number FROM chart_of_accounts')
const vAcc = await q(vue, 'SELECT id, name, account_number FROM chart_of_accounts')
const vByKey = new Map(vAcc.map(a => [`${a.name}|${a.account_number}`, a.id]))
const accMap = new Map(); const unmapped = []
for (const a of lAcc) { const v = vByKey.get(`${a.name}|${a.account_number}`); if (v != null) accMap.set(a.id, v); else unmapped.push(a) }

const load = async (c, mapAcc) => {
  const je = new Map((await q(c, 'SELECT id, uuid, transaction_date, description, related_document_type t, related_document_id r, responsible_employee_id, created_by_user_id, created_at, is_reversed FROM journal_entries')).map(r => [r.id, { ...r, lines: [] }]))
  for (const l of await q(c, 'SELECT journal_entry_id, account_id, debit_amount, credit_amount, description FROM transaction_lines')) {
    const e = je.get(l.journal_entry_id); if (e) e.lines.push({ ...l, account_id: mapAcc ? (mapAcc.get(l.account_id) ?? `L${l.account_id}`) : l.account_id })
  }
  return je
}
const [lj, vj] = [await load(legacy, accMap), await load(vue, null)]
const key = (e) => e.t && e.r ? `${e.t}/${e.r}` : `D:${e.transaction_date}:${(e.description || '').slice(0, 60)}`
const sig = (e) => e.lines.map(l => `${l.account_id}:${n2(l.debit_amount)}:${n2(l.credit_amount)}`).sort().join('|')
const bal = (e) => Math.abs(e.lines.reduce((a, l) => a + Number(l.debit_amount) - Number(l.credit_amount), 0)) < 0.005 && e.lines.length >= 2
const group = (m) => { const g = new Map(); for (const [id, e] of m) { const k = key(e); if (!g.has(k)) g.set(k, []); g.get(k).push({ id, e }) } return g }
const [lg, vg] = [group(lj), group(vj)]

const toInsert = [], toRelines = [], vueOnly = [], toDedupe = []
for (const [k, ls] of lg) {
  const vs = vg.get(k) ?? []; const used = new Set()
  const left = []
  for (const l of ls) { const i = vs.findIndex((x, ix) => !used.has(ix) && sig(x.e) === sig(l.e)); if (i >= 0) used.add(i); else left.push(l) }
  for (const l of left) {
    const j = vs.findIndex((x, ix) => !used.has(ix) && !bal(x.e))        // an unbalanced twin here → repair it
    if (j >= 0 && bal(l.e)) { used.add(j); toRelines.push({ l, v: vs[j] }) } else toInsert.push(l)
  }
  vs.forEach((x, ix) => {
    if (used.has(ix)) return
    // an extra copy of an entry that is already matched (same document, same lines) is a double posting
    if (ls.length < vs.length && vs.some((y, iy) => iy !== ix && used.has(iy) && sig(y.e) === sig(x.e))) toDedupe.push({ x, keep: vs.find((y, iy) => iy !== ix && used.has(iy) && sig(y.e) === sig(x.e)) })
    else vueOnly.push(x)
  })
}
for (const [k, vs] of vg) if (!lg.has(k)) vueOnly.push(...vs)
const stillOdd = toInsert.filter(x => x.e.lines.some(l => String(l.account_id).startsWith('L')))
const doInsert = toInsert.filter(x => !stillOdd.includes(x) && bal(x.e))
const unbalancedLegacy = toInsert.filter(x => !bal(x.e))

const show = (x) => `#${x.id} ${x.e.transaction_date} ${x.e.t}/${x.e.r} "${(x.e.description || '').slice(0, 55)}" ${x.e.lines.length} lines, dr ${n2(x.e.lines.reduce((a, l) => a + Number(l.debit_amount), 0))}`
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}   accounts mapped ${accMap.size}/${lAcc.length}${unmapped.length ? ` (UNMAPPED: ${unmapped.map(a => a.name).join(', ')})` : ''}`)
console.log(`\nInsert (legacy entry missing here): ${doInsert.length}`); doInsert.forEach(x => console.log('  +', show(x)))
console.log(`\nRe-line (half-posted here): ${toRelines.length}`); toRelines.forEach(({ l, v }) => console.log('  ~ vue', show(v), '\n    ← legacy', show(l)))
if (stillOdd.length) { console.log(`\nSkipped — uses an account missing here: ${stillOdd.length}`); stillOdd.forEach(x => console.log('  ?', show(x))) }
if (unbalancedLegacy.length) { console.log(`\nSkipped — legacy entry itself is unbalanced: ${unbalancedLegacy.length}`); unbalancedLegacy.forEach(x => console.log('  !', show(x))) }
console.log(`\nDouble postings here (extra copy removed): ${toDedupe.length}`); toDedupe.forEach(({ x, keep }) => console.log('  -', show(x), `(keeps #${keep.id})`))
console.log(`\nLeft alone (entries that exist only here): ${vueOnly.length}`); vueOnly.forEach(x => console.log('  =', show(x)))
const vUnbal = [...vj].filter(([, e]) => !bal(e) && !toRelines.some(r => r.v.id === e.id)).map(([id, e]) => ({ id, e }))
if (vUnbal.length) { console.log(`\nStill unbalanced here after repair: ${vUnbal.length}`); vUnbal.forEach(x => console.log('  !', show(x))) }

if (APPLY) {
  await vue.beginTransaction()
  try {
    const nextId = async () => Number((await q(vue, 'SELECT GREATEST(COALESCE(MAX(id),0), 999999) + 1 n FROM journal_entries'))[0].n)
    const lines = async (id, e) => { for (const l of e.lines) await vue.query('INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES (?,?,?,?,?)', [id, l.account_id, l.debit_amount, l.credit_amount, l.description]) }
    const linked = []
    for (const x of doInsert) {
      const id = await nextId(); const e = x.e
      const uuidFree = !(await q(vue, 'SELECT 1 FROM journal_entries WHERE uuid = ?', [e.uuid])).length
      await vue.query('INSERT INTO journal_entries (id, uuid, transaction_date, description, related_document_id, related_document_type, responsible_employee_id, created_by_user_id, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [id, uuidFree ? e.uuid : null, e.transaction_date, e.description, e.r, e.t, null, e.created_by_user_id ?? null, e.created_at])
      await lines(id, e); linked.push({ id, t: e.t, r: e.r })
    }
    for (const { l, v } of toRelines) { await vue.query('DELETE FROM transaction_lines WHERE journal_entry_id = ?', [v.id]); await lines(v.id, l.e) }
    for (const { x, keep } of toDedupe) {
      for (const [t, col] of [['customer_ledger', 'journal_entry_id'], ['goods_received_adnan', 'journal_entry_id'], ['purchase_payments_adnan', 'journal_entry_id'], ['expense_vouchers', 'journal_entry_id']])
        await vue.query(`UPDATE \`${t}\` SET \`${col}\` = ? WHERE \`${col}\` = ?`, [keep.id, x.id]).catch(() => {})
      await vue.query('DELETE FROM transaction_lines WHERE journal_entry_id = ?', [x.id]); await vue.query('DELETE FROM journal_entries WHERE id = ?', [x.id])
    }
    // source rows that should point at the entry
    for (const k of linked) {
      if (k.t === 'credit_orders') await vue.query(`UPDATE customer_ledger SET journal_entry_id = ? WHERE journal_entry_id IS NULL AND reference_type = 'credit_orders' AND reference_id = ? AND transaction_type = 'invoice'`, [k.id, k.r]).catch(() => {})
      if (k.t === 'grn_adnan') await vue.query(`UPDATE goods_received_adnan SET journal_entry_id = ? WHERE id = ? AND journal_entry_id IS NULL`, [k.id, k.r]).catch(() => {})
      if (k.t === 'purchase_payment_adnan') await vue.query(`UPDATE purchase_payments_adnan SET journal_entry_id = ? WHERE id = ? AND journal_entry_id IS NULL`, [k.id, k.r]).catch(() => {})
    }
    await vue.commit(); console.log('\nApplied.')
  } catch (e) { await vue.rollback(); console.error('FAILED:', e.message); process.exitCode = 1 }
} else console.log('\nDry run only — re-run with --apply.')
await legacy.end(); await vue.end()

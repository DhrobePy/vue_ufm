import { query } from '~/server/utils/db'

/**
 * GET /api/admin/db-viewer[?table=&page=&q=]   — READ-ONLY table browser, Superadmin only.
 * (Legacy's DB Viewer could also insert / edit / delete rows. That is deliberately not offered here: a raw edit skips every business rule —
 *  ledger entries, balances, audit trail — so changes go through the app's own screens, or a reviewed script.)
 * Table names are checked against the live table list; column names come from the database. Secret-looking columns and secret settings are hidden.
 */
const SECRET_COL = /pass(word|wd)|secret|token|api[_-]?key|refresh|private|otp|\bhash\b|_hash$/i
const SECRET_SETTING = /pass|secret|token|key|refresh|credential|oauth/i
const PER = 50

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (String((session?.user as any)?.role ?? '').toLowerCase() !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'The DB Viewer is for the Superadmin only' })
  const q = getQuery(event)

  const tables = await query<any>(`SELECT TABLE_NAME AS name, TABLE_ROWS AS approx_rows, TABLE_TYPE AS kind FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`)
  const table = String(q.table ?? '')
  if (!table) return { tables: tables.map(t => ({ name: t.name, rows: Number(t.approx_rows ?? 0), view: t.kind === 'VIEW' })) }
  if (!tables.some(t => t.name === table)) throw createError({ statusCode: 404, statusMessage: 'Unknown table' })

  const cols = await query<any>(`SELECT COLUMN_NAME AS name, DATA_TYPE AS type, COLUMN_KEY AS ckey FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`, [table])
  const visible = cols.filter(c => !SECRET_COL.test(c.name))
  const hidden = cols.filter(c => SECRET_COL.test(c.name)).map(c => c.name)
  const pk = cols.find(c => c.ckey === 'PRI')?.name ?? cols[0]?.name
  const page = Math.max(1, Number(q.page) || 1)
  const search = String(q.q ?? '').trim()
  const textCols = visible.filter(c => /char|text|enum|date|time|int|decimal|double|float/.test(c.type)).map(c => `\`${c.name}\``)
  const where = search && textCols.length ? `WHERE CONCAT_WS('¦', ${textCols.join(', ')}) LIKE ?` : ''
  const params = search && textCols.length ? [`%${search}%`] : []
  const [{ n }] = await query<any>(`SELECT COUNT(*) AS n FROM \`${table}\` ${where}`, params)
  const rows = await query<any>(`SELECT ${visible.map(c => `\`${c.name}\``).join(', ') || '1'} FROM \`${table}\` ${where} ${pk ? `ORDER BY \`${pk}\` DESC` : ''} LIMIT ${PER} OFFSET ${(page - 1) * PER}`, params)
  if (table === 'system_settings') for (const r of rows) if (SECRET_SETTING.test(String(r.setting_key ?? ''))) r.setting_value = '••••••••'
  const clip = (v: any) => (typeof v === 'string' && v.length > 400 ? v.slice(0, 400) + '…' : v)
  return { table, columns: visible.map(c => ({ name: c.name, type: c.type, pk: c.ckey === 'PRI' })), hidden, total: Number(n), page, per: PER,
    rows: rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, clip(v)]))) }
})

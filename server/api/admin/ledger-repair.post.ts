import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/admin/ledger-repair   { action: 'rebuild_running_balances', customer_id? }   — Superadmin only.
 * Recomputes each ledger line's running balance in date order. No debit, credit or balance total changes — only the "balance after" column
 * (back-dated entries leave it out of order). Customers whose column is already right are untouched.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (String((session?.user as any)?.role ?? '').toLowerCase() !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'Ledger Repair is for the Superadmin only' })
  const b = await readBody(event)
  if (b?.action !== 'rebuild_running_balances') throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  const userId = Number((session?.user as any)?.id ?? 1)

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const only = Number(b.customer_id) || 0
    const [bad] = await conn.query<any[]>(
      `SELECT DISTINCT customer_id FROM (
         SELECT customer_id, balance_after, SUM(debit_amount - credit_amount) OVER (PARTITION BY customer_id ORDER BY transaction_date, id) AS rb FROM customer_ledger ${only ? 'WHERE customer_id = ?' : ''}) t
       WHERE ABS(balance_after - rb) >= 0.5`, only ? [only] : [])
    for (const { customer_id } of bad) {
      await conn.query(
        `UPDATE customer_ledger l JOIN (SELECT id, SUM(debit_amount - credit_amount) OVER (ORDER BY transaction_date, id) AS rb FROM customer_ledger WHERE customer_id = ?) x ON x.id = l.id
         SET l.balance_after = x.rb WHERE l.customer_id = ?`, [customer_id, customer_id])
    }
    await auditLog(conn, { userId, action: 'ledger_running_balances_rebuilt', module: 'customers', recordType: 'customer_ledger', recordId: only || 0,
      description: `Rebuilt running balances in date order for ${bad.length} customer ledger(s)${only ? ` (customer #${only})` : ''}`, severity: 'warning' })
    await conn.commit()
    return { ok: true, customers: bad.length, message: bad.length ? `Running balances rebuilt for ${bad.length} customer(s).` : 'Nothing to rebuild — every running balance is already in order.' }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})

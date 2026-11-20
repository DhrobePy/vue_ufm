import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/admin/customer-reconciliation   { action: 'reconcile', customer_id } | { action: 'undo', history_id }
 * reconcile: set the stored balance to the ledger total and record old → new (reversible). undo: put the old stored balance back.
 */
export default defineEventHandler(async (event) => {
  const b = await readBody(event)
  const session = await getUserSession(event)
  const userId = Number((session?.user as any)?.id ?? 1), userName = (session?.user as any)?.name ?? 'admin'
  if (!['admin', 'superadmin'].includes(((session?.user as any)?.role ?? '').toLowerCase()))
    throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin can reconcile customer balances' })
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    if (b?.action === 'reconcile') {
      const [[c]] = await conn.query<any>(`SELECT id, name, current_balance FROM customers WHERE id = ? FOR UPDATE`, [Number(b.customer_id)])
      if (!c) throw createError({ statusCode: 404, statusMessage: 'Customer not found.' })
      const [[agg]] = await conn.query<any>(`SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS net FROM customer_ledger WHERE customer_id = ?`, [c.id])
      const trueBal = Math.round(Number(agg.net) * 100) / 100, oldBal = Number(c.current_balance)
      if (Math.abs(trueBal - oldBal) < 0.5) throw createError({ statusCode: 409, statusMessage: `${c.name} is already reconciled — nothing to do.` })
      await conn.query(`UPDATE customers SET current_balance = ? WHERE id = ?`, [trueBal, c.id])
      const [h] = await conn.query<any>(`INSERT INTO customer_balance_reconciliations (customer_id, old_balance, new_balance, status, reconciled_by_user_id) VALUES (?, ?, ?, 'active', ?)`, [c.id, oldBal, trueBal, userId])
      await auditLog(conn, { userId, action: 'balance_reconciled', module: 'customers', recordType: 'customer', recordId: c.id,
        description: `Reconciled stored balance for ${c.name} (#${c.id}) [history #${h.insertId}]: ৳${oldBal.toLocaleString()} → ৳${trueBal.toLocaleString()} by ${userName}`, severity: 'warning' })
      await conn.commit()
      return { ok: true, message: `${c.name} reconciled: ৳${oldBal.toLocaleString()} → ৳${trueBal.toLocaleString()}. This can be undone from the history.` }
    }
    if (b?.action === 'undo') {
      const [[r]] = await conn.query<any>(`SELECT r.*, c.name FROM customer_balance_reconciliations r JOIN customers c ON c.id = r.customer_id WHERE r.id = ? AND r.status = 'active' FOR UPDATE`, [Number(b.history_id)])
      if (!r) throw createError({ statusCode: 404, statusMessage: 'That reconciliation was not found, or has already been undone.' })
      await conn.query(`UPDATE customers SET current_balance = ? WHERE id = ?`, [Number(r.old_balance), r.customer_id])
      await conn.query(`UPDATE customer_balance_reconciliations SET status = 'reverted', reverted_by_user_id = ?, reverted_at = NOW() WHERE id = ?`, [userId, r.id])
      await auditLog(conn, { userId, action: 'balance_reconciliation_reverted', module: 'customers', recordType: 'customer', recordId: r.customer_id,
        description: `Undid reconciliation #${r.id} for ${r.name}: stored balance restored to ৳${Number(r.old_balance).toLocaleString()} by ${userName}`, severity: 'warning' })
      await conn.commit()
      return { ok: true, message: `${r.name}: stored balance restored to ৳${Number(r.old_balance).toLocaleString()}.` }
    }
    throw createError({ statusCode: 400, statusMessage: 'Unknown action.' })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})

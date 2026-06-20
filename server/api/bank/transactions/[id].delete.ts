import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  const userId  = (session?.user as any)?.id   ?? 1
  const userName = (session?.user as any)?.name ?? 'System'
  const ip      = getRequestIP(event) ?? null

  if (!['superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only Superadmin can permanently delete transactions' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [[txn]] = await conn.query<any>(`SELECT * FROM bank_transactions WHERE id = ?`, [id])
    if (!txn) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })

    await conn.query(
      `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, notes)
       VALUES (?, 'deleted', ?, ?, ?, ?, 'PERMANENTLY DELETED by Superadmin')`,
      [id, userId, userName, ip, JSON.stringify(txn)],
    )
    await conn.query(`DELETE FROM bank_transactions WHERE id = ?`, [id])
    await conn.commit()
    return { message: `Transaction ${txn.transaction_number} permanently deleted` }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})

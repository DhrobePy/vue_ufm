import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { ids: number[]; action: 'unpost' | 'delete'; reason?: string }
  const { ids, action, reason } = body

  if (!ids?.length || !['unpost', 'delete'].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: 'ids (array) and action (unpost|delete) required' })
  }

  const session  = await getUserSession(event)
  const role     = ((session?.user as any)?.role ?? '').toLowerCase()
  const userId   = (session?.user as any)?.id   ?? 1
  const userName = (session?.user as any)?.name ?? 'System'
  const ip       = getRequestIP(event) ?? null
  const isAdmin  = ['admin', 'superadmin'].includes(role)

  if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Only admin can perform bulk actions' })
  if (action === 'delete' && role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Only Superadmin can bulk delete transactions' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    let affected = 0

    for (const id of ids) {
      const [[txn]] = await conn.query<any>(`SELECT * FROM bank_transactions WHERE id = ?`, [id])
      if (!txn) continue

      if (action === 'delete') {
        await conn.query(
          `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, notes)
           VALUES (?, 'deleted', ?, ?, ?, ?, ?)`,
          [id, userId, userName, ip, JSON.stringify(txn), reason ? `BULK DELETE: ${reason}` : 'BULK DELETE by Superadmin'],
        )
        await conn.query(`DELETE FROM bank_transactions WHERE id = ?`, [id])
      } else {
        await conn.query(
          `UPDATE bank_transactions SET status = 'unposted', updated_at = NOW() WHERE id = ?`, [id],
        )
        await conn.query(
          `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values, notes)
           VALUES (?, 'unposted', ?, ?, ?, ?, ?, ?)`,
          [id, userId, userName, ip,
            JSON.stringify({ status: txn.status }),
            JSON.stringify({ status: 'unposted' }),
            reason ? `BULK UNPOST: ${reason}` : 'Bulk unpost by admin'],
        )
      }
      affected++
    }

    await conn.commit()
    return { affected, message: `${affected} transaction(s) ${action}ed successfully` }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})

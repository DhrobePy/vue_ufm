import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event) as {
    bank_name?: string; account_name?: string; branch_name?: string
    account_number?: string; account_type?: string; opening_balance?: number; status?: string
  }

  const session  = await getUserSession(event)
  const userId   = (session?.user as any)?.id   ?? 1
  const role     = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [[old]] = await conn.query<any>(`SELECT * FROM bank_tx_accounts WHERE id = ?`, [id])
    if (!old) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

    const sets: string[] = []
    const vals: any[]   = []
    const fields = ['bank_name','account_name','branch_name','account_number','account_type','opening_balance','status'] as const
    for (const f of fields) {
      if (body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(body[f]) }
    }
    if (!sets.length) { await conn.rollback(); return { message: 'Nothing to update' } }

    sets.push('updated_at = NOW()')
    await conn.query(`UPDATE bank_tx_accounts SET ${sets.join(', ')} WHERE id = ?`, [...vals, id])
    await auditLog(conn, { userId, action: 'user_updated', module: 'bank', recordType: 'bank_account', recordId: id, description: `Bank account "${old.bank_name}" updated` })
    await conn.commit()
    return { message: 'Account updated successfully' }
  } catch (err) {
    await conn.rollback(); throw err
  } finally { conn.release() }
})

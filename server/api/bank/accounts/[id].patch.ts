import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * PATCH /api/bank/accounts/:id
 * :id is bank_accounts.id (the unified list) — edits sync to the mirrored
 * bank_tx_accounts row too, so transaction/reconciliation/dashboard queries
 * (all keyed to bank_tx_account_id) see the same name/branch/status.
 */
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
    const [[old]] = await conn.query<any>(`SELECT * FROM bank_accounts WHERE id = ?`, [id])
    if (!old) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

    const sets: string[] = []
    const vals: any[]   = []
    const fields = ['bank_name','account_name','branch_name','account_number','account_type','status'] as const
    for (const f of fields) {
      if (body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(body[f]) }
    }
    if (body.opening_balance !== undefined) {
      sets.push('initial_balance = ?')
      vals.push(Number(body.opening_balance))
    }
    if (!sets.length) { await conn.rollback(); return { message: 'Nothing to update' } }

    sets.push('updated_at = NOW()')
    await conn.query(`UPDATE bank_accounts SET ${sets.join(', ')} WHERE id = ?`, [...vals, id])

    // Keep the mirror in sync (only the columns bank_tx_accounts actually has)
    if (old.legacy_tx_account_id) {
      const mirrorSets: string[] = []
      const mirrorVals: any[]    = []
      if (body.bank_name       !== undefined) { mirrorSets.push('bank_name = ?');       mirrorVals.push(body.bank_name) }
      if (body.account_name    !== undefined) { mirrorSets.push('account_name = ?');    mirrorVals.push(body.account_name) }
      if (body.branch_name     !== undefined) { mirrorSets.push('branch_name = ?');     mirrorVals.push(body.branch_name) }
      if (body.account_number  !== undefined) { mirrorSets.push('account_number = ?');  mirrorVals.push(body.account_number) }
      if (body.opening_balance !== undefined) { mirrorSets.push('opening_balance = ?'); mirrorVals.push(Number(body.opening_balance)) }
      if (body.status !== undefined) {
        mirrorSets.push('status = ?')
        mirrorVals.push(body.status === 'closed' ? 'inactive' : body.status)
      }
      if (mirrorSets.length) {
        mirrorSets.push('updated_at = NOW()')
        await conn.query(`UPDATE bank_tx_accounts SET ${mirrorSets.join(', ')} WHERE id = ?`, [...mirrorVals, old.legacy_tx_account_id])
      }
    }

    // Chart-of-accounts display name follows the bank/account name
    if ((body.bank_name !== undefined || body.account_name !== undefined) && old.chart_of_account_id) {
      const newBankName    = body.bank_name    ?? old.bank_name
      const newAccountName = body.account_name ?? old.account_name
      await conn.query(
        `UPDATE chart_of_accounts SET name = ? WHERE id = ?`,
        [`${newBankName} — ${newAccountName}`.slice(0, 255), old.chart_of_account_id],
      )
    }

    await auditLog(conn, { userId, action: 'user_updated', module: 'bank', recordType: 'bank_account', recordId: id, description: `Bank account "${old.bank_name}" updated` })
    await conn.commit()
    return { message: 'Account updated successfully' }
  } catch (err) {
    await conn.rollback(); throw err
  } finally { conn.release() }
})

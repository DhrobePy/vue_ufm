import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event) as { name?: string; nature?: string; description?: string; is_active?: boolean; action?: 'toggle'; chart_of_account_id?: number | null }

  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    const [[existing]] = await conn.query<any>(`SELECT * FROM bank_tx_transaction_types WHERE id = ?`, [id])
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Type not found' })

    if (body.action === 'toggle') {
      await conn.query(`UPDATE bank_tx_transaction_types SET is_active = NOT is_active WHERE id = ?`, [id])
      conn.release()
      return { message: `Type ${existing.is_active ? 'deactivated' : 'activated'}` }
    }

    const sets: string[] = []
    const vals: any[]   = []
    if (body.name        !== undefined) { sets.push('name = ?');        vals.push(body.name) }
    if (body.nature      !== undefined) { sets.push('nature = ?');      vals.push(body.nature) }
    if (body.description !== undefined) { sets.push('description = ?'); vals.push(body.description) }
    if (body.is_active   !== undefined) { sets.push('is_active = ?');   vals.push(body.is_active ? 1 : 0) }
    if (body.chart_of_account_id !== undefined) { sets.push('chart_of_account_id = ?'); vals.push(body.chart_of_account_id || null) }

    if (sets.length) {
      await conn.query(`UPDATE bank_tx_transaction_types SET ${sets.join(', ')} WHERE id = ?`, [...vals, id])
    }
    conn.release()
    return { message: 'Type updated' }
  } catch (err) {
    conn.release(); throw err
  }
})

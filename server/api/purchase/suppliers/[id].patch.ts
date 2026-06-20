import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event) as {
    company_name?: string; supplier_code?: string; contact_person?: string
    phone?: string; email?: string; address?: string; city?: string
    supplier_type?: string; credit_limit?: number; payment_terms?: string; status?: string; notes?: string
  }

  const session = await getUserSession(event)
  const userId  = (session?.user as any)?.id ?? 1

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [[sup]] = await conn.query<any>(`SELECT * FROM suppliers WHERE id = ?`, [id])
    if (!sup) throw createError({ statusCode: 404, statusMessage: 'Supplier not found' })

    const fields = ['company_name','supplier_code','contact_person','phone','email','address','city','supplier_type','credit_limit','payment_terms','status','notes'] as const
    const sets: string[] = []
    const vals: any[]   = []
    for (const f of fields) {
      if (body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(body[f]) }
    }
    if (!sets.length) { await conn.rollback(); return { message: 'Nothing to update' } }

    sets.push('updated_at = NOW()')
    await conn.query(`UPDATE suppliers SET ${sets.join(', ')} WHERE id = ?`, [...vals, id])
    await auditLog(conn, {
      userId, action: 'user_updated', module: 'purchase', recordType: 'supplier',
      recordId: id, description: `Supplier "${sup.company_name}" updated`,
    })
    await conn.commit()
    return { message: 'Supplier updated successfully' }
  } catch (err) {
    await conn.rollback(); throw err
  } finally { conn.release() }
})

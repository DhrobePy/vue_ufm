import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    company_name: string; supplier_code?: string; contact_person?: string
    phone?: string; email?: string; address?: string; city?: string
    supplier_type?: string; credit_limit?: number; payment_terms?: string; status?: string; notes?: string
  }

  if (!body.company_name?.trim()) throw createError({ statusCode: 422, statusMessage: 'company_name is required' })

  const session  = await getUserSession(event)
  const userId   = (session?.user as any)?.id ?? 1
  const role     = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin', 'accounts', 'superadmin'].includes(role) && !role.includes('account')) {
    throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' })
  }

  // Auto-generate supplier code if not provided
  const code = body.supplier_code?.trim() || `SUP-${Date.now().toString(36).toUpperCase().slice(-6)}`

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query<any>(
      `INSERT INTO suppliers
         (supplier_code, company_name, contact_person, phone, email, address, city,
          supplier_type, credit_limit, payment_terms, status, notes, current_balance, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [code, body.company_name.trim(), body.contact_person || null, body.phone || null,
        body.email || null, body.address || null, body.city || null,
        body.supplier_type || 'local', body.credit_limit || 0, body.payment_terms || null,
        body.status || 'active', body.notes || null, userId],
    )
    const newId = (result as any).insertId
    await auditLog(conn, {
      userId, action: 'user_created', module: 'purchase', recordType: 'supplier',
      recordId: newId, description: `Supplier "${body.company_name}" created`,
    })
    await conn.commit()
    return { id: newId, supplier_code: code, message: 'Supplier created successfully' }
  } catch (err) {
    await conn.rollback(); throw err
  } finally { conn.release() }
})

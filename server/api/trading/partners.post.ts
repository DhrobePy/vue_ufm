import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { ADMIN_ROLES, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

/**
 * POST /api/trading/partners
 *  action=link   { customer_id, supplier_id, name? } — link as one partner
 *  action=unlink { partner_id }                      — dissolve the link
 * Additive only: customers/suppliers rows are never merged, just tagged.
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role   = ((session.user as any).role ?? '').toLowerCase()

  const canLink = await userCanAction({
    userId, role, module: 'trading', page: 'partners', action: 'link_partner',
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES],
  })
  if (!canLink) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to manage business partners' })

  const action = String(body?.action ?? 'link')
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    if (action === 'unlink') {
      const partnerId = Number(body?.partner_id)
      if (!partnerId) throw createError({ statusCode: 400, statusMessage: 'partner_id required' })
      await conn.query(`UPDATE customers SET business_partner_id = NULL WHERE business_partner_id = ?`, [partnerId])
      await conn.query(`UPDATE suppliers SET business_partner_id = NULL WHERE business_partner_id = ?`, [partnerId])
      await conn.query(`DELETE FROM business_partners WHERE id = ?`, [partnerId])
      await auditLog(conn, {
        userId, action: 'deleted', module: 'trading', recordType: 'business_partner',
        recordId: partnerId, description: `Business partner #${partnerId} unlinked`, severity: 'info',
      })
      await conn.commit()
      return { ok: true }
    }

    const customerId = Number(body?.customer_id)
    const supplierId = Number(body?.supplier_id)
    if (!customerId || !supplierId)
      throw createError({ statusCode: 400, statusMessage: 'customer_id and supplier_id are required' })

    const [[cust]] = await conn.query<any>(
      `SELECT id, name, business_partner_id FROM customers WHERE id = ? FOR UPDATE`, [customerId])
    const [[supp]] = await conn.query<any>(
      `SELECT id, company_name, business_partner_id FROM suppliers WHERE id = ? FOR UPDATE`, [supplierId])
    if (!cust) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
    if (!supp) throw createError({ statusCode: 404, statusMessage: 'Supplier not found' })
    if (cust.business_partner_id) throw createError({ statusCode: 409, statusMessage: `${cust.name} is already linked to a partner` })
    if (supp.business_partner_id) throw createError({ statusCode: 409, statusMessage: `${supp.company_name} is already linked to a partner` })

    const name = String(body?.name || cust.name).slice(0, 180)
    const [res] = await conn.query<any>(
      `INSERT INTO business_partners (name, notes, created_by_user_id) VALUES (?, ?, ?)`,
      [name, body?.notes ?? null, userId],
    )
    const partnerId = res.insertId
    await conn.query(`UPDATE customers SET business_partner_id = ? WHERE id = ?`, [partnerId, customerId])
    await conn.query(`UPDATE suppliers SET business_partner_id = ? WHERE id = ?`, [partnerId, supplierId])

    await auditLog(conn, {
      userId, action: 'created', module: 'trading', recordType: 'business_partner',
      recordId: partnerId, referenceNumber: name,
      description: `Business partner "${name}" linked — customer ${cust.name} + supplier ${supp.company_name}`,
      severity: 'info',
    })
    await conn.commit()
    return { ok: true, id: partnerId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * PATCH /api/purchase/commodities/:id
 * Edits name/unit/status/GL account, and — when provided — wholesale-replaces
 * the origin list and supplier scoping (small, rarely-changed lists, so
 * delete-then-reinsert is simpler and just as correct as a diff).
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid commodity ID' })

  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role) && !role.includes('account')) {
    throw createError({ statusCode: 403, statusMessage: 'Only accounts/admin can manage the commodity catalog' })
  }
  const userId = Number((session?.user as any)?.id ?? 1)

  const body = await readBody(event)
  const { name, unit, inventory_account_id, status, origins, supplier_ids } = body ?? {}

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[current]] = await conn.query<any>(`SELECT name FROM purchase_commodities WHERE id = ?`, [id])
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Commodity not found' })

    const setParts: string[] = []
    const setParams: unknown[] = []
    if (name !== undefined)                 { setParts.push('name = ?');                 setParams.push(String(name).trim()) }
    if (unit !== undefined)                 { setParts.push('unit = ?');                 setParams.push(unit) }
    if (inventory_account_id !== undefined) { setParts.push('inventory_account_id = ?'); setParams.push(inventory_account_id || null) }
    if (status !== undefined)               { setParts.push('status = ?');               setParams.push(status) }
    if (setParts.length) {
      setParts.push('updated_at = NOW()')
      await conn.query(`UPDATE purchase_commodities SET ${setParts.join(', ')} WHERE id = ?`, [...setParams, id])
    }

    if (Array.isArray(origins)) {
      await conn.query(`DELETE FROM purchase_commodity_origins WHERE commodity_id = ?`, [id])
      const cleanOrigins = (origins as string[]).map(o => String(o).trim()).filter(Boolean)
      for (let i = 0; i < cleanOrigins.length; i++) {
        await conn.query(
          `INSERT INTO purchase_commodity_origins (commodity_id, origin_name, sort_order) VALUES (?, ?, ?)`,
          [id, cleanOrigins[i], i],
        )
      }
    }

    if (Array.isArray(supplier_ids)) {
      await conn.query(`DELETE FROM supplier_commodities WHERE commodity_id = ?`, [id])
      for (const supId of (supplier_ids as number[])) {
        await conn.query(
          `INSERT IGNORE INTO supplier_commodities (supplier_id, commodity_id) VALUES (?, ?)`,
          [Number(supId), id],
        )
      }
    }

    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'purchase',
      recordType:      'commodity',
      recordId:        id,
      referenceNumber: name ?? current.name,
      description:     `Commodity "${current.name}" updated`,
      severity:        'info',
    })

    await conn.commit()
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

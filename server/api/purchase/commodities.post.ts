import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/** POST /api/purchase/commodities — create a commodity + its origin list + optional supplier scoping. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role) && !role.includes('account')) {
    throw createError({ statusCode: 403, statusMessage: 'Only accounts/admin can manage the commodity catalog' })
  }
  const userId = Number((session?.user as any)?.id ?? 1)

  const body = await readBody(event)
  const {
    name, unit = 'KG', inventory_account_id = null,
    origins = [] as string[], supplier_ids = [] as number[],
  } = body ?? {}

  if (!name || !String(name).trim())
    throw createError({ statusCode: 422, statusMessage: 'Commodity name is required' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [result] = await conn.query<any>(
      `INSERT INTO purchase_commodities (name, unit, inventory_account_id, status) VALUES (?, ?, ?, 'active')`,
      [String(name).trim(), unit, inventory_account_id || null],
    )
    const id = result.insertId

    const cleanOrigins = (origins as string[]).map(o => String(o).trim()).filter(Boolean)
    for (let i = 0; i < cleanOrigins.length; i++) {
      await conn.query(
        `INSERT INTO purchase_commodity_origins (commodity_id, origin_name, sort_order) VALUES (?, ?, ?)`,
        [id, cleanOrigins[i], i],
      )
    }
    for (const supId of (supplier_ids as number[])) {
      await conn.query(
        `INSERT IGNORE INTO supplier_commodities (supplier_id, commodity_id) VALUES (?, ?)`,
        [Number(supId), id],
      )
    }

    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'purchase',
      recordType:      'commodity',
      recordId:        id,
      referenceNumber: name,
      description:     `Commodity "${name}" (${unit}) added to procurement catalog — ${cleanOrigins.length} origin(s), ${supplier_ids.length} linked supplier(s)`,
      severity:        'info',
    })

    await conn.commit()
    return { ok: true, id }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

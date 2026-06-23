import { query, getDb } from '~/server/utils/db'

const ACCOUNTS_ROLES = ['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ACCOUNTS_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const variantId = Number(getRouterParam(event, 'variantId'))
  if (!variantId) throw createError({ statusCode: 400, statusMessage: 'Invalid variant ID' })

  const body = await readBody(event)
  const { branch_id, note } = body ?? {}

  if (!branch_id)
    throw createError({ statusCode: 400, statusMessage: 'branch_id is required' })

  const changedBy = (session?.user as any)?.name ?? 'System'

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Fetch currently active price before archiving
    const [rows] = await conn.query(
      `SELECT id, unit_price FROM product_prices
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1 LIMIT 1`,
      [variantId, branch_id],
    ) as any

    if (!rows.length) {
      await conn.rollback()
      throw createError({ statusCode: 404, statusMessage: 'No active price found to archive' })
    }

    const currentPrice = rows[0].unit_price

    // Deactivate the price
    await conn.query(
      `UPDATE product_prices SET is_active = 0, status = 'archived'
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
      [variantId, branch_id],
    )

    // Log the archive action
    await conn.query(
      `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by, note)
       VALUES (?, ?, ?, NULL, 'archive', ?, ?)`,
      [variantId, branch_id, currentPrice, changedBy, note || null],
    )

    await conn.commit()
    return { ok: true, message: 'Price archived' }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

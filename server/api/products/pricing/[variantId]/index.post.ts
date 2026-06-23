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
  const { branch_id, unit_price, effective_date, status } = body ?? {}

  if (!branch_id || unit_price == null)
    throw createError({ statusCode: 400, statusMessage: 'branch_id and unit_price are required' })

  const price    = Number(unit_price)
  if (isNaN(price) || price < 0)
    throw createError({ statusCode: 400, statusMessage: 'Invalid unit_price' })

  const date     = effective_date || new Date().toISOString().slice(0, 10)
  const priceStatus = ['active', 'promotional'].includes(status) ? status : 'active'
  const changedBy = (session?.user as any)?.name ?? 'System'

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Capture old active price for audit
    const [oldRows] = await conn.query(
      `SELECT id, unit_price FROM product_prices
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1 LIMIT 1`,
      [variantId, branch_id],
    ) as any
    const oldPrice = oldRows[0]?.unit_price ?? null
    const changeType = oldPrice !== null ? 'update' : 'set'

    // Deactivate existing active price for this variant+branch
    await conn.query(
      `UPDATE product_prices SET is_active = 0
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
      [variantId, branch_id],
    )

    // Insert new active price
    const [ins] = await conn.query(
      `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [variantId, branch_id, price, date, priceStatus],
    ) as any

    // Log to price_change_log
    await conn.query(
      `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variantId, branch_id, oldPrice, price, changeType, changedBy],
    )

    await conn.commit()
    return { ok: true, priceId: ins.insertId, changeType }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

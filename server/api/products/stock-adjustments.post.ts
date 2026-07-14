import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { nextDocNumber } from '~/server/utils/creditOrders'

const PROD_ROLES = ['admin', 'superadmin', 'production manager-srg', 'production manager-demra']

/**
 * POST /api/products/stock-adjustments
 * Record an inventory correction (spec §2.9). Maker/checker: always lands
 * 'pending' — a DIFFERENT authorised user must approve before stock moves.
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role   = ((session.user as any).role ?? '').toLowerCase()
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Production or admin only' })

  const variantId = Number(body?.variant_id)
  const delta     = Number(body?.delta)
  const reason    = String(body?.reason ?? '').trim()
  const notes     = body?.notes ? String(body.notes).slice(0, 500) : null

  if (!variantId) throw createError({ statusCode: 400, statusMessage: 'variant_id required' })
  if (!delta || !Number.isFinite(delta)) throw createError({ statusCode: 400, statusMessage: 'delta must be a non-zero number' })
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[variant]] = await conn.query<any>(
      `SELECT pv.id, pv.sku, pv.stock_qty, p.base_name AS product_name
       FROM product_variants pv JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [variantId],
    )
    if (!variant) throw createError({ statusCode: 404, statusMessage: 'Variant not found' })

    const adjNo = await nextDocNumber(conn, 'ADJ', 'stock_adjustments')
    const [res] = await conn.query<any>(
      `INSERT INTO stock_adjustments (adj_number, variant_id, delta, reason, notes, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [adjNo, variantId, delta, reason, notes, userId],
    )

    await auditLog(conn, {
      userId, action: 'other', module: 'products',
      recordType: 'stock_adjustment', recordId: res.insertId, referenceNumber: adjNo,
      description: `Stock adjustment ${adjNo} for ${variant.product_name} (${variant.sku}) — ${delta > 0 ? '+' : ''}${delta} — ${reason} — pending approval`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(
      `📦 <b>Stock Adjustment Recorded</b>\n${adjNo} — ${variant.product_name} (${variant.sku})\n` +
      `${delta > 0 ? '+' : ''}${delta} bags · ${reason}\nPending approval`,
    )
    return { ok: true, adj_number: adjNo, id: res.insertId, status: 'pending' }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

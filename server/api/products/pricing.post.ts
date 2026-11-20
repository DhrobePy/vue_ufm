import { requireAction } from '~/server/utils/permissions'
import { getDb } from '~/server/utils/db'
import { priceAutoApplyEnabled, applyPriceChangeToOpenOrders } from '~/server/utils/priceSync'

/**
 * Set / deactivate ONE variant price for a branch — same steps as legacy product/pricing.php:
 *   set_price   archive the active price → insert the new one → write the price history (old → new) → optionally carry the change
 *               into open, not-yet-invoiced orders (only when "auto-apply to orders" is switched on in the pricing engine settings)
 *   deactivate  archive the price and log it
 */
export default defineEventHandler(async (event) => {
  await requireAction(event, { module: 'products', page: 'pricing', action: 'edit', roleFallback: [] },
    'Only admin (or a user granted Products → Pricing) may change prices')
  const session = await getUserSession(event)
  const changedBy = (session?.user as any)?.name ?? 'System'
  const userId = Number((session?.user as any)?.id ?? 1)
  const body = await readBody(event)
  const { action, variantId, branchId, unitPrice, effectiveDate, status, priceId } = body ?? {}

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    if (action === 'set_price') {
      if (!variantId || !branchId || unitPrice == null)
        throw createError({ statusCode: 400, statusMessage: 'variantId, branchId and unitPrice are required' })
      const price = Number(unitPrice)
      if (isNaN(price) || price < 0) throw createError({ statusCode: 400, statusMessage: 'Invalid unit price' })
      const date = effectiveDate || new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)

      const [[old]] = await conn.query<any>(`SELECT unit_price FROM product_prices WHERE variant_id = ? AND branch_id = ? AND is_active = 1 LIMIT 1`, [variantId, branchId])
      const oldPrice = old ? Number(old.unit_price) : null

      await conn.query(`UPDATE product_prices SET is_active = 0 WHERE variant_id = ? AND branch_id = ? AND is_active = 1`, [variantId, branchId])
      const [res] = await conn.query<any>(
        `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
        [variantId, branchId, price, date, status || 'active'])
      await conn.query(
        `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [variantId, branchId, oldPrice, price, oldPrice !== null ? 'update' : 'set', changedBy])

      let appliedOrders = 0
      if (await priceAutoApplyEnabled(conn))
        appliedOrders = (await applyPriceChangeToOpenOrders(conn, { variantId: Number(variantId), branchId: Number(branchId), oldPrice, newPrice: price, userId, label: changedBy })).orders
      await conn.commit()
      return { ok: true, priceId: res.insertId, appliedToOrders: appliedOrders }
    }

    if (action === 'deactivate') {
      if (!priceId) throw createError({ statusCode: 400, statusMessage: 'priceId is required' })
      const [[row]] = await conn.query<any>(`SELECT variant_id, branch_id, unit_price FROM product_prices WHERE id = ?`, [priceId])
      await conn.query(`UPDATE product_prices SET is_active = 0, status = 'inactive' WHERE id = ?`, [priceId])
      if (row) await conn.query(
        `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by) VALUES (?, ?, ?, NULL, 'archive', ?)`,
        [row.variant_id, row.branch_id, Number(row.unit_price), changedBy])
      await conn.commit()
      return { ok: true }
    }

    throw createError({ statusCode: 400, statusMessage: 'Unknown action. Use set_price or deactivate.' })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})

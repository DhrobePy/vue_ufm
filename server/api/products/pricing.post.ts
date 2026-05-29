import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, variantId, branchId, unitPrice, effectiveDate, status, priceId } = body ?? {}

  // ── SET NEW PRICE (archive old → insert new) ──────────────────────────────
  if (action === 'set_price') {
    if (!variantId || !branchId || unitPrice == null)
      throw createError({ statusCode: 400, statusMessage: 'variantId, branchId and unitPrice are required' })

    const price = Number(unitPrice)
    if (isNaN(price) || price < 0)
      throw createError({ statusCode: 400, statusMessage: 'Invalid unit price' })

    const date = effectiveDate || new Date().toISOString().slice(0, 10)
    const priceStatus = status || 'active'

    // Deactivate any existing active price for this variant + branch
    await query(
      `UPDATE product_prices SET is_active = 0
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
      [variantId, branchId],
    )

    // Insert new active price
    const result = await query(
      `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [variantId, branchId, price, date, priceStatus],
    ) as any

    return { ok: true, priceId: result.insertId }
  }

  // ── DEACTIVATE / ARCHIVE A PRICE ─────────────────────────────────────────
  if (action === 'deactivate') {
    if (!priceId)
      throw createError({ statusCode: 400, statusMessage: 'priceId is required' })

    await query(
      `UPDATE product_prices SET is_active = 0, status = 'inactive' WHERE id = ?`,
      [priceId],
    )

    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action. Use set_price or deactivate.' })
})

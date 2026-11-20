import { getDb } from '~/server/utils/db'

const PROD_ROLES = ['admin', 'superadmin', 'production manager-srg', 'production manager-demra']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readBody(event) as {
    product_id: number
    weight_variant: string
    sku?: string
    grade?: string
    barcode?: string
    unit_of_measure?: string
    weight_kg?: number
    unit_price?: number
    cost_price?: number
  }

  const { product_id, weight_variant, sku, grade, barcode, unit_of_measure, weight_kg, unit_price, cost_price } = body

  if (!product_id || !weight_variant) {
    throw createError({ statusCode: 422, statusMessage: 'product_id and weight_variant are required' })
  }

  const validUom = ['pcs', 'litre', 'kg', 'gm', 'bag']
  const uom = unit_of_measure && validUom.includes(unit_of_measure) ? unit_of_measure : 'bag'

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    // A blank SKU is generated server-side the legacy way: BASE-WEIGHT[-G]
    let finalSku = sku?.trim() || null
    if (!finalSku) {
      const [[bp]] = await conn.query<any>(`SELECT base_sku FROM products WHERE id = ?`, [product_id])
      if (bp?.base_sku) {
        const g = String(grade ?? '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
        finalSku = [String(bp.base_sku).toUpperCase().trim(), String(weight_variant).replace(/[^a-zA-Z0-9]/g, '').toUpperCase(), ...(g ? [g.slice(0, 1)] : [])].join('-')
      }
    }
    const [result] = await conn.query<any>(
      `INSERT INTO product_variants
         (product_id, weight_variant, sku, grade, barcode, unit_of_measure, weight_kg, unit_price, cost_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id, weight_variant,
        finalSku,
        grade || null,
        barcode || null,
        uom,
        weight_kg ? Number(weight_kg) : null,
        unit_price || 0,
        cost_price || 0,
      ],
    )
    return { id: result.insertId, message: 'Variant created' }
  } finally {
    conn.release()
  }
})

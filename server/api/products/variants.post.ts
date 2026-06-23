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
    const [result] = await conn.query<any>(
      `INSERT INTO product_variants
         (product_id, weight_variant, sku, grade, barcode, unit_of_measure, weight_kg, unit_price, cost_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id, weight_variant,
        sku?.trim() || null,
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

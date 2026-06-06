import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    product_id: number
    weight_variant: string
    grade?: string
    barcode?: string
    unit_price?: number
    cost_price?: number
  }

  const { product_id, weight_variant, grade, barcode, unit_price, cost_price } = body

  if (!product_id || !weight_variant) {
    throw createError({ statusCode: 422, statusMessage: 'product_id and weight_variant are required' })
  }

  const db   = await getDb()
  const conn = await db.getConnection()
  try {
    const [result] = await conn.query<any>(
      `INSERT INTO product_variants (product_id, weight_variant, grade, barcode, unit_price, cost_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product_id, weight_variant, grade || null, barcode || null, unit_price || 0, cost_price || 0],
    )
    return { id: result.insertId, message: 'Variant created' }
  } finally {
    conn.release()
  }
})

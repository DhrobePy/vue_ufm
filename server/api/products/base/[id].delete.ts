import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

const ADMIN_ROLES = ['admin', 'superadmin']

/**
 * Deleting a base product cascade-archives its variants and prices too —
 * otherwise a deleted product's variants stay status='active' and keep
 * surfacing (with live prices) in any query that doesn't explicitly join
 * back to products.status, e.g. POS/dispatch item pickers.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const id     = Number(getRouterParam(event, 'id'))
  const userId = Number((session?.user as any)?.id) || 1
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[product]] = await conn.query<any>(
      `SELECT id, base_name, status FROM products WHERE id = ? FOR UPDATE`, [id],
    )
    if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    if (product.status === 'deleted')
      throw createError({ statusCode: 400, statusMessage: 'Product is already deleted' })

    await conn.query(`UPDATE products SET status = 'deleted' WHERE id = ?`, [id])

    const [variantRows] = await conn.query<any>(
      `SELECT id FROM product_variants WHERE product_id = ? AND status = 'active'`, [id],
    )
    const variantIds = (variantRows as any[]).map(v => v.id)

    if (variantIds.length) {
      await conn.query(
        `UPDATE product_variants SET status = 'inactive' WHERE id IN (?)`, [variantIds],
      )
      await conn.query(
        `UPDATE product_prices SET is_active = 0 WHERE variant_id IN (?) AND is_active = 1`, [variantIds],
      )
    }

    await auditLog(conn, {
      userId, action: 'deleted', module: 'products',
      recordType: 'product', recordId: id,
      description: `Product "${product.base_name}" deleted — cascade-archived ${variantIds.length} variant(s) and their active prices`,
      severity: 'warning',
    })

    await conn.commit()
    return { ok: true, message: `Product deleted (${variantIds.length} variant(s) archived)` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const body = await readBody(event)
  const { base_name, base_sku, category, description, status } = body

  if (!base_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Product name is required' })

  const validStatuses = ['active', 'inactive']
  if (status && !validStatuses.includes(status))
    throw createError({ statusCode: 400, statusMessage: 'status must be active or inactive' })

  const result = await query(
    `UPDATE products
     SET base_name = ?, base_sku = ?, category = ?, description = ?, status = ?
     WHERE id = ? AND status != 'deleted'`,
    [base_name.trim(), base_sku?.trim() || null, category || 'Flour', description || null, status || 'active', id],
  ) as any

  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  return { ok: true, message: 'Product updated' }
})

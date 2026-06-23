import { query } from '~/server/utils/db'

const PROD_ROLES = ['admin', 'superadmin', 'production manager-srg', 'production manager-demra']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readBody(event)
  const { base_name, base_sku, category, description } = body

  if (!base_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Product name is required' })

  const result = await query(
    `INSERT INTO products (base_name, base_sku, category, description, status) VALUES (?, ?, ?, ?, 'active')`,
    [base_name.trim(), base_sku?.trim() || null, category || 'Flour', description || null],
  ) as any

  return { id: result.insertId, message: 'Product created' }
})

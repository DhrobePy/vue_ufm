import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { base_name, category, description } = body

  if (!base_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Product name is required' })

  const result = await query(
    `INSERT INTO products (base_name, category, description, status) VALUES (?, ?, ?, 'active')`,
    [base_name.trim(), category || 'Flour', description || null],
  ) as any

  return { id: result.insertId, message: 'Product created' }
})

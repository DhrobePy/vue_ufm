import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })

  const body = await readBody(event)

  const {
    name,
    business_name,
    phone_number,
    business_address,
    customer_type,
    credit_limit,
    status,
  } = body ?? {}

  if (!name || !phone_number)
    throw createError({ statusCode: 400, statusMessage: 'name and phone_number are required' })

  await query(
    `UPDATE customers
     SET name             = ?,
         business_name    = ?,
         phone_number     = ?,
         business_address = ?,
         customer_type    = ?,
         credit_limit     = ?,
         status           = ?,
         updated_at       = NOW()
     WHERE id = ?`,
    [
      name.trim(),
      business_name    || null,
      phone_number,
      business_address || null,
      customer_type    ?? 'Credit',
      credit_limit ? Number(credit_limit) : 0,
      status ?? 'active',
      id,
    ],
  )

  return { ok: true }
})

import { requireAction } from '~/server/utils/permissions'
import { ACCOUNTS_ROLES } from '~/server/utils/creditOrders'
import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireAction(event, { module: 'customers', page: 'list', action: 'edit', roleFallback: ACCOUNTS_ROLES },
    'Only Accounts / admin (or a user granted Customers → Edit) may edit customers')
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

  // Legacy rule: one customer per phone number (checked against everyone else).
  const dup = await queryOne<any>('SELECT id, name FROM customers WHERE phone_number = ? AND id <> ? LIMIT 1', [phone_number, id])
  if (dup) throw createError({ statusCode: 409, statusMessage: `Another customer already uses this phone number (${dup.name})` })

  // Changing the credit limit is its own power (Credit Limits page), not part of plain "edit customer".
  const cur = await queryOne<any>('SELECT credit_limit FROM customers WHERE id = ?', [id])
  if (cur && Number(cur.credit_limit ?? 0) !== (credit_limit ? Number(credit_limit) : 0))
    await requireAction(event, { module: 'credit_sales', page: 'credit-limits', action: 'update', roleFallback: ACCOUNTS_ROLES },
      'Only Accounts / admin (or a user granted Credit Limits) may change credit limits')

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

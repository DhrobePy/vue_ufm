import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customer_id, amount, method, notes } = body

  if (!customer_id || !amount || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: 'customer_id and positive amount are required' })

  const result = await query(
    `INSERT INTO customer_payments
       (customer_id, payment_date, amount, payment_method, notes, allocation_status, created_by_user_id)
     VALUES (?, CURDATE(), ?, ?, ?, 'unallocated', 1)`,
    [customer_id, Number(amount), method ?? 'cash', notes ?? null],
  ) as any

  return { id: result.insertId, message: 'Collection recorded' }
})

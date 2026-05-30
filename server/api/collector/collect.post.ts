import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customer_id, amount, method, notes } = body

  if (!customer_id || !amount || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: 'customer_id and positive amount are required' })

  // Map to actual payment_method ENUM values
  const methodMap: Record<string, string> = {
    cash:  'Cash',
    bkash: 'Mobile Banking',
    nagad: 'Mobile Banking',
    bank:  'Bank Transfer',
    Cash:  'Cash',
  }
  const mappedMethod = methodMap[method ?? ''] ?? 'Cash'

  // Generate payment number
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const [cnt] = await query<any>(
    `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`,
  )
  const seq    = String((cnt.n ?? 0) + 1).padStart(4, '0')
  const payNo  = `PAY-${today}-${seq}`

  const result = await query(
    `INSERT INTO customer_payments
       (payment_number, customer_id, payment_date, amount, payment_method,
        payment_type, allocation_status, allocated_amount, notes, created_by_user_id)
     VALUES (?, ?, CURDATE(), ?, ?, 'advance', 'unallocated', 0, ?, 1)`,
    [payNo, customer_id, Number(amount), mappedMethod, notes ?? null],
  ) as any

  return { id: result.insertId, payment_number: payNo, message: 'Collection recorded' }
})

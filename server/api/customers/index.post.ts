import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    name: string
    business_name?: string
    phone_number?: string
    email?: string
    business_address?: string
    customer_type?: 'Credit' | 'POS'
    credit_limit?: number
  }

  const { name, business_name, phone_number, email, business_address, customer_type, credit_limit } = body

  if (!name || !name.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Customer name is required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    const [result] = await conn.query<any>(
      `INSERT INTO customers
         (name, business_name, phone_number, email, business_address,
          customer_type, credit_limit, current_balance, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
      [
        name.trim(),
        business_name   || null,
        phone_number    || null,
        email           || null,
        business_address || null,
        customer_type   || 'Credit',
        credit_limit    || 0,
      ],
    )
    return { id: result.insertId, message: 'Customer created successfully' }
  } finally {
    conn.release()
  }
})

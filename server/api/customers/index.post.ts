import { getDb } from '~/server/utils/db'
import { ACCOUNTS_ROLES, SALES_ROLES } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role   = ((session.user as any).role ?? '').toLowerCase()

  const canCreate = await userCanAction({
    userId, role, module: 'customers', page: 'list', action: 'create',
    roleFallback: [...ACCOUNTS_ROLES, ...SALES_ROLES, 'collector'],
  })
  if (!canCreate)
    throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to create customers' })

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

import { getDb } from '~/server/utils/db'
import { ACCOUNTS_ROLES, SALES_ROLES, postCustomerLedger } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'
import { auditLog } from '~/server/utils/audit'

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
    opening_balance?: number
  }

  const { name, business_name, phone_number, email, business_address, customer_type, credit_limit, opening_balance } = body

  if (!name || !name.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Customer name is required' })
  }
  const openingBal = Math.max(0, Number(opening_balance) || 0)

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

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
    const customerId = result.insertId

    if (openingBal > 0.009) {
      const date = new Date().toISOString().slice(0, 10)
      const ledgerId = await postCustomerLedger(conn, {
        customerId,
        date,
        transactionType: 'opening_balance',
        referenceType: 'opening_balance',
        referenceId: 0,
        invoiceNumber: `OB-${customerId}`,
        description: `Opening balance — existing outstanding due carried into the system at customer creation`,
        debit: openingBal,
        credit: 0,
        journalEntryId: null, // memo-level, matches the manual-adjustment convention — no GL posting
        userId,
      })
      await auditLog(conn, {
        userId, action: 'created', module: 'customers',
        recordType: 'customer_ledger', recordId: ledgerId,
        description: `Opening balance ৳${openingBal.toLocaleString()} recorded for new customer "${name.trim()}"`,
        severity: 'info',
      })
    }

    await conn.commit()
    return { id: customerId, message: 'Customer created successfully' }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

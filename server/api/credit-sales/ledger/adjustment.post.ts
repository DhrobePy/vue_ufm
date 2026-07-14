import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES, postCustomerLedger } from '~/server/utils/creditOrders'

/**
 * POST /api/credit-sales/ledger/adjustment
 * Manual ledger reconciliation memo (spec §2.10) — admin only.
 * Body: { customer_id, direction: 'debit' | 'credit', amount, reason }
 * Memo-level: no journal entry, just a ledger row + balance sync.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const body        = await readBody(event)
  const customerId  = Number(body?.customer_id)
  const direction   = body?.direction === 'credit' ? 'credit' : body?.direction === 'debit' ? 'debit' : null
  const amount      = Number(body?.amount ?? 0)
  const reason      = String(body?.reason ?? '').trim()

  if (!customerId) throw createError({ statusCode: 400, statusMessage: 'customer_id required' })
  if (!direction) throw createError({ statusCode: 400, statusMessage: 'direction must be "debit" or "credit"' })
  if (!amount || amount <= 0) throw createError({ statusCode: 400, statusMessage: 'amount must be greater than zero' })
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'reason is required for a manual adjustment' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[customer]] = await conn.query<any>(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`, [customerId],
    )
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    const date = new Date().toISOString().slice(0, 10)
    const ledgerId = await postCustomerLedger(conn, {
      customerId,
      date,
      transactionType: 'adjustment',
      referenceType: 'manual_adjustment',
      referenceId: 0,
      invoiceNumber: `ADJ-${Date.now()}`,
      description: `Manual ${direction} adjustment — ${reason}`,
      debit:  direction === 'debit'  ? amount : 0,
      credit: direction === 'credit' ? amount : 0,
      journalEntryId: null, // memo-level — no GL posting, per spec §2.10
      userId,
    })

    await auditLog(conn, {
      userId, action: 'updated', module: 'credit_sales',
      recordType: 'customer_ledger', recordId: ledgerId,
      description: `Manual ${direction} adjustment for ${customer.name} — ৳${amount.toLocaleString()} — ${reason}`,
      severity: 'critical',
    })

    await conn.commit()
    sendTelegram(
      `📝 <b>Manual Ledger Adjustment</b>\n${customer.name}\n` +
      `${direction === 'debit' ? '+' : '−'}৳${amount.toLocaleString()} (${direction})\nReason: ${reason}\nby ${userName}`,
    )
    return { ok: true, id: ledgerId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

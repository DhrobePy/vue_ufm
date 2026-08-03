import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole } from '~/server/utils/creditOrders'

/**
 * POST /api/pos/eod — submit an end-of-day cash count. "Expected" is the
 * live system balance on branch_petty_cash_accounts (every POS cash sale +
 * customer-payment cash-in already keeps this current); "actual" is what
 * the till counted. A non-zero variance requires a reason and starts as
 * 'pending' (admin/accounts can approve outright).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number(session.user.id)
  const role   = ((session.user as any).role ?? '').toLowerCase()

  const body = await readBody(event)
  const cashAccountId = Number(body?.cash_account_id)
  const actualCash     = Number(body?.actual_cash)
  const witnessUserId  = body?.witness_user_id ? Number(body.witness_user_id) : null
  const varianceReason = String(body?.variance_reason ?? '').trim()

  if (!cashAccountId || !(actualCash >= 0))
    throw createError({ statusCode: 400, statusMessage: 'cash_account_id and a non-negative actual_cash are required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[acct]] = await conn.query<any>(
      `SELECT * FROM branch_petty_cash_accounts WHERE id = ? FOR UPDATE`, [cashAccountId])
    if (!acct) throw createError({ statusCode: 404, statusMessage: 'Cash account not found' })

    const expectedCash = Number(acct.current_balance)
    const variance = Math.round((actualCash - expectedCash) * 100) / 100
    if (Math.abs(variance) > 0.005 && !varianceReason)
      throw createError({ statusCode: 400, statusMessage: 'A variance reason is required when actual cash does not match expected' })

    const status = isAdminRole(role) || Math.abs(variance) < 0.005 ? 'approved' : 'pending'

    const [res] = await conn.query<any>(
      `INSERT INTO cash_verification_log
         (branch_id, verification_date, expected_cash, actual_cash, variance, variance_reason,
          verified_by_user_id, witness_user_id, notes, status, cash_account_id)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [acct.branch_id, expectedCash, actualCash, variance, varianceReason || null,
       userId, witnessUserId, body?.notes ?? null, status, cashAccountId],
    )

    await auditLog(conn, {
      userId, action: 'created', module: 'other', recordType: 'cash_verification',
      recordId: res.insertId,
      description: `EOD cash count — ${acct.account_name}: expected ৳${expectedCash.toLocaleString()}, actual ৳${actualCash.toLocaleString()}, variance ৳${variance.toLocaleString()}`,
      severity: Math.abs(variance) > 0.005 ? 'warning' : 'info',
    })
    await conn.commit()

    if (Math.abs(variance) > 0.005) {
      sendTelegram(
        `${variance < 0 ? '🔴' : '🟡'} <b>EOD Cash Variance</b>\n${acct.account_name}\n` +
        `Expected ৳${expectedCash.toLocaleString()} · Actual ৳${actualCash.toLocaleString()} · Variance ৳${variance.toLocaleString()}\n` +
        `Reason: ${varianceReason}\nBy ${(session.user as any).name ?? userId}`, 'orders')
    }
    return { ok: true, id: res.insertId, expected_cash: expectedCash, variance, status }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

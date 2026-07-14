import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES, getGLAccountId, postJournalEntry, postCustomerLedger } from '~/server/utils/creditOrders'

/**
 * PATCH /api/credit-sales/over-deliveries/:odId/status
 * Body: { action: 'approve' | 'reject', notes?: string }
 * Admin/superadmin only; the submitter cannot decide their own request.
 *
 * On approve:
 *   resolution='bill'      -> order total/balance += X, ledger debit note
 *                              (customer owes more) + balanced JE (spec §2.9)
 *   resolution='retrieve'  -> approved only; company takes the goods back —
 *                              no billing. A later mark-retrieved call closes it.
 *   resolution='writeoff'  -> approved only; company absorbs the extra goods,
 *                              no billing, nothing to retrieve.
 */
export default defineEventHandler(async (event) => {
  const odId    = Number(getRouterParam(event, 'odId'))
  if (!odId) throw createError({ statusCode: 400, statusMessage: 'Invalid over-delivery ID' })

  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body   = await readBody(event)
  const action = body?.action as 'approve' | 'reject'
  const notes  = body?.notes as string | undefined
  if (!['approve', 'reject'].includes(action))
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[od]] = await conn.query<any>(
      `SELECT od.*, o.order_number FROM credit_order_over_deliveries od
       JOIN credit_orders o ON o.id = od.order_id
       WHERE od.id = ? FOR UPDATE`,
      [odId],
    )
    if (!od) throw createError({ statusCode: 404, statusMessage: 'Over-delivery not found' })
    if (od.status !== 'pending')
      throw createError({ statusCode: 409, statusMessage: `Already ${od.status}` })
    if (Number(od.created_by_user_id) === userId)
      throw createError({ statusCode: 403, statusMessage: 'You recorded this over-delivery — a different authorised user must decide it' })

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const amount = Number(od.total_extra_amount)
    let jeId: number | null = null

    if (action === 'approve' && od.resolution === 'bill') {
      const date = new Date().toISOString().slice(0, 10)
      const arId  = await getGLAccountId(conn, 'Accounts Receivable')
      const revId = await getGLAccountId(conn, 'Revenue')
      if (arId && revId) {
        jeId = await postJournalEntry(conn, {
          date,
          description: `Over-delivery billed — ${od.od_number} (Order ${od.order_number})`,
          docType: 'OverDelivery',
          docId: odId,
          userId,
          lines: [
            { accountId: arId,  debit: amount, credit: 0, memo: od.od_number },
            { accountId: revId, debit: 0, credit: amount, memo: od.od_number },
          ],
        })
      }
      await postCustomerLedger(conn, {
        customerId: od.customer_id,
        date,
        transactionType: 'debit_note',
        referenceType: 'credit_order_over_delivery',
        referenceId: odId,
        invoiceNumber: od.od_number,
        description: `Over-delivery billed — ${od.od_number} (Order ${od.order_number})`,
        debit: amount,
        credit: 0,
        journalEntryId: jeId,
        userId,
      })
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = total_amount + ?, balance_due = balance_due + ?, updated_at = NOW()
         WHERE id = ?`,
        [amount, amount, od.order_id],
      )
    }

    await conn.query(
      `UPDATE credit_order_over_deliveries
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(), decision_note = ?, journal_entry_id = ?
       WHERE id = ?`,
      [newStatus, userId, notes ?? null, jeId, odId],
    )

    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [od.order_id, od.status, od.status,
       action === 'approve' ? 'over_delivery_approved' : 'over_delivery_rejected', userId,
       `${od.od_number} ${action === 'approve' ? `approved (${od.resolution})` : 'rejected'}${notes ? ` — ${notes}` : ''}`],
    )
    await auditLog(conn, {
      userId, action: action === 'approve' ? 'approved' : 'rejected', module: 'credit_sales',
      recordType: 'credit_order_over_delivery', recordId: od.order_id, referenceNumber: od.od_number,
      description: `Over-delivery ${od.od_number} (Order ${od.order_number}) ${action}d — ৳${amount.toLocaleString()} (${od.resolution})${notes ? ` · ${notes}` : ''}`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(
      `${action === 'approve' ? '✅' : '❌'} <b>Over-Delivery ${action === 'approve' ? 'Approved' : 'Rejected'}</b>\n` +
      `${od.od_number} — Order ${od.order_number}\n৳${amount.toLocaleString()} (${od.resolution}) · by ${userName}`,
    )
    return { ok: true, status: newStatus }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

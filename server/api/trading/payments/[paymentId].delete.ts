import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * DELETE /api/trading/payments/:paymentId — reverse one commodity-sale
 * payment (recycle-backed, Option A: archive the original posting).
 * Targets the payment's exact customer_ledger row via the
 * customer_ledger_id pinned at creation — the (reference_type,
 * reference_id) pair alone is ambiguous between a sale's invoice row and
 * its payments (the exact trap the legacy build hit).
 */
export default defineEventHandler(async (event) => {
  const paymentId = Number(getRouterParam(event, 'paymentId'))
  if (!paymentId) throw createError({ statusCode: 400, statusMessage: 'Invalid payment ID' })
  const body    = await readBody(event).catch(() => ({}))
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Payment reversal is admin/superadmin only' })

  const reason = String(body?.reason ?? '').trim()
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'A reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[pay]] = await conn.query<any>(
      `SELECT p.*, s.sale_number, s.total_amount, s.advance_paid, s.amount_paid AS sale_paid,
              c.name AS customer_name
       FROM commodity_sale_payments p
       JOIN commodity_sales s ON s.id = p.sale_id
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = ? FOR UPDATE`, [paymentId],
    )
    if (!pay) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })

    const batchId = await recycleBegin(conn, {
      entityType: 'commodity_payment',
      label: `${pay.payment_number} — ${pay.customer_name} — ৳${Number(pay.amount).toLocaleString()}`,
      customerId: pay.customer_id, userId, userName,
    })

    // Restore sale balances (advance-aware formula), snapshotting first
    await recycleSnapshotBefore(conn, batchId, 'commodity_sales', 'id', pay.sale_id)
    const newPaid = Math.max(0, Number(pay.sale_paid) - Number(pay.amount))
    const newBalance = Math.max(0, Number(pay.total_amount) - Number(pay.advance_paid) - newPaid)
    await conn.query(
      `UPDATE commodity_sales SET amount_paid = ?, balance_due = ? WHERE id = ?`,
      [newPaid, newBalance, pay.sale_id],
    )

    // Cash payments: pull the money back out of the petty cash box.
    // Archive by row id — reference_id alone would collide with other
    // reference_types sharing the same numeric id.
    if (pay.cash_account_id) {
      await recycleSnapshotBefore(conn, batchId, 'branch_petty_cash_accounts', 'id', pay.cash_account_id)
      const [pcTxns] = await conn.query<any>(
        `SELECT id FROM branch_petty_cash_transactions
         WHERE reference_type = 'commodity_sale_payment' AND reference_id = ?`, [paymentId],
      )
      for (const t of pcTxns) {
        await recycleArchiveDelete(conn, batchId, 'branch_petty_cash_transactions', 'id', t.id)
      }
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
        [Number(pay.amount), pay.cash_account_id],
      )
    }

    // Void a still-pending bank bridge row, if any
    try {
      await recycleSnapshotBefore(conn, batchId, 'bank_transactions', 'source_payment_id', paymentId)
      await conn.query(
        `UPDATE bank_transactions SET status = 'rejected'
         WHERE source_payment_id = ? AND status = 'pending'`, [paymentId],
      )
    } catch { /* bank module absent — fine */ }

    // Archive the exact ledger row + JE + payment row
    if (pay.customer_ledger_id) {
      await recycleArchiveDelete(conn, batchId, 'customer_ledger', 'id', pay.customer_ledger_id)
      const [[bal]] = await conn.query<any>(
        `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS b FROM customer_ledger WHERE customer_id = ?`,
        [pay.customer_id],
      )
      await conn.query(`UPDATE customers SET current_balance = GREATEST(0, ?) WHERE id = ?`, [Number(bal.b), pay.customer_id])
    }
    if (pay.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', pay.journal_entry_id)
      await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', pay.journal_entry_id)
    }
    await recycleArchiveDelete(conn, batchId, 'commodity_sale_payments', 'id', paymentId)
    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId, action: 'deleted', module: 'trading', recordType: 'commodity_sale_payment',
      recordId: paymentId, referenceNumber: pay.payment_number,
      description: `Commodity payment ${pay.payment_number} reversed (batch #${batchId}) — ${reason}`,
      severity: 'critical',
    })
    await conn.commit()
    sendTelegram(
      `↩️ <b>Commodity Payment Reversed</b>\n${pay.payment_number} — ${pay.customer_name} (${pay.sale_number})\n৳${Number(pay.amount).toLocaleString()} · by ${userName}\nReason: ${reason}`,
      'payment_received')
    return { ok: true, recycle_batch_id: batchId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole } from '~/server/utils/creditOrders'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'

/** DELETE /api/pos/:id — Recycle-Bin-backed reversal of a POS sale (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!isAdminRole(role)) throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event).catch(() => ({}))
  const reason = String(body?.reason ?? '').trim()
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'A reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[order]] = await conn.query<any>(
      `SELECT o.*, c.name AS customer_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? AND o.order_type = 'POS' FOR UPDATE`, [id])
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const batchId = await recycleBegin(conn, {
      entityType: 'pos_order',
      label: `${order.order_number} — ${order.customer_name ?? 'Walk-in'} — ৳${Number(order.total_amount).toLocaleString()}`,
      customerId: order.customer_id, userId, userName,
    })

    // Restore stock for every line item, snapshot each variant row first.
    const [items] = await conn.query<any>(`SELECT * FROM order_items WHERE order_id = ?`, [id])
    for (const it of items as any[]) {
      await recycleSnapshotBefore(conn, batchId, 'product_variants', 'id', it.variant_id)
      await conn.query(`UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`, [it.quantity, it.variant_id])
    }

    // Reverse the cash portion out of petty cash, if any.
    if (order.payment_method === 'Cash' && order.cash_account_id && Number(order.cash_amount) > 0.005) {
      await recycleSnapshotBefore(conn, batchId, 'branch_petty_cash_accounts', 'id', order.cash_account_id)
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`, [Number(order.cash_amount), order.cash_account_id])
      await recycleArchiveDelete(conn, batchId, 'branch_petty_cash_transactions', 'reference_id', id)
    }

    // Archive the POS ledger row (the credit portion's balance impact).
    await recycleArchiveDelete(conn, batchId, 'pos_customer_ledger', 'order_id', id)

    // Archive the JE + its lines.
    if (order.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', order.journal_entry_id)
      await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', order.journal_entry_id)
    }

    await recycleArchiveDelete(conn, batchId, 'order_items', 'order_id', id)
    await recycleArchiveDelete(conn, batchId, 'orders', 'id', id)
    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId, action: 'deleted', module: 'other', recordType: 'pos_order', recordId: id,
      referenceNumber: order.order_number,
      description: `POS sale ${order.order_number} deleted (recycle batch #${batchId}) — ${reason}`,
      severity: 'critical',
    })
    await conn.commit()
    sendTelegram(
      `🗑️ <b>POS Sale Deleted</b>\n${order.order_number}${order.customer_name ? ` — ${order.customer_name}` : ''}\n৳${Number(order.total_amount).toLocaleString()} · by ${userName}\nReason: ${reason}`,
      'orders')
    return { ok: true, recycle_batch_id: batchId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

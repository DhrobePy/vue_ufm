import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, postGoodsOnBoardInvoice, getGLAccountId, postJournalEntry, postCustomerLedger,
} from '~/server/utils/creditOrders'

/**
 * POST /api/credit-sales/:id/override-status
 * Admin-only manual status override (spec §4.1 order_status), separate from
 * the normal workflow.post.ts pipeline — an escape hatch for orders stuck
 * outside the happy path, constrained to its own transition map (spec §2.8):
 *   ready_to_ship  -> goods_on_board | shipped | hold
 *   goods_on_board -> shipped | delivered | hold
 *   shipped        -> delivered
 *   hold           -> ready_to_ship | goods_on_board | shipped | delivered  (resume)
 *   delivered      -> cancelled                                            (admin reversal)
 *
 * Jumping straight to shipped/delivered still posts the goods-on-board
 * ledger entry first (idempotent) — the accounting pivot (spec §2.3) never
 * gets skipped just because the status jump did.
 */
const OVERRIDE_TRANSITIONS: Record<string, string[]> = {
  ready_to_ship:  ['goods_on_board', 'shipped', 'hold'],
  goods_on_board: ['shipped', 'delivered', 'hold'],
  shipped:        ['delivered'],
  hold:           ['ready_to_ship', 'goods_on_board', 'shipped', 'delivered'],
  delivered:      ['cancelled'],
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Manual status override is admin/superadmin only' })

  const body      = await readBody(event)
  const to_status = String(body?.to_status ?? '')
  const reason    = String(body?.reason ?? '').trim()
  if (!to_status) throw createError({ statusCode: 400, statusMessage: 'to_status is required' })
  if (!reason)    throw createError({ statusCode: 400, statusMessage: 'A reason is required for a manual status override' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT o.*, c.name AS customer_name FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id WHERE o.id = ? FOR UPDATE`,
      [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const allowed = OVERRIDE_TRANSITIONS[order.status] ?? []
    if (!allowed.includes(to_status)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot override "${order.status}" → "${to_status}" — allowed targets: ${allowed.join(', ') || 'none'}`,
      })
    }

    let telegramMsg = ''

    if (to_status === 'cancelled') {
      // delivered -> cancelled: full reversal, only for a "clean" order —
      // no payments/returns/over-deliveries recorded. Anything more
      // entangled needs the existing payment-reversal / delete tools first.
      const [[entangled]] = await conn.query<any>(
        `SELECT
           (SELECT COUNT(*) FROM customer_payments WHERE order_id = ?) +
           (SELECT COUNT(*) FROM payment_allocations WHERE order_id = ?) +
           (SELECT COUNT(*) FROM credit_order_returns WHERE order_id = ?) +
           (SELECT COUNT(*) FROM credit_order_over_deliveries WHERE order_id = ?) AS n`,
        [id, id, id, id],
      )
      if (Number(entangled.n) > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This order has payments, returns, or over-deliveries recorded — reverse those first (Payment History / Returns Center), then cancel.',
        })
      }

      const [[invoiceLedger]] = await conn.query<any>(
        `SELECT id, journal_entry_id FROM customer_ledger
         WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice' LIMIT 1`,
        [id],
      )
      if (invoiceLedger) {
        const postDate = new Date().toISOString().slice(0, 10)
        const arId  = await getGLAccountId(conn, 'Accounts Receivable')
        const revId = await getGLAccountId(conn, 'Revenue')
        let reversalJeId: number | null = null
        if (arId && revId) {
          reversalJeId = await postJournalEntry(conn, {
            date: postDate,
            description: `Reversal — ${order.order_number} cancelled after delivery (admin override)`,
            docType: 'CreditOrder',
            docId: id,
            userId,
            lines: [
              { accountId: revId, debit: Number(order.total_amount), credit: 0, memo: order.order_number },
              { accountId: arId,  debit: 0, credit: Number(order.total_amount), memo: order.order_number },
            ],
          })
        }
        await postCustomerLedger(conn, {
          customerId: order.customer_id,
          date: postDate,
          transactionType: 'credit_note',
          referenceType: 'credit_order',
          referenceId: id,
          invoiceNumber: order.order_number,
          description: `Order ${order.order_number} cancelled after delivery — invoice reversed (admin override)`,
          debit: 0,
          credit: Number(order.total_amount),
          journalEntryId: reversalJeId,
          userId,
        })
      }

      await conn.query(
        `UPDATE credit_orders SET status = 'cancelled', total_amount = 0, balance_due = 0, updated_at = NOW() WHERE id = ?`,
        [id],
      )
      telegramMsg = `⚠️ <b>Order Cancelled (post-delivery reversal)</b>\n${order.order_number} — ${order.customer_name}\nReason: ${reason}\nby ${userName}`
    } else if (['goods_on_board', 'shipped', 'delivered'].includes(to_status)) {
      // Skipping straight past the accounting pivot must still post it —
      // postGoodsOnBoardInvoice is idempotent (no-op if already posted).
      await postGoodsOnBoardInvoice(conn, {
        orderId: id, orderNumber: order.order_number, customerId: order.customer_id,
        customerName: order.customer_name, totalAmount: Number(order.total_amount),
        balanceDue: Number(order.balance_due), userId, userName,
      })
      await conn.query(`UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`, [to_status, id])
      telegramMsg = `🛠️ <b>Manual Status Override</b>\n${order.order_number} — ${order.customer_name}\n${order.status} → ${to_status}\nReason: ${reason}\nby ${userName}`
    } else {
      // hold, or resuming to ready_to_ship — pre-ledger, no accounting impact
      await conn.query(`UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`, [to_status, id])
      telegramMsg = `🛠️ <b>Manual Status Override</b>\n${order.order_number} — ${order.customer_name}\n${order.status} → ${to_status}\nReason: ${reason}\nby ${userName}`
    }

    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, action, from_status, to_status, comments, performed_by_user_id)
       VALUES (?, 'status_override', ?, ?, ?, ?)`,
      [id, order.status, to_status, reason, userId],
    )

    await auditLog(conn, {
      userId,
      action:          'status_changed',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: order.order_number,
      description:     `Admin manual status override: ${order.order_number} ${order.status} → ${to_status} — ${reason}`,
      severity:        'critical',
    })

    await conn.commit()
    sendTelegram(telegramMsg)
    return { ok: true, from_status: order.status, to_status }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

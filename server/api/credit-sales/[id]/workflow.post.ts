import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, ACCOUNTS_ROLES, PRODUCTION_ROLES, DISPATCH_ROLES,
  isAdminRole, isAccountsRole,
  getCustomerOutstanding, creditUsagePct, getUserApprovalLimit,
  getOrderGateState, getGLAccountId, postJournalEntry, postCustomerLedger,
} from '~/server/utils/creditOrders'

/**
 * The ONLY endpoint that moves an order through the status pipeline.
 * Every transition is enforced here — hiding buttons in the UI is decoration.
 *
 * ACCOUNTING PIVOT: the invoice hits customer_ledger at DISPATCH (ship) for
 * the full total_amount, with a balanced JE (Dr AR / Cr Revenue). Deliveries
 * only record physical movement. Post-dispatch money changes are debit/credit
 * notes (amendments), never direct edits.
 */

// Canonical pipeline + accepted aliases from older UI code
const STATUS_ALIAS: Record<string, string> = {
  dispatched: 'shipped',
  produced:   'ready_to_ship',
}

interface TransitionRule {
  from: string[]
  /** roles allowed (admin always allowed) */
  roles: string[]
  /** run extra enforcement; throw createError to block */
  enforce?: 'approve' | 'production' | 'ship'
}

const TRANSITIONS: Record<string, TransitionRule> = {
  approved:      { from: ['pending_approval', 'escalated'], roles: [...ACCOUNTS_ROLES], enforce: 'approve' },
  rejected:      { from: ['pending_approval', 'escalated'], roles: [...ACCOUNTS_ROLES], enforce: 'approve' },
  in_production: { from: ['approved'], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: 'production' },
  ready_to_ship: { from: ['in_production'], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES] },
  shipped:       { from: ['ready_to_ship'], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES], enforce: 'ship' },
  completed:     { from: ['delivered'], roles: [] },  // admin only (payments auto-complete otherwise)
  cancelled:     { from: ['pending_approval', 'escalated', 'approved', 'in_production', 'ready_to_ship'], roles: [] }, // admin only — pre-ledger, nothing to reverse
}

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const rawTo     = String(body?.to_status ?? '')
  const to_status = STATUS_ALIAS[rawTo] ?? rawTo
  const comments  = body?.comments ?? null
  const conditions = body?.conditions ?? null   // optional gate setup at approval

  if (!id || !to_status)
    throw createError({ statusCode: 400, statusMessage: 'id and to_status required' })
  if (to_status === 'delivered')
    throw createError({ statusCode: 400, statusMessage: 'Deliveries must go through the delivery flow, not a status change' })

  const rule = TRANSITIONS[to_status]
  if (!rule)
    throw createError({ statusCode: 400, statusMessage: `Unknown target status "${to_status}"` })

  // Role gate (decorative UI check re-enforced here)
  if (!isAdminRole(role) && !rule.roles.includes(role))
    throw createError({ statusCode: 403, statusMessage: `Your role cannot move orders to "${to_status}"` })

  const db   = getDb()
  const conn = await db.getConnection()
  let telegramMsg: string | null = null

  try {
    await conn.beginTransaction()

    // Lock the row — double-click / stale-tab protection. Status re-checked
    // inside the transaction, not from whatever the browser last saw.
    const [[order]] = await conn.query<any>(
      `SELECT o.*, c.name AS customer_name, c.credit_limit
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`,
      [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    if (!rule.from.includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `Order is "${order.status}" — cannot move to "${to_status}" from there`,
      })

    const totalAmount = Number(order.total_amount ?? 0)
    let wfComment = comments ? String(comments) : ''

    // ── Enforcement: APPROVE / REJECT ────────────────────────────────────────
    if (rule.enforce === 'approve' && to_status === 'approved') {
      const { limit, source } = await getUserApprovalLimit(conn, userId, role)
      const exposure = await getCustomerOutstanding(conn, order.customer_id, { excludeOrderId: id })
      const usageAfter = creditUsagePct(
        exposure.totalExposure + Number(order.balance_due ?? 0),
        Number(order.credit_limit ?? 0),
      )

      if (source === 'admin') {
        wfComment = `Approved by admin authority · ${wfComment}`.trim()
      } else if (source === 'personal') {
        // Personal limit decides EVERYTHING — even escalated/over-limit customers
        if (totalAmount > limit)
          throw createError({
            statusCode: 403,
            statusMessage: `Order ৳${totalAmount.toLocaleString()} exceeds your approval limit of ৳${limit.toLocaleString()} — escalate to admin`,
          })
        wfComment = `Approved under delegated limit ৳${limit.toLocaleString()} · customer usage ${usageAfter}% · outstanding ৳${exposure.ledgerOutstanding.toLocaleString()} · ${wfComment}`.trim()
      } else {
        // Accounts family without a personal limit → standard 80% rule
        if (order.status === 'escalated')
          throw createError({ statusCode: 403, statusMessage: 'Escalated orders need admin or a delegated approval limit' })
        if (usageAfter > 80)
          throw createError({
            statusCode: 403,
            statusMessage: `Customer credit usage would be ${usageAfter > 900 ? 'over limit' : usageAfter + '%'} — exceeds the 80% rule, escalate to admin`,
          })
        wfComment = `Approved under 80% rule · usage ${usageAfter}% · ${wfComment}`.trim()
      }

      // Optional special instructions (gates) — accounts/admin only
      if (conditions && isAccountsRole(role)) {
        const ct = ['manual', 'outstanding_below', 'outstanding_after_ship', 'amount_received']
          .includes(conditions.condition_type) ? conditions.condition_type : null
        await conn.query(
          `INSERT INTO order_approval_conditions
             (order_id, production_hold, production_hold_note,
              dispatch_hold, condition_type, condition_amount, auto_release,
              accounts_note, created_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             production_hold = VALUES(production_hold),
             production_hold_note = VALUES(production_hold_note),
             dispatch_hold = VALUES(dispatch_hold),
             condition_type = VALUES(condition_type),
             condition_amount = VALUES(condition_amount),
             auto_release = VALUES(auto_release),
             accounts_note = VALUES(accounts_note),
             dispatch_cleared = 0, dispatch_cleared_by = NULL,
             dispatch_cleared_at = NULL, dispatch_cleared_note = NULL`,
          [
            id,
            conditions.production_hold ? 1 : 0,
            conditions.production_hold_note ?? null,
            conditions.dispatch_hold ? 1 : 0,
            ct,
            conditions.condition_amount != null ? Number(conditions.condition_amount) : null,
            conditions.auto_release ? 1 : 0,
            conditions.accounts_note ?? null,
            userId,
          ],
        )
        if (conditions.production_hold || conditions.dispatch_hold) {
          wfComment += ' · SPECIAL INSTRUCTIONS SET'
        }
      }

      telegramMsg =
        `✅ <b>Order Approved</b>\n` +
        `${order.order_number} — ${order.customer_name}\n` +
        `৳${totalAmount.toLocaleString()} · by ${userName}` +
        (conditions?.production_hold ? `\n⛔ Production HOLD: ${conditions.production_hold_note ?? 'see order'}` : '') +
        (conditions?.dispatch_hold ? `\n🚫 Dispatch hold: ${conditions.condition_type ?? 'manual'}${conditions.condition_amount ? ` ৳${Number(conditions.condition_amount).toLocaleString()}` : ''}` : '')
    }

    if (rule.enforce === 'approve' && to_status === 'rejected') {
      telegramMsg = `❌ <b>Order Rejected</b>\n${order.order_number} — ${order.customer_name}\n৳${totalAmount.toLocaleString()} · by ${userName}${comments ? `\nReason: ${comments}` : ''}`
    }

    // ── Enforcement: PRODUCTION HOLD ─────────────────────────────────────────
    if (rule.enforce === 'production') {
      const gate = await getOrderGateState(conn, id)
      if (gate.productionHold && !gate.productionReleased)
        throw createError({
          statusCode: 423,
          statusMessage: `Production HOLD on this order${gate.raw?.production_hold_note ? `: ${gate.raw.production_hold_note}` : ''} — an admin must release it first`,
        })
    }

    // ── Enforcement + LEDGER POSTING: SHIP (the accounting pivot) ───────────
    if (rule.enforce === 'ship') {
      const gate = await getOrderGateState(conn, id)
      if (gate.dispatchHold && !gate.dispatchCleared) {
        if (gate.conditionMet && gate.autoRelease) {
          // Condition satisfied + auto-release opted in → self-clear, stamped
          await conn.query(
            `UPDATE order_approval_conditions
             SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
                 dispatch_cleared_note = 'Auto-released: condition met at dispatch'
             WHERE order_id = ?`,
            [userId, id],
          )
          wfComment += ' · dispatch clearance auto-released (condition met)'
        } else {
          throw createError({
            statusCode: 423,
            statusMessage: gate.conditionMet
              ? 'Payment condition met but clearance is manual — ask accounts to grant it (Payment Watch)'
              : `Dispatch blocked — payment clearance pending (${gate.conditionType ?? 'manual'}${gate.conditionAmount ? ` ৳${gate.conditionAmount.toLocaleString()}` : ''})`,
          })
        }
      }

      // Post the invoice — once. Guard against double-posting.
      const [[already]] = await conn.query<any>(
        `SELECT id FROM customer_ledger
         WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice'
         LIMIT 1`,
        [id],
      )
      if (!already) {
        const shipDate = new Date().toISOString().slice(0, 10)
        let jeId: number | null = null
        const arId  = await getGLAccountId(conn, 'Accounts Receivable')
        const revId = await getGLAccountId(conn, 'Revenue')
        if (arId && revId) {
          jeId = await postJournalEntry(conn, {
            date: shipDate,
            description: `Sales invoice — ${order.order_number} (${order.customer_name}) — dispatched`,
            docType: 'CreditOrder',
            docId: id,
            userId,
            lines: [
              { accountId: arId,  debit: totalAmount, credit: 0, memo: order.order_number },
              { accountId: revId, debit: 0, credit: totalAmount, memo: order.order_number },
            ],
          })
        } else {
          console.warn(`[ship] Missing GL accounts (AR=${arId}, Rev=${revId}) — ledger posted without JE`)
        }
        await postCustomerLedger(conn, {
          customerId: order.customer_id,
          date: shipDate,
          transactionType: 'invoice',
          referenceType: 'credit_order',
          referenceId: id,
          invoiceNumber: order.order_number,
          description: `Invoice — ${order.order_number} dispatched (full order value)`,
          debit: totalAmount,
          credit: 0,
          journalEntryId: jeId,
          userId,
        })
        wfComment = `Dispatched — invoice ৳${totalAmount.toLocaleString()} posted to ledger · ${wfComment}`.trim()
      }

      telegramMsg =
        `🚚 <b>Order Dispatched</b>\n` +
        `${order.order_number} — ${order.customer_name}\n` +
        `Invoice ৳${totalAmount.toLocaleString()} posted · balance due ৳${Number(order.balance_due ?? 0).toLocaleString()}\n` +
        `by ${userName}`
    }

    // ── Apply the transition ─────────────────────────────────────────────────
    await conn.query(
      `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [to_status, id],
    )
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, to_status, to_status, userId, wfComment || null],
    )

    await auditLog(conn, {
      userId,
      action:          to_status === 'approved' ? 'approved' : to_status === 'rejected' ? 'rejected' : 'status_changed',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: order.order_number,
      description:     `Order ${order.order_number}: ${order.status} → ${to_status}${wfComment ? ` · ${wfComment}` : ''}`,
      severity:        'info',
      ipAddress,
    })

    await conn.commit()

    if (telegramMsg) sendTelegram(telegramMsg)  // fire-and-forget, after commit

    return { ok: true, newStatus: to_status }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

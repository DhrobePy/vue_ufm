import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, ACCOUNTS_ROLES, PRODUCTION_ROLES, DISPATCH_ROLES,
  isAdminRole, isAccountsRole,
  getCustomerOutstanding, getUserApprovalLimit, getUserBranchIds,
  getOrderGateState, assertDispatchClear, transitionOrder, postGoodsOnBoardInvoice, generateDeliverySlipNumber, getCreditWorkflowSettings,
} from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'
import { postOtherSalesCOGS } from '~/server/utils/commodityTrading'

/**
 * The ONLY endpoint that moves an order through the status pipeline.
 * Every transition is enforced here — hiding buttons in the UI is decoration.
 *
 * ACCOUNTING PIVOT: the invoice hits customer_ledger at GOODS ON BOARD (spec
 * §2.3) for the full total_amount, with a balanced JE (Dr AR / Cr Revenue).
 * SHIPPED is a separate, lightweight, money-free stage after it (truck has
 * physically departed). Deliveries only record physical movement.
 * Post-goods-on-board money changes are debit/credit notes (amendments).
 */

// Canonical pipeline + accepted aliases from older UI code
const STATUS_ALIAS: Record<string, string> = {
  dispatched: 'goods_on_board',
}

interface TransitionRule {
  from: string[]
  /** roles allowed (admin always allowed) */
  roles: string[]
  /** run extra enforcement; throw createError to block */
  enforce?: 'approve' | 'production' | 'ready_to_ship' | 'goods_on_board'
}

const TRANSITIONS: Record<string, TransitionRule> = {
  approved:        { from: ['pending_approval', 'escalated'], roles: [...ACCOUNTS_ROLES], enforce: 'approve' },
  rejected:        { from: ['pending_approval', 'escalated'], roles: [...ACCOUNTS_ROLES], enforce: 'approve' },
  escalated:       { from: ['pending_approval'], roles: [...ACCOUNTS_ROLES] },  // flag up to admin
  in_production:   { from: ['approved'], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: 'production' },
  produced:        { from: ['in_production'], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES] },   // production finished — not yet cleared to leave
  ready_to_ship:   { from: ['produced'], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: 'ready_to_ship' },
  goods_on_board:  { from: ['ready_to_ship'], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES], enforce: 'goods_on_board' },
  shipped:         { from: ['goods_on_board'], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES] }, // truck departed — no money logic
  completed:       { from: ['delivered'], roles: [] },  // admin only (payments auto-complete otherwise)
  cancelled:       { from: ['pending_approval', 'escalated', 'approved', 'in_production', 'produced', 'ready_to_ship'], roles: [] }, // admin only — pre-ledger, nothing to reverse
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

  // Per-user action toggles from the privileges editor (admin bypasses;
  // users without a permissions row keep their role-family defaults)
  const TRANSITION_PERM: Record<string, { page: string; action: string }> = {
    approved:       { page: 'approve',    action: 'approve' },
    rejected:       { page: 'approve',    action: 'reject' },
    escalated:      { page: 'approve',    action: 'escalate' },
    in_production:  { page: 'production', action: 'start_production' },
    produced:       { page: 'production', action: 'mark_produced' },
    ready_to_ship:  { page: 'production', action: 'mark_ready' },
    goods_on_board: { page: 'dispatch',   action: 'mark_dispatched' },
    shipped:        { page: 'dispatch',   action: 'mark_shipped' },
  }
  const tp = TRANSITION_PERM[to_status]
  if (tp) {
    const allowed = await userCanAction({
      userId, role, module: 'credit_sales', page: tp.page, action: tp.action,
      roleFallback: rule.roles,
    })
    if (!allowed)
      throw createError({ statusCode: 403, statusMessage: `Your account is not allowed to ${tp.action.replace(/_/g, ' ')} (ask admin to enable it)` })
  }
  // Setting special instructions is its own toggleable power
  if (conditions && !isAdminRole(role)) {
    const canSet = await userCanAction({
      userId, role, module: 'credit_sales', page: 'approve', action: 'set_conditions',
      roleFallback: ACCOUNTS_ROLES,
    })
    if (!canSet)
      throw createError({ statusCode: 403, statusMessage: 'Your account cannot set special instructions' })
  }

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

    // Other Sales (Trading commodities via this flow) skip production
    // entirely: approved → ready_to_ship directly, and the production
    // stages are refused outright.
    const isOtherSales = !!order.is_other_sales
    if (isOtherSales && ['in_production'].includes(to_status))
      throw createError({ statusCode: 409, statusMessage: 'Other Sales orders skip production — move it straight to Ready to Ship' })
    const allowedFrom = isOtherSales && to_status === 'ready_to_ship'
      ? [...rule.from, 'approved']
      : rule.from
    if (!allowedFrom.includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `Order is "${order.status}" — cannot move to "${to_status}" from there`,
      })

    const totalAmount = Number(order.total_amount ?? 0)
    let wfComment = comments ? String(comments) : ''

    // The status the order actually ends up in (an approval can auto-escalate, and Other Sales skip production).
    let finalStatus = to_status

    // ── Enforcement: APPROVE / REJECT (legacy credit_order_approval.php) ─────
    if (rule.enforce === 'approve' && to_status === 'approved') {
      // The approver assigns the production branch and the required delivery date (both mandatory in legacy).
      // Omitted → the order's existing values are used, so older callers keep working.
      const branchId = Number(body?.branch_id ?? order.assigned_branch_id ?? 0)
      const ymd = (v: any) => v instanceof Date
        ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
        : String(v ?? '').slice(0, 10)
      const requiredDate = ymd(body?.required_date ?? order.required_date)
      if (!branchId) throw createError({ statusCode: 400, statusMessage: 'Please select a branch for production' })
      if (!/^\d{4}-\d{2}-\d{2}$/.test(requiredDate)) throw createError({ statusCode: 400, statusMessage: 'Please select a valid required delivery date' })
      if (!isAdminRole(role) && requiredDate < new Date().toISOString().slice(0, 10))
        throw createError({ statusCode: 400, statusMessage: 'Required delivery date cannot be in the past' })
      const [[br]] = await conn.query<any>(`SELECT id FROM branches WHERE id = ? AND status = 'active'`, [branchId])
      if (!br) throw createError({ statusCode: 400, statusMessage: 'The chosen branch is not active' })
      if (!isAdminRole(role)) {
        const scope = await getUserBranchIds(conn, userId, role)
        if (scope) {
          if (order.assigned_branch_id != null && !scope.includes(Number(order.assigned_branch_id)))
            throw createError({ statusCode: 403, statusMessage: 'This order is outside your assigned branch scope' })
          if (!scope.includes(branchId))
            throw createError({ statusCode: 403, statusMessage: 'You may only assign production to a branch within your own scope' })
        }
      }

      const { limit: myLimit, source } = await getUserApprovalLimit(conn, userId, role)
      const exposure = await getCustomerOutstanding(conn, order.customer_id, { excludeOrderId: id })
      const creditLimit = Number(order.credit_limit ?? 0)
      const available = creditLimit - exposure.totalExposure          // credit left after dues AND other open orders
      // Legacy: how much of the REMAINING credit this order would eat. No limit set (0) → never escalates.
      const usagePct = creditLimit <= 0 ? 0 : available <= 0 ? 999 : (totalAmount / available) * 100
      const overLimit = creditLimit > 0 && Number(order.balance_due ?? 0) > available
      const usageText = usagePct >= 999 ? 'OVER LIMIT' : `${Math.round(usagePct)}%`
      let mustEscalate = false

      if (source === 'admin') {
        wfComment = `Approved by admin authority · ${wfComment}`.trim()
      } else if (source === 'personal') {
        // A credit-limit breach needs a personal limit that covers the WHOLE order; otherwise only admin/superadmin may approve it
        if (overLimit && totalAmount > myLimit)
          throw createError({ statusCode: 403, statusMessage: `This order exceeds the customer's credit limit by ৳${Math.max(0, Number(order.balance_due) - available).toLocaleString()} — only admin / superadmin, or an approver with a limit covering the full order amount, can approve it. It stays escalated.` })
        mustEscalate = totalAmount > myLimit
        wfComment = mustEscalate
          ? `Auto-escalated: order ৳${totalAmount.toLocaleString()} exceeds approver's delegated limit of ৳${myLimit.toLocaleString()} · ${wfComment}`.trim()
          : `Approved under delegated limit ৳${myLimit.toLocaleString()} · customer usage ${usageText} · outstanding ৳${exposure.ledgerOutstanding.toLocaleString()} · ${wfComment}`.trim()
      } else {
        // Accounts family without a personal limit
        if (order.status === 'escalated')
          throw createError({ statusCode: 403, statusMessage: 'Escalated orders need admin or a delegated approval limit' })
        if (overLimit)
          throw createError({ statusCode: 403, statusMessage: `This order exceeds the customer's credit limit by ৳${Math.max(0, Number(order.balance_due) - available).toLocaleString()} — only admin / superadmin, or an approver with a delegated ৳ limit covering the full order, can approve it. It stays escalated.` })
        mustEscalate = usagePct >= 80
        wfComment = mustEscalate
          ? `Auto-escalated: order uses ${usageText} of the customer's remaining credit (80% rule) · ${wfComment}`.trim()
          : `Approved · order uses ${usageText} of remaining credit · ${wfComment}`.trim()
      }

      if (mustEscalate) {
        finalStatus = 'escalated'
        telegramMsg = `⚠️ <b>Order Escalated</b>\n${order.order_number} — ${order.customer_name}\n৳${totalAmount.toLocaleString()} · by ${userName}\n${usageText} of remaining credit`
      } else {
        // Other Sales (commodity resale) skip production: approval goes straight to Ready to Ship
        finalStatus = order.is_other_sales ? 'ready_to_ship' : 'approved'
        await conn.query(`UPDATE credit_orders SET assigned_branch_id = ?, required_date = ?, updated_at = NOW() WHERE id = ?`, [branchId, requiredDate, id])
      }

      // Credit-limit auto-release (opt-in policy): approving an over-limit order — without the approver
      // setting their own manual conditions — force-sets a self-clearing dispatch hold.
      let autoHoldApplied = false
      if (!conditions && overLimit && finalStatus === 'approved') {
        const { creditLimitAutoRelease } = await getCreditWorkflowSettings(conn)
        if (creditLimitAutoRelease) {
          await conn.query(
            `INSERT INTO order_approval_conditions
               (order_id, dispatch_hold, condition_type, condition_amount, auto_release,
                accounts_note, created_by_user_id)
             VALUES (?, 1, 'outstanding_after_ship', ?, 1, ?, ?)
             ON DUPLICATE KEY UPDATE
               dispatch_hold = 1, condition_type = 'outstanding_after_ship',
               condition_amount = VALUES(condition_amount), auto_release = 1,
               accounts_note = VALUES(accounts_note),
               dispatch_cleared = 0, dispatch_cleared_by = NULL,
               dispatch_cleared_at = NULL, dispatch_cleared_note = NULL`,
            [
              id,
              Number(order.credit_limit ?? 0),
              `Auto dispatch hold: approved over the credit limit — releases once balance is back within the ৳${Number(order.credit_limit ?? 0).toLocaleString()} limit`,
              userId,
            ],
          )
          autoHoldApplied = true
          wfComment += ' · AUTO dispatch hold set (over credit limit, self-releases)'
        }
      }

      // Optional special instructions (gates) — accounts/admin only
      if (conditions && isAccountsRole(role) && finalStatus === 'approved') {
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

      if (finalStatus !== 'escalated') telegramMsg =
        `✅ <b>Order Approved</b>\n` +
        `${order.order_number} — ${order.customer_name}\n` +
        `৳${totalAmount.toLocaleString()} · by ${userName}` +
        (conditions?.production_hold ? `\n⛔ Production HOLD: ${conditions.production_hold_note ?? 'see order'}` : '') +
        (conditions?.dispatch_hold ? `\n🚫 Dispatch hold: ${conditions.condition_type ?? 'manual'}${conditions.condition_amount ? ` ৳${Number(conditions.condition_amount).toLocaleString()}` : ''}` : '') +
        (autoHoldApplied ? `\n🔒 AUTO dispatch hold — over credit limit, self-releases when balance is back within ৳${Number(order.credit_limit ?? 0).toLocaleString()}` : '')
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

    // ── Enforcement: READY TO SHIP needs dispatch clearance (payment hold) ───
    if (rule.enforce === 'ready_to_ship') {
      const { autoReleased } = await assertDispatchClear(conn, id, userId)
      if (autoReleased) wfComment = `Dispatch clearance auto-released (condition met) · ${wfComment}`.trim()
    }

    // ── Enforcement + LEDGER POSTING: GOODS ON BOARD (the accounting pivot) ──
    if (rule.enforce === 'goods_on_board') {
      // Truck details are mandatory (legacy rule) — and the dispatcher may add a
      // final discount (reason required) BEFORE the invoice is posted, so the
      // ledger/JE carry the discounted total from the first post.
      const d = body?.dispatch ?? {}
      const truck = String(d.truck_number ?? '').trim()
      const driver = String(d.driver_name ?? '').trim()
      if (!truck || !driver)
        throw createError({ statusCode: 400, statusMessage: 'Truck number and driver name are required to put goods on board' })
      const extra = Math.round(Number(d.extra_discount_amount ?? 0) * 100) / 100
      const extraReason = String(d.extra_discount_reason ?? '').trim()
      if (!(extra >= 0)) throw createError({ statusCode: 400, statusMessage: 'Discount amount cannot be negative' })
      if (extra > 0 && !extraReason) throw createError({ statusCode: 400, statusMessage: 'Please enter a reason for the additional discount' })
      if (extra > Number(order.subtotal ?? 0))
        throw createError({ statusCode: 400, statusMessage: `Discount (৳${extra.toLocaleString()}) cannot exceed the order subtotal (৳${Number(order.subtotal).toLocaleString()})` })
      const bags = Math.max(0, Math.floor(Number(d.bags_boarded ?? 0))) || null
      const bagKg = Math.max(0, Number(d.bag_size_kg ?? 0)) || null

      // Hold check first — a blocked order must not have its totals touched.
      await assertDispatchClear(conn, id, userId)

      if (extra > 0) {
        await conn.query(
          `UPDATE credit_orders
           SET discount_amount = discount_amount + ?, total_amount = total_amount - ?,
               balance_due = GREATEST(0, total_amount - advance_paid - amount_paid), updated_at = NOW()
           WHERE id = ?`,
          [extra, extra, id],
        )
        const [[fresh]] = await conn.query<any>(`SELECT total_amount, balance_due FROM credit_orders WHERE id = ?`, [id])
        order.total_amount = fresh.total_amount
        order.balance_due = fresh.balance_due
        wfComment = `Dispatcher discount ৳${extra.toLocaleString()} (${extraReason}) · ${wfComment}`.trim()
      }

      const [[ship]] = await conn.query<any>(`SELECT id, delivery_slip_number FROM credit_order_shipping WHERE order_id = ? LIMIT 1`, [id])
      // Slip number is assigned once per order and kept on a correction/re-dispatch.
      const slip = ship?.delivery_slip_number || await generateDeliverySlipNumber(conn, order.assigned_branch_id ?? null)
      if (ship) {
        await conn.query(
          `UPDATE credit_order_shipping SET truck_number=?, driver_name=?, driver_contact=?, shipped_date=NOW(), shipped_by_user_id=?,
             bags_boarded=?, bag_size_kg=?, delivery_slip_number=?,
             extra_discount_amount = extra_discount_amount + ?,
             extra_discount_reason = IF(? > 0, ?, extra_discount_reason),
             extra_discount_by_user_id = IF(? > 0, ?, extra_discount_by_user_id),
             extra_discount_at = IF(? > 0, NOW(), extra_discount_at)
           WHERE id = ?`,
          [truck, driver, d.driver_contact || null, userId, bags, bagKg, slip, extra, extra, extraReason, extra, userId, extra, ship.id],
        )
      } else {
        await conn.query(
          `INSERT INTO credit_order_shipping
             (order_id, truck_number, driver_name, driver_contact, shipped_date, shipped_by_user_id,
              bags_boarded, bag_size_kg, delivery_slip_number,
              extra_discount_amount, extra_discount_reason, extra_discount_by_user_id, extra_discount_at)
           VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ${extra > 0 ? 'NOW()' : 'NULL'})`,
          [id, truck, driver, d.driver_contact || null, userId, bags, bagKg, slip,
           extra, extra > 0 ? extraReason : null, extra > 0 ? userId : null],
        )
      }
      wfComment = `Truck ${truck} · driver ${driver} · slip ${slip} · ${wfComment}`.trim()

      const result = await postGoodsOnBoardInvoice(conn, {
        orderId: id,
        orderNumber: order.order_number,
        customerId: order.customer_id,
        customerName: order.customer_name,
        totalAmount: Number(order.total_amount ?? 0),
        balanceDue: Number(order.balance_due ?? 0),
        userId,
        userName,
      })
      if (!result.alreadyPosted)
        wfComment = `Goods on board — invoice ৳${Number(order.total_amount ?? 0).toLocaleString()} posted to ledger · ${wfComment}`.trim()
      if (result.autoReleased)
        wfComment += ' · dispatch clearance auto-released (condition met)'
      telegramMsg = result.telegramMsg

      // Other Sales: trading stock leaves NOW — post COGS + decrement the
      // commodity pools (idempotent, keyed per order).
      if (order.is_other_sales) {
        const cogs = await postOtherSalesCOGS(conn, {
          orderId: id, orderNumber: order.order_number,
          branchId: order.assigned_branch_id ?? null, userId,
        })
        if (cogs > 0) wfComment += ` · trading COGS ৳${cogs.toLocaleString()} posted`
      }
    }

    // ── SHIPPED — truck has physically departed; no money logic ─────────────
    if (to_status === 'shipped') {
      wfComment = `Truck departed · ${wfComment}`.trim()
      telegramMsg = `🛣️ <b>Order Shipped</b>\n${order.order_number} — ${order.customer_name}\nTruck has departed · by ${userName}`
    }

    // ── Apply the transition ─────────────────────────────────────────────────
    await transitionOrder(conn, { orderId: id, from: order.status, to: finalStatus, action: to_status === 'approved' && finalStatus !== 'approved' ? (finalStatus === 'escalated' ? 'escalated' : 'approved') : undefined, userId, comment: wfComment })

    await auditLog(conn, {
      userId,
      action:          finalStatus === 'approved' ? 'approved' : to_status === 'rejected' ? 'rejected' : 'status_changed',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: order.order_number,
      description:     `Order ${order.order_number}: ${order.status} → ${finalStatus}${wfComment ? ` · ${wfComment}` : ''}`,
      severity:        'info',
      ipAddress,
    })

    await conn.commit()

    if (telegramMsg) {
      // Route to the matching category group: approval decisions → orders,
      // production stages → production, movement stages → dispatch.
      const cat = ['approved', 'rejected', 'escalated'].includes(finalStatus) || to_status === 'approved' ? 'orders'
        : ['in_production', 'ready_to_ship'].includes(to_status) ? 'production'
        : ['goods_on_board', 'shipped'].includes(to_status) ? 'dispatch'
        : undefined
      sendTelegram(telegramMsg, cat as any)  // fire-and-forget, after commit
    }

    return { ok: true, newStatus: finalStatus }
  } catch (e: any) {
    await conn.rollback()
    // Re-throw createError()s as-is; wrap raw SQL/JS errors so the client
    // toast shows the real cause instead of a blank "Server Error"
    if (e?.statusCode) throw e
    console.error('[workflow] transition failed:', e?.message, '| errno:', e?.errno)
    throw createError({
      statusCode: 500,
      statusMessage: e?.sqlMessage ?? e?.message ?? 'Workflow transition failed',
    })
  } finally {
    conn.release()
  }
})

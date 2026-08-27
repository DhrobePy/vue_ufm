import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole, isAccountsRole, getOrderGateState, getUserActionLimit, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

/**
 * Gate actions on one order:
 *  - set               (accounts/admin, delegable): create/update holds + conditions
 *  - clear_dispatch    (accounts/admin, delegable): grant dispatch clearance
 *  - revoke_dispatch   (accounts/admin, delegable): revoke clearance — only until goods on board
 *  - release_production(admin only):                lift a production hold
 *
 * Clearance powers are DELEGABLE to any user via the privileges editor
 * (payment-watch action grants) — matching the legacy app's Jul 2026 change
 * that removed the hard accounts-family gate. Users without an explicit
 * grant still fall back to the accounts-family default via userCanAction.
 */
export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const action   = String(body?.action ?? '')
  const note     = body?.note ? String(body.note).slice(0, 255) : null

  if (!id || !action) throw createError({ statusCode: 400, statusMessage: 'id and action required' })
  if (action === 'release_production' && !isAdminRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Only admin can release a production hold' })

  // Per-user action toggles (admin bypasses; unconfigured users fall back to
  // accounts family). Deliberately NO hard accounts-role gate in front of
  // this — any user given the explicit payment-watch action grant can clear/
  // revoke, same as the legacy app after its Jul 2026 delegation change.
  const ACTION_PERM: Record<string, string> = {
    set: 'set_conditions', clear_dispatch: 'clear_dispatch', revoke_dispatch: 'revoke_dispatch',
  }
  if (ACTION_PERM[action]) {
    const allowed = await userCanAction({
      userId, role, module: 'credit_sales', page: 'payment-watch',
      action: ACTION_PERM[action], roleFallback: ACCOUNTS_ROLES,
    })
    if (!allowed)
      throw createError({ statusCode: 403, statusMessage: `Your account is not allowed to ${ACTION_PERM[action].replace('_', ' ')}` })
  } else if (!isAccountsRole(role)) {
    // Unknown/other actions keep the conservative accounts-family gate
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  let telegramMsg: string | null = null

  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.order_number, o.status, o.customer_id, o.total_amount, c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // Delegated-limit / condition-met enforcement for early dispatch release
    // (spec parity with legacy payment_watch.php): a non-admin may only grant
    // clearance ahead of the condition actually being met if their delegated
    // "early_release" ৳ limit covers the order's total — otherwise clearing
    // the hold requires either an admin, or the condition genuinely being
    // met. The permission grant checked above only says a user MAY clear
    // dispatch holds at all; it says nothing about how large an order they
    // may override, which was the actual gap.
    if (action === 'clear_dispatch' && !isAdminRole(role)) {
      const preState = await getOrderGateState(conn, id)
      if (preState.dispatchHold && !preState.dispatchCleared && !preState.conditionMet) {
        const limit = await getUserActionLimit(conn, userId, 'early_release')
        const orderTotal = Number(order.total_amount ?? 0)
        if (limit === null || orderTotal > limit) {
          throw createError({
            statusCode: 403,
            statusMessage: limit === null
              ? 'The payment condition on this order is not yet met, and no early-release limit has been delegated to your account.'
              : `The payment condition is not yet met, and this order's ৳${orderTotal.toLocaleString()} exceeds your delegated early-release limit of ৳${limit.toLocaleString()}.`,
          })
        }
      }
    }

    if (action === 'set') {
      const ct = ['manual', 'outstanding_below', 'outstanding_after_ship', 'amount_received']
        .includes(body?.condition_type) ? body.condition_type : null
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
           accounts_note = VALUES(accounts_note)`,
        [
          id,
          body?.production_hold ? 1 : 0,
          body?.production_hold_note ?? null,
          body?.dispatch_hold ? 1 : 0,
          ct,
          body?.condition_amount != null ? Number(body.condition_amount) : null,
          body?.auto_release ? 1 : 0,
          body?.accounts_note ?? null,
          userId,
        ],
      )
    }

    else if (action === 'clear_dispatch') {
      // Upsert — under the global-hold policy most orders reach this point
      // with NO order_approval_conditions row yet (the hold is synthesized,
      // not stored); a plain UPDATE would silently affect zero rows.
      await conn.query(
        `INSERT INTO order_approval_conditions
           (order_id, dispatch_hold, condition_type, dispatch_cleared,
            dispatch_cleared_by, dispatch_cleared_at, dispatch_cleared_note, created_by_user_id)
         VALUES (?, 1, 'manual', 1, ?, NOW(), ?, ?)
         ON DUPLICATE KEY UPDATE
           dispatch_cleared = 1, dispatch_cleared_by = VALUES(dispatch_cleared_by),
           dispatch_cleared_at = NOW(), dispatch_cleared_note = VALUES(dispatch_cleared_note)`,
        [id, userId, note ?? 'Cleared by accounts', userId],
      )
      telegramMsg = `🟢 <b>Dispatch Clearance GRANTED</b>\n${order.order_number} — ${order.customer_name}\nby ${userName}${note ? `\nNote: ${note}` : ''}`
    }

    else if (action === 'revoke_dispatch') {
      if (!note)
        throw createError({ statusCode: 400, statusMessage: 'A reason is required to revoke dispatch clearance' })
      if (['goods_on_board', 'dispatched', 'shipped', 'delivered', 'completed'].includes(order.status))
        throw createError({ statusCode: 409, statusMessage: 'Order already goods on board — clearance can no longer be revoked' })
      // Revoke also kills auto-release: a human said stop, the machine must not restart it
      await conn.query(
        `UPDATE order_approval_conditions
         SET dispatch_cleared = 0, dispatch_cleared_by = NULL, dispatch_cleared_at = NULL,
             dispatch_cleared_note = ?, auto_release = 0
         WHERE order_id = ?`,
        [note ?? `Revoked by ${userName}`, id],
      )
      telegramMsg = `🔴 <b>Dispatch Clearance REVOKED</b>\n${order.order_number} — ${order.customer_name}\nby ${userName}${note ? `\nReason: ${note}` : ''}`
    }

    else if (action === 'release_production') {
      await conn.query(
        `UPDATE order_approval_conditions
         SET production_released_by = ?, production_released_at = NOW()
         WHERE order_id = ? AND production_hold = 1`,
        [userId, id],
      )
      telegramMsg = `🟡 <b>Production Hold RELEASED</b>\n${order.order_number} — ${order.customer_name}\nby ${userName}`
    }

    else {
      throw createError({ statusCode: 400, statusMessage: `Unknown gate action "${action}"` })
    }

    // Every gate event lands in the existing workflow trail (from = to)
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, order.status, `gate_${action}`, userId, note],
    )
    await auditLog(conn, {
      userId,
      action: 'status_changed',
      module: 'credit_sales',
      recordType: 'credit_order',
      recordId: id,
      referenceNumber: order.order_number,
      description: `Gate ${action} on ${order.order_number}${note ? ` · ${note}` : ''}`,
      severity: action === 'revoke_dispatch' ? 'warning' : 'info',
    })

    const state = await getOrderGateState(conn, id)
    await conn.commit()
    if (telegramMsg) sendTelegram(telegramMsg, 'dispatch')
    return { ok: true, gate: state }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

import { q as defineEventHandler, R as getRouterParam, at as readBody, X as getUserSession, m as createError, a1 as isAdminRole, aT as userCanAction, a0 as isAccountsRole, z as getDb, H as getOrderGateState, U as getUserActionLimit, g as auditLog, aM as sendTelegram, A as ACCOUNTS_ROLES } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const gates_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const action = String((_c = body == null ? void 0 : body.action) != null ? _c : "");
  const note = (body == null ? void 0 : body.note) ? String(body.note).slice(0, 255) : null;
  if (!id || !action) throw createError({ statusCode: 400, statusMessage: "id and action required" });
  if (action === "release_production" && !isAdminRole(role))
    throw createError({ statusCode: 403, statusMessage: "Only admin can release a production hold" });
  const ACTION_PERM = {
    set: "set_conditions",
    clear_dispatch: "clear_dispatch",
    revoke_dispatch: "revoke_dispatch"
  };
  if (ACTION_PERM[action]) {
    const allowed = await userCanAction({
      userId,
      role,
      module: "credit_sales",
      page: "payment-watch",
      action: ACTION_PERM[action],
      roleFallback: ACCOUNTS_ROLES
    });
    if (!allowed)
      throw createError({ statusCode: 403, statusMessage: `Your account is not allowed to ${ACTION_PERM[action].replace("_", " ")}` });
  } else if (!isAccountsRole(role)) {
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  let telegramMsg = null;
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.id, o.order_number, o.status, o.customer_id, o.total_amount, c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (action === "clear_dispatch" && !isAdminRole(role)) {
      const preState = await getOrderGateState(conn, id);
      if (preState.dispatchHold && !preState.dispatchCleared && !preState.conditionMet) {
        const limit = await getUserActionLimit(conn, userId, "early_release");
        const orderTotal = Number((_d = order.total_amount) != null ? _d : 0);
        if (limit === null || orderTotal > limit) {
          throw createError({
            statusCode: 403,
            statusMessage: limit === null ? "The payment condition on this order is not yet met, and no early-release limit has been delegated to your account." : `The payment condition is not yet met, and this order's \u09F3${orderTotal.toLocaleString()} exceeds your delegated early-release limit of \u09F3${limit.toLocaleString()}.`
          });
        }
      }
    }
    if (action === "set") {
      const ct = ["manual", "outstanding_below", "outstanding_after_ship", "amount_received"].includes(body == null ? void 0 : body.condition_type) ? body.condition_type : null;
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
          (body == null ? void 0 : body.production_hold) ? 1 : 0,
          (_e = body == null ? void 0 : body.production_hold_note) != null ? _e : null,
          (body == null ? void 0 : body.dispatch_hold) ? 1 : 0,
          ct,
          (body == null ? void 0 : body.condition_amount) != null ? Number(body.condition_amount) : null,
          (body == null ? void 0 : body.auto_release) ? 1 : 0,
          (_f = body == null ? void 0 : body.accounts_note) != null ? _f : null,
          userId
        ]
      );
    } else if (action === "clear_dispatch") {
      await conn.query(
        `INSERT INTO order_approval_conditions
           (order_id, dispatch_hold, condition_type, dispatch_cleared,
            dispatch_cleared_by, dispatch_cleared_at, dispatch_cleared_note, created_by_user_id)
         VALUES (?, 1, 'manual', 1, ?, NOW(), ?, ?)
         ON DUPLICATE KEY UPDATE
           dispatch_cleared = 1, dispatch_cleared_by = VALUES(dispatch_cleared_by),
           dispatch_cleared_at = NOW(), dispatch_cleared_note = VALUES(dispatch_cleared_note)`,
        [id, userId, note != null ? note : "Cleared by accounts", userId]
      );
      telegramMsg = `\u{1F7E2} <b>Dispatch Clearance GRANTED</b>
${order.order_number} \u2014 ${order.customer_name}
by ${userName}${note ? `
Note: ${note}` : ""}`;
    } else if (action === "revoke_dispatch") {
      if (!note)
        throw createError({ statusCode: 400, statusMessage: "A reason is required to revoke dispatch clearance" });
      if (["goods_on_board", "dispatched", "shipped", "delivered", "completed"].includes(order.status))
        throw createError({ statusCode: 409, statusMessage: "Order already goods on board \u2014 clearance can no longer be revoked" });
      await conn.query(
        `UPDATE order_approval_conditions
         SET dispatch_cleared = 0, dispatch_cleared_by = NULL, dispatch_cleared_at = NULL,
             dispatch_cleared_note = ?, auto_release = 0
         WHERE order_id = ?`,
        [note != null ? note : `Revoked by ${userName}`, id]
      );
      telegramMsg = `\u{1F534} <b>Dispatch Clearance REVOKED</b>
${order.order_number} \u2014 ${order.customer_name}
by ${userName}${note ? `
Reason: ${note}` : ""}`;
    } else if (action === "release_production") {
      await conn.query(
        `UPDATE order_approval_conditions
         SET production_released_by = ?, production_released_at = NOW()
         WHERE order_id = ? AND production_hold = 1`,
        [userId, id]
      );
      telegramMsg = `\u{1F7E1} <b>Production Hold RELEASED</b>
${order.order_number} \u2014 ${order.customer_name}
by ${userName}`;
    } else {
      throw createError({ statusCode: 400, statusMessage: `Unknown gate action "${action}"` });
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, order.status, `gate_${action}`, userId, note]
    );
    await auditLog(conn, {
      userId,
      action: "status_changed",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `Gate ${action} on ${order.order_number}${note ? ` \xB7 ${note}` : ""}`,
      severity: action === "revoke_dispatch" ? "warning" : "info"
    });
    const state = await getOrderGateState(conn, id);
    await conn.commit();
    if (telegramMsg) sendTelegram(telegramMsg, "dispatch");
    return { ok: true, gate: state };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { gates_post as default };
//# sourceMappingURL=gates.post.mjs.map

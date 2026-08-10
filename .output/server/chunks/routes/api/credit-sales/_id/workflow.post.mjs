import { q as defineEventHandler, R as getRouterParam, as as readBody, X as getUserSession, m as createError, K as getRequestHeader, a1 as isAdminRole, D as DISPATCH_ROLES, A as ACCOUNTS_ROLES, e as PRODUCTION_ROLES, aR as userCanAction, z as getDb, V as getUserApprovalLimit, y as getCustomerOutstanding, o as creditUsagePct, x as getCreditWorkflowSettings, a0 as isAccountsRole, H as getOrderGateState, ak as postGoodsOnBoardInvoice, am as postOtherSalesCOGS, g as auditLog, aK as sendTelegram } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const STATUS_ALIAS = {
  dispatched: "goods_on_board",
  produced: "ready_to_ship"
};
const TRANSITIONS = {
  approved: { from: ["pending_approval", "escalated"], roles: [...ACCOUNTS_ROLES], enforce: "approve" },
  rejected: { from: ["pending_approval", "escalated"], roles: [...ACCOUNTS_ROLES], enforce: "approve" },
  escalated: { from: ["pending_approval"], roles: [...ACCOUNTS_ROLES] },
  // flag up to admin
  in_production: { from: ["approved"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: "production" },
  ready_to_ship: { from: ["in_production"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES] },
  goods_on_board: { from: ["ready_to_ship"], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES], enforce: "goods_on_board" },
  shipped: { from: ["goods_on_board"], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES] },
  // truck departed — no money logic
  completed: { from: ["delivered"], roles: [] },
  // admin only (payments auto-complete otherwise)
  cancelled: { from: ["pending_approval", "escalated", "approved", "in_production", "ready_to_ship"], roles: [] }
  // admin only — pre-ledger, nothing to reverse
};
const workflow_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user))
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
  const rawTo = String((_e = body == null ? void 0 : body.to_status) != null ? _e : "");
  const to_status = (_f = STATUS_ALIAS[rawTo]) != null ? _f : rawTo;
  const comments = (_g = body == null ? void 0 : body.comments) != null ? _g : null;
  const conditions = (_h = body == null ? void 0 : body.conditions) != null ? _h : null;
  if (!id || !to_status)
    throw createError({ statusCode: 400, statusMessage: "id and to_status required" });
  if (to_status === "delivered")
    throw createError({ statusCode: 400, statusMessage: "Deliveries must go through the delivery flow, not a status change" });
  const rule = TRANSITIONS[to_status];
  if (!rule)
    throw createError({ statusCode: 400, statusMessage: `Unknown target status "${to_status}"` });
  if (!isAdminRole(role) && !rule.roles.includes(role))
    throw createError({ statusCode: 403, statusMessage: `Your role cannot move orders to "${to_status}"` });
  const TRANSITION_PERM = {
    approved: { page: "approve", action: "approve" },
    rejected: { page: "approve", action: "reject" },
    escalated: { page: "approve", action: "escalate" },
    in_production: { page: "production", action: "start_production" },
    ready_to_ship: { page: "production", action: "mark_ready" },
    goods_on_board: { page: "dispatch", action: "mark_dispatched" },
    shipped: { page: "dispatch", action: "mark_shipped" }
  };
  const tp = TRANSITION_PERM[to_status];
  if (tp) {
    const allowed = await userCanAction({
      userId,
      role,
      module: "credit_sales",
      page: tp.page,
      action: tp.action,
      roleFallback: rule.roles
    });
    if (!allowed)
      throw createError({ statusCode: 403, statusMessage: `Your account is not allowed to ${tp.action.replace(/_/g, " ")} (ask admin to enable it)` });
  }
  if (conditions && !isAdminRole(role)) {
    const canSet = await userCanAction({
      userId,
      role,
      module: "credit_sales",
      page: "approve",
      action: "set_conditions",
      roleFallback: ACCOUNTS_ROLES
    });
    if (!canSet)
      throw createError({ statusCode: 403, statusMessage: "Your account cannot set special instructions" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  let telegramMsg = null;
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.*, c.name AS customer_name, c.credit_limit
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const isOtherSales = !!order.is_other_sales;
    if (isOtherSales && ["in_production"].includes(to_status))
      throw createError({ statusCode: 409, statusMessage: "Other Sales orders skip production \u2014 move it straight to Ready to Ship" });
    const allowedFrom = isOtherSales && to_status === "ready_to_ship" ? [...rule.from, "approved"] : rule.from;
    if (!allowedFrom.includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `Order is "${order.status}" \u2014 cannot move to "${to_status}" from there`
      });
    const totalAmount = Number((_i = order.total_amount) != null ? _i : 0);
    let wfComment = comments ? String(comments) : "";
    if (rule.enforce === "approve" && to_status === "approved") {
      const { limit, source } = await getUserApprovalLimit(conn, userId, role);
      const exposure = await getCustomerOutstanding(conn, order.customer_id, { excludeOrderId: id });
      const usageAfter = creditUsagePct(
        exposure.totalExposure + Number((_j = order.balance_due) != null ? _j : 0),
        Number((_k = order.credit_limit) != null ? _k : 0)
      );
      if (source === "admin") {
        wfComment = `Approved by admin authority \xB7 ${wfComment}`.trim();
      } else if (source === "personal") {
        if (totalAmount > limit)
          throw createError({
            statusCode: 403,
            statusMessage: `Order \u09F3${totalAmount.toLocaleString()} exceeds your approval limit of \u09F3${limit.toLocaleString()} \u2014 escalate to admin`
          });
        wfComment = `Approved under delegated limit \u09F3${limit.toLocaleString()} \xB7 customer usage ${usageAfter}% \xB7 outstanding \u09F3${exposure.ledgerOutstanding.toLocaleString()} \xB7 ${wfComment}`.trim();
      } else {
        if (order.status === "escalated")
          throw createError({ statusCode: 403, statusMessage: "Escalated orders need admin or a delegated approval limit" });
        if (usageAfter > 80)
          throw createError({
            statusCode: 403,
            statusMessage: `Customer credit usage would be ${usageAfter > 900 ? "over limit" : usageAfter + "%"} \u2014 exceeds the 80% rule, escalate to admin`
          });
        wfComment = `Approved under 80% rule \xB7 usage ${usageAfter}% \xB7 ${wfComment}`.trim();
      }
      let autoHoldApplied = false;
      if (!conditions && usageAfter > 100) {
        const { creditLimitAutoRelease } = await getCreditWorkflowSettings(conn);
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
              Number((_l = order.credit_limit) != null ? _l : 0),
              `Auto dispatch hold: approved at ${usageAfter}% credit usage \u2014 releases once balance is back within the \u09F3${Number((_m = order.credit_limit) != null ? _m : 0).toLocaleString()} limit`,
              userId
            ]
          );
          autoHoldApplied = true;
          wfComment += " \xB7 AUTO dispatch hold set (over credit limit, self-releases)";
        }
      }
      if (conditions && isAccountsRole(role)) {
        const ct = ["manual", "outstanding_below", "outstanding_after_ship", "amount_received"].includes(conditions.condition_type) ? conditions.condition_type : null;
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
            (_n = conditions.production_hold_note) != null ? _n : null,
            conditions.dispatch_hold ? 1 : 0,
            ct,
            conditions.condition_amount != null ? Number(conditions.condition_amount) : null,
            conditions.auto_release ? 1 : 0,
            (_o = conditions.accounts_note) != null ? _o : null,
            userId
          ]
        );
        if (conditions.production_hold || conditions.dispatch_hold) {
          wfComment += " \xB7 SPECIAL INSTRUCTIONS SET";
        }
      }
      telegramMsg = `\u2705 <b>Order Approved</b>
${order.order_number} \u2014 ${order.customer_name}
\u09F3${totalAmount.toLocaleString()} \xB7 by ${userName}` + ((conditions == null ? void 0 : conditions.production_hold) ? `
\u26D4 Production HOLD: ${(_p = conditions.production_hold_note) != null ? _p : "see order"}` : "") + ((conditions == null ? void 0 : conditions.dispatch_hold) ? `
\u{1F6AB} Dispatch hold: ${(_q = conditions.condition_type) != null ? _q : "manual"}${conditions.condition_amount ? ` \u09F3${Number(conditions.condition_amount).toLocaleString()}` : ""}` : "") + (autoHoldApplied ? `
\u{1F512} AUTO dispatch hold \u2014 over credit limit, self-releases when balance is back within \u09F3${Number((_r = order.credit_limit) != null ? _r : 0).toLocaleString()}` : "");
    }
    if (rule.enforce === "approve" && to_status === "rejected") {
      telegramMsg = `\u274C <b>Order Rejected</b>
${order.order_number} \u2014 ${order.customer_name}
\u09F3${totalAmount.toLocaleString()} \xB7 by ${userName}${comments ? `
Reason: ${comments}` : ""}`;
    }
    if (rule.enforce === "production") {
      const gate = await getOrderGateState(conn, id);
      if (gate.productionHold && !gate.productionReleased)
        throw createError({
          statusCode: 423,
          statusMessage: `Production HOLD on this order${((_s = gate.raw) == null ? void 0 : _s.production_hold_note) ? `: ${gate.raw.production_hold_note}` : ""} \u2014 an admin must release it first`
        });
    }
    if (rule.enforce === "goods_on_board") {
      const result = await postGoodsOnBoardInvoice(conn, {
        orderId: id,
        orderNumber: order.order_number,
        customerId: order.customer_id,
        customerName: order.customer_name,
        totalAmount,
        balanceDue: Number((_t = order.balance_due) != null ? _t : 0),
        userId,
        userName
      });
      if (!result.alreadyPosted)
        wfComment = `Goods on board \u2014 invoice \u09F3${totalAmount.toLocaleString()} posted to ledger \xB7 ${wfComment}`.trim();
      if (result.autoReleased)
        wfComment += " \xB7 dispatch clearance auto-released (condition met)";
      telegramMsg = result.telegramMsg;
      if (order.is_other_sales) {
        const cogs = await postOtherSalesCOGS(conn, {
          orderId: id,
          orderNumber: order.order_number,
          branchId: (_u = order.assigned_branch_id) != null ? _u : null,
          userId
        });
        if (cogs > 0) wfComment += ` \xB7 trading COGS \u09F3${cogs.toLocaleString()} posted`;
      }
    }
    if (to_status === "shipped") {
      wfComment = `Truck departed \xB7 ${wfComment}`.trim();
      telegramMsg = `\u{1F6E3}\uFE0F <b>Order Shipped</b>
${order.order_number} \u2014 ${order.customer_name}
Truck has departed \xB7 by ${userName}`;
    }
    await conn.query(
      `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [to_status, id]
    );
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, to_status, to_status, userId, wfComment || null]
    );
    await auditLog(conn, {
      userId,
      action: to_status === "approved" ? "approved" : to_status === "rejected" ? "rejected" : "status_changed",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `Order ${order.order_number}: ${order.status} \u2192 ${to_status}${wfComment ? ` \xB7 ${wfComment}` : ""}`,
      severity: "info",
      ipAddress
    });
    await conn.commit();
    if (telegramMsg) {
      const cat = ["approved", "rejected", "escalated"].includes(to_status) ? "orders" : ["in_production", "ready_to_ship"].includes(to_status) ? "production" : ["goods_on_board", "shipped"].includes(to_status) ? "dispatch" : void 0;
      sendTelegram(telegramMsg, cat);
    }
    return { ok: true, newStatus: to_status };
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    console.error("[workflow] transition failed:", e == null ? void 0 : e.message, "| errno:", e == null ? void 0 : e.errno);
    throw createError({
      statusCode: 500,
      statusMessage: (_w = (_v = e == null ? void 0 : e.sqlMessage) != null ? _v : e == null ? void 0 : e.message) != null ? _w : "Workflow transition failed"
    });
  } finally {
    conn.release();
  }
});

export { workflow_post as default };
//# sourceMappingURL=workflow.post.mjs.map

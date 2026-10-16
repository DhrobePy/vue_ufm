import { t as defineEventHandler, Y as getRouterParam, aC as readBody, a2 as getUserSession, q as createError, O as getRequestHeader, a7 as isAdminRole, D as DISPATCH_ROLES, A as ACCOUNTS_ROLES, f as PRODUCTION_ROLES, b5 as userCanAction, F as getDb, a0 as getUserBranchIds, _ as getUserApprovalLimit, E as getCustomerOutstanding, C as getCreditWorkflowSettings, a6 as isAccountsRole, L as getOrderGateState, i as assertDispatchClear, z as generateDeliverySlipNumber, ar as postGoodsOnBoardInvoice, at as postOtherSalesCOGS, b2 as transitionOrder, j as auditLog, aZ as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const STATUS_ALIAS = {
  dispatched: "goods_on_board"
};
const TRANSITIONS = {
  approved: { from: ["pending_approval", "escalated"], roles: [...ACCOUNTS_ROLES], enforce: "approve" },
  rejected: { from: ["pending_approval", "escalated"], roles: [...ACCOUNTS_ROLES], enforce: "approve" },
  escalated: { from: ["pending_approval"], roles: [...ACCOUNTS_ROLES] },
  // flag up to admin
  in_production: { from: ["approved"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: "production" },
  produced: { from: ["in_production"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES] },
  // production finished — not yet cleared to leave
  ready_to_ship: { from: ["produced"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: "ready_to_ship" },
  goods_on_board: { from: ["ready_to_ship"], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES], enforce: "goods_on_board" },
  shipped: { from: ["goods_on_board"], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES] },
  // truck departed — no money logic
  completed: { from: ["delivered"], roles: [] },
  // admin only (payments auto-complete otherwise)
  cancelled: { from: ["pending_approval", "escalated", "approved", "in_production", "produced", "ready_to_ship"], roles: [] }
  // admin only — pre-ledger, nothing to reverse
};
const workflow_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K;
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
    produced: { page: "production", action: "mark_produced" },
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
    let finalStatus = to_status;
    if (rule.enforce === "approve" && to_status === "approved") {
      const branchId = Number((_k = (_j = body == null ? void 0 : body.branch_id) != null ? _j : order.assigned_branch_id) != null ? _k : 0);
      const ymd = (v) => v instanceof Date ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}` : String(v != null ? v : "").slice(0, 10);
      const requiredDate = ymd((_l = body == null ? void 0 : body.required_date) != null ? _l : order.required_date);
      if (!branchId) throw createError({ statusCode: 400, statusMessage: "Please select a branch for production" });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(requiredDate)) throw createError({ statusCode: 400, statusMessage: "Please select a valid required delivery date" });
      if (!isAdminRole(role) && requiredDate < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10))
        throw createError({ statusCode: 400, statusMessage: "Required delivery date cannot be in the past" });
      const [[br]] = await conn.query(`SELECT id FROM branches WHERE id = ? AND status = 'active'`, [branchId]);
      if (!br) throw createError({ statusCode: 400, statusMessage: "The chosen branch is not active" });
      if (!isAdminRole(role)) {
        const scope = await getUserBranchIds(conn, userId, role);
        if (scope) {
          if (order.assigned_branch_id != null && !scope.includes(Number(order.assigned_branch_id)))
            throw createError({ statusCode: 403, statusMessage: "This order is outside your assigned branch scope" });
          if (!scope.includes(branchId))
            throw createError({ statusCode: 403, statusMessage: "You may only assign production to a branch within your own scope" });
        }
      }
      const { limit: myLimit, source } = await getUserApprovalLimit(conn, userId, role);
      const exposure = await getCustomerOutstanding(conn, order.customer_id, { excludeOrderId: id });
      const creditLimit = Number((_m = order.credit_limit) != null ? _m : 0);
      const available = creditLimit - exposure.totalExposure;
      const usagePct = creditLimit <= 0 ? 0 : available <= 0 ? 999 : totalAmount / available * 100;
      const overLimit = creditLimit > 0 && Number((_n = order.balance_due) != null ? _n : 0) > available;
      const usageText = usagePct >= 999 ? "OVER LIMIT" : `${Math.round(usagePct)}%`;
      let mustEscalate = false;
      if (source === "admin") {
        wfComment = `Approved by admin authority \xB7 ${wfComment}`.trim();
      } else if (source === "personal") {
        if (overLimit && totalAmount > myLimit)
          throw createError({ statusCode: 403, statusMessage: `This order exceeds the customer's credit limit by \u09F3${Math.max(0, Number(order.balance_due) - available).toLocaleString()} \u2014 only admin / superadmin, or an approver with a limit covering the full order amount, can approve it. It stays escalated.` });
        mustEscalate = totalAmount > myLimit;
        wfComment = mustEscalate ? `Auto-escalated: order \u09F3${totalAmount.toLocaleString()} exceeds approver's delegated limit of \u09F3${myLimit.toLocaleString()} \xB7 ${wfComment}`.trim() : `Approved under delegated limit \u09F3${myLimit.toLocaleString()} \xB7 customer usage ${usageText} \xB7 outstanding \u09F3${exposure.ledgerOutstanding.toLocaleString()} \xB7 ${wfComment}`.trim();
      } else {
        if (order.status === "escalated")
          throw createError({ statusCode: 403, statusMessage: "Escalated orders need admin or a delegated approval limit" });
        if (overLimit)
          throw createError({ statusCode: 403, statusMessage: `This order exceeds the customer's credit limit by \u09F3${Math.max(0, Number(order.balance_due) - available).toLocaleString()} \u2014 only admin / superadmin, or an approver with a delegated \u09F3 limit covering the full order, can approve it. It stays escalated.` });
        mustEscalate = usagePct >= 80;
        wfComment = mustEscalate ? `Auto-escalated: order uses ${usageText} of the customer's remaining credit (80% rule) \xB7 ${wfComment}`.trim() : `Approved \xB7 order uses ${usageText} of remaining credit \xB7 ${wfComment}`.trim();
      }
      if (mustEscalate) {
        finalStatus = "escalated";
        telegramMsg = `\u26A0\uFE0F <b>Order Escalated</b>
${order.order_number} \u2014 ${order.customer_name}
\u09F3${totalAmount.toLocaleString()} \xB7 by ${userName}
${usageText} of remaining credit`;
      } else {
        finalStatus = order.is_other_sales ? "ready_to_ship" : "approved";
        await conn.query(`UPDATE credit_orders SET assigned_branch_id = ?, required_date = ?, updated_at = NOW() WHERE id = ?`, [branchId, requiredDate, id]);
      }
      let autoHoldApplied = false;
      if (!conditions && overLimit && finalStatus === "approved") {
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
              Number((_o = order.credit_limit) != null ? _o : 0),
              `Auto dispatch hold: approved over the credit limit \u2014 releases once balance is back within the \u09F3${Number((_p = order.credit_limit) != null ? _p : 0).toLocaleString()} limit`,
              userId
            ]
          );
          autoHoldApplied = true;
          wfComment += " \xB7 AUTO dispatch hold set (over credit limit, self-releases)";
        }
      }
      if (conditions && isAccountsRole(role) && finalStatus === "approved") {
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
            (_q = conditions.production_hold_note) != null ? _q : null,
            conditions.dispatch_hold ? 1 : 0,
            ct,
            conditions.condition_amount != null ? Number(conditions.condition_amount) : null,
            conditions.auto_release ? 1 : 0,
            (_r = conditions.accounts_note) != null ? _r : null,
            userId
          ]
        );
        if (conditions.production_hold || conditions.dispatch_hold) {
          wfComment += " \xB7 SPECIAL INSTRUCTIONS SET";
        }
      }
      if (finalStatus !== "escalated") telegramMsg = `\u2705 <b>Order Approved</b>
${order.order_number} \u2014 ${order.customer_name}
\u09F3${totalAmount.toLocaleString()} \xB7 by ${userName}` + ((conditions == null ? void 0 : conditions.production_hold) ? `
\u26D4 Production HOLD: ${(_s = conditions.production_hold_note) != null ? _s : "see order"}` : "") + ((conditions == null ? void 0 : conditions.dispatch_hold) ? `
\u{1F6AB} Dispatch hold: ${(_t = conditions.condition_type) != null ? _t : "manual"}${conditions.condition_amount ? ` \u09F3${Number(conditions.condition_amount).toLocaleString()}` : ""}` : "") + (autoHoldApplied ? `
\u{1F512} AUTO dispatch hold \u2014 over credit limit, self-releases when balance is back within \u09F3${Number((_u = order.credit_limit) != null ? _u : 0).toLocaleString()}` : "");
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
          statusMessage: `Production HOLD on this order${((_v = gate.raw) == null ? void 0 : _v.production_hold_note) ? `: ${gate.raw.production_hold_note}` : ""} \u2014 an admin must release it first`
        });
    }
    if (rule.enforce === "ready_to_ship") {
      const { autoReleased } = await assertDispatchClear(conn, id, userId);
      if (autoReleased) wfComment = `Dispatch clearance auto-released (condition met) \xB7 ${wfComment}`.trim();
    }
    if (rule.enforce === "goods_on_board") {
      const d = (_w = body == null ? void 0 : body.dispatch) != null ? _w : {};
      const truck = String((_x = d.truck_number) != null ? _x : "").trim();
      const driver = String((_y = d.driver_name) != null ? _y : "").trim();
      if (!truck || !driver)
        throw createError({ statusCode: 400, statusMessage: "Truck number and driver name are required to put goods on board" });
      const extra = Math.round(Number((_z = d.extra_discount_amount) != null ? _z : 0) * 100) / 100;
      const extraReason = String((_A = d.extra_discount_reason) != null ? _A : "").trim();
      if (!(extra >= 0)) throw createError({ statusCode: 400, statusMessage: "Discount amount cannot be negative" });
      if (extra > 0 && !extraReason) throw createError({ statusCode: 400, statusMessage: "Please enter a reason for the additional discount" });
      if (extra > Number((_B = order.subtotal) != null ? _B : 0))
        throw createError({ statusCode: 400, statusMessage: `Discount (\u09F3${extra.toLocaleString()}) cannot exceed the order subtotal (\u09F3${Number(order.subtotal).toLocaleString()})` });
      const bags = Math.max(0, Math.floor(Number((_C = d.bags_boarded) != null ? _C : 0))) || null;
      const bagKg = Math.max(0, Number((_D = d.bag_size_kg) != null ? _D : 0)) || null;
      await assertDispatchClear(conn, id, userId);
      if (extra > 0) {
        await conn.query(
          `UPDATE credit_orders
           SET discount_amount = discount_amount + ?, total_amount = total_amount - ?,
               balance_due = GREATEST(0, total_amount - advance_paid - amount_paid), updated_at = NOW()
           WHERE id = ?`,
          [extra, extra, id]
        );
        const [[fresh]] = await conn.query(`SELECT total_amount, balance_due FROM credit_orders WHERE id = ?`, [id]);
        order.total_amount = fresh.total_amount;
        order.balance_due = fresh.balance_due;
        wfComment = `Dispatcher discount \u09F3${extra.toLocaleString()} (${extraReason}) \xB7 ${wfComment}`.trim();
      }
      const [[ship]] = await conn.query(`SELECT id, delivery_slip_number FROM credit_order_shipping WHERE order_id = ? LIMIT 1`, [id]);
      const slip = (ship == null ? void 0 : ship.delivery_slip_number) || await generateDeliverySlipNumber(conn, (_E = order.assigned_branch_id) != null ? _E : null);
      if (ship) {
        await conn.query(
          `UPDATE credit_order_shipping SET truck_number=?, driver_name=?, driver_contact=?, shipped_date=NOW(), shipped_by_user_id=?,
             bags_boarded=?, bag_size_kg=?, delivery_slip_number=?,
             extra_discount_amount = extra_discount_amount + ?,
             extra_discount_reason = IF(? > 0, ?, extra_discount_reason),
             extra_discount_by_user_id = IF(? > 0, ?, extra_discount_by_user_id),
             extra_discount_at = IF(? > 0, NOW(), extra_discount_at)
           WHERE id = ?`,
          [truck, driver, d.driver_contact || null, userId, bags, bagKg, slip, extra, extra, extraReason, extra, userId, extra, ship.id]
        );
      } else {
        await conn.query(
          `INSERT INTO credit_order_shipping
             (order_id, truck_number, driver_name, driver_contact, shipped_date, shipped_by_user_id,
              bags_boarded, bag_size_kg, delivery_slip_number,
              extra_discount_amount, extra_discount_reason, extra_discount_by_user_id, extra_discount_at)
           VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ${extra > 0 ? "NOW()" : "NULL"})`,
          [
            id,
            truck,
            driver,
            d.driver_contact || null,
            userId,
            bags,
            bagKg,
            slip,
            extra,
            extra > 0 ? extraReason : null,
            extra > 0 ? userId : null
          ]
        );
      }
      wfComment = `Truck ${truck} \xB7 driver ${driver} \xB7 slip ${slip} \xB7 ${wfComment}`.trim();
      const result = await postGoodsOnBoardInvoice(conn, {
        orderId: id,
        orderNumber: order.order_number,
        customerId: order.customer_id,
        customerName: order.customer_name,
        totalAmount: Number((_F = order.total_amount) != null ? _F : 0),
        balanceDue: Number((_G = order.balance_due) != null ? _G : 0),
        userId,
        userName
      });
      if (!result.alreadyPosted)
        wfComment = `Goods on board \u2014 invoice \u09F3${Number((_H = order.total_amount) != null ? _H : 0).toLocaleString()} posted to ledger \xB7 ${wfComment}`.trim();
      if (result.autoReleased)
        wfComment += " \xB7 dispatch clearance auto-released (condition met)";
      telegramMsg = result.telegramMsg;
      if (order.is_other_sales) {
        const cogs = await postOtherSalesCOGS(conn, {
          orderId: id,
          orderNumber: order.order_number,
          branchId: (_I = order.assigned_branch_id) != null ? _I : null,
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
    await transitionOrder(conn, { orderId: id, from: order.status, to: finalStatus, action: to_status === "approved" && finalStatus !== "approved" ? finalStatus === "escalated" ? "escalated" : "approved" : void 0, userId, comment: wfComment });
    await auditLog(conn, {
      userId,
      action: finalStatus === "approved" ? "approved" : to_status === "rejected" ? "rejected" : "status_changed",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `Order ${order.order_number}: ${order.status} \u2192 ${finalStatus}${wfComment ? ` \xB7 ${wfComment}` : ""}`,
      severity: "info",
      ipAddress
    });
    await conn.commit();
    if (telegramMsg) {
      const cat = ["approved", "rejected", "escalated"].includes(finalStatus) || to_status === "approved" ? "orders" : ["in_production", "ready_to_ship"].includes(to_status) ? "production" : ["goods_on_board", "shipped"].includes(to_status) ? "dispatch" : void 0;
      sendTelegram(telegramMsg, cat);
    }
    return { ok: true, newStatus: finalStatus };
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    console.error("[workflow] transition failed:", e == null ? void 0 : e.message, "| errno:", e == null ? void 0 : e.errno);
    throw createError({
      statusCode: 500,
      statusMessage: (_K = (_J = e == null ? void 0 : e.sqlMessage) != null ? _J : e == null ? void 0 : e.message) != null ? _K : "Workflow transition failed"
    });
  } finally {
    conn.release();
  }
});

export { workflow_post as default };
//# sourceMappingURL=workflow.post.mjs.map

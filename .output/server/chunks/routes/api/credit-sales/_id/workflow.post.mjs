import { m as defineEventHandler, G as getRouterParam, a3 as readBody, J as getUserSession, i as createError, y as getRequestHeader, O as isAdminRole, D as DISPATCH_ROLES, A as ACCOUNTS_ROLES, P as PRODUCTION_ROLES, t as getDb, H as getUserApprovalLimit, s as getCustomerOutstanding, k as creditUsagePct, N as isAccountsRole, w as getOrderGateState, u as getGLAccountId, _ as postJournalEntry, Z as postCustomerLedger, e as auditLog, a9 as sendTelegram } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const STATUS_ALIAS = {
  dispatched: "shipped",
  produced: "ready_to_ship"
};
const TRANSITIONS = {
  approved: { from: ["pending_approval", "escalated"], roles: [...ACCOUNTS_ROLES], enforce: "approve" },
  rejected: { from: ["pending_approval", "escalated"], roles: [...ACCOUNTS_ROLES], enforce: "approve" },
  escalated: { from: ["pending_approval"], roles: [...ACCOUNTS_ROLES] },
  // flag up to admin
  in_production: { from: ["approved"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES], enforce: "production" },
  ready_to_ship: { from: ["in_production"], roles: [...PRODUCTION_ROLES, ...ACCOUNTS_ROLES] },
  shipped: { from: ["ready_to_ship"], roles: [...DISPATCH_ROLES, ...ACCOUNTS_ROLES], enforce: "ship" },
  completed: { from: ["delivered"], roles: [] },
  // admin only (payments auto-complete otherwise)
  cancelled: { from: ["pending_approval", "escalated", "approved", "in_production", "ready_to_ship"], roles: [] }
  // admin only — pre-ledger, nothing to reverse
};
const workflow_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
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
    if (!rule.from.includes(order.status))
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
            (_l = conditions.production_hold_note) != null ? _l : null,
            conditions.dispatch_hold ? 1 : 0,
            ct,
            conditions.condition_amount != null ? Number(conditions.condition_amount) : null,
            conditions.auto_release ? 1 : 0,
            (_m = conditions.accounts_note) != null ? _m : null,
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
\u26D4 Production HOLD: ${(_n = conditions.production_hold_note) != null ? _n : "see order"}` : "") + ((conditions == null ? void 0 : conditions.dispatch_hold) ? `
\u{1F6AB} Dispatch hold: ${(_o = conditions.condition_type) != null ? _o : "manual"}${conditions.condition_amount ? ` \u09F3${Number(conditions.condition_amount).toLocaleString()}` : ""}` : "");
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
          statusMessage: `Production HOLD on this order${((_p = gate.raw) == null ? void 0 : _p.production_hold_note) ? `: ${gate.raw.production_hold_note}` : ""} \u2014 an admin must release it first`
        });
    }
    if (rule.enforce === "ship") {
      const gate = await getOrderGateState(conn, id);
      if (gate.dispatchHold && !gate.dispatchCleared) {
        if (gate.conditionMet && gate.autoRelease) {
          await conn.query(
            `UPDATE order_approval_conditions
             SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
                 dispatch_cleared_note = 'Auto-released: condition met at dispatch'
             WHERE order_id = ?`,
            [userId, id]
          );
          wfComment += " \xB7 dispatch clearance auto-released (condition met)";
        } else {
          throw createError({
            statusCode: 423,
            statusMessage: gate.conditionMet ? "Payment condition met but clearance is manual \u2014 ask accounts to grant it (Payment Watch)" : `Dispatch blocked \u2014 payment clearance pending (${(_q = gate.conditionType) != null ? _q : "manual"}${gate.conditionAmount ? ` \u09F3${gate.conditionAmount.toLocaleString()}` : ""})`
          });
        }
      }
      const [[already]] = await conn.query(
        `SELECT id FROM customer_ledger
         WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice'
         LIMIT 1`,
        [id]
      );
      if (!already) {
        const shipDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        let jeId = null;
        const arId = await getGLAccountId(conn, "Accounts Receivable");
        const revId = await getGLAccountId(conn, "Revenue");
        if (arId && revId) {
          jeId = await postJournalEntry(conn, {
            date: shipDate,
            description: `Sales invoice \u2014 ${order.order_number} (${order.customer_name}) \u2014 dispatched`,
            docType: "CreditOrder",
            docId: id,
            userId,
            lines: [
              { accountId: arId, debit: totalAmount, credit: 0, memo: order.order_number },
              { accountId: revId, debit: 0, credit: totalAmount, memo: order.order_number }
            ]
          });
        } else {
          console.warn(`[ship] Missing GL accounts (AR=${arId}, Rev=${revId}) \u2014 ledger posted without JE`);
        }
        await postCustomerLedger(conn, {
          customerId: order.customer_id,
          date: shipDate,
          transactionType: "invoice",
          referenceType: "credit_order",
          referenceId: id,
          invoiceNumber: order.order_number,
          description: `Invoice \u2014 ${order.order_number} dispatched (full order value)`,
          debit: totalAmount,
          credit: 0,
          journalEntryId: jeId,
          userId
        });
        wfComment = `Dispatched \u2014 invoice \u09F3${totalAmount.toLocaleString()} posted to ledger \xB7 ${wfComment}`.trim();
      }
      telegramMsg = `\u{1F69A} <b>Order Dispatched</b>
${order.order_number} \u2014 ${order.customer_name}
Invoice \u09F3${totalAmount.toLocaleString()} posted \xB7 balance due \u09F3${Number((_r = order.balance_due) != null ? _r : 0).toLocaleString()}
by ${userName}`;
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
    if (telegramMsg) sendTelegram(telegramMsg);
    return { ok: true, newStatus: to_status };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { workflow_post as default };
//# sourceMappingURL=workflow.post.mjs.map

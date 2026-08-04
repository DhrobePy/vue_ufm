import { q as defineEventHandler, ar as readBody, X as getUserSession, m as createError, K as getRequestHeader, aP as userCanAction, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, z as getDb, a1 as isAdminRole, x as getCreditWorkflowSettings, U as getUserActionLimit, aq as queuePendingRequest, aI as sendTelegram, ag as postCommoditySale, g as auditLog } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const sales_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
  const canSell = await userCanAction({
    userId,
    role,
    module: "trading",
    page: "sales",
    action: "create_sale",
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES]
  });
  if (!canSell) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to record commodity sales" });
  const {
    customer_id,
    commodity_id,
    branch_id,
    origin,
    sale_date,
    quantity,
    unit_price,
    stock_override,
    source_purchase_order_id,
    notes,
    is_checker_review
  } = body != null ? body : {};
  if (!customer_id || !commodity_id || !quantity || !unit_price)
    throw createError({ statusCode: 400, statusMessage: "customer, commodity, quantity and unit price are required" });
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let saleDate = String(sale_date || today);
  if (!isAdminRole(role)) saleDate = today;
  if (saleDate > today) throw createError({ statusCode: 400, statusMessage: "Sale date cannot be in the future" });
  const totalAmount = Math.round(Number(quantity) * Number(unit_price) * 100) / 100;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[customer]] = await conn.query(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`,
      [customer_id]
    );
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    if (!isAdminRole(role) && !is_checker_review) {
      const { paymentRequireApproval } = await getCreditWorkflowSettings(conn);
      const cap = await getUserActionLimit(conn, userId, "approve_order");
      const saleCap = (_e = await getUserActionLimit(conn, userId, "commodity_sale")) != null ? _e : cap;
      const withinCap = saleCap !== null && totalAmount <= saleCap;
      if (paymentRequireApproval || !withinCap) {
        const reqId = await queuePendingRequest(conn, {
          requestType: "commodity_sale",
          payload: body,
          customerId: Number(customer_id),
          amount: totalAmount,
          referenceLabel: `${customer.name} \u2014 commodity sale \u09F3${totalAmount.toLocaleString()}`,
          requestedBy: userId,
          requestedReason: paymentRequireApproval ? "Sale approval policy (all commodity sales)" : saleCap === null ? "No commodity-sale limit configured" : `Exceeds commodity-sale limit of \u09F3${saleCap.toLocaleString()}`
        });
        await conn.commit();
        sendTelegram(
          `\u23F3 <b>Commodity Sale Queued for Approval</b>
${customer.name} \u2014 \u09F3${totalAmount.toLocaleString()}
Requested by ${userName}`,
          "orders"
        );
        return {
          ok: true,
          queued: true,
          pending_request_id: reqId,
          message: `Sale of \u09F3${totalAmount.toLocaleString()} queued for a checker's approval.`
        };
      }
    }
    const result = await postCommoditySale(conn, {
      customerId: Number(customer_id),
      commodityId: Number(commodity_id),
      branchId: branch_id ? Number(branch_id) : null,
      origin: origin != null ? origin : "",
      saleDate,
      quantity: Number(quantity),
      unitPrice: Number(unit_price),
      stockOverride: Boolean(stock_override),
      sourcePurchaseOrderId: source_purchase_order_id ? Number(source_purchase_order_id) : null,
      notes: notes != null ? notes : null,
      userId
    });
    await auditLog(conn, {
      userId,
      action: "created",
      module: "trading",
      recordType: "commodity_sale",
      recordId: result.saleId,
      referenceNumber: result.saleNumber,
      description: `Commodity sale ${result.saleNumber} \u2014 ${customer.name} \xB7 \u09F3${result.totalAmount.toLocaleString()} \xB7 COGS \u09F3${result.cogs.toLocaleString()}${saleDate !== today ? ` \xB7 BACKDATED to ${saleDate}` : ""}`,
      severity: "info",
      ipAddress
    });
    await conn.commit();
    sendTelegram(
      `\u{1F33E} <b>Commodity Sale</b>
${result.saleNumber} \u2014 ${customer.name}
\u09F3${result.totalAmount.toLocaleString()} \xB7 by ${userName}` + (stock_override ? "\n\u26A0\uFE0F Sold past on-hand stock (override)" : ""),
      "orders"
    );
    return { ok: true, id: result.saleId, sale_number: result.saleNumber, total_amount: result.totalAmount };
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    console.error("[trading/sales] failed:", e == null ? void 0 : e.message);
    throw createError({ statusCode: 500, statusMessage: (_g = (_f = e == null ? void 0 : e.sqlMessage) != null ? _f : e == null ? void 0 : e.message) != null ? _g : "Commodity sale failed" });
  } finally {
    conn.release();
  }
});

export { sales_post as default };
//# sourceMappingURL=sales.post.mjs.map

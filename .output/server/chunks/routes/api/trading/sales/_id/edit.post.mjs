import { q as defineEventHandler, R as getRouterParam, m as createError, ar as readBody, X as getUserSession, z as getDb, a1 as isAdminRole, x as getCreditWorkflowSettings, U as getUserActionLimit, aq as queuePendingRequest, aH as sendTelegram, ax as recycleBegin, aB as recycleSnapshotBefore, aD as restoreCommodityStock, aw as recycleArchiveDelete, ag as postCommoditySale, ay as recycleFinalize, g as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const edit_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const reason = String((_c = body == null ? void 0 : body.reason) != null ? _c : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required for every correction" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[sale]] = await conn.query(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`,
      [id]
    );
    if (!sale) throw createError({ statusCode: 404, statusMessage: "Sale not found" });
    if (Number(sale.amount_paid) > 5e-3)
      throw createError({ statusCode: 409, statusMessage: "This sale has payments \u2014 reverse them before correcting it" });
    const [[pendingEdit]] = await conn.query(
      `SELECT id FROM commodity_sale_edits WHERE old_sale_id = ? AND status = 'pending_approval' LIMIT 1`,
      [id]
    );
    if (pendingEdit && !(body == null ? void 0 : body.is_checker_review))
      throw createError({ statusCode: 409, statusMessage: "A correction is already pending approval on this sale" });
    const proposed = {
      customer_id: Number((_d = body == null ? void 0 : body.customer_id) != null ? _d : sale.customer_id),
      commodity_id: Number((_e = body == null ? void 0 : body.commodity_id) != null ? _e : sale.commodity_id),
      branch_id: (body == null ? void 0 : body.branch_id) !== void 0 ? body.branch_id ? Number(body.branch_id) : null : sale.branch_id,
      origin: (body == null ? void 0 : body.origin) !== void 0 ? String((_f = body.origin) != null ? _f : "") : (_g = sale.origin) != null ? _g : "",
      sale_date: String((_h = body == null ? void 0 : body.sale_date) != null ? _h : sale.sale_date).slice(0, 10),
      quantity: Number((_i = body == null ? void 0 : body.quantity) != null ? _i : sale.quantity),
      unit_price: Number((_j = body == null ? void 0 : body.unit_price) != null ? _j : sale.unit_price),
      notes: (body == null ? void 0 : body.notes) !== void 0 ? body.notes : sale.notes,
      source_purchase_order_id: (body == null ? void 0 : body.source_purchase_order_id) !== void 0 ? body.source_purchase_order_id ? Number(body.source_purchase_order_id) : null : sale.source_purchase_order_id
    };
    const newTotal = Math.round(proposed.quantity * proposed.unit_price * 100) / 100;
    const diff = {};
    for (const k of Object.keys(proposed)) {
      const oldV = k === "sale_date" ? String(sale[k]).slice(0, 10) : sale[k];
      if (String(oldV != null ? oldV : "") !== String((_k = proposed[k]) != null ? _k : "")) diff[k] = { from: oldV, to: proposed[k] };
    }
    if (!Object.keys(diff).length)
      throw createError({ statusCode: 400, statusMessage: "Nothing changed" });
    if (!isAdminRole(role) && !(body == null ? void 0 : body.is_checker_review)) {
      const { paymentRequireApproval } = await getCreditWorkflowSettings(conn);
      const saleCap = (_l = await getUserActionLimit(conn, userId, "commodity_sale")) != null ? _l : await getUserActionLimit(conn, userId, "approve_order");
      const withinCap = saleCap !== null && newTotal <= saleCap;
      if (paymentRequireApproval || !withinCap) {
        const [editRes] = await conn.query(
          `INSERT INTO commodity_sale_edits
             (old_sale_id, old_sale_number, change_summary, reason, status, requested_by_user_id)
           VALUES (?, ?, ?, ?, 'pending_approval', ?)`,
          [id, sale.sale_number, JSON.stringify(diff), reason, userId]
        );
        const reqId = await queuePendingRequest(conn, {
          requestType: "commodity_sale_edit",
          payload: { ...body, sale_id: id, edit_id: editRes.insertId },
          customerId: sale.customer_id,
          amount: newTotal,
          referenceLabel: `EDIT ${sale.sale_number} \u2014 ${sale.customer_name} \u2192 \u09F3${newTotal.toLocaleString()}`,
          requestedBy: userId,
          requestedReason: `Correction to ${sale.sale_number}: ${reason.slice(0, 120)}`
        });
        await conn.commit();
        sendTelegram(
          `\u23F3 <b>Sale Correction Queued</b>
${sale.sale_number} \u2014 ${sale.customer_name}
Requested by ${userName}
Reason: ${reason}`,
          "orders"
        );
        return { ok: true, queued: true, pending_request_id: reqId, message: "Correction queued for a checker's approval." };
      }
    }
    const batchId = await recycleBegin(conn, {
      entityType: "commodity_sale_edit",
      label: `EDIT ${sale.sale_number} \u2014 ${sale.customer_name}`,
      customerId: sale.customer_id,
      userId,
      userName
    });
    await recycleSnapshotBefore(conn, batchId, "commodity_inventory", "commodity_id", sale.commodity_id);
    await restoreCommodityStock(conn, {
      commodityId: sale.commodity_id,
      branchId: Number((_m = sale.branch_id) != null ? _m : 0),
      origin: (_n = sale.origin) != null ? _n : "",
      qty: Number(sale.quantity)
    });
    if (sale.customer_ledger_id) {
      await recycleArchiveDelete(conn, batchId, "customer_ledger", "id", sale.customer_ledger_id);
    }
    if (sale.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", sale.journal_entry_id);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", sale.journal_entry_id);
    }
    await recycleArchiveDelete(conn, batchId, "commodity_sales", "id", id);
    const result = await postCommoditySale(conn, {
      customerId: proposed.customer_id,
      commodityId: proposed.commodity_id,
      branchId: proposed.branch_id,
      origin: proposed.origin,
      saleDate: proposed.sale_date,
      quantity: proposed.quantity,
      unitPrice: proposed.unit_price,
      stockOverride: true,
      // correction reposts must never be blocked by a transient stock dip
      sourcePurchaseOrderId: proposed.source_purchase_order_id,
      notes: proposed.notes,
      userId
    });
    await recycleFinalize(conn, batchId);
    for (const cid of /* @__PURE__ */ new Set([sale.customer_id, proposed.customer_id])) {
      const [[bal]] = await conn.query(
        `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS b FROM customer_ledger WHERE customer_id = ?`,
        [cid]
      );
      await conn.query(`UPDATE customers SET current_balance = GREATEST(0, ?) WHERE id = ?`, [Number(bal.b), cid]);
    }
    if (body == null ? void 0 : body.edit_id) {
      await conn.query(
        `UPDATE commodity_sale_edits
         SET status = 'approved', new_sale_id = ?, new_sale_number = ?, decided_by_user_id = ?, decided_at = NOW()
         WHERE id = ?`,
        [result.saleId, result.saleNumber, userId, Number(body.edit_id)]
      );
    } else {
      await conn.query(
        `INSERT INTO commodity_sale_edits
           (old_sale_id, old_sale_number, new_sale_id, new_sale_number, change_summary, reason,
            status, requested_by_user_id, decided_by_user_id, decided_at)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, ?, NOW())`,
        [id, sale.sale_number, result.saleId, result.saleNumber, JSON.stringify(diff), reason, userId, userId]
      );
    }
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "trading",
      recordType: "commodity_sale",
      recordId: result.saleId,
      referenceNumber: result.saleNumber,
      description: `Sale corrected: ${sale.sale_number} \u2192 ${result.saleNumber} (batch #${batchId}) \u2014 ${reason}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `\u270F\uFE0F <b>Commodity Sale Corrected</b>
${sale.sale_number} \u2192 ${result.saleNumber}
\u09F3${result.totalAmount.toLocaleString()} \xB7 by ${userName}
Reason: ${reason}`,
      "orders"
    );
    return { ok: true, id: result.saleId, sale_number: result.saleNumber };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { edit_post as default };
//# sourceMappingURL=edit.post.mjs.map

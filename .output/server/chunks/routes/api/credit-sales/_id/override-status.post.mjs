import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, b as ADMIN_ROLES, at as readBody, z as getDb, E as getGLAccountId, al as postJournalEntry, ai as postCustomerLedger, ak as postGoodsOnBoardInvoice, am as postOtherSalesCOGS, g as auditLog, aM as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const OVERRIDE_TRANSITIONS = {
  ready_to_ship: ["goods_on_board", "shipped", "hold"],
  goods_on_board: ["shipped", "delivered", "hold"],
  shipped: ["delivered"],
  hold: ["ready_to_ship", "goods_on_board", "shipped", "delivered"],
  delivered: ["cancelled"]
};
const overrideStatus_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Manual status override is admin/superadmin only" });
  const body = await readBody(event);
  const to_status = String((_c = body == null ? void 0 : body.to_status) != null ? _c : "");
  const reason = String((_d = body == null ? void 0 : body.reason) != null ? _d : "").trim();
  if (!to_status) throw createError({ statusCode: 400, statusMessage: "to_status is required" });
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required for a manual status override" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.*, c.name AS customer_name FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id WHERE o.id = ? FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const allowed = (_e = OVERRIDE_TRANSITIONS[order.status]) != null ? _e : [];
    if (!allowed.includes(to_status)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot override "${order.status}" \u2192 "${to_status}" \u2014 allowed targets: ${allowed.join(", ") || "none"}`
      });
    }
    let telegramMsg = "";
    if (to_status === "cancelled") {
      const [[entangled]] = await conn.query(
        `SELECT
           (SELECT COUNT(*) FROM customer_payments WHERE order_id = ?) +
           (SELECT COUNT(*) FROM payment_allocations WHERE order_id = ?) +
           (SELECT COUNT(*) FROM credit_order_returns WHERE order_id = ?) +
           (SELECT COUNT(*) FROM credit_order_over_deliveries WHERE order_id = ?) AS n`,
        [id, id, id, id]
      );
      if (Number(entangled.n) > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: "This order has payments, returns, or over-deliveries recorded \u2014 reverse those first (Payment History / Returns Center), then cancel."
        });
      }
      const [[invoiceLedger]] = await conn.query(
        `SELECT id, journal_entry_id FROM customer_ledger
         WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice' LIMIT 1`,
        [id]
      );
      if (invoiceLedger) {
        const postDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const arId = await getGLAccountId(conn, "Accounts Receivable");
        const revId = await getGLAccountId(conn, "Revenue");
        let reversalJeId = null;
        if (arId && revId) {
          reversalJeId = await postJournalEntry(conn, {
            date: postDate,
            description: `Reversal \u2014 ${order.order_number} cancelled after delivery (admin override)`,
            docType: "CreditOrder",
            docId: id,
            userId,
            lines: [
              { accountId: revId, debit: Number(order.total_amount), credit: 0, memo: order.order_number },
              { accountId: arId, debit: 0, credit: Number(order.total_amount), memo: order.order_number }
            ]
          });
        }
        await postCustomerLedger(conn, {
          customerId: order.customer_id,
          date: postDate,
          transactionType: "credit_note",
          referenceType: "credit_order",
          referenceId: id,
          invoiceNumber: order.order_number,
          description: `Order ${order.order_number} cancelled after delivery \u2014 invoice reversed (admin override)`,
          debit: 0,
          credit: Number(order.total_amount),
          journalEntryId: reversalJeId,
          userId
        });
      }
      await conn.query(
        `UPDATE credit_orders SET status = 'cancelled', total_amount = 0, balance_due = 0, updated_at = NOW() WHERE id = ?`,
        [id]
      );
      telegramMsg = `\u26A0\uFE0F <b>Order Cancelled (post-delivery reversal)</b>
${order.order_number} \u2014 ${order.customer_name}
Reason: ${reason}
by ${userName}`;
    } else if (["goods_on_board", "shipped", "delivered"].includes(to_status)) {
      await postGoodsOnBoardInvoice(conn, {
        orderId: id,
        orderNumber: order.order_number,
        customerId: order.customer_id,
        customerName: order.customer_name,
        totalAmount: Number(order.total_amount),
        balanceDue: Number(order.balance_due),
        userId,
        userName
      });
      if (order.is_other_sales) {
        await postOtherSalesCOGS(conn, {
          orderId: id,
          orderNumber: order.order_number,
          branchId: (_f = order.assigned_branch_id) != null ? _f : null,
          userId
        });
      }
      await conn.query(`UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`, [to_status, id]);
      telegramMsg = `\u{1F6E0}\uFE0F <b>Manual Status Override</b>
${order.order_number} \u2014 ${order.customer_name}
${order.status} \u2192 ${to_status}
Reason: ${reason}
by ${userName}`;
    } else {
      await conn.query(`UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`, [to_status, id]);
      telegramMsg = `\u{1F6E0}\uFE0F <b>Manual Status Override</b>
${order.order_number} \u2014 ${order.customer_name}
${order.status} \u2192 ${to_status}
Reason: ${reason}
by ${userName}`;
    }
    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, action, from_status, to_status, comments, performed_by_user_id)
       VALUES (?, 'status_override', ?, ?, ?, ?)`,
      [id, order.status, to_status, reason, userId]
    );
    await auditLog(conn, {
      userId,
      action: "status_changed",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `Admin manual status override: ${order.order_number} ${order.status} \u2192 ${to_status} \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(telegramMsg);
    return { ok: true, from_status: order.status, to_status };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { overrideStatus_post as default };
//# sourceMappingURL=override-status.post.mjs.map

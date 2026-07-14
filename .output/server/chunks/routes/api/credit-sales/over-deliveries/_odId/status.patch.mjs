import { n as defineEventHandler, I as getRouterParam, j as createError, L as getUserSession, a as ADMIN_ROLES, a9 as readBody, u as getDb, w as getGLAccountId, a4 as postJournalEntry, a2 as postCustomerLedger, e as auditLog, ag as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const status_patch = defineEventHandler(async (event) => {
  var _a, _b;
  const odId = Number(getRouterParam(event, "odId"));
  if (!odId) throw createError({ statusCode: 400, statusMessage: "Invalid over-delivery ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  const body = await readBody(event);
  const action = body == null ? void 0 : body.action;
  const notes = body == null ? void 0 : body.notes;
  if (!["approve", "reject"].includes(action))
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[od]] = await conn.query(
      `SELECT od.*, o.order_number FROM credit_order_over_deliveries od
       JOIN credit_orders o ON o.id = od.order_id
       WHERE od.id = ? FOR UPDATE`,
      [odId]
    );
    if (!od) throw createError({ statusCode: 404, statusMessage: "Over-delivery not found" });
    if (od.status !== "pending")
      throw createError({ statusCode: 409, statusMessage: `Already ${od.status}` });
    if (Number(od.created_by_user_id) === userId)
      throw createError({ statusCode: 403, statusMessage: "You recorded this over-delivery \u2014 a different authorised user must decide it" });
    const newStatus = action === "approve" ? "approved" : "rejected";
    const amount = Number(od.total_extra_amount);
    let jeId = null;
    if (action === "approve" && od.resolution === "bill") {
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const arId = await getGLAccountId(conn, "Accounts Receivable");
      const revId = await getGLAccountId(conn, "Revenue");
      if (arId && revId) {
        jeId = await postJournalEntry(conn, {
          date,
          description: `Over-delivery billed \u2014 ${od.od_number} (Order ${od.order_number})`,
          docType: "OverDelivery",
          docId: odId,
          userId,
          lines: [
            { accountId: arId, debit: amount, credit: 0, memo: od.od_number },
            { accountId: revId, debit: 0, credit: amount, memo: od.od_number }
          ]
        });
      }
      await postCustomerLedger(conn, {
        customerId: od.customer_id,
        date,
        transactionType: "debit_note",
        referenceType: "credit_order_over_delivery",
        referenceId: odId,
        invoiceNumber: od.od_number,
        description: `Over-delivery billed \u2014 ${od.od_number} (Order ${od.order_number})`,
        debit: amount,
        credit: 0,
        journalEntryId: jeId,
        userId
      });
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = total_amount + ?, balance_due = balance_due + ?, updated_at = NOW()
         WHERE id = ?`,
        [amount, amount, od.order_id]
      );
    }
    await conn.query(
      `UPDATE credit_order_over_deliveries
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(), decision_note = ?, journal_entry_id = ?
       WHERE id = ?`,
      [newStatus, userId, notes != null ? notes : null, jeId, odId]
    );
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        od.order_id,
        od.status,
        od.status,
        action === "approve" ? "over_delivery_approved" : "over_delivery_rejected",
        userId,
        `${od.od_number} ${action === "approve" ? `approved (${od.resolution})` : "rejected"}${notes ? ` \u2014 ${notes}` : ""}`
      ]
    );
    await auditLog(conn, {
      userId,
      action: action === "approve" ? "approved" : "rejected",
      module: "credit_sales",
      recordType: "credit_order_over_delivery",
      recordId: od.order_id,
      referenceNumber: od.od_number,
      description: `Over-delivery ${od.od_number} (Order ${od.order_number}) ${action}d \u2014 \u09F3${amount.toLocaleString()} (${od.resolution})${notes ? ` \xB7 ${notes}` : ""}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `${action === "approve" ? "\u2705" : "\u274C"} <b>Over-Delivery ${action === "approve" ? "Approved" : "Rejected"}</b>
${od.od_number} \u2014 Order ${od.order_number}
\u09F3${amount.toLocaleString()} (${od.resolution}) \xB7 by ${userName}`
    );
    return { ok: true, status: newStatus };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { status_patch as default };
//# sourceMappingURL=status.patch.mjs.map

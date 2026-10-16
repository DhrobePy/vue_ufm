import { u as defineEventHandler, a0 as getRouterParam, r as createError, aS as requireAction, aF as readBody, V as getRequestHeader, I as getDb, L as getGLAccountId, F as getCreditRevenueAccountId, av as postJournalEntry, ar as postCustomerLedger, k as auditLog } from '../../../../../nitro/nitro.mjs';
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

const status_patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const returnId = Number(getRouterParam(event, "returnId"));
  if (!returnId) throw createError({ statusCode: 400, statusMessage: "Invalid return ID" });
  const { userId } = await requireAction(
    event,
    { module: "credit_sales", page: "all", action: "approve_return", roleFallback: [], explicit: true },
    'Only admin / superadmin, or a user granted "Approve / Reject Returns", may decide returns'
  );
  const body = await readBody(event);
  const action = body == null ? void 0 : body.action;
  const notes = body == null ? void 0 : body.notes;
  const ipAddress = (_b = (_a = getRequestHeader(event, "x-forwarded-for")) != null ? _a : getRequestHeader(event, "x-real-ip")) != null ? _b : void 0;
  if (!["approve", "reject"].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[ret]] = await conn.query(
      `SELECT r.*, o.order_number, o.customer_id
       FROM credit_order_returns r
       JOIN credit_orders o ON o.id = r.order_id
       WHERE r.id = ?`,
      [returnId]
    );
    if (!ret) throw createError({ statusCode: 404, statusMessage: "Return not found" });
    if (ret.status !== "pending") {
      throw createError({ statusCode: 409, statusMessage: `Return is already ${ret.status}` });
    }
    if (Number(ret.created_by_user_id) === Number(userId)) {
      throw createError({ statusCode: 403, statusMessage: "You filed this return \u2014 a different authorised user must decide it" });
    }
    const newStatus = action === "approve" ? "approved" : "rejected";
    await conn.query(
      `UPDATE credit_order_returns
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(),
           notes = CASE WHEN ? IS NOT NULL THEN CONCAT(COALESCE(notes,''), ' | Admin note: ', ?) ELSE notes END
       WHERE id = ?`,
      [newStatus, userId, notes != null ? notes : null, notes != null ? notes : null, returnId]
    );
    if (action === "approve") {
      const totalRetAmount = Number(ret.total_returned_amount);
      const retDate = ret.return_date;
      let jeId = null;
      const arId = await getGLAccountId(conn, "Accounts Receivable");
      const revId = await getCreditRevenueAccountId(conn, ret.order_id);
      if (arId && revId && totalRetAmount > 0) {
        jeId = await postJournalEntry(conn, {
          date: retDate instanceof Date ? retDate.toISOString().slice(0, 10) : String(retDate).slice(0, 10),
          description: `Goods return credit note ${ret.return_number} \u2014 Order ${ret.order_number}`,
          docType: "CreditOrderReturn",
          docId: returnId,
          userId,
          lines: [
            { accountId: revId, debit: totalRetAmount, credit: 0, memo: ret.return_number },
            { accountId: arId, debit: 0, credit: totalRetAmount, memo: ret.return_number }
          ]
        });
      }
      await postCustomerLedger(conn, {
        customerId: ret.customer_id,
        date: retDate,
        transactionType: "credit_note",
        referenceType: "credit_order_return",
        referenceId: returnId,
        invoiceNumber: ret.return_number,
        description: `Goods Return Credit Note \u2014 ${ret.return_number} (Order ${ret.order_number})`,
        debit: 0,
        credit: totalRetAmount,
        journalEntryId: jeId,
        userId
      });
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, ret.order_id]
      );
    }
    const wfAction = action === "approve" ? "return_approved" : "return_rejected";
    const wfComment = `${action === "approve" ? "Approved" : "Rejected"} return ${ret.return_number} \u2014 \u09F3${Number(ret.total_returned_amount).toLocaleString()}${notes ? ` | ${notes}` : ""}`;
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [ret.order_id, (_c = ret.status) != null ? _c : "delivered", (_d = ret.status) != null ? _d : "delivered", wfAction, userId, wfComment]
    );
    await auditLog(conn, {
      userId,
      action: wfAction,
      // 'return_approved'→'approved', 'return_rejected'→'rejected'
      module: "credit_sales",
      recordType: "credit_order_return",
      recordId: ret.order_id,
      // credit order id — audit page links to /credit-sales/{id}
      referenceNumber: ret.return_number,
      description: `${action === "approve" ? "Approved" : "Rejected"} return ${ret.return_number} (Order ${ret.order_number}) \u2014 \u09F3${Number(ret.total_returned_amount).toLocaleString()}${notes ? ` \xB7 ${notes}` : ""}`,
      severity: action === "approve" ? "info" : "warning",
      ipAddress
    });
    await conn.commit();
    return { ok: true, status: newStatus, return_id: returnId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { status_patch as default };
//# sourceMappingURL=status.patch.mjs.map

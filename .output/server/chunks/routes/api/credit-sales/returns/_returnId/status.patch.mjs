import { h as defineEventHandler, v as getRouterParam, e as createError, w as getUserSession, K as readBody, q as getRequestHeader, n as getDb, a as auditLog } from '../../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const returnId = Number(getRouterParam(event, "returnId"));
  if (!returnId) throw createError({ statusCode: 400, statusMessage: "Invalid return ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Admin access required to approve returns" });
  }
  const body = await readBody(event);
  const action = body == null ? void 0 : body.action;
  const notes = body == null ? void 0 : body.notes;
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
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
    const newStatus = action === "approve" ? "approved" : "rejected";
    await conn.query(
      `UPDATE credit_order_returns
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(),
           notes = CASE WHEN ? IS NOT NULL THEN CONCAT(COALESCE(notes,''), ' | Admin note: ', ?) ELSE notes END,
           updated_at = NOW()
       WHERE id = ?`,
      [newStatus, userId, notes != null ? notes : null, notes != null ? notes : null, returnId]
    );
    if (action === "approve") {
      const totalRetAmount = Number(ret.total_returned_amount);
      const retDate = ret.return_date;
      const [[lastLedger]] = await conn.query(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [ret.customer_id]
      );
      const prevBal = Number((_g = lastLedger == null ? void 0 : lastLedger.bal) != null ? _g : 0);
      const newBal = Math.max(0, prevBal - totalRetAmount);
      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
         VALUES (?, ?, 'credit_note', 'credit_order_return', ?, ?, ?, 0, ?, ?, ?)`,
        [
          ret.customer_id,
          retDate,
          returnId,
          ret.return_number,
          `Goods Return Credit Note \u2014 ${ret.return_number} (Order ${ret.order_number})`,
          totalRetAmount,
          newBal,
          userId
        ]
      );
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, ret.order_id]
      );
      await conn.query(
        `UPDATE customers
         SET current_balance = GREATEST(0, current_balance - ?),
             updated_at = NOW()
         WHERE id = ?`,
        [totalRetAmount, ret.customer_id]
      );
    }
    const wfAction = action === "approve" ? "return_approved" : "return_rejected";
    const wfComment = `${action === "approve" ? "Approved" : "Rejected"} return ${ret.return_number} \u2014 \u09F3${Number(ret.total_returned_amount).toLocaleString()}${notes ? ` | ${notes}` : ""}`;
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [ret.order_id, (_h = ret.status) != null ? _h : "delivered", (_i = ret.status) != null ? _i : "delivered", wfAction, userId, wfComment]
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

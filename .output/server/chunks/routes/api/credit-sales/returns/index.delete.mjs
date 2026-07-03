import { j as defineEventHandler, C as getRouterParam, f as createError, F as getUserSession, v as getRequestHeader, q as getDb, b as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const returnId = Number(getRouterParam(event, "returnId"));
  if (!returnId) throw createError({ statusCode: 400, statusMessage: "Invalid return ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can delete returns" });
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
    const retAmount = Number(ret.total_returned_amount);
    if (ret.status === "approved") {
      await conn.query(
        `DELETE FROM customer_ledger
         WHERE reference_type = 'credit_order_return' AND reference_id = ?`,
        [returnId]
      );
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = total_amount + ?,
             balance_due  = balance_due  + ?,
             updated_at   = NOW()
         WHERE id = ?`,
        [retAmount, retAmount, ret.order_id]
      );
      await conn.query(
        `UPDATE customers
         SET current_balance = current_balance + ?, updated_at = NOW()
         WHERE id = ?`,
        [retAmount, ret.customer_id]
      );
    }
    await conn.query(`DELETE FROM credit_order_return_items WHERE return_id = ?`, [returnId]);
    await conn.query(`DELETE FROM credit_order_returns WHERE id = ?`, [returnId]);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "credit_sales",
      recordType: "credit_order_return",
      recordId: ret.order_id,
      referenceNumber: ret.return_number,
      description: ret.status === "approved" ? `Approved return ${ret.return_number} deleted & reversed \u2014 \u09F3${retAmount.toLocaleString()} restored to order ${ret.order_number}` : `Return ${ret.return_number} (${ret.status}) deleted from order ${ret.order_number}`,
      severity: ret.status === "approved" ? "warning" : "info",
      ipAddress
    });
    await conn.commit();
    return { ok: true, return_number: ret.return_number, was_approved: ret.status === "approved" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map

import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, K as getRequestHeader, z as getDb, aB as recycleBegin, aP as serializeRow, aF as recycleSnapshotBefore, aA as recycleArchiveDelete, aC as recycleFinalize, g as auditLog } from '../../../../nitro/nitro.mjs';
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

const _returnId__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
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
    const batchId = await recycleBegin(conn, {
      entityType: "credit_order_return",
      label: (_g = ret.return_number) != null ? _g : `Return-${returnId}`,
      customerId: ret.customer_id,
      userId,
      userName: (_i = (_h = session == null ? void 0 : session.user) == null ? void 0 : _h.name) != null ? _i : `User ${userId}`
    });
    if (ret.status === "approved") {
      const [ledgerRows] = await conn.query(
        `SELECT * FROM customer_ledger WHERE reference_type = 'credit_order_return' AND reference_id = ?`,
        [returnId]
      );
      for (const row of ledgerRows) {
        await conn.query(
          `INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json)
           VALUES (?, 'customer_ledger', 'delete', 'id', ?, ?)`,
          [batchId, String(row.id), JSON.stringify(serializeRow(row))]
        );
      }
      await conn.query(
        `DELETE FROM customer_ledger WHERE reference_type = 'credit_order_return' AND reference_id = ?`,
        [returnId]
      );
      await recycleSnapshotBefore(conn, batchId, "credit_orders", "id", ret.order_id);
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = total_amount + ?,
             balance_due  = balance_due  + ?,
             updated_at   = NOW()
         WHERE id = ?`,
        [retAmount, retAmount, ret.order_id]
      );
      await recycleSnapshotBefore(conn, batchId, "customers", "id", ret.customer_id);
      await conn.query(
        `UPDATE customers
         SET current_balance = current_balance + ?, updated_at = NOW()
         WHERE id = ?`,
        [retAmount, ret.customer_id]
      );
    }
    await recycleArchiveDelete(conn, batchId, "credit_order_return_items", "return_id", returnId);
    await recycleArchiveDelete(conn, batchId, "credit_order_returns", "id", returnId);
    await recycleFinalize(conn, batchId);
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

export { _returnId__delete as default };
//# sourceMappingURL=_returnId_.delete.mjs.map

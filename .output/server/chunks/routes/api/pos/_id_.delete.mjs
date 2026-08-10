import { q as defineEventHandler, X as getUserSession, m as createError, a1 as isAdminRole, R as getRouterParam, as as readBody, z as getDb, az as recycleBegin, aD as recycleSnapshotBefore, ay as recycleArchiveDelete, aA as recycleFinalize, g as auditLog, aK as sendTelegram } from '../../../nitro/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAdminRole(role)) throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const userId = Number(session.user.id);
  const userName = (_b = session.user.name) != null ? _b : `User ${userId}`;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event).catch(() => ({}));
  const reason = String((_c = body == null ? void 0 : body.reason) != null ? _c : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.*, c.name AS customer_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? AND o.order_type = 'POS' FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const batchId = await recycleBegin(conn, {
      entityType: "pos_order",
      label: `${order.order_number} \u2014 ${(_d = order.customer_name) != null ? _d : "Walk-in"} \u2014 \u09F3${Number(order.total_amount).toLocaleString()}`,
      customerId: order.customer_id,
      userId,
      userName
    });
    const [items] = await conn.query(`SELECT * FROM order_items WHERE order_id = ?`, [id]);
    for (const it of items) {
      await recycleSnapshotBefore(conn, batchId, "product_variants", "id", it.variant_id);
      await conn.query(`UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`, [it.quantity, it.variant_id]);
    }
    if (order.payment_method === "Cash" && order.cash_account_id && Number(order.cash_amount) > 5e-3) {
      await recycleSnapshotBefore(conn, batchId, "branch_petty_cash_accounts", "id", order.cash_account_id);
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`, [Number(order.cash_amount), order.cash_account_id]);
      await recycleArchiveDelete(conn, batchId, "branch_petty_cash_transactions", "reference_id", id);
    }
    await recycleArchiveDelete(conn, batchId, "pos_customer_ledger", "order_id", id);
    if (order.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", order.journal_entry_id);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", order.journal_entry_id);
    }
    await recycleArchiveDelete(conn, batchId, "order_items", "order_id", id);
    await recycleArchiveDelete(conn, batchId, "orders", "id", id);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "other",
      recordType: "pos_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `POS sale ${order.order_number} deleted (recycle batch #${batchId}) \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F5D1}\uFE0F <b>POS Sale Deleted</b>
${order.order_number}${order.customer_name ? ` \u2014 ${order.customer_name}` : ""}
\u09F3${Number(order.total_amount).toLocaleString()} \xB7 by ${userName}
Reason: ${reason}`,
      "orders"
    );
    return { ok: true, recycle_batch_id: batchId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

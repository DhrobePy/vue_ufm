import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, X as getUserSession, b as ADMIN_ROLES, aR as userCanAction, z as getDb, az as recycleBegin, aD as recycleSnapshotBefore, aF as restoreCommodityStock, ay as recycleArchiveDelete, aA as recycleFinalize, g as auditLog, aK as sendTelegram } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const body = await readBody(event).catch(() => ({}));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const canDelete = ADMIN_ROLES.includes(role) || await userCanAction({
    userId,
    role,
    module: "trading",
    page: "sales",
    action: "delete_sale",
    roleFallback: ADMIN_ROLES
  });
  if (!canDelete) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to delete commodity sales" });
  const reason = String((_c = body == null ? void 0 : body.reason) != null ? _c : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
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
      throw createError({ statusCode: 409, statusMessage: "This sale has payments recorded \u2014 reverse those first, then delete" });
    const [[pendingEdit]] = await conn.query(
      `SELECT id FROM commodity_sale_edits WHERE old_sale_id = ? AND status = 'pending_approval' LIMIT 1`,
      [id]
    );
    if (pendingEdit) throw createError({ statusCode: 409, statusMessage: "A correction is pending approval on this sale \u2014 decide it first" });
    const batchId = await recycleBegin(conn, {
      entityType: "commodity_sale",
      label: `${sale.sale_number} \u2014 ${sale.customer_name} \u2014 \u09F3${Number(sale.total_amount).toLocaleString()}`,
      customerId: sale.customer_id,
      userId,
      userName
    });
    await recycleSnapshotBefore(conn, batchId, "commodity_inventory", "commodity_id", sale.commodity_id);
    await restoreCommodityStock(conn, {
      commodityId: sale.commodity_id,
      branchId: Number((_d = sale.branch_id) != null ? _d : 0),
      origin: (_e = sale.origin) != null ? _e : "",
      qty: Number(sale.quantity)
    });
    if (sale.customer_ledger_id) {
      await recycleArchiveDelete(conn, batchId, "customer_ledger", "id", sale.customer_ledger_id);
      const [[bal]] = await conn.query(
        `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS b FROM customer_ledger WHERE customer_id = ?`,
        [sale.customer_id]
      );
      await conn.query(`UPDATE customers SET current_balance = GREATEST(0, ?) WHERE id = ?`, [Number(bal.b), sale.customer_id]);
    }
    if (sale.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", sale.journal_entry_id);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", sale.journal_entry_id);
    }
    await recycleArchiveDelete(conn, batchId, "commodity_sales", "id", id);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "trading",
      recordType: "commodity_sale",
      recordId: id,
      referenceNumber: sale.sale_number,
      description: `Commodity sale ${sale.sale_number} deleted (recycle batch #${batchId}) \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F5D1}\uFE0F <b>Commodity Sale Deleted</b>
${sale.sale_number} \u2014 ${sale.customer_name}
\u09F3${Number(sale.total_amount).toLocaleString()} \xB7 by ${userName}
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

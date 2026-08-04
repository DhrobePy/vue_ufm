import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, z as getDb, ax as recycleBegin, aw as recycleArchiveDelete, ay as recycleFinalize, g as auditLog } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1);
  const userName = (_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.name) != null ? _f : `User ${userId}`;
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can delete customers" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[customer]] = await conn.query(
      `SELECT id, name, business_name FROM customers WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const [[bal]] = await conn.query(
      `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS balance
       FROM customer_ledger WHERE customer_id = ?`,
      [id]
    );
    if (Math.abs(Number(bal.balance)) > 0.5) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot delete \u2014 outstanding ledger balance of \u09F3${Number(bal.balance).toLocaleString()}. Settle or write off first.`
      });
    }
    const label = customer.business_name ? `${customer.name} (${customer.business_name})` : customer.name;
    const batchId = await recycleBegin(conn, {
      entityType: "customer",
      label,
      customerId: id,
      userId,
      userName
    });
    const [orders] = await conn.query(`SELECT id FROM credit_orders WHERE customer_id = ?`, [id]);
    const [payments] = await conn.query(`SELECT id FROM customer_payments WHERE customer_id = ?`, [id]);
    for (const p of payments) {
      await recycleArchiveDelete(conn, batchId, "payment_allocations", "payment_id", p.id);
    }
    await recycleArchiveDelete(conn, batchId, "customer_payments", "customer_id", id);
    for (const o of orders) {
      const orderId = o.id;
      const [deliveries] = await conn.query(
        `SELECT id FROM credit_order_deliveries WHERE order_id = ?`,
        [orderId]
      );
      for (const d of deliveries) {
        await recycleArchiveDelete(conn, batchId, "credit_order_delivery_items", "delivery_id", d.id);
      }
      await recycleArchiveDelete(conn, batchId, "credit_order_deliveries", "order_id", orderId);
      const [returns] = await conn.query(
        `SELECT id FROM credit_order_returns WHERE order_id = ?`,
        [orderId]
      );
      for (const r of returns) {
        await recycleArchiveDelete(conn, batchId, "credit_order_return_items", "return_id", r.id);
      }
      await recycleArchiveDelete(conn, batchId, "credit_order_returns", "order_id", orderId);
      const [overDeliveries] = await conn.query(
        `SELECT id FROM credit_order_over_deliveries WHERE order_id = ?`,
        [orderId]
      );
      for (const od of overDeliveries) {
        await recycleArchiveDelete(conn, batchId, "credit_order_over_delivery_items", "od_id", od.id);
      }
      await recycleArchiveDelete(conn, batchId, "credit_order_over_deliveries", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "order_approval_conditions", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "order_amendments", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "cr_qr_scan_log", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "cr_delivery_confirmations", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "credit_pending_requests", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "credit_order_workflow", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "credit_order_audit", "order_id", orderId);
      const deliveryIds = deliveries.map((d) => d.id);
      const deliveryRefSql = deliveryIds.length ? ` OR (reference_type = 'credit_order_delivery' AND reference_id IN (${deliveryIds.map(() => "?").join(",")}))` : "";
      const [ledgerRows] = await conn.query(
        `SELECT id, journal_entry_id FROM customer_ledger
         WHERE (reference_type = 'credit_order' AND reference_id = ?)${deliveryRefSql}`,
        [orderId, ...deliveryIds]
      );
      for (const row of ledgerRows) {
        await recycleArchiveDelete(conn, batchId, "customer_ledger", "id", row.id);
      }
      for (const jeId of ledgerRows.map((r) => r.journal_entry_id).filter(Boolean)) {
        await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", jeId);
        await recycleArchiveDelete(conn, batchId, "journal_entries", "id", jeId);
      }
      await recycleArchiveDelete(conn, batchId, "credit_order_items", "order_id", orderId);
      await recycleArchiveDelete(conn, batchId, "credit_orders", "id", orderId);
    }
    const [remainingLedger] = await conn.query(
      `SELECT id, journal_entry_id FROM customer_ledger WHERE customer_id = ?`,
      [id]
    );
    for (const row of remainingLedger) {
      await recycleArchiveDelete(conn, batchId, "customer_ledger", "id", row.id);
    }
    for (const jeId of remainingLedger.map((r) => r.journal_entry_id).filter(Boolean)) {
      await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", jeId);
      await recycleArchiveDelete(conn, batchId, "journal_entries", "id", jeId);
    }
    await recycleArchiveDelete(conn, batchId, "credit_pending_requests", "customer_id", id);
    await recycleArchiveDelete(conn, batchId, "customers", "id", id);
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "customers",
      recordType: "customer",
      recordId: id,
      referenceNumber: customer.name,
      description: `Customer "${label}" deleted (${orders.length} order(s) cascaded) \u2014 recoverable from Recycle Bin`,
      severity: "critical"
    });
    await conn.commit();
    return { ok: true, deleted: label, recycle_bin_batch_id: batchId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

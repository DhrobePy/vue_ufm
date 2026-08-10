import { q as defineEventHandler, X as getUserSession, R as getRouterParam, as as readBody, m as createError, z as getDb, aj as postFleetExpenseGl } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  const userId = Number((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || 1;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { status, payment_method, cash_account_id, bank_account_id } = body;
  if (!["pending", "in_progress", "completed", "cancelled"].includes(status))
    throw createError({ statusCode: 400, statusMessage: "Invalid status" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[maint]] = await conn.query(
      `SELECT id, request_no, vehicle_id, total_cost, journal_entry_id, status
       FROM maintenance_requests WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!maint) throw createError({ statusCode: 404, statusMessage: "Maintenance request not found" });
    await conn.query(
      `UPDATE maintenance_requests
       SET status = ?, completed_date = ${status === "completed" ? "CURDATE()" : "completed_date"},
           payment_method = COALESCE(?, payment_method),
           cash_account_id = COALESCE(?, cash_account_id),
           bank_account_id = COALESCE(?, bank_account_id)
       WHERE id = ?`,
      [
        status,
        payment_method === "bank" ? "bank" : payment_method === "cash" ? "cash" : null,
        cash_account_id ? Number(cash_account_id) : null,
        bank_account_id ? Number(bank_account_id) : null,
        id
      ]
    );
    if (status === "completed" && !maint.journal_entry_id && Number(maint.total_cost) > 9e-3) {
      if (!payment_method)
        throw createError({ statusCode: 400, statusMessage: "A payment method is required to complete this maintenance request" });
      const journalEntryId = await postFleetExpenseGl({
        conn,
        expenseAccountName: "Vehicle Maintenance Expense",
        paymentMethod: payment_method === "bank" ? "bank" : "cash",
        cashAccountId: cash_account_id ? Number(cash_account_id) : null,
        bankAccountId: bank_account_id ? Number(bank_account_id) : null,
        amount: Number(maint.total_cost),
        date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        description: `Vehicle maintenance \u2014 ${maint.request_no}`,
        relatedDocumentType: "MaintenanceRequest",
        relatedDocumentId: id,
        userId
      });
      await conn.query(`UPDATE maintenance_requests SET journal_entry_id = ? WHERE id = ?`, [journalEntryId, id]);
    }
    if (status === "completed") {
      await conn.query(
        `UPDATE fleet_vehicles SET status = 'available' WHERE id = ? AND status = 'repair'`,
        [maint.vehicle_id]
      );
    }
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

import { q as defineEventHandler, R as getRouterParam, X as getUserSession, m as createError, z as getDb, az as recycleBegin, ay as recycleArchiveDelete, aD as recycleSnapshotBefore, aA as recycleFinalize, g as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[je]] = await conn.query(
      `SELECT id, description, is_reversed, related_document_type, related_document_id FROM journal_entries WHERE id = ?`,
      [id]
    );
    if (!je) throw createError({ statusCode: 404, statusMessage: "Journal entry not found" });
    if (je.is_reversed) throw createError({ statusCode: 400, statusMessage: "Cannot delete a reversed journal entry" });
    const [[linked]] = await conn.query(
      `SELECT id FROM journal_entries WHERE reversed_by_entry_id = ?`,
      [id]
    );
    if (linked) throw createError({ statusCode: 400, statusMessage: "Cannot delete \u2014 this entry has been reversed" });
    const batchId = await recycleBegin(conn, {
      entityType: "journal_entry",
      label: je.description ? `JE-${id}: ${je.description}` : `JE-${id}`,
      userId,
      userName: (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : `User ${userId}`
    });
    await recycleArchiveDelete(conn, batchId, "transaction_lines", "journal_entry_id", id);
    await recycleArchiveDelete(conn, batchId, "journal_entries", "id", id);
    if (je.related_document_type === "ExpenseVoucher" && je.related_document_id) {
      await recycleSnapshotBefore(conn, batchId, "expense_vouchers", "id", je.related_document_id);
      await conn.query(
        `UPDATE expense_vouchers SET journal_entry_id = NULL WHERE id = ? AND journal_entry_id = ?`,
        [je.related_document_id, id]
      );
    }
    await recycleFinalize(conn, batchId);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "accounts",
      recordType: "journal_entry",
      recordId: id,
      referenceNumber: `JE-${id}`,
      description: `Journal entry JE-${id} deleted by user ${userId}`,
      severity: "critical"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

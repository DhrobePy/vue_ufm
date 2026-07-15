import { n as defineEventHandler, K as getRouterParam, aa as readBody, N as getUserSession, j as createError, v as getDb, e as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reverse_post = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { reason } = body != null ? body : {};
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[je]] = await conn.query(
      `SELECT id, description, transaction_date, is_reversed FROM journal_entries WHERE id = ?`,
      [id]
    );
    if (!je) throw createError({ statusCode: 404, statusMessage: "Journal entry not found" });
    if (je.is_reversed) throw createError({ statusCode: 400, statusMessage: "This entry is already reversed" });
    const [lines] = await conn.query(
      `SELECT account_id, debit_amount, credit_amount, description FROM transaction_lines WHERE journal_entry_id = ?`,
      [id]
    );
    const [rev] = await conn.query(
      `INSERT INTO journal_entries (transaction_date, description, reverses_entry_id, related_document_type, created_by_user_id)
       VALUES (CURDATE(), ?, ?, 'ManualReversal', ?)`,
      [`REVERSAL: ${je.description}${reason ? " \u2014 " + reason : ""}`.slice(0, 255), id, userId]
    );
    const revId = rev.insertId;
    for (const line of lines) {
      await conn.query(
        `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, ?, ?)`,
        [revId, line.account_id, Number(line.credit_amount), Number(line.debit_amount), line.description]
      );
    }
    await conn.query(
      `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
      [revId, id]
    );
    await auditLog(conn, {
      userId,
      action: "cancelled",
      module: "accounts",
      recordType: "journal_entry",
      recordId: id,
      referenceNumber: `JE-${id}`,
      description: `Journal entry JE-${id} reversed by user ${userId}${reason ? ": " + reason : ""}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, reversalId: revId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { reverse_post as default };
//# sourceMappingURL=reverse.post.mjs.map

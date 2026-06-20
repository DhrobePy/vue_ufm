import { h as defineEventHandler, M as readBody, x as getUserSession, e as createError, n as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const journal_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    transaction_date,
    description,
    entry_type = "general",
    lines = []
  } = body != null ? body : {};
  if (!transaction_date || !description)
    throw createError({ statusCode: 400, statusMessage: "transaction_date and description are required" });
  if (!Array.isArray(lines) || lines.length < 2)
    throw createError({ statusCode: 400, statusMessage: "At least two journal lines are required" });
  const totalDebits = lines.reduce((s, l) => s + Number(l.debit_amount || 0), 0);
  const totalCredits = lines.reduce((s, l) => s + Number(l.credit_amount || 0), 0);
  if (Math.abs(totalDebits - totalCredits) > 0.01)
    throw createError({ statusCode: 400, statusMessage: `Journal entry does not balance: debits=${totalDebits} credits=${totalCredits}` });
  if (totalDebits <= 0)
    throw createError({ statusCode: 400, statusMessage: "Journal entry must have at least one non-zero amount" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO journal_entries
         (transaction_date, description, related_document_type, created_by_user_id)
       VALUES (?, ?, ?, ?)`,
      [transaction_date, description, "GeneralTransaction", userId]
    );
    const entryId = result.insertId;
    for (const line of lines) {
      await conn.query(
        `INSERT INTO transaction_lines
           (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          entryId,
          Number(line.account_id),
          Number(line.debit_amount || 0),
          Number(line.credit_amount || 0),
          line.description || null
        ]
      );
    }
    await conn.commit();
    return { ok: true, id: entryId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { journal_post as default };
//# sourceMappingURL=journal.post.mjs.map

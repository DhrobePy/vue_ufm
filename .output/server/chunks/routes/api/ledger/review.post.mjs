import { u as defineEventHandler, aP as requireAction, a3 as getUserSession, aD as readBody, q as createError, G as getDb, j as auditLog, aK as recycleBegin, aJ as recycleArchiveDelete, aL as recycleFinalize } from '../../../nitro/nitro.mjs';
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

const review_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const { userId } = await requireAction(
    event,
    { module: "customers", page: "list", action: "review_ledger", roleFallback: [], explicit: true },
    'Only admin, or a user granted "Review Ledger Lines", may decide ledger lines'
  );
  const session = await getUserSession(event);
  const userName = String((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.name) != null ? _b : `User ${userId}`);
  const body = await readBody(event);
  const ids = [...new Set((Array.isArray(body == null ? void 0 : body.ids) ? body.ids : []).map(Number).filter(Boolean))];
  const action = String((_c = body == null ? void 0 : body.action) != null ? _c : "");
  const note = String((_d = body == null ? void 0 : body.note) != null ? _d : "").trim().slice(0, 255);
  if (!ids.length || ids.length > 500) throw createError({ statusCode: 400, statusMessage: "Choose between 1 and 500 lines" });
  if (!["keep", "delete"].includes(action)) throw createError({ statusCode: 400, statusMessage: "action must be keep or delete" });
  if (action === "delete" && note.length < 3) throw createError({ statusCode: 400, statusMessage: "Please give a short reason for deleting" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [lines] = await conn.query(`SELECT * FROM customer_ledger WHERE id IN (?) FOR UPDATE`, [ids]);
    const notReviewable = lines.filter((l) => l.review_status !== "review");
    if (lines.length !== ids.length || notReviewable.length)
      throw createError({ statusCode: 409, statusMessage: `${ids.length - lines.length + notReviewable.length} of the chosen lines are not waiting for review (already decided, or not flagged)` });
    if (action === "keep") {
      await conn.query(`UPDATE customer_ledger SET review_status = 'kept', reviewed_by_user_id = ?, reviewed_at = NOW(), review_note = ? WHERE id IN (?)`, [userId, note || null, ids]);
      await auditLog(conn, {
        userId,
        action: "other",
        module: "customers",
        recordType: "customer_ledger",
        recordId: ids[0],
        description: `Ledger review: kept ${ids.length} line(s)${note ? ` \u2014 ${note}` : ""}`
      });
      await conn.commit();
      return { ok: true, kept: ids.length };
    }
    const customerIds = [...new Set(lines.map((l) => Number(l.customer_id)))];
    const batch = await recycleBegin(conn, { entityType: "ledger_review_delete", label: `Ledger review \u2014 ${ids.length} line(s) deleted: ${note}`, customerId: customerIds.length === 1 ? customerIds[0] : null, userId, userName });
    let jeRemoved = 0;
    for (const l of lines) {
      const je = l.journal_entry_id ? Number(l.journal_entry_id) : null;
      await recycleArchiveDelete(conn, batch, "customer_ledger", "id", l.id);
      if (je) {
        const [[other]] = await conn.query(`SELECT COUNT(*) n FROM customer_ledger WHERE journal_entry_id = ?`, [je]);
        const [[pay]] = await conn.query(`SELECT COUNT(*) n FROM customer_payments WHERE journal_entry_id = ?`, [je]).catch(() => [[{ n: 0 }]]);
        if (!Number(other.n) && !Number(pay.n)) {
          await recycleArchiveDelete(conn, batch, "transaction_lines", "journal_entry_id", je);
          await recycleArchiveDelete(conn, batch, "journal_entries", "id", je);
          jeRemoved++;
        }
      }
    }
    await conn.query(
      `UPDATE customers c LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger WHERE customer_id IN (?) GROUP BY customer_id) l ON l.customer_id = c.id
       SET c.current_balance = COALESCE(l.b, 0), c.updated_at = NOW() WHERE c.id IN (?)`,
      [customerIds, customerIds]
    );
    await recycleFinalize(conn, batch);
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "customers",
      recordType: "customer_ledger",
      recordId: ids[0],
      severity: "warning",
      description: `Ledger review: deleted ${ids.length} line(s) (${jeRemoved} journal entries) \u2192 Recycle Bin batch #${batch} \u2014 ${note}`
    });
    await conn.commit();
    return { ok: true, deleted: ids.length, journalEntriesRemoved: jeRemoved, recycleBatch: batch };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { review_post as default };
//# sourceMappingURL=review.post.mjs.map

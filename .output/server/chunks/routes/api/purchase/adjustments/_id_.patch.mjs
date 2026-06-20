import { h as defineEventHandler, w as getRouterParam, e as createError, M as readBody, x as getUserSession, L as queryOne, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const body = await readBody(event);
  const action = body == null ? void 0 : body.action;
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  if (!["approve", "post", "cancel"].includes(action))
    throw createError({ statusCode: 400, statusMessage: "action must be approve, post, or cancel" });
  const note = await queryOne(
    `SELECT * FROM purchase_adjustment_notes WHERE id = ?`,
    [id]
  );
  if (!note) throw createError({ statusCode: 404, statusMessage: "Note not found" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (action === "approve") {
      if (note.status !== "draft")
        throw createError({ statusCode: 400, statusMessage: "Only draft notes can be approved" });
      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [userId, id]
      );
      await auditLog(conn, {
        userId,
        action: "adj_approved",
        module: "purchase",
        recordType: "adjustment_note",
        recordId: id,
        referenceNumber: note.note_number,
        description: `Adjustment Note ${note.note_number} approved \xB7 \u09F3${Number(note.amount).toLocaleString()} \xB7 PO ${note.po_number}`,
        severity: "info"
      });
    } else if (action === "post") {
      if (note.status !== "approved")
        throw createError({ statusCode: 400, statusMessage: "Only approved notes can be posted" });
      const delta = note.note_type === "debit" ? Number(note.amount) : -Number(note.amount);
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET balance_payable = GREATEST(0, COALESCE(balance_payable, 0) + ?),
             updated_at      = NOW()
         WHERE id = ?`,
        [delta, note.purchase_order_id]
      );
      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status = 'posted', posted_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [id]
      );
      const effectLabel = note.note_type === "debit" ? "increases payable by" : "reduces payable by";
      await auditLog(conn, {
        userId,
        action: "adj_posted",
        module: "purchase",
        recordType: "adjustment_note",
        recordId: id,
        referenceNumber: note.note_number,
        description: `Adjustment Note ${note.note_number} posted \u2014 ${effectLabel} \u09F3${Number(note.amount).toLocaleString()} \xB7 PO ${note.po_number}`,
        severity: "warning"
      });
    } else if (action === "cancel") {
      if (note.status === "posted")
        throw createError({ statusCode: 400, statusMessage: "Cannot cancel a posted note" });
      if (note.status === "cancelled")
        throw createError({ statusCode: 400, statusMessage: "Note is already cancelled" });
      const cancelReason = (_c = body == null ? void 0 : body.cancel_reason) != null ? _c : "Cancelled";
      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status      = 'cancelled',
             description = CONCAT(COALESCE(description, ''), '
[CANCELLED: ', ?, ']'),
             updated_at  = NOW()
         WHERE id = ?`,
        [cancelReason, id]
      );
      await auditLog(conn, {
        userId,
        action: "adj_cancelled",
        module: "purchase",
        recordType: "adjustment_note",
        recordId: id,
        referenceNumber: note.note_number,
        description: `Adjustment Note ${note.note_number} cancelled \xB7 Reason: ${cancelReason}`,
        severity: "warning"
      });
    }
    await conn.commit();
    return { ok: true, action };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

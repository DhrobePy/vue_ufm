import { X as defineEventHandler, at as getRouterParam, L as createError, ay as getUserSession, ae as getDb, bm as recycleBegin, bl as recycleArchiveDelete, bn as recycleFinalize, bi as recalcPO, w as auditLog } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const session = await getUserSession(event);
  const userId = Number((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1), userName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  if (!["admin", "superadmin"].includes(((_h = (_g = session == null ? void 0 : session.user) == null ? void 0 : _g.role) != null ? _h : "").toLowerCase()))
    throw createError({ statusCode: 403, statusMessage: "Only admin / superadmin can delete an adjustment note" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[note]] = await conn.query(`SELECT * FROM purchase_adjustment_notes WHERE id = ? FOR UPDATE`, [id]);
    if (!note) throw createError({ statusCode: 404, statusMessage: "Adjustment note not found" });
    const batch = await recycleBegin(conn, { entityType: "adjustment_note", label: `Adjustment Note ${note.note_number} \u2014 PO ${note.po_number} \xB7 \u09F3${Number(note.amount).toLocaleString()}`, userId, userName });
    if (note.status === "posted") {
      const delta = note.note_type === "debit" ? Number(note.amount) : -Number(note.amount);
      await conn.query(`UPDATE purchase_orders_adnan SET total_adjustment_amount = COALESCE(total_adjustment_amount, 0) - ?, updated_at = NOW() WHERE id = ?`, [delta, note.purchase_order_id]);
      if (note.note_type === "credit") await recycleArchiveDelete(conn, batch, "supplier_balance_adjustments", "adjustment_note_id", id);
    }
    await recycleArchiveDelete(conn, batch, "purchase_adjustment_notes", "id", id);
    await recycleFinalize(conn, batch);
    if (note.status === "posted") await recalcPO(conn, Number(note.purchase_order_id));
    await auditLog(conn, {
      userId,
      action: "adj_deleted",
      module: "purchase",
      recordType: "adjustment_note",
      recordId: id,
      referenceNumber: note.note_number,
      description: `Adjustment Note ${note.note_number} deleted by ${userName}${note.status === "posted" ? " \u2014 financial effect reversed on the PO" : ""}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: `Adjustment Note ${note.note_number} deleted.${note.status === "posted" ? " Financial effect has been reversed." : ""}` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

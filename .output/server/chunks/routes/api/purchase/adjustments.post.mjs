import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, H as queryOne, n as getDb, a as auditLog } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const adjustments_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    note_type,
    reason_type,
    purchase_order_id,
    quantity_kg,
    unit_price_per_kg,
    amount,
    description
  } = body != null ? body : {};
  if (!note_type || !reason_type || !purchase_order_id || !amount || !description)
    throw createError({ statusCode: 400, statusMessage: "note_type, reason_type, purchase_order_id, amount, description are required" });
  if (!["debit", "credit"].includes(note_type))
    throw createError({ statusCode: 400, statusMessage: "note_type must be debit or credit" });
  const po = await queryOne(
    `SELECT id, po_number, supplier_id, supplier_name FROM purchase_orders_adnan WHERE id = ?`,
    [purchase_order_id]
  );
  if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const prefix = note_type === "debit" ? "DAN" : "CAN";
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM purchase_adjustment_notes WHERE note_type = ? AND YEAR(created_at) = ?`,
      [note_type, year]
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const noteNum = `${prefix}-${year}-${seq}`;
    const [result] = await conn.query(
      `INSERT INTO purchase_adjustment_notes
         (note_number, note_type, reason_type, purchase_order_id, po_number,
          supplier_id, supplier_name, quantity_kg, unit_price_per_kg, amount,
          description, status, created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW(), NOW())`,
      [
        noteNum,
        note_type,
        reason_type,
        Number(purchase_order_id),
        po.po_number,
        po.supplier_id,
        po.supplier_name,
        quantity_kg ? Number(quantity_kg) : null,
        unit_price_per_kg ? Number(unit_price_per_kg) : null,
        Number(amount),
        description,
        userId
      ]
    );
    const noteId = result.insertId;
    const typeLabel = note_type === "debit" ? "Debit Adj. Note (DAN)" : "Credit Adj. Note (CAN)";
    await auditLog(conn, {
      userId,
      action: "adj_created",
      module: "purchase",
      recordType: "adjustment_note",
      recordId: noteId,
      referenceNumber: noteNum,
      description: `${typeLabel} ${noteNum} created for PO ${po.po_number} \xB7 ${po.supplier_name} \xB7 \u09F3${Number(amount).toLocaleString()} \xB7 Reason: ${reason_type}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: noteId, note_number: noteNum };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { adjustments_post as default };
//# sourceMappingURL=adjustments.post.mjs.map

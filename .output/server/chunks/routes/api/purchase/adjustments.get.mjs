import { j as defineEventHandler, u as getQuery, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const adjustments_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const noteType = q.note_type || "";
  const status = q.status || "";
  const dateFrom = q.date_from || "";
  const dateTo = q.date_to || "";
  const search = q.search || "";
  const where = [];
  const params = [];
  if (noteType) {
    where.push("note_type = ?");
    params.push(noteType);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (dateFrom) {
    where.push("DATE(created_at) >= ?");
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push("DATE(created_at) <= ?");
    params.push(dateTo);
  }
  if (search) {
    where.push("(note_number LIKE ? OR po_number LIKE ? OR supplier_name LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";
  const notes = await query(
    `SELECT id, note_number, note_type, reason_type, purchase_order_id, po_number,
            supplier_id, supplier_name, quantity_kg, amount, status, created_at, approved_at, posted_at
     FROM purchase_adjustment_notes
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT 500`,
    params
  );
  return { notes };
});

export { adjustments_get as default };
//# sourceMappingURL=adjustments.get.mjs.map

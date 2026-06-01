import { h as defineEventHandler, v as getRouterParam, e as createError, w as getUserSession, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid PO ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT id, po_number, po_status, supplier_name, total_order_value
       FROM purchase_orders_adnan WHERE id = ?`,
      [id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    if (po.po_status === "cancelled") throw createError({ statusCode: 400, statusMessage: "PO is already cancelled" });
    await conn.query(
      `UPDATE purchase_orders_adnan SET po_status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    await auditLog(conn, {
      userId,
      action: "po_cancelled",
      module: "purchase",
      recordType: "purchase_order",
      recordId: id,
      referenceNumber: po.po_number,
      description: `Purchase Order ${po.po_number} cancelled \xB7 Supplier: ${po.supplier_name} \xB7 Value: \u09F3${Number(po.total_order_value).toLocaleString()}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: `PO ${po.po_number} cancelled successfully` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

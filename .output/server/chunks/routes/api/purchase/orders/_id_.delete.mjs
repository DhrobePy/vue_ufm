import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, as as readBody, z as getDb, az as recycleBegin, ay as recycleArchiveDelete, aA as recycleFinalize, g as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid PO ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const body = await readBody(event).catch(() => ({}));
  const force = isAdmin && ((body == null ? void 0 : body.force) === true || (body == null ? void 0 : body.force) === "true");
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
    if (po.po_status === "cancelled" && !force) {
      throw createError({ statusCode: 400, statusMessage: "PO is already cancelled" });
    }
    if (force) {
      const batchId = await recycleBegin(conn, {
        entityType: "purchase_order",
        label: po.po_number,
        userId,
        userName: (_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.name) != null ? _f : `User ${userId}`
      });
      await recycleArchiveDelete(conn, batchId, "purchase_payments_adnan", "purchase_order_id", id);
      await recycleArchiveDelete(conn, batchId, "goods_received_adnan", "purchase_order_id", id);
      await recycleArchiveDelete(conn, batchId, "purchase_orders_adnan", "id", id);
      await recycleFinalize(conn, batchId);
    } else {
      await conn.query(
        `UPDATE purchase_orders_adnan SET po_status = 'cancelled', updated_at = NOW() WHERE id = ?`,
        [id]
      );
    }
    await auditLog(conn, {
      userId,
      action: force ? "po_hard_deleted" : "po_cancelled",
      module: "purchase",
      recordType: "purchase_order",
      recordId: id,
      referenceNumber: po.po_number,
      description: force ? `Purchase Order ${po.po_number} HARD DELETED by admin (${role}) \u2014 all GRNs & payments removed \xB7 Supplier: ${po.supplier_name} \xB7 Value: \u09F3${Number(po.total_order_value).toLocaleString()}` : `Purchase Order ${po.po_number} cancelled \xB7 Supplier: ${po.supplier_name} \xB7 Value: \u09F3${Number(po.total_order_value).toLocaleString()}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: force ? `PO ${po.po_number} permanently deleted` : `PO ${po.po_number} cancelled successfully` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

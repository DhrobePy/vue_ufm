import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, as as readBody, z as getDb, av as recalcPO, g as auditLog } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid GRN ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (role !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Only a Superadmin can cancel a GRN" });
  const body = await readBody(event).catch(() => ({}));
  const reason = (_e = body == null ? void 0 : body.reason) != null ? _e : "";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[grn]] = await conn.query(
      `SELECT id, grn_number, grn_status, purchase_order_id,
              supplier_name, quantity_received_kg, total_value
       FROM goods_received_adnan WHERE id = ?`,
      [id]
    );
    if (!grn) throw createError({ statusCode: 404, statusMessage: "GRN not found" });
    if (grn.grn_status === "cancelled") {
      throw createError({ statusCode: 400, statusMessage: "GRN is already cancelled" });
    }
    const reasonNote = reason ? ` Reason: ${reason}` : "";
    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_status = 'cancelled',
           remarks    = CONCAT(COALESCE(remarks, ''), ' [CANCELLED${reason ? ": " + reason : ""}]'),
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );
    await recalcPO(conn, grn.purchase_order_id);
    await auditLog(conn, {
      userId,
      action: "grn_cancelled",
      module: "purchase",
      recordType: "grn",
      recordId: id,
      referenceNumber: grn.grn_number,
      description: `GRN ${grn.grn_number} cancelled \xB7 ${grn.supplier_name} \xB7 ${Number(grn.quantity_received_kg).toLocaleString()} KG \xB7 \u09F3${Number(grn.total_value).toLocaleString()}${reasonNote}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: `GRN ${grn.grn_number} cancelled` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

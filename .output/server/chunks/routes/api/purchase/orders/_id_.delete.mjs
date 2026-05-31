import { h as defineEventHandler, v as getRouterParam, e as createError, n as getDb } from '../../../../nitro/nitro.mjs';
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
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid PO ID" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT id, po_number, po_status FROM purchase_orders_adnan WHERE id = ?`,
      [id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    if (po.po_status === "cancelled") throw createError({ statusCode: 400, statusMessage: "PO is already cancelled" });
    await conn.query(
      `UPDATE purchase_orders_adnan SET po_status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
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

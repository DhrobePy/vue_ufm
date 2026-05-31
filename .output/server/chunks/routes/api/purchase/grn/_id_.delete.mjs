import { h as defineEventHandler, v as getRouterParam, e as createError, n as getDb, L as recalcPO } from '../../../../nitro/nitro.mjs';
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
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid GRN ID" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[grn]] = await conn.query(
      `SELECT id, grn_number, grn_status, purchase_order_id
       FROM goods_received_adnan WHERE id = ?`,
      [id]
    );
    if (!grn) throw createError({ statusCode: 404, statusMessage: "GRN not found" });
    if (grn.grn_status === "cancelled") {
      throw createError({ statusCode: 400, statusMessage: "GRN is already cancelled" });
    }
    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_status = 'cancelled',
           remarks    = CONCAT(COALESCE(remarks, ''), ' [CANCELLED]'),
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );
    await recalcPO(conn, grn.purchase_order_id);
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

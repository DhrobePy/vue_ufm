import { h as defineEventHandler, v as getRouterParam, e as createError, I as readBody, w as getUserSession, n as getDb, a as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const close_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid PO ID" });
  const body = await readBody(event);
  const action = (_a = body == null ? void 0 : body.action) != null ? _a : "close";
  const session = await getUserSession(event);
  const userId = (_c = (_b = session == null ? void 0 : session.user) == null ? void 0 : _b.id) != null ? _c : 1;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT id, po_number, delivery_status FROM purchase_orders_adnan WHERE id = ?`,
      [id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    if (action === "reopen") {
      if (po.delivery_status !== "closed") {
        throw createError({ statusCode: 400, statusMessage: "PO is not closed \u2014 cannot reopen" });
      }
      await conn.query(
        `UPDATE purchase_orders_adnan SET delivery_status = 'partial', updated_at = NOW() WHERE id = ?`,
        [id]
      );
      await auditLog(conn, {
        userId,
        action: "po_reopened",
        module: "purchase",
        recordType: "purchase_order",
        recordId: id,
        referenceNumber: po.po_number,
        description: `PO ${po.po_number} reopened \u2014 goods receipt is allowed again`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, message: `PO ${po.po_number} reopened \u2014 goods receipt is allowed again` };
    }
    if (po.delivery_status === "closed") {
      throw createError({ statusCode: 400, statusMessage: "PO is already closed" });
    }
    await conn.query(
      `UPDATE purchase_orders_adnan SET delivery_status = 'closed', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    await auditLog(conn, {
      userId,
      action: "po_closed",
      module: "purchase",
      recordType: "purchase_order",
      recordId: id,
      referenceNumber: po.po_number,
      description: `PO ${po.po_number} closed \u2014 no further goods can be received`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, message: `PO ${po.po_number} closed \u2014 no further goods can be received` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { close_post as default };
//# sourceMappingURL=close.post.mjs.map

import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, X as getUserSession, z as getDb, g as auditLog, av as recalcPO } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const close_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid PO ID" });
  const body = await readBody(event);
  const action = (_a = body == null ? void 0 : body.action) != null ? _a : "close";
  const session = await getUserSession(event);
  const userId = (_c = (_b = session == null ? void 0 : session.user) == null ? void 0 : _b.id) != null ? _c : 1;
  const role = ((_e = (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.role) != null ? _e : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT id, po_number, delivery_status, po_status FROM purchase_orders_adnan WHERE id = ?`,
      [id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    if (action === "final_delivery") {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin can mark final delivery" });
      if (po.delivery_status === "closed") throw createError({ statusCode: 400, statusMessage: "PO is already closed" });
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET delivery_status            = 'closed',
             is_delivery_locked         = 1,
             delivery_lock_reason       = 'Final delivery marked by admin',
             delivery_locked_by_user_id = ?,
             delivery_locked_at         = NOW(),
             updated_at                 = NOW()
         WHERE id = ?`,
        [userId, id]
      );
      await auditLog(conn, {
        userId,
        action: "po_locked",
        module: "purchase",
        recordType: "purchase_order",
        recordId: id,
        referenceNumber: po.po_number,
        description: `PO ${po.po_number} marked as Final Delivery \u2014 delivery locked permanently`,
        severity: "info"
      });
      await conn.commit();
      return { ok: true, message: `PO ${po.po_number} marked as final delivery and locked` };
    }
    if (action === "reverse") {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can reverse a PO" });
      await conn.query(
        `UPDATE goods_received_adnan
         SET grn_status = 'cancelled',
             remarks    = CONCAT(COALESCE(remarks, ''), ' [REVERSED by admin]'),
             updated_at = NOW()
         WHERE purchase_order_id = ? AND grn_status != 'cancelled'`,
        [id]
      );
      await conn.query(
        `UPDATE purchase_payments_adnan
         SET is_posted  = 0,
             remarks    = CONCAT(COALESCE(remarks, ''), '
[REVERSED by admin ${role}]'),
             updated_at = NOW()
         WHERE purchase_order_id = ?`,
        [id]
      );
      await recalcPO(conn, id);
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET po_status = 'cancelled', delivery_status = 'pending', updated_at = NOW()
         WHERE id = ?`,
        [id]
      );
      await auditLog(conn, {
        userId,
        action: "po_reversed",
        module: "purchase",
        recordType: "purchase_order",
        recordId: id,
        referenceNumber: po.po_number,
        description: `PO ${po.po_number} fully REVERSED by ${role} \u2014 all GRNs cancelled and payments voided`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, message: `PO ${po.po_number} reversed \u2014 all GRNs cancelled and payments voided` };
    }
    if (action === "reopen") {
      if (!isAdmin && po.delivery_status !== "closed") {
        throw createError({ statusCode: 400, statusMessage: "PO is not closed \u2014 cannot reopen" });
      }
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET delivery_status = 'partial', po_status = 'active', updated_at = NOW()
         WHERE id = ?`,
        [id]
      );
      await auditLog(conn, {
        userId,
        action: "po_reopened",
        module: "purchase",
        recordType: "purchase_order",
        recordId: id,
        referenceNumber: po.po_number,
        description: `PO ${po.po_number} reopened by ${role} \u2014 goods receipt is allowed again`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, message: `PO ${po.po_number} reopened \u2014 goods receipt is allowed again` };
    }
    if (!isAdmin && po.delivery_status === "closed") {
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
      description: `PO ${po.po_number} closed by ${role} \u2014 no further goods can be received`,
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

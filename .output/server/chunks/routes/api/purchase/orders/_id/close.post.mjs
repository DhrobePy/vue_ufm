import { J as defineEventHandler, ag as getRouterParam, C as createError, aZ as readBody, al as getUserSession, a1 as getDb, ay as nextNoteNumber, q as auditLog, b0 as recalcPO } from '../../../../../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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

const close_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
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
      `SELECT id, po_number, delivery_status, po_status, supplier_id, supplier_name, quantity_kg, total_received_qty, unit_price_per_kg, is_delivery_locked FROM purchase_orders_adnan WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    if (action === "final_delivery") {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin can mark final delivery" });
      if (po.delivery_status === "closed") throw createError({ statusCode: 400, statusMessage: "PO is already closed" });
      if (Number(po.is_delivery_locked) === 1) throw createError({ statusCode: 400, statusMessage: "Delivery is already locked." });
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET is_delivery_locked         = 1,
             delivery_lock_reason       = 'Final delivery marked by admin \u2014 PO closed for further GRNs',
             delivery_locked_by_user_id = ?,
             delivery_locked_at         = NOW(),
             final_delivery_marked      = 1,
             updated_at                 = NOW()
         WHERE id = ?`,
        [userId, id]
      );
      const shortfall = Number(po.quantity_kg) - Number((_f = po.total_received_qty) != null ? _f : 0);
      let canNo = null;
      if ((body == null ? void 0 : body.create_can_for_shortfall) && shortfall > 1) {
        canNo = await nextNoteNumber(conn, "credit");
        const amt = shortfall * Number(po.unit_price_per_kg);
        await conn.query(
          `INSERT INTO purchase_adjustment_notes
             (note_number, note_type, reason_type, purchase_order_id, po_number, supplier_id, supplier_name, quantity_kg, unit_price_per_kg, amount, description, status, created_by_user_id, created_at, updated_at)
           VALUES (?, 'credit', 'under_delivery_closure', ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW(), NOW())`,
          [
            canNo,
            id,
            po.po_number,
            po.supplier_id,
            po.supplier_name,
            shortfall,
            po.unit_price_per_kg,
            amt,
            `Auto-generated CAN: PO closed with shortfall of ${shortfall.toLocaleString()} KG (\u09F3${amt.toLocaleString()}) \u2014 marked as final delivery.`,
            userId
          ]
        );
      }
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
      return { ok: true, message: `PO ${po.po_number} marked as final delivery and locked.${canNo ? ` Draft CAN ${canNo} created for the shortfall.` : ""}` };
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
      const [[got]] = await conn.query(`SELECT COALESCE(SUM(quantity_received_kg), 0) AS q FROM goods_received_adnan WHERE purchase_order_id = ? AND grn_status != 'cancelled'`, [id]);
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET delivery_status = ?, is_delivery_locked = 0, delivery_lock_reason = NULL, updated_at = NOW()
         WHERE id = ?`,
        [Number(got.q) > 0 ? "partial" : "pending", id]
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

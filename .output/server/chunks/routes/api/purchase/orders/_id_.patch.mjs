import { q as defineEventHandler, R as getRouterParam, m as createError, ar as readBody, X as getUserSession, z as getDb, g as auditLog, ap as queryOne } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    po_number,
    po_date,
    supplier_id,
    wheat_origin,
    quantity_kg,
    unit_price_per_kg,
    expected_delivery_date,
    remarks,
    lock_action,
    // 'lock' | 'unlock' | ''
    lock_reason
  } = body != null ? body : {};
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[current]] = await conn.query(
      `SELECT po_number, supplier_name FROM purchase_orders_adnan WHERE id = ?`,
      [id]
    );
    if (!current) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    let supplierName = null;
    if (supplier_id) {
      const [[sup]] = await conn.query(
        `SELECT company_name FROM suppliers WHERE id = ?`,
        [supplier_id]
      );
      supplierName = (_c = sup == null ? void 0 : sup.company_name) != null ? _c : null;
    }
    const total = Number(quantity_kg != null ? quantity_kg : 0) * Number(unit_price_per_kg != null ? unit_price_per_kg : 0);
    const setParts = [];
    const setParams = [];
    if (po_number !== void 0) {
      setParts.push("po_number = ?");
      setParams.push(po_number);
    }
    if (po_date !== void 0) {
      setParts.push("po_date = ?");
      setParams.push(po_date);
    }
    if (supplier_id !== void 0) {
      setParts.push("supplier_id = ?");
      setParams.push(Number(supplier_id));
    }
    if (supplierName !== null) {
      setParts.push("supplier_name = ?");
      setParams.push(supplierName);
    }
    if (wheat_origin !== void 0) {
      setParts.push("wheat_origin = ?");
      setParams.push(wheat_origin);
    }
    if (quantity_kg !== void 0) {
      setParts.push("quantity_kg = ?");
      setParams.push(Number(quantity_kg));
    }
    if (unit_price_per_kg !== void 0) {
      setParts.push("unit_price_per_kg = ?");
      setParams.push(Number(unit_price_per_kg));
    }
    if (quantity_kg !== void 0 || unit_price_per_kg !== void 0) {
      setParts.push("total_order_value = ?");
      setParams.push(total);
    }
    if (expected_delivery_date !== void 0) {
      setParts.push("expected_delivery_date = ?");
      setParams.push(expected_delivery_date != null ? expected_delivery_date : null);
    }
    if (remarks !== void 0) {
      setParts.push("remarks = ?");
      setParams.push(remarks != null ? remarks : null);
    }
    let auditAction = "po_updated";
    let auditDesc = `Purchase Order ${current.po_number} updated`;
    if (lock_action === "lock") {
      setParts.push("is_delivery_locked = 1", "delivery_lock_reason = ?", "delivery_locked_by_user_id = ?", "delivery_locked_at = NOW()");
      setParams.push(lock_reason != null ? lock_reason : "", userId);
      auditAction = "po_locked";
      auditDesc = `PO ${current.po_number} delivery locked: ${lock_reason}`;
    } else if (lock_action === "unlock") {
      setParts.push("is_delivery_locked = 0", "delivery_lock_reason = ?", "delivery_locked_by_user_id = ?", "delivery_locked_at = NULL");
      setParams.push(`Unlocked: ${lock_reason}`, userId);
      auditAction = "po_unlocked";
      auditDesc = `PO ${current.po_number} delivery unlocked: ${lock_reason}`;
    }
    setParts.push("updated_at = NOW()");
    if (setParts.length > 1) {
      await conn.query(
        `UPDATE purchase_orders_adnan SET ${setParts.join(", ")} WHERE id = ?`,
        [...setParams, id]
      );
    }
    await auditLog(conn, {
      userId,
      action: auditAction,
      module: "purchase",
      recordType: "purchase_order",
      recordId: id,
      referenceNumber: current.po_number,
      description: auditDesc,
      severity: lock_action ? "warning" : "info"
    });
    await conn.commit();
    const updated = await queryOne(
      `SELECT * FROM purchase_orders_adnan WHERE id = ?`,
      [id]
    );
    return { ok: true, po: updated };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

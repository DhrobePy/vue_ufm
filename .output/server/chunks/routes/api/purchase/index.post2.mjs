import { h as defineEventHandler, K as readBody, w as getUserSession, e as createError, n as getDb, a as auditLog } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    supplier_id,
    po_date,
    wheat_origin,
    expected_delivery_date,
    payment_terms = "Credit 30",
    quantity_mt,
    // metric tonnes
    unit_price_per_mt,
    remarks,
    branch_id
  } = body != null ? body : {};
  if (!supplier_id || !po_date || !quantity_mt || !unit_price_per_mt) {
    throw createError({ statusCode: 400, statusMessage: "supplier_id, po_date, quantity_mt and unit_price_per_mt are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[sup]] = await conn.query(
      `SELECT company_name FROM suppliers WHERE id = ?`,
      [supplier_id]
    );
    const supplierName = (_c = sup == null ? void 0 : sup.company_name) != null ? _c : "";
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM purchase_orders_adnan WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_d = cnt.n) != null ? _d : 0) + 1).padStart(4, "0");
    const poNo = `PO-${today}-${seq}`;
    const quantity_kg = Number(quantity_mt) * 1e3;
    const unit_price_per_kg = Number(unit_price_per_mt) / 1e3;
    const total_order_value = quantity_kg * unit_price_per_kg;
    const [result] = await conn.query(
      `INSERT INTO purchase_orders_adnan
         (po_number, po_date, supplier_id, supplier_name, wheat_origin,
          expected_delivery_date, po_payment_terms, quantity_kg, unit_price_per_kg,
          total_order_value, balance_payable,
          po_status, delivery_status, payment_status,
          branch_id, created_by_user_id, remarks,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?,
               ?, ?, ?, ?,
               ?, ?,
               'approved', 'pending', 'unpaid',
               ?, ?, ?,
               NOW(), NOW())`,
      [
        poNo,
        po_date,
        Number(supplier_id),
        supplierName,
        wheat_origin || "Other",
        expected_delivery_date != null ? expected_delivery_date : null,
        payment_terms || "Credit 30",
        quantity_kg,
        unit_price_per_kg,
        total_order_value,
        total_order_value,
        branch_id ? Number(branch_id) : null,
        userId,
        remarks != null ? remarks : null
      ]
    );
    const poId = result.insertId;
    await auditLog(conn, {
      userId,
      action: "po_created",
      module: "purchase",
      recordType: "purchase_order",
      recordId: poId,
      referenceNumber: poNo,
      description: `Purchase Order ${poNo} created for ${supplierName} \xB7 ${quantity_kg.toLocaleString()} KG @ \u09F3${unit_price_per_kg.toLocaleString()}/kg \xB7 Total \u09F3${total_order_value.toLocaleString()}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: poId, po_number: poNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map

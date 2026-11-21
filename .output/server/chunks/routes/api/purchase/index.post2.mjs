import { Z as defineEventHandler, bq as readBody, aG as getUserSession, N as createError, aj as getDb, x as auditLog, bY as sendTelegram } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    commodity_id,
    supplier_id,
    po_date,
    origin,
    wheat_origin,
    // back-compat alias — older client build / direct API callers
    expected_delivery_date,
    payment_terms = "Credit 30",
    quantity,
    quantity_mt,
    // quantity_mt = back-compat alias (implies MT)
    unit_price,
    unit_price_per_mt,
    // unit_price_per_mt = back-compat alias
    remarks,
    branch_id,
    po_number: manual_po_number,
    // optional hand-typed PO number (legacy: physical PO book)
    is_service,
    // service purchase: no product value per unit — a total invoice value + remark instead
    service_total_value
  } = body != null ? body : {};
  const qty = quantity != null ? quantity : quantity_mt;
  const isService = Boolean(is_service);
  const originVal = origin != null ? origin : wheat_origin;
  if (isService) {
    if (!(Number(service_total_value) > 0)) throw createError({ statusCode: 400, statusMessage: "Total Invoice Value is required for a service purchase" });
    if (!String(remarks != null ? remarks : "").trim()) throw createError({ statusCode: 400, statusMessage: "Remarks are required for a service purchase \u2014 explain what this invoice is for" });
  }
  const price = isService ? Number(service_total_value) / (Number(qty) || 1) : unit_price != null ? unit_price : unit_price_per_mt;
  if (!supplier_id || !po_date || !qty || !price) {
    throw createError({ statusCode: 400, statusMessage: "supplier_id, po_date, quantity and unit_price are required" });
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
    let commodityId = commodity_id ? Number(commodity_id) : null;
    let commodityUnit = "MT";
    if (commodityId) {
      const [[comm]] = await conn.query(`SELECT unit FROM purchase_commodities WHERE id = ?`, [commodityId]);
      commodityUnit = (_d = comm == null ? void 0 : comm.unit) != null ? _d : "MT";
    } else {
      const [[wheat]] = await conn.query(`SELECT id, unit FROM purchase_commodities WHERE name = 'Wheat'`);
      commodityId = (_e = wheat == null ? void 0 : wheat.id) != null ? _e : null;
      commodityUnit = (_f = wheat == null ? void 0 : wheat.unit) != null ? _f : "MT";
    }
    let poNo = String(manual_po_number != null ? manual_po_number : "").trim();
    if (poNo) {
      const [[dup]] = await conn.query(`SELECT id FROM purchase_orders_adnan WHERE po_number = ?`, [poNo]);
      if (dup) throw createError({ statusCode: 409, statusMessage: `PO Number '${poNo}' already exists. Use a different number or leave it blank for auto-numbering.` });
    } else {
      const [[mx]] = await conn.query(`SELECT COALESCE(MAX(CAST(po_number AS UNSIGNED)), 441) AS m FROM purchase_orders_adnan FOR UPDATE`);
      poNo = String(Number(mx.m) + 1);
    }
    const isMt = commodityUnit === "MT";
    const quantity_kg = isMt ? Number(qty) * 1e3 : Number(qty);
    const unit_price_per_kg = isMt ? Number(price) / 1e3 : Number(price);
    const total_order_value = quantity_kg * unit_price_per_kg;
    const [result] = await conn.query(
      `INSERT INTO purchase_orders_adnan
         (po_number, po_date, supplier_id, supplier_name, wheat_origin, commodity_id,
          expected_delivery_date, po_payment_terms, quantity_kg, unit_price_per_kg,
          total_order_value, balance_payable, is_service_purchase,
          po_status, delivery_status, payment_status,
          branch_id, created_by_user_id, remarks,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?,
               ?, ?, ?,
               'approved', 'pending', 'unpaid',
               ?, ?, ?,
               NOW(), NOW())`,
      [
        poNo,
        po_date,
        Number(supplier_id),
        supplierName,
        originVal || "Other",
        commodityId,
        expected_delivery_date != null ? expected_delivery_date : null,
        payment_terms || "Credit 30",
        quantity_kg,
        unit_price_per_kg,
        total_order_value,
        total_order_value,
        isService ? 1 : 0,
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
    sendTelegram(`\u{1F9FE} <b>Purchase Order Created</b>
PO ${poNo} \u2014 ${supplierName}${isService ? " (service)" : ""}
${quantity_kg.toLocaleString()} ${commodityUnit === "MT" ? "KG" : commodityUnit} @ \u09F3${unit_price_per_kg.toLocaleString()} = \u09F3${total_order_value.toLocaleString()}${originVal ? "\nOrigin: " + originVal : ""}`, "purchase");
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

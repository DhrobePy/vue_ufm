import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, n as getDb } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    po_id,
    grn_date,
    vehicle,
    driver,
    quality_grade,
    notes,
    items
    // [{ product, qty_mt, unit_price_per_mt, condition }]
  } = body != null ? body : {};
  if (!po_id || !grn_date || !(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "po_id, grn_date and items are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT po_number, supplier_name, supplier_id FROM purchase_orders_adnan WHERE id = ?`,
      [po_id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM goods_received_adnan WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const grnNo = `GRN-${today}-${seq}`;
    let totalQtyKg = 0;
    let totalValue = 0;
    for (const it of items) {
      const qty_kg = Number((_d = it.qty_mt) != null ? _d : 0) * 1e3;
      const price_per_kg = Number((_e = it.unit_price_per_mt) != null ? _e : 0) / 1e3;
      totalQtyKg += qty_kg;
      totalValue += qty_kg * price_per_kg;
    }
    const unit_price_per_kg = totalQtyKg > 0 ? totalValue / totalQtyKg : 0;
    const [[poQty]] = await conn.query(
      `SELECT quantity_kg FROM purchase_orders_adnan WHERE id = ?`,
      [po_id]
    );
    const orderedKg = Number((_f = poQty == null ? void 0 : poQty.quantity_kg) != null ? _f : 0);
    const weightVariance = totalQtyKg - orderedKg;
    const variancePct = orderedKg > 0 ? (weightVariance / orderedKg * 100).toFixed(4) : "0";
    const [result] = await conn.query(
      `INSERT INTO goods_received_adnan
         (grn_number, grn_date, purchase_order_id, po_number,
          supplier_id, supplier_name,
          quantity_received_kg, unit_price_per_kg, total_value,
          variance_percentage,
          truck_number, remarks,
          grn_status, receiver_user_id,
          created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?,
               ?, ?, ?,
               ?,
               ?, ?,
               'draft', ?,
               NOW(), NOW())`,
      [
        grnNo,
        grn_date,
        Number(po_id),
        po.po_number,
        (_g = po.supplier_id) != null ? _g : null,
        po.supplier_name,
        totalQtyKg,
        unit_price_per_kg,
        totalValue,
        variancePct,
        vehicle != null ? vehicle : null,
        notes != null ? notes : null,
        userId
      ]
    );
    const grnId = result.insertId;
    await conn.query(
      `UPDATE purchase_orders_adnan
       SET total_received_qty = COALESCE(total_received_qty,0) + ?,
           qty_yet_to_receive = GREATEST(0, COALESCE(qty_yet_to_receive, quantity_kg) - ?),
           updated_at = NOW()
       WHERE id = ?`,
      [totalQtyKg, totalQtyKg, po_id]
    );
    await conn.commit();
    return { ok: true, id: grnId, grn_number: grnNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map

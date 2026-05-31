import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, n as getDb, L as recalcPO } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    po_id,
    grn_date,
    truck_number,
    quantity_received_kg,
    expected_quantity,
    unload_point_name,
    remarks,
    over_delivery_action,
    // 'as_is' | 'accept_with_dan'
    excess_qty
  } = body != null ? body : {};
  if (!po_id || !grn_date || !quantity_received_kg) {
    throw createError({ statusCode: 400, statusMessage: "po_id, grn_date and quantity_received_kg are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT id, po_number, supplier_name, supplier_id, unit_price_per_kg, quantity_kg
       FROM purchase_orders_adnan WHERE id = ?`,
      [Number(po_id)]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    const receivedKg = Number(quantity_received_kg);
    const expectedKg = Number(expected_quantity) || 0;
    const unitPrice = Number(po.unit_price_per_kg);
    const totalValue = receivedKg * unitPrice;
    const baseQty = expectedKg > 0 ? expectedKg : Number(po.quantity_kg);
    const varPct = baseQty > 0 ? ((receivedKg - baseQty) / baseQty * 100).toFixed(4) : "0";
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM goods_received_adnan WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const grnNo = `GRN-${today}-${seq}`;
    const [result] = await conn.query(
      `INSERT INTO goods_received_adnan
         (grn_number, grn_date, purchase_order_id, po_number,
          supplier_id, supplier_name,
          quantity_received_kg, expected_quantity,
          unit_price_per_kg, total_value,
          variance_percentage,
          truck_number, unload_point_name, remarks,
          grn_status, receiver_user_id,
          created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, ?,
               ?,
               ?, ?, ?,
               'verified', ?,
               NOW(), NOW())`,
      [
        grnNo,
        grn_date,
        Number(po_id),
        po.po_number,
        (_d = po.supplier_id) != null ? _d : null,
        po.supplier_name,
        receivedKg,
        expectedKg > 0 ? expectedKg : null,
        unitPrice,
        totalValue,
        varPct,
        truck_number != null ? truck_number : null,
        unload_point_name != null ? unload_point_name : null,
        remarks != null ? remarks : null,
        userId
      ]
    );
    const grnId = result.insertId;
    await recalcPO(conn, Number(po_id));
    if (over_delivery_action === "accept_with_dan" && Number(excess_qty) > 0) {
      try {
        const excessKg = Number(excess_qty);
        const danAmt = excessKg * unitPrice;
        const [[adjCheck]] = await conn.query(
          `SELECT COUNT(*) AS n FROM information_schema.tables
           WHERE table_schema = DATABASE() AND table_name = 'purchase_adjustment_notes'`
        );
        if (adjCheck.n > 0) {
          const [[danCnt]] = await conn.query(
            `SELECT COUNT(*) AS n FROM purchase_adjustment_notes WHERE DATE(created_at) = CURDATE()`
          );
          const danSeq = String(((_e = danCnt.n) != null ? _e : 0) + 1).padStart(4, "0");
          const danNo = `DAN-${today}-${danSeq}`;
          await conn.query(
            `INSERT INTO purchase_adjustment_notes
               (note_number, note_type, reason_type, purchase_order_id,
                quantity_kg, unit_price_per_kg, amount,
                description, status, created_at, updated_at)
             VALUES (?, 'debit', 'over_delivery', ?,
                     ?, ?, ?,
                     ?, 'draft', NOW(), NOW())`,
            [
              danNo,
              Number(po_id),
              excessKg,
              unitPrice,
              danAmt,
              `Auto-generated: Over-delivery on ${grnNo}. Excess qty: ${excessKg.toFixed(2)} KG.`
            ]
          );
        }
      } catch (danErr) {
        console.error("Auto-DAN creation error:", danErr);
      }
    }
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

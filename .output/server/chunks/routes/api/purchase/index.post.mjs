import { B as defineEventHandler, aP as readBody, ac as getUserSession, w as createError, Q as getDb, z as defaultGrnBasis, ae as grnPricedQty, ao as nextDocNumber, aS as recalcPO, az as postCommodityGRNCost, aD as postGRNJournalEntry, m as auditLog, ap as nextNoteNumber, bd as sendTelegram } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
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
    unload_point_branch_id,
    // which branch received the goods — feeds commodity costing
    remarks,
    value_basis,
    // 'expected' | 'received' — which quantity to price this GRN on (default: Settings → Finance)
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
      `SELECT id, po_number, supplier_name, supplier_id, unit_price_per_kg, quantity_kg,
              commodity_id, wheat_origin, is_delivery_locked, delivery_lock_reason, quantity_kg AS po_qty
       FROM purchase_orders_adnan WHERE id = ?`,
      [Number(po_id)]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    if (Number(po.is_delivery_locked) === 1)
      throw createError({ statusCode: 409, statusMessage: `This purchase order (PO #${po.po_number}) has been locked by admin \u2014 no further GRNs can be recorded.${po.delivery_lock_reason ? " Reason: " + po.delivery_lock_reason : ""} Contact a Superadmin or Admin to re-open it.` });
    const receivedKg = Number(quantity_received_kg);
    const expectedKg = Number(expected_quantity) || 0;
    const unitPrice = Number(po.unit_price_per_kg);
    const basis = ["expected", "received"].includes(value_basis) ? value_basis : await defaultGrnBasis();
    const billedQty = grnPricedQty(basis, receivedKg, expectedKg);
    const totalValue = billedQty * unitPrice;
    const baseQty = expectedKg > 0 ? expectedKg : Number(po.quantity_kg);
    const varPct = baseQty > 0 ? ((receivedKg - baseQty) / baseQty * 100).toFixed(4) : "0";
    const grnNo = await nextDocNumber(conn, "GRN", "goods_received_adnan", "grn_number");
    const [result] = await conn.query(
      `INSERT INTO goods_received_adnan
         (grn_number, grn_date, purchase_order_id, po_number,
          supplier_id, supplier_name,
          quantity_received_kg, expected_quantity,
          unit_price_per_kg, total_value,
          variance_percentage,
          truck_number, unload_point_name, unload_point_branch_id, remarks,
          grn_status, receiver_user_id, value_basis,
          created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, ?,
               ?,
               ?, ?, ?, ?,
               'verified', ?, ?,
               NOW(), NOW())`,
      [
        grnNo,
        grn_date,
        Number(po_id),
        po.po_number,
        (_c = po.supplier_id) != null ? _c : null,
        po.supplier_name,
        receivedKg,
        expectedKg > 0 ? expectedKg : null,
        unitPrice,
        totalValue,
        varPct,
        truck_number != null ? truck_number : null,
        unload_point_name != null ? unload_point_name : null,
        unload_point_branch_id ? Number(unload_point_branch_id) : null,
        remarks != null ? remarks : null,
        userId,
        basis
      ]
    );
    const grnId = result.insertId;
    await recalcPO(conn, Number(po_id));
    if (po.commodity_id && unload_point_branch_id) {
      try {
        await postCommodityGRNCost(conn, {
          commodityId: Number(po.commodity_id),
          branchId: Number(unload_point_branch_id),
          origin: (_d = po.wheat_origin) != null ? _d : "",
          qty: receivedKg,
          unitCost: unitPrice
        });
      } catch (costErr) {
        console.warn(`[grn] commodity costing failed for ${grnNo}:`, costErr);
      }
    }
    try {
      await postGRNJournalEntry(conn, {
        grnId,
        poId: Number(po_id),
        grnNumber: grnNo,
        poNumber: po.po_number,
        grnDate: grn_date,
        totalValue,
        userId
      });
    } catch (jeErr) {
      console.warn(`[grn] GL posting failed for ${grnNo}:`, jeErr);
    }
    const varianceNote = expectedKg > 0 ? ` \xB7 Expected: ${expectedKg.toLocaleString()} KG \xB7 Variance: ${Number(varPct) >= 0 ? "+" : ""}${Number(varPct).toFixed(2)}%` : "";
    await auditLog(conn, {
      userId,
      action: "grn_created",
      module: "purchase",
      recordType: "grn",
      recordId: grnId,
      referenceNumber: grnNo,
      description: `GRN ${grnNo} recorded: ${po.supplier_name} \xB7 PO ${po.po_number} \xB7 Received ${receivedKg.toLocaleString()} KG \xB7 Billed ${billedQty.toLocaleString()} KG \xB7 \u09F3${totalValue.toLocaleString()}${varianceNote}`,
      severity: Math.abs(Number(varPct)) > 1 ? "warning" : "info"
    });
    if (over_delivery_action === "accept_with_dan" && Number(excess_qty) > 0) {
      try {
        const excessKg = Number(excess_qty);
        const danAmt = excessKg * unitPrice;
        const [[adjCheck]] = await conn.query(
          `SELECT COUNT(*) AS n FROM information_schema.tables
           WHERE table_schema = DATABASE() AND table_name = 'purchase_adjustment_notes'`
        );
        if (adjCheck.n > 0) {
          const danNo = await nextNoteNumber(conn, "debit");
          const [danResult] = await conn.query(
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
          await auditLog(conn, {
            userId,
            action: "adj_created",
            module: "purchase",
            recordType: "adjustment_note",
            recordId: danResult.insertId,
            referenceNumber: danNo,
            description: `Auto-draft DAN ${danNo} created for over-delivery on GRN ${grnNo} \xB7 Excess ${excessKg.toFixed(2)} KG \xB7 \u09F3${danAmt.toLocaleString()}`,
            severity: "warning"
          });
        }
      } catch (danErr) {
        console.error("Auto-DAN creation error:", danErr);
      }
    }
    const [[tot]] = await conn.query(`SELECT total_received_qty FROM purchase_orders_adnan WHERE id = ?`, [Number(po_id)]);
    await conn.commit();
    const poQty = Number(po.po_qty) || 0, got = Number(tot == null ? void 0 : tot.total_received_qty) || 0;
    sendTelegram(
      `\u{1F4E6} <b>Goods Received</b>
${grnNo} \u2014 ${po.supplier_name} (PO ${po.po_number})
${receivedKg.toLocaleString()} KG${truck_number ? " \xB7 truck " + truck_number : ""} @ \u09F3${unitPrice.toLocaleString()} = \u09F3${totalValue.toLocaleString()}
PO progress: ${got.toLocaleString()} / ${poQty.toLocaleString()} KG${poQty > 0 ? ` (${(got / poQty * 100).toFixed(1)}%)` : ""}`,
      "goods_received"
    );
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

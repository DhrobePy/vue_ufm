import { Z as defineEventHandler, az as getRouterParam, N as createError, bo as readBody, aE as getUserSession, aj as getDb, aF as grnBasisOf, aG as grnPricedQty, bM as reverseGRNJournalEntry, bb as postGRNJournalEntry, bs as recalcPO, x as auditLog } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid GRN ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (role !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Only a Superadmin can edit a GRN" });
  const {
    grn_date,
    truck_number,
    quantity_received_kg,
    expected_quantity,
    unload_point_name,
    unload_point_branch_id,
    variance_remarks,
    remarks,
    value_basis
  } = body != null ? body : {};
  if (!grn_date) throw createError({ statusCode: 400, statusMessage: "grn_date is required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[grn]] = await conn.query(
      `SELECT id, grn_number, grn_status, purchase_order_id, unit_price_per_kg, journal_entry_id, value_basis, total_value, expected_quantity AS old_expected,
              quantity_received_kg AS old_qty, quantity_received_kg
       FROM goods_received_adnan WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!grn) throw createError({ statusCode: 404, statusMessage: "GRN not found" });
    if (grn.grn_status === "cancelled") {
      throw createError({ statusCode: 400, statusMessage: "Cannot edit a cancelled GRN" });
    }
    const newQtyKg = Number(quantity_received_kg != null ? quantity_received_kg : grn.old_qty);
    const expectedKg = Number(expected_quantity) || 0;
    const unitPrice = Number(grn.unit_price_per_kg);
    const basis = ["expected", "received"].includes(value_basis) ? value_basis : grnBasisOf({ value_basis: grn.value_basis, total_value: grn.total_value, quantity_received_kg: grn.old_qty, expected_quantity: grn.old_expected, unit_price_per_kg: grn.unit_price_per_kg });
    const billedQty = grnPricedQty(basis, newQtyKg, expectedKg);
    const totalValue = billedQty * unitPrice;
    const varPct = expectedKg > 0 ? ((newQtyKg - expectedKg) / expectedKg * 100).toFixed(4) : "0";
    if (grn.journal_entry_id) {
      await reverseGRNJournalEntry(conn, {
        journalEntryId: grn.journal_entry_id,
        grnNumber: grn.grn_number,
        reason: "GRN edited",
        userId,
        grnId: id
      });
    }
    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_date               = ?,
           truck_number           = ?,
           quantity_received_kg   = ?,
           expected_quantity      = ?,
           total_value            = ?,
           variance_percentage    = ?,
           unload_point_name      = ?,
           unload_point_branch_id = ?,
           variance_remarks       = ?,
           remarks                = ?,
           value_basis            = ?,
           updated_at             = NOW()
       WHERE id = ?`,
      [
        grn_date,
        truck_number != null ? truck_number : null,
        newQtyKg,
        expectedKg > 0 ? expectedKg : null,
        totalValue,
        varPct,
        unload_point_name != null ? unload_point_name : null,
        unload_point_branch_id != null ? unload_point_branch_id : null,
        variance_remarks != null ? variance_remarks : null,
        remarks != null ? remarks : null,
        basis,
        id
      ]
    );
    let newJeId = null;
    try {
      const [[po]] = await conn.query(`SELECT po_number FROM purchase_orders_adnan WHERE id = ?`, [grn.purchase_order_id]);
      newJeId = await postGRNJournalEntry(conn, {
        grnId: id,
        poId: grn.purchase_order_id,
        grnNumber: grn.grn_number,
        poNumber: (_e = po == null ? void 0 : po.po_number) != null ? _e : "",
        grnDate: grn_date,
        totalValue,
        userId
      });
    } catch (jeErr) {
      console.warn(`[grn] Re-post GL failed for ${grn.grn_number}:`, jeErr);
    }
    await recalcPO(conn, grn.purchase_order_id);
    const changeNote = newQtyKg !== Number(grn.old_qty) ? ` \xB7 Qty changed: ${Number(grn.old_qty).toLocaleString()} \u2192 ${newQtyKg.toLocaleString()} KG` : "";
    await auditLog(conn, {
      userId,
      action: "grn_updated",
      module: "purchase",
      recordType: "grn",
      recordId: id,
      referenceNumber: grn.grn_number,
      description: `GRN ${grn.grn_number} updated${changeNote} \xB7 Total Value: \u09F3${totalValue.toLocaleString()}${newJeId ? ` \xB7 GL re-posted (#${newJeId})` : ""}`,
      severity: newQtyKg !== Number(grn.old_qty) ? "warning" : "info"
    });
    await conn.commit();
    return { ok: true, message: `GRN ${grn.grn_number} updated` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

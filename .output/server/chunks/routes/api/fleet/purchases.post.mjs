import { m as defineEventHandler, a4 as readBody, i as createError, a2 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const purchases_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const {
    supplier_name,
    purchase_date,
    notes,
    items = []
  } = body != null ? body : {};
  if (!purchase_date) throw createError({ statusCode: 400, statusMessage: "Purchase date is required" });
  if (!items.length) throw createError({ statusCode: 400, statusMessage: "At least one item is required" });
  const d = new Date(purchase_date);
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const [cntRow] = await query(`SELECT COUNT(*) AS cnt FROM fleet_purchases WHERE DATE(purchase_date) = ?`, [purchase_date]);
  const seq = String(Number((_a = cntRow == null ? void 0 : cntRow.cnt) != null ? _a : 0) + 1).padStart(4, "0");
  const po_number = `FMCPO-${dateStr}-${seq}`;
  const totalAmount = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const result = await query(
    `INSERT INTO fleet_purchases (po_number, supplier_name, purchase_date, status, total_amount, notes)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
    [
      po_number,
      (supplier_name == null ? void 0 : supplier_name.trim()) || null,
      purchase_date,
      totalAmount,
      notes || null
    ]
  );
  const purchaseId = result.insertId;
  for (const item of items) {
    const amount = Number(item.quantity || 0) * Number(item.unit_rate || 0);
    await query(
      `INSERT INTO fleet_purchase_items (purchase_id, item_id, item_name, quantity, unit_rate, amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        purchaseId,
        item.item_id ? Number(item.item_id) : null,
        ((_b = item.item_name) == null ? void 0 : _b.trim()) || null,
        Number(item.quantity || 0),
        Number(item.unit_rate || 0),
        amount
      ]
    );
  }
  return { ok: true, id: purchaseId, po_number };
});

export { purchases_post as default };
//# sourceMappingURL=purchases.post.mjs.map

import { m as defineEventHandler, H as getRouterParam, i as createError, a3 as queryOne } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const note = await queryOne(
    `SELECT n.*,
            po.total_order_value, po.total_received_value, po.total_paid, po.balance_payable,
            po.quantity_kg AS po_quantity_kg, po.unit_price_per_kg AS po_unit_price
     FROM purchase_adjustment_notes n
     LEFT JOIN purchase_orders_adnan po ON n.purchase_order_id = po.id
     WHERE n.id = ?`,
    [id]
  );
  if (!note) throw createError({ statusCode: 404, statusMessage: "Adjustment note not found" });
  return { note };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

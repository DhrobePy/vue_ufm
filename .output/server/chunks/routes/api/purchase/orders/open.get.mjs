import { m as defineEventHandler, a1 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const open_get = defineEventHandler(async () => {
  const orders = await query(
    `SELECT id, po_number, supplier_id, supplier_name, quantity_kg,
            qty_yet_to_receive, total_received_qty, unit_price_per_kg,
            total_order_value, balance_payable, total_paid, wheat_origin
     FROM purchase_orders_adnan
     WHERE po_status NOT IN ('cancelled')
       AND delivery_status NOT IN ('closed')
       AND is_delivery_locked = 0
       AND qty_yet_to_receive > 0
     ORDER BY po_date DESC
     LIMIT 200`
  );
  return { orders };
});

export { open_get as default };
//# sourceMappingURL=open.get.mjs.map

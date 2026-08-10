import { q as defineEventHandler, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const open_get = defineEventHandler(async () => {
  const orders = await query(
    `SELECT o.id, o.po_number, o.supplier_id, o.supplier_name, o.quantity_kg,
            o.qty_yet_to_receive, o.total_received_qty, o.unit_price_per_kg,
            o.total_order_value, o.balance_payable, o.total_paid, o.wheat_origin,
            c.name AS commodity_name, c.unit AS commodity_unit
     FROM purchase_orders_adnan o
     LEFT JOIN purchase_commodities c ON c.id = o.commodity_id
     WHERE o.po_status NOT IN ('cancelled')
       AND o.delivery_status NOT IN ('closed')
       AND o.is_delivery_locked = 0
       AND o.qty_yet_to_receive > 0
     ORDER BY o.po_date DESC
     LIMIT 200`
  );
  return { orders };
});

export { open_get as default };
//# sourceMappingURL=open.get.mjs.map

import { h as defineEventHandler, w as getUserSession, e as createError, J as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const variance_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Access denied \u2014 admin/superadmin only" });
  }
  const rows = await query(
    `SELECT
       g.id,
       g.grn_date,
       g.grn_number,
       g.truck_number,
       g.quantity_received_kg  AS received_quantity,
       g.expected_quantity     AS expected_quantity,
       g.variance_percentage,
       g.remarks,
       po.po_number,
       po.supplier_name,
       po.quantity_kg          AS ordered_quantity,
       po.unit_price_per_kg,
       -- weight variance in KG
       (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) AS variance,
       -- value impact
       (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg))
         * po.unit_price_per_kg AS variance_value,
       -- type
       CASE
         WHEN (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) < -10 THEN 'loss'
         WHEN (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) > 10  THEN 'gain'
         ELSE 'normal'
       END AS variance_type
     FROM goods_received_adnan g
     LEFT JOIN purchase_orders_adnan po ON g.purchase_order_id = po.id
     WHERE g.grn_status != 'cancelled'
       AND ABS(g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) > 0
     ORDER BY g.grn_date DESC
     LIMIT 500`
  );
  return { variances: rows };
});

export { variance_get as default };
//# sourceMappingURL=variance.get.mjs.map

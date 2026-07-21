import { o as defineEventHandler, M as getRouterParam, k as createError, ac as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const overDeliveries_get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const rows = await query(
    `SELECT od.*, cr.display_name AS created_by_name, ap.display_name AS approved_by_name
     FROM credit_order_over_deliveries od
     LEFT JOIN users cr ON cr.id = od.created_by_user_id
     LEFT JOIN users ap ON ap.id = od.approved_by_user_id
     WHERE od.order_id = ?
     ORDER BY od.created_at DESC`,
    [id]
  );
  for (const od of rows) {
    od.items = await query(
      `SELECT odi.*, p.base_name AS product_name, pv.weight_variant
       FROM credit_order_over_delivery_items odi
       LEFT JOIN products p ON p.id = odi.product_id
       LEFT JOIN product_variants pv ON pv.id = odi.variant_id
       WHERE odi.od_id = ?`,
      [od.id]
    );
  }
  return { over_deliveries: rows };
});

export { overDeliveries_get as default };
//# sourceMappingURL=over-deliveries.get.mjs.map

import { q as defineEventHandler, R as getRouterParam, m as createError, ao as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const returns_get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const returns = await query(
    `SELECT r.*,
            u.display_name AS created_by_name,
            a.display_name AS approved_by_name
     FROM credit_order_returns r
     LEFT JOIN users u ON u.id = r.created_by_user_id
     LEFT JOIN users a ON a.id = r.approved_by_user_id
     WHERE r.order_id = ?
     ORDER BY r.created_at DESC`,
    [id]
  );
  for (const ret of returns) {
    ret.items = await query(
      `SELECT ri.*, p.base_name AS product_name, pv.weight_variant
       FROM credit_order_return_items ri
       LEFT JOIN products p  ON p.id = ri.product_id
       LEFT JOIN product_variants pv ON pv.id = ri.variant_id
       WHERE ri.return_id = ?`,
      [ret.id]
    );
  }
  return { returns };
});

export { returns_get as default };
//# sourceMappingURL=returns.get.mjs.map

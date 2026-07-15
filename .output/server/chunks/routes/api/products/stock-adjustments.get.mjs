import { o as defineEventHandler, O as getUserSession, k as createError, E as getQuery, ab as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const stockAdjustments_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const status = q.status ? String(q.status) : null;
  const rows = await query(
    `SELECT sa.*, pv.sku, pv.stock_qty AS current_stock, p.base_name AS product_name,
            u1.display_name AS created_by_name, u2.display_name AS approved_by_name
     FROM stock_adjustments sa
     JOIN product_variants pv ON pv.id = sa.variant_id
     JOIN products p ON p.id = pv.product_id
     LEFT JOIN users u1 ON u1.id = sa.created_by_user_id
     LEFT JOIN users u2 ON u2.id = sa.approved_by_user_id
     WHERE (? IS NULL OR sa.status = ?)
     ORDER BY sa.id DESC
     LIMIT 300`,
    [status, status]
  );
  return { adjustments: rows };
});

export { stockAdjustments_get as default };
//# sourceMappingURL=stock-adjustments.get.mjs.map

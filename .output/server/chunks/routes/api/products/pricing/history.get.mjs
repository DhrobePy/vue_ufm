import { p as defineEventHandler, H as getQuery, l as createError, aj as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const history_get = defineEventHandler(async (event) => {
  const { variantId } = getQuery(event);
  if (!variantId)
    throw createError({ statusCode: 400, statusMessage: "variantId is required" });
  const history = await query(
    `SELECT pp.id, pp.branch_id, b.name AS branch_name, b.code AS branch_code,
            pp.unit_price, pp.effective_date, pp.status, pp.is_active,
            pp.created_at
     FROM product_prices pp
     JOIN branches b ON b.id = pp.branch_id
     WHERE pp.variant_id = ?
     ORDER BY pp.branch_id ASC, pp.is_active DESC, pp.effective_date DESC`,
    [Number(variantId)]
  );
  return { history };
});

export { history_get as default };
//# sourceMappingURL=history.get.mjs.map

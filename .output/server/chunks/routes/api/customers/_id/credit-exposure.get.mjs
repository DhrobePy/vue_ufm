import { n as defineEventHandler, K as getRouterParam, j as createError, a9 as queryOne } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const creditExposure_get = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  const row = await queryOne(
    `SELECT
       COALESCE((
         SELECT SUM(o.balance_due)
         FROM credit_orders o
         WHERE o.customer_id = ?
           AND o.status IN ('pending_approval','escalated','approved','in_production','ready_to_ship')
       ), 0) AS pending
     FROM dual`,
    [id]
  );
  return { pending: Number((_a = row == null ? void 0 : row.pending) != null ? _a : 0) };
});

export { creditExposure_get as default };
//# sourceMappingURL=credit-exposure.get.mjs.map

import { h as defineEventHandler, v as getRouterParam, e as createError, H as queryOne } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
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
           AND o.status IN ('pending_approval','approved','in_production','ready_to_ship','shipped')
       ), 0) AS pending
     FROM dual`,
    [id]
  );
  return { pending: Number((_a = row == null ? void 0 : row.pending) != null ? _a : 0) };
});

export { creditExposure_get as default };
//# sourceMappingURL=credit-exposure.get.mjs.map

import { m as defineEventHandler, H as getRouterParam, i as createError, a3 as queryOne } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const credit_get = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid supplier ID" });
  const result = await queryOne(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)
     - COALESCE(SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END), 0) AS available_credit
     FROM supplier_balance_adjustments
     WHERE supplier_id = ?`,
    [id]
  );
  return {
    supplier_id: id,
    available_credit: Math.max(0, Number((_a = result == null ? void 0 : result.available_credit) != null ? _a : 0))
  };
});

export { credit_get as default };
//# sourceMappingURL=credit.get.mjs.map

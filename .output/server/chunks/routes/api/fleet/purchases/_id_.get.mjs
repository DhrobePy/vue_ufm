import { n as defineEventHandler, H as getRouterParam, j as createError, a5 as queryOne, a4 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [purchase, items] = await Promise.all([
    queryOne(`SELECT * FROM fleet_purchases WHERE id = ?`, [id]),
    query(`SELECT fpi.*, fi.item_code FROM fleet_purchase_items fpi LEFT JOIN fleet_items fi ON fi.id = fpi.item_id WHERE fpi.purchase_id = ? ORDER BY fpi.id`, [id])
  ]);
  if (!purchase) throw createError({ statusCode: 404, statusMessage: "Purchase not found" });
  return { purchase, items };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

import { u as defineEventHandler, a0 as getRouterParam, r as createError, U as getQuery, I as getDb, C as getAdvanceCredit, b6 as suggestAllotment } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const advanceCredit_get = defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, "id"));
  if (!customerId) throw createError({ statusCode: 400, statusMessage: "Invalid customer" });
  const q = getQuery(event);
  const strategy = q.strategy === "opening_first" ? "opening_first" : "orders_first";
  const onlyOrderId = q.order_id ? Number(q.order_id) : void 0;
  const conn = await getDb().getConnection();
  try {
    const credit = await getAdvanceCredit(conn, customerId);
    return { ...credit, strategy, suggestion: suggestAllotment(credit, strategy, { onlyOrderId }) };
  } finally {
    conn.release();
  }
});

export { advanceCredit_get as default };
//# sourceMappingURL=advance-credit.get.mjs.map

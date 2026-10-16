import { w as defineEventHandler, a3 as getRouterParam, t as createError, aG as queryOne, L as getDb, K as getCustomerOutstanding } from '../../../../nitro/nitro.mjs';
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

const creditExposure_get = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  await queryOne(
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
  const conn = await getDb().getConnection();
  try {
    const exp = await getCustomerOutstanding(conn, id);
    const [[c]] = await conn.query("SELECT credit_limit FROM customers WHERE id = ?", [id]);
    return { pending: exp.pendingExposure, ledger: exp.ledgerOutstanding, limit: Number((_a = c == null ? void 0 : c.credit_limit) != null ? _a : 0) };
  } finally {
    conn.release();
  }
});

export { creditExposure_get as default };
//# sourceMappingURL=credit-exposure.get.mjs.map

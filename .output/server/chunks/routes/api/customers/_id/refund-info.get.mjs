import { w as defineEventHandler, a3 as getRouterParam, L as getDb, t as createError } from '../../../../nitro/nitro.mjs';
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

const refundInfo_get = defineEventHandler(async (event) => {
  var _a;
  const customerId = Number(getRouterParam(event, "id"));
  const conn = await getDb().getConnection();
  try {
    const [[c]] = await conn.query(`SELECT name, initial_due FROM customers WHERE id = ?`, [customerId]);
    if (!c) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const [[bal]] = await conn.query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) b FROM customer_ledger WHERE customer_id = ? AND reference_type <> 'initial_due'`,
      [customerId]
    );
    const net = Number((_a = c.initial_due) != null ? _a : 0) + Number(bal.b);
    const [refunds] = await conn.query(`SELECT refund_number, refund_date, amount, payment_method FROM customer_refunds WHERE customer_id = ? ORDER BY id DESC LIMIT 10`, [customerId]);
    return { name: c.name, credit: Math.max(0, -net), balance: net, refunds };
  } finally {
    conn.release();
  }
});

export { refundInfo_get as default };
//# sourceMappingURL=refund-info.get.mjs.map

import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, z as getDb } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const invoice_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const conn = await getDb().getConnection();
  try {
    const [[sale]] = await conn.query(
      `SELECT cs.*, c.name AS customer_name, c.phone_number AS customer_phone,
              c.business_address, c.business_name,
              pc.name AS commodity_name, pc.unit, b.name AS branch_name, b.address AS branch_address
       FROM commodity_sales cs
       JOIN customers c ON c.id = cs.customer_id
       JOIN purchase_commodities pc ON pc.id = cs.commodity_id
       JOIN branches b ON b.id = cs.branch_id
       WHERE cs.id = ?`,
      [id]
    );
    if (!sale) throw createError({ statusCode: 404, statusMessage: "Sale not found" });
    const [[agg]] = await conn.query(
      `SELECT COALESCE(SUM(debit_amount),0) AS td, COALESCE(SUM(credit_amount),0) AS tc
       FROM customer_ledger
       WHERE customer_id = ?
         AND id < (SELECT MIN(id) FROM customer_ledger WHERE reference_type = 'commodity_sales' AND reference_id = ?)`,
      [sale.customer_id, id]
    );
    const [[custInit]] = await conn.query(`SELECT initial_due FROM customers WHERE id = ?`, [sale.customer_id]);
    const td = Number((_a = agg == null ? void 0 : agg.td) != null ? _a : 0);
    const tc = Number((_b = agg == null ? void 0 : agg.tc) != null ? _b : 0);
    const previousDue = td > 0 || tc > 0 ? td - tc : Number((_c = custInit == null ? void 0 : custInit.initial_due) != null ? _c : 0);
    return { sale, previous_due: previousDue };
  } finally {
    conn.release();
  }
});

export { invoice_get as default };
//# sourceMappingURL=invoice.get.mjs.map

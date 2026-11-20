import { B as defineEventHandler, ac as getUserSession, w as createError, aM as query } from '../../../nitro/nitro.mjs';
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

const ledgerRepair_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  if (String((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Ledger Repair is for the Superadmin only" });
  const balanceMismatch = await query(
    `SELECT c.id, c.name, c.current_balance AS stored, COALESCE(l.net,0) AS ledger FROM customers c
     LEFT JOIN (SELECT customer_id, SUM(debit_amount - credit_amount) net FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
     WHERE ABS(c.current_balance - COALESCE(l.net,0)) >= 0.5 ORDER BY ABS(c.current_balance - COALESCE(l.net,0)) DESC LIMIT 100`
  );
  const chain = await query(
    `SELECT t.customer_id AS id, c.name, COUNT(*) AS rows_off FROM (
       SELECT customer_id, balance_after, SUM(debit_amount - credit_amount) OVER (PARTITION BY customer_id ORDER BY transaction_date, id) AS rb FROM customer_ledger) t
     JOIN customers c ON c.id = t.customer_id WHERE ABS(t.balance_after - t.rb) >= 0.5 GROUP BY t.customer_id, c.name ORDER BY rows_off DESC LIMIT 200`
  );
  const dispatched = `co.status IN ('goods_on_board','shipped','delivered') AND co.order_number NOT LIKE 'OB-%' AND co.order_number NOT LIKE 'INV-INITIAL-%'`;
  const noLedger = await query(
    `SELECT co.order_number, c.name AS customer, co.total_amount AS amount, co.status FROM credit_orders co JOIN customers c ON c.id = co.customer_id
     WHERE ${dispatched} AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_id = co.id AND l.transaction_type = 'invoice' AND l.reference_type IN ('credit_order','credit_orders'))
     ORDER BY co.id DESC LIMIT 100`
  );
  const noJe = await query(
    `SELECT co.order_number, c.name AS customer, co.total_amount AS amount, co.status FROM credit_orders co JOIN customers c ON c.id = co.customer_id
     WHERE ${dispatched} AND NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.related_document_id = co.id AND je.related_document_type IN ('credit_orders','CreditOrder'))
     ORDER BY co.id DESC LIMIT 100`
  );
  const unbalanced = await query(
    `SELECT je.id, je.transaction_date AS date, LEFT(je.description, 70) AS description, COUNT(l.id) AS line_count,
            ROUND(COALESCE(SUM(l.debit_amount),0),2) AS debit, ROUND(COALESCE(SUM(l.credit_amount),0),2) AS credit
     FROM journal_entries je LEFT JOIN transaction_lines l ON l.journal_entry_id = je.id
     GROUP BY je.id HAVING ABS(debit - credit) > 0.005 OR (line_count < 2 AND debit + credit > 0) ORDER BY je.id DESC LIMIT 100`
  );
  const num = (rows, keys) => rows.map((r) => {
    for (const k of keys) r[k] = Number(r[k]);
    return r;
  });
  return {
    balanceMismatch: num(balanceMismatch, ["stored", "ledger"]),
    chain,
    noLedger: num(noLedger, ["amount"]),
    noJe: num(noJe, ["amount"]),
    unbalanced: num(unbalanced, ["debit", "credit", "line_count"])
  };
});

export { ledgerRepair_get as default };
//# sourceMappingURL=ledger-repair.get.mjs.map

import { J as defineEventHandler, aW as query } from '../../../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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

const customerReconciliation_get = defineEventHandler(async () => {
  const mismatches = await query(
    `SELECT c.id, c.name, c.business_name, c.current_balance AS stored,
            COALESCE(l.net, 0) AS ledger, COALESCE(l.n, 0) AS line_count,
            ROUND(c.current_balance - COALESCE(l.net, 0), 2) AS diff
     FROM customers c
     LEFT JOIN (SELECT customer_id, SUM(debit_amount - credit_amount) AS net, COUNT(*) AS n FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
     WHERE ABS(c.current_balance - COALESCE(l.net, 0)) >= 0.5
     ORDER BY ABS(c.current_balance - COALESCE(l.net, 0)) DESC`
  );
  const history = await query(
    `SELECT r.id, r.customer_id, c.name AS customer, r.old_balance, r.new_balance, r.status, r.reconciled_at, r.reverted_at,
            ub.display_name AS reconciled_by, rb.display_name AS reverted_by
     FROM customer_balance_reconciliations r
     JOIN customers c ON c.id = r.customer_id
     LEFT JOIN users ub ON ub.id = r.reconciled_by_user_id
     LEFT JOIN users rb ON rb.id = r.reverted_by_user_id
     ORDER BY r.id DESC LIMIT 100`
  );
  const num = (r) => ({ ...r, stored: Number(r.stored), ledger: Number(r.ledger), diff: Number(r.diff) });
  return { mismatches: mismatches.map(num), history, checked: Number((await query(`SELECT COUNT(*) n FROM customers`))[0].n) };
});

export { customerReconciliation_get as default };
//# sourceMappingURL=customer-reconciliation.get.mjs.map

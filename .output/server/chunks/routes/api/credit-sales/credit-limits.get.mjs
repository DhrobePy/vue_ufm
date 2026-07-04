import { m as defineEventHandler, a1 as query, a2 as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const creditLimits_get = defineEventHandler(async () => {
  const customers = await query(
    `SELECT c.id, c.name, c.business_address AS area, c.credit_limit,
            c.current_balance AS outstanding, c.status,
            COALESCE(
              (SELECT SUM(o.balance_due)
               FROM credit_orders o
               WHERE o.customer_id = c.id
                 AND o.status NOT IN ('cancelled','rejected')
                 AND o.required_date < CURDATE()
                 AND o.balance_due > 0),
              0
            ) AS overdue
     FROM customers c
     WHERE c.customer_type = 'Credit'
       AND c.status != 'blacklisted'
     ORDER BY c.current_balance DESC`
  );
  const stats = await queryOne(
    `SELECT
       COALESCE(SUM(credit_limit),   0) AS total_limit,
       COALESCE(SUM(current_balance),0) AS total_outstanding
     FROM customers
     WHERE customer_type = 'Credit'`
  );
  return { customers, stats };
});

export { creditLimits_get as default };
//# sourceMappingURL=credit-limits.get.mjs.map

import { q as defineEventHandler, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const ageing_get = defineEventHandler(async () => {
  const rows = await query(
    `SELECT
       c.id AS customer_id,
       c.name AS customer,
       c.status,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 0  AND 30  THEN o.balance_due ELSE 0 END) AS current_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 31 AND 60  THEN o.balance_due ELSE 0 END) AS d30_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 61 AND 90  THEN o.balance_due ELSE 0 END) AS d60_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 91 AND 120 THEN o.balance_due ELSE 0 END) AS d90_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) > 120              THEN o.balance_due ELSE 0 END) AS d120_amt,
       SUM(o.balance_due) AS total
     FROM credit_orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.balance_due > 0
       AND o.status NOT IN ('cancelled', 'rejected')
     GROUP BY c.id, c.name, c.status
     HAVING total > 0
     ORDER BY total DESC`
  );
  const buckets = [
    { label: "Current (0\u201330d)", key: "current_amt", color: "#10b981" },
    { label: "31\u201360 days", key: "d30_amt", color: "#eab308" },
    { label: "61\u201390 days", key: "d60_amt", color: "#f97316" },
    { label: "91\u2013120 days", key: "d90_amt", color: "#ef4444" },
    { label: "120+ days", key: "d120_amt", color: "#7f1d1d" }
  ];
  const summary = buckets.map((b) => ({
    label: b.label,
    color: b.color,
    value: rows.reduce((s, r) => {
      var _a;
      return s + Number((_a = r[b.key]) != null ? _a : 0);
    }, 0),
    count: rows.filter((r) => {
      var _a;
      return Number((_a = r[b.key]) != null ? _a : 0) > 0;
    }).length
  }));
  return { rows, summary };
});

export { ageing_get as default };
//# sourceMappingURL=ageing.get.mjs.map

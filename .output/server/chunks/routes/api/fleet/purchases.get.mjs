import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
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

const purchases_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const status = q.status;
  const conditions = [];
  const params = [];
  if (status && status !== "all") {
    conditions.push("fp.status = ?");
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const purchases = await query(
    `SELECT fp.*,
            COUNT(fpi.id) AS item_count
     FROM fleet_purchases fp
     LEFT JOIN fleet_purchase_items fpi ON fpi.purchase_id = fp.id
     ${where}
     GROUP BY fp.id
     ORDER BY fp.purchase_date DESC, fp.id DESC
     LIMIT 200`,
    params
  );
  const [stats] = await query(
    `SELECT
       COUNT(*)                                          AS total,
       SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status='approved'  THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status='received'  THEN 1 ELSE 0 END) AS received,
       SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
       COALESCE(SUM(total_amount),0) AS total_value,
       COALESCE(SUM(paid_amount),0)  AS total_paid
     FROM fleet_purchases`,
    []
  );
  return { purchases, stats };
});

export { purchases_get as default };
//# sourceMappingURL=purchases.get.mjs.map

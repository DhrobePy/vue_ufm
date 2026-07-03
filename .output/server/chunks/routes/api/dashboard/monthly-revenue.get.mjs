import { j as defineEventHandler, u as getQuery, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const monthlyRevenue_get = defineEventHandler(async (event) => {
  var _a;
  const period = (_a = getQuery(event).period) != null ? _a : "1M";
  let sql;
  if (period === "7D") {
    sql = `SELECT
             DATE_FORMAT(order_date, '%d %b')   AS month,
             DATE_FORMAT(order_date, '%Y-%m-%d') AS sort_key,
             COALESCE(SUM(total_amount), 0)     AS revenue,
             COUNT(*)                           AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             AND status NOT IN ('cancelled','rejected')
           GROUP BY DATE_FORMAT(order_date, '%Y-%m-%d')
           ORDER BY sort_key ASC`;
  } else if (period === "1M") {
    sql = `SELECT
             DATE_FORMAT(order_date, '%d %b')   AS month,
             DATE_FORMAT(order_date, '%Y-%m-%d') AS sort_key,
             COALESCE(SUM(total_amount), 0)     AS revenue,
             COUNT(*)                           AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
             AND status NOT IN ('cancelled','rejected')
           GROUP BY DATE_FORMAT(order_date, '%Y-%m-%d')
           ORDER BY sort_key ASC`;
  } else if (period === "3M") {
    sql = `SELECT
             CONCAT(DATE_FORMAT(MIN(order_date), '%d %b'), '\u2013', DATE_FORMAT(MAX(order_date), '%d %b')) AS month,
             YEARWEEK(order_date, 1)            AS sort_key,
             COALESCE(SUM(total_amount), 0)     AS revenue,
             COUNT(*)                           AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 89 DAY)
             AND status NOT IN ('cancelled','rejected')
           GROUP BY YEARWEEK(order_date, 1)
           ORDER BY sort_key ASC`;
  } else {
    sql = `SELECT
             DATE_FORMAT(order_date, '%b %Y')  AS month,
             DATE_FORMAT(order_date, '%Y-%m')  AS sort_key,
             COALESCE(SUM(total_amount), 0)    AS revenue,
             COUNT(*)                          AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
             AND status NOT IN ('cancelled','rejected')
           GROUP BY DATE_FORMAT(order_date, '%Y-%m')
           ORDER BY sort_key ASC`;
  }
  try {
    const rows = await query(sql);
    return rows;
  } catch {
    return [];
  }
});

export { monthlyRevenue_get as default };
//# sourceMappingURL=monthly-revenue.get.mjs.map

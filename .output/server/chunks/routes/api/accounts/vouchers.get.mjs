import { h as defineEventHandler, p as getQuery, K as query, L as queryOne, G as paginate } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const vouchers_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const page = Number(q.page) || 1;
  const { limit, offset } = paginate(page, 20);
  const where = [];
  const params = [];
  if (search) {
    where.push("(dv.voucher_number LIKE ? OR dv.paid_to LIKE ? OR dv.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("dv.status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [vouchers, [cnt], stats] = await Promise.all([
    query(
      `SELECT dv.id, dv.voucher_number, dv.voucher_date AS date,
              dv.paid_to, dv.description AS purpose,
              dv.amount, dv.status,
              ea.name AS expense_account,
              pa.name AS payment_account,
              u.display_name AS created_by
       FROM debit_vouchers dv
       LEFT JOIN chart_of_accounts ea ON ea.id = dv.expense_account_id
       LEFT JOIN chart_of_accounts pa ON pa.id = dv.payment_account_id
       LEFT JOIN users u ON u.id = dv.created_by_user_id
       ${w}
       ORDER BY dv.voucher_date DESC, dv.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM debit_vouchers dv ${w}`, params),
    queryOne(
      `SELECT
         SUM(DATE(voucher_date) = CURDATE())   AS today_count,
         SUM(CASE WHEN DATE(voucher_date) = CURDATE() THEN amount ELSE 0 END) AS today_total,
         SUM(status = 'draft')                 AS pending_count,
         SUM(CASE WHEN MONTH(voucher_date) = MONTH(CURDATE()) THEN amount ELSE 0 END) AS month_total
       FROM debit_vouchers`
    )
  ]);
  return {
    vouchers,
    total: cnt.total,
    page,
    perPage: limit,
    stats
  };
});

export { vouchers_get as default };
//# sourceMappingURL=vouchers.get.mjs.map

import { o as defineEventHandler, F as getQuery, ac as query, a3 as paginate } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const payments_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const page = Number(q.page) || 1;
  const { limit, offset } = paginate(page, 25);
  const where = [];
  const params = [];
  if (search) {
    where.push("(p.payment_voucher_number LIKE ? OR p.supplier_name LIKE ? OR p.po_number LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [payments, [cnt]] = await Promise.all([
    query(
      `SELECT p.id, p.payment_voucher_number, p.payment_date, p.supplier_name,
              p.po_number, p.amount_paid, p.payment_method, p.bank_name,
              p.payment_type, p.reference_number, p.remarks,
              cr.display_name AS created_by_name
       FROM purchase_payments_adnan p
       LEFT JOIN users cr ON cr.id = p.created_by_user_id
       ${w}
       ORDER BY p.payment_date DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM purchase_payments_adnan p ${w}`, params)
  ]);
  return { payments, total: cnt.total, page, perPage: limit };
});

export { payments_get as default };
//# sourceMappingURL=payments.get.mjs.map

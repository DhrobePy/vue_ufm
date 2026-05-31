import { h as defineEventHandler, p as getQuery, G as query, C as paginate } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const payments_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const page = Number(q.page) || 1;
  const { limit, offset } = paginate(page, 30);
  const where = [];
  const params = [];
  if (search) {
    where.push("(p.reference_number LIKE ? OR c.name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("p.allocation_status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [payments, [cnt]] = await Promise.all([
    query(
      `SELECT p.id, p.reference_number, p.payment_date, p.amount,
              p.allocated_amount, p.allocation_status, p.payment_method,
              p.notes, p.status, p.created_at,
              c.id AS customer_id, c.name AS customer_name
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       ${w}
       ORDER BY p.payment_date DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM customer_payments p JOIN customers c ON c.id = p.customer_id ${w}`, params)
  ]);
  return { payments, total: cnt.total, page, perPage: limit };
});

export { payments_get as default };
//# sourceMappingURL=payments.get.mjs.map

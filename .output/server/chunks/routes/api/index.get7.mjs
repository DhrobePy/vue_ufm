import { p as defineEventHandler, H as getQuery, aj as query, a7 as paginate } from '../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const type = q.type || "";
  const status = q.status || "";
  const page = Number(q.page) || 1;
  const perPage = Math.min(Number(q.per) || 25, 500);
  const { limit, offset } = paginate(page, perPage);
  const where = [];
  const params = [];
  if (search) {
    where.push("(s.company_name LIKE ? OR s.supplier_code LIKE ? OR s.phone LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (type) {
    where.push("s.supplier_type = ?");
    params.push(type);
  }
  if (status) {
    where.push("s.status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [suppliers, [cnt]] = await Promise.all([
    query(
      `SELECT s.id, s.supplier_code, s.company_name, s.contact_person,
              s.phone, s.mobile, s.city, s.country, s.supplier_type,
              s.payment_terms, s.credit_limit, s.current_balance, s.status,
              COUNT(DISTINCT o.id) AS total_pos
       FROM suppliers s
       LEFT JOIN purchase_orders_adnan o ON o.supplier_id = s.id
       ${w}
       GROUP BY s.id
       ORDER BY s.company_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM suppliers s ${w}`, params)
  ]);
  return { suppliers, total: cnt.total, page, perPage: limit };
});

export { index_get as default };
//# sourceMappingURL=index.get7.mjs.map

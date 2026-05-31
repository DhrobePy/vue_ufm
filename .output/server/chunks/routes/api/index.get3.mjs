import { h as defineEventHandler, p as getQuery, G as query, C as paginate } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const page = Number(q.page) || 1;
  const { limit, offset } = paginate(page, 25);
  const where = [];
  const params = [];
  if (search) {
    where.push("(e.voucher_number LIKE ? OR e.handled_by_person LIKE ? OR cat.category_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("e.status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [expenses, [cnt]] = await Promise.all([
    query(
      `SELECT e.id, e.voucher_number, e.expense_date, e.total_amount,
              e.payment_method, e.status, e.remarks, e.handled_by_person,
              e.unit_quantity, e.per_unit_cost, e.created_at,
              cat.category_name, sub.subcategory_name,
              cr.display_name AS created_by_name,
              ap.display_name AS approved_by_name,
              b.name AS branch_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat     ON cat.id = e.category_id
       LEFT JOIN expense_subcategories sub  ON sub.id = e.subcategory_id
       LEFT JOIN users cr ON cr.id = e.created_by_user_id
       LEFT JOIN users ap ON ap.id = e.approved_by_user_id
       LEFT JOIN branches b ON b.id = e.branch_id
       ${w}
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*) AS total FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       LEFT JOIN expense_subcategories sub ON sub.id = e.subcategory_id
       ${w}`,
      params
    )
  ]);
  return { expenses, total: cnt.total, page, perPage: limit };
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map

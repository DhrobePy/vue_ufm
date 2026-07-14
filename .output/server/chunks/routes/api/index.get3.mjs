import { n as defineEventHandler, z as getQuery, a6 as query, _ as paginate } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const branch_id = Number(q.branch_id) || 0;
  const category_id = Number(q.category_id) || 0;
  const date_from = q.date_from || "";
  const date_to = q.date_to || "";
  const page = Number(q.page) || 1;
  const perPage = Number(q.per) || 25;
  const { limit, offset } = paginate(page, perPage);
  const where = [];
  const params = [];
  if (search) {
    where.push("(e.voucher_number LIKE ? OR e.handled_by_person LIKE ? OR cat.category_name LIKE ? OR e.remarks LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("e.status = ?");
    params.push(status);
  }
  if (branch_id) {
    where.push("e.branch_id = ?");
    params.push(branch_id);
  }
  if (category_id) {
    where.push("e.category_id = ?");
    params.push(category_id);
  }
  if (date_from) {
    where.push("e.expense_date >= ?");
    params.push(date_from);
  }
  if (date_to) {
    where.push("e.expense_date <= ?");
    params.push(date_to);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const baseJoins = `
    FROM expense_vouchers e
    LEFT JOIN expense_categories cat    ON cat.id = e.category_id
    LEFT JOIN expense_subcategories sub ON sub.id = e.subcategory_id
    LEFT JOIN branches b ON b.id = e.branch_id`;
  const [expenses, [cnt], stats] = await Promise.all([
    query(
      `SELECT e.id, e.voucher_number, e.expense_date, e.total_amount,
              e.payment_method, e.status, e.remarks, e.handled_by_person,
              e.unit_quantity, e.per_unit_cost, e.created_at,
              cat.category_name, sub.subcategory_name,
              cr.display_name AS created_by_name,
              ap.display_name AS approved_by_name,
              b.name AS branch_name
       ${baseJoins}
       LEFT JOIN users cr ON cr.id = e.created_by_user_id
       LEFT JOIN users ap ON ap.id = e.approved_by_user_id
       ${w}
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*) AS total ${baseJoins} ${w}`,
      params
    ),
    // Stats (unfiltered by date/search for card consistency, only status-split)
    query(
      `SELECT
         COUNT(*)                                                    AS total_count,
         SUM(status = 'pending')                                     AS pending_count,
         SUM(status = 'approved')                                    AS approved_count,
         SUM(status = 'rejected')                                    AS rejected_count,
         COALESCE(SUM(CASE WHEN status='approved' THEN total_amount ELSE 0 END), 0) AS approved_amount,
         COALESCE(SUM(CASE WHEN status='pending'  THEN total_amount ELSE 0 END), 0) AS pending_amount
       FROM expense_vouchers`,
      []
    )
  ]);
  const s = (_a = stats[0]) != null ? _a : {};
  return {
    expenses,
    total: Number(cnt.total),
    page,
    perPage: limit,
    stats: {
      totalCount: Number((_b = s.total_count) != null ? _b : 0),
      pendingCount: Number((_c = s.pending_count) != null ? _c : 0),
      approvedCount: Number((_d = s.approved_count) != null ? _d : 0),
      rejectedCount: Number((_e = s.rejected_count) != null ? _e : 0),
      approvedAmount: Number((_f = s.approved_amount) != null ? _f : 0),
      pendingAmount: Number((_g = s.pending_amount) != null ? _g : 0)
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map

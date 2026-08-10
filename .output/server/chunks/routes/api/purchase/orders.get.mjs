import { q as defineEventHandler, J as getQuery, ap as query, aa as paginate } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const orders_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const deliveryStatus = q.delivery_status || "";
  const paymentStatus = q.payment_status || "";
  const origin = q.origin || "";
  const dateFrom = q.date_from || "";
  const dateTo = q.date_to || "";
  const page = Number(q.page) || 1;
  const perPage = Math.min(Number(q.per) || 25, 200);
  const { limit, offset } = paginate(page, perPage);
  const where = [];
  const params = [];
  if (search) {
    where.push("(o.po_number LIKE ? OR o.supplier_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("o.po_status = ?");
    params.push(status);
  }
  if (deliveryStatus) {
    where.push("o.delivery_status = ?");
    params.push(deliveryStatus);
  }
  if (paymentStatus) {
    where.push("o.payment_status = ?");
    params.push(paymentStatus);
  }
  if (origin) {
    where.push("o.wheat_origin = ?");
    params.push(origin);
  }
  if (dateFrom) {
    where.push("o.po_date >= ?");
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push("o.po_date <= ?");
    params.push(dateTo);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [orders, [cnt]] = await Promise.all([
    query(
      `SELECT o.id, o.po_number, o.po_date, o.supplier_name, o.wheat_origin,
              o.quantity_kg, o.unit_price_per_kg, o.total_order_value,
              o.total_received_qty, o.qty_yet_to_receive,
              o.total_paid, o.balance_payable,
              o.po_status, o.delivery_status, o.payment_status,
              o.is_delivery_locked, o.expected_delivery_date,
              b.name AS branch_name,
              c.name AS commodity_name, c.unit AS commodity_unit
       FROM purchase_orders_adnan o
       LEFT JOIN branches b ON b.id = o.branch_id
       LEFT JOIN purchase_commodities c ON c.id = o.commodity_id
       ${w}
       ORDER BY o.po_date DESC, o.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM purchase_orders_adnan o ${w}`, params)
  ]);
  return { orders, total: cnt.total, page, perPage: limit };
});

export { orders_get as default };
//# sourceMappingURL=orders.get.mjs.map

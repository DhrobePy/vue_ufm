import { p as defineEventHandler, V as getUserSession, l as createError, H as getQuery, aj as query } from '../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const search_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = String((_a = getQuery(event).q) != null ? _a : "").trim();
  if (q.length < 2) return { results: [] };
  const like = `%${q}%`;
  const results = [];
  const safe = async (fn) => {
    try {
      return await fn();
    } catch {
      return [];
    }
  };
  const [
    customers,
    orders,
    products,
    suppliers,
    pos,
    expenses,
    employees,
    branches,
    tradingSales,
    loans,
    users
  ] = await Promise.all([
    safe(() => query(
      `SELECT id, name, business_name, phone_number, current_balance FROM customers
       WHERE name LIKE ? OR business_name LIKE ? OR phone_number LIKE ?
       ORDER BY name LIMIT 6`,
      [like, like, like]
    )),
    safe(() => query(
      `SELECT o.id, o.order_number, o.status, o.total_amount, c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number LIKE ? OR c.name LIKE ?
       ORDER BY o.id DESC LIMIT 6`,
      [like, like]
    )),
    safe(() => query(
      `SELECT p.id AS product_id, p.base_name, v.id AS variant_id, v.weight_variant, v.sku
       FROM products p JOIN product_variants v ON v.product_id = p.id
       WHERE p.base_name LIKE ? OR v.sku LIKE ?
       ORDER BY p.base_name LIMIT 6`,
      [like, like]
    )),
    safe(() => query(
      `SELECT id, company_name, phone, current_balance FROM suppliers
       WHERE company_name LIKE ? OR phone LIKE ?
       ORDER BY company_name LIMIT 6`,
      [like, like]
    )),
    safe(() => query(
      `SELECT id, po_number, supplier_name, po_status FROM purchase_orders_adnan
       WHERE po_number LIKE ? OR supplier_name LIKE ?
       ORDER BY id DESC LIMIT 6`,
      [like, like]
    )),
    safe(() => query(
      `SELECT id, voucher_number, total_amount, status FROM expense_vouchers
       WHERE voucher_number LIKE ? OR remarks LIKE ? OR handled_by_person LIKE ?
       ORDER BY id DESC LIMIT 6`,
      [like, like, like]
    )),
    safe(() => query(
      `SELECT id, first_name, last_name, designation FROM employees
       WHERE first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name,' ',last_name) LIKE ?
       ORDER BY first_name LIMIT 5`,
      [like, like, like]
    )),
    safe(() => query(
      `SELECT id, name, code FROM branches WHERE name LIKE ? OR code LIKE ? ORDER BY name LIMIT 5`,
      [like, like]
    )),
    safe(() => query(
      `SELECT s.id, s.sale_number, s.total_amount, c.name AS customer_name
       FROM commodity_sales s JOIN customers c ON c.id = s.customer_id
       WHERE s.sale_number LIKE ? OR c.name LIKE ?
       ORDER BY s.id DESC LIMIT 5`,
      [like, like]
    )),
    safe(() => query(
      `SELECT l.id, l.loan_number, l.principal_amount, COALESCE(c.name, s.company_name) AS borrower_name
       FROM loans l LEFT JOIN customers c ON c.id = l.customer_id LEFT JOIN suppliers s ON s.id = l.supplier_id
       WHERE l.loan_number LIKE ? OR c.name LIKE ? OR s.company_name LIKE ?
       ORDER BY l.id DESC LIMIT 5`,
      [like, like, like]
    )),
    safe(() => query(
      `SELECT id, display_name, email, role FROM users
       WHERE display_name LIKE ? OR email LIKE ?
       ORDER BY display_name LIMIT 5`,
      [like, like]
    ))
  ]);
  for (const c of customers) results.push({
    type: "customer",
    icon: "\u{1F464}",
    label: c.name,
    sublabel: `${c.business_name ? c.business_name + " \xB7 " : ""}\u09F3${Number((_b = c.current_balance) != null ? _b : 0).toLocaleString()} due`,
    route: `/customers/${c.id}`
  });
  for (const o of orders) results.push({
    type: "order",
    icon: "\u{1F4CB}",
    label: o.order_number,
    sublabel: `${o.customer_name} \xB7 \u09F3${Number(o.total_amount).toLocaleString()} \xB7 ${String(o.status).replace(/_/g, " ")}`,
    route: `/credit-sales/${o.id}`
  });
  for (const p of products) results.push({
    type: "product",
    icon: "\u{1F33E}",
    label: `${p.base_name} (${p.weight_variant})`,
    sublabel: (_c = p.sku) != null ? _c : "",
    route: `/products/${p.product_id}/variants`
  });
  for (const s of suppliers) results.push({
    type: "supplier",
    icon: "\u{1F3ED}",
    label: s.company_name,
    sublabel: `${(_d = s.phone) != null ? _d : ""} \xB7 \u09F3${Number((_e = s.current_balance) != null ? _e : 0).toLocaleString()} payable`,
    route: `/purchase/suppliers/${s.id}`
  });
  for (const p of pos) results.push({
    type: "po",
    icon: "\u{1F6D2}",
    label: p.po_number,
    sublabel: `${p.supplier_name} \xB7 ${p.po_status}`,
    route: `/purchase/orders/${p.id}`
  });
  for (const e of expenses) results.push({
    type: "expense",
    icon: "\u{1F4B8}",
    label: e.voucher_number,
    sublabel: `\u09F3${Number(e.total_amount).toLocaleString()} \xB7 ${e.status}`,
    route: `/expenses/${e.id}`
  });
  for (const e of employees) results.push({
    type: "employee",
    icon: "\u{1F9D1}\u200D\u{1F4BC}",
    label: `${e.first_name} ${(_f = e.last_name) != null ? _f : ""}`.trim(),
    sublabel: (_g = e.designation) != null ? _g : "",
    route: `/hr/employees/${e.id}`
  });
  for (const b of branches) results.push({
    type: "branch",
    icon: "\u{1F4CD}",
    label: b.name,
    sublabel: (_h = b.code) != null ? _h : "",
    route: `/admin/settings`
  });
  for (const s of tradingSales) results.push({
    type: "trading",
    icon: "\u{1F4E6}",
    label: s.sale_number,
    sublabel: `${s.customer_name} \xB7 \u09F3${Number(s.total_amount).toLocaleString()}`,
    route: `/trading/sales/${s.id}`
  });
  for (const l of loans) results.push({
    type: "loan",
    icon: "\u{1F91D}",
    label: l.loan_number,
    sublabel: `${(_i = l.borrower_name) != null ? _i : "\u2014"} \xB7 \u09F3${Number(l.principal_amount).toLocaleString()}`,
    route: `/loans/${l.id}`
  });
  for (const u of users) results.push({
    type: "user",
    icon: "\u{1F465}",
    label: u.display_name,
    sublabel: `${u.email} \xB7 ${u.role}`,
    route: `/admin/users/${u.id}/permissions`
  });
  return { results };
});

export { search_get as default };
//# sourceMappingURL=search.get.mjs.map

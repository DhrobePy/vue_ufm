import { Z as defineEventHandler, bl as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const operationsCenter_get = defineEventHandler(async () => {
  const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
  const open = `co.status NOT IN ('delivered','cancelled','rejected')`;
  const live = "cp.reversed_at IS NULL";
  const [ordersToday, shipments, products, paymentsToday, receivables, suppPayables, suppAdvances, suppPaidToday, expensesToday] = await Promise.all([
    query(`SELECT co.order_number, co.id, c.name AS customer, co.total_amount AS amount, co.status, co.priority, co.advance_paid AS advance, co.balance_due AS due
                FROM credit_orders co JOIN customers c ON c.id = co.customer_id WHERE DATE(co.created_at) = ? ORDER BY co.created_at DESC`, [today]),
    query(`SELECT co.order_number, co.id, c.name AS customer, co.required_date, co.total_amount AS amount, co.status, co.priority
                FROM credit_orders co JOIN customers c ON c.id = co.customer_id WHERE co.required_date = ? AND ${open}
                ORDER BY FIELD(co.priority,'urgent','high','normal','low'), co.order_number`, [today]),
    query(`SELECT p.base_name AS product, COALESCE(pv.grade,'') AS grade, COALESCE(pv.weight_variant,'') AS variant, SUM(coi.quantity) AS ordered_qty,
                       SUM(coi.line_total) AS ordered_value, COALESCE(pv.stock_qty,0) AS stock, COUNT(DISTINCT coi.order_id) AS orders
                FROM credit_order_items coi JOIN credit_orders co ON co.id = coi.order_id AND ${open}
                JOIN products p ON p.id = coi.product_id LEFT JOIN product_variants pv ON pv.id = coi.variant_id
                GROUP BY p.id, pv.id ORDER BY ordered_qty DESC`),
    query(`SELECT cp.payment_number AS ref, c.name AS customer, cp.amount, cp.payment_method AS method, cp.payment_type AS type, COALESCE(ba.account_name,'Cash') AS paid_into
                FROM customer_payments cp JOIN customers c ON c.id = cp.customer_id LEFT JOIN bank_accounts ba ON ba.id = cp.bank_account_id
                WHERE cp.payment_date = ? AND ${live} ORDER BY cp.created_at DESC`, [today]),
    query(`SELECT c.id, c.name AS customer, c.phone_number AS phone, c.current_balance AS balance, c.credit_limit FROM customers c
                WHERE c.current_balance > 0.01 AND c.customer_type = 'Credit' ORDER BY c.current_balance DESC LIMIT 100`),
    query(`SELECT t.po_number AS po, t.po_date AS date, t.supplier, t.billed, t.paid, t.balance AS due, t.delivery_status AS delivery FROM (
                  SELECT po.po_number, po.po_date, COALESCE(s.company_name, po.supplier_name) AS supplier, po.delivery_status,
                         COALESCE(g.q,0) * po.unit_price_per_kg + COALESCE(po.total_adjustment_amount,0) AS billed, COALESCE(p.paid,0) AS paid,
                         COALESCE(g.q,0) * po.unit_price_per_kg + COALESCE(po.total_adjustment_amount,0) - COALESCE(p.paid,0) AS balance
                  FROM purchase_orders_adnan po LEFT JOIN suppliers s ON s.id = po.supplier_id
                  LEFT JOIN (SELECT purchase_order_id, SUM(expected_quantity) q FROM goods_received_adnan WHERE grn_status <> 'cancelled' GROUP BY purchase_order_id) g ON g.purchase_order_id = po.id
                  LEFT JOIN (SELECT purchase_order_id, SUM(amount_paid) paid FROM purchase_payments_adnan WHERE is_posted = 1 GROUP BY purchase_order_id) p ON p.purchase_order_id = po.id
                  WHERE po.po_status <> 'cancelled' AND po.delivery_status <> 'closed') t
                WHERE t.balance > 0.01 ORDER BY t.balance DESC LIMIT 60`),
    query(`SELECT t.po_number AS po, t.po_date AS date, t.supplier, t.billed, t.paid, t.adv AS advance, t.delivery_status AS delivery FROM (
                  SELECT po.po_number, po.po_date, COALESCE(s.company_name, po.supplier_name) AS supplier, po.delivery_status,
                         COALESCE(g.q,0) * po.unit_price_per_kg + COALESCE(po.total_adjustment_amount,0) AS billed, COALESCE(p.paid,0) AS paid,
                         COALESCE(p.paid,0) - (COALESCE(g.q,0) * po.unit_price_per_kg + COALESCE(po.total_adjustment_amount,0)) AS adv
                  FROM purchase_orders_adnan po LEFT JOIN suppliers s ON s.id = po.supplier_id
                  LEFT JOIN (SELECT purchase_order_id, SUM(expected_quantity) q FROM goods_received_adnan WHERE grn_status <> 'cancelled' GROUP BY purchase_order_id) g ON g.purchase_order_id = po.id
                  LEFT JOIN (SELECT purchase_order_id, SUM(amount_paid) paid FROM purchase_payments_adnan WHERE is_posted = 1 GROUP BY purchase_order_id) p ON p.purchase_order_id = po.id
                  WHERE po.po_status <> 'cancelled' AND po.delivery_status <> 'closed') t
                WHERE t.adv > 0.01 ORDER BY t.adv DESC LIMIT 60`),
    query(`SELECT payment_voucher_number AS ref, supplier_name AS supplier, po_number AS po, amount_paid AS amount, payment_method AS method, payment_type AS type
                FROM purchase_payments_adnan WHERE payment_date = ? AND is_posted = 1 ORDER BY created_at DESC`, [today]),
    query(`SELECT ev.voucher_number AS ref, ec.category_name AS category, esc.subcategory_name AS subcategory, ev.total_amount AS amount, ev.payment_method AS method, ev.remarks
                FROM expense_vouchers ev LEFT JOIN expense_categories ec ON ec.id = ev.category_id LEFT JOIN expense_subcategories esc ON esc.id = ev.subcategory_id
                WHERE ev.expense_date = ? AND ev.status = 'approved' ORDER BY ev.created_at DESC`, [today])
  ]);
  const sum = (a, k) => a.reduce((t, r) => {
    var _a;
    return t + Number((_a = r[k]) != null ? _a : 0);
  }, 0);
  const rcvTotal = Number((await query(`SELECT COALESCE(SUM(current_balance),0) v FROM customers WHERE current_balance > 0.01 AND customer_type = 'Credit'`))[0].v);
  return {
    today,
    kpis: {
      newOrders: { n: ordersToday.length, v: sum(ordersToday, "amount") },
      shipments: { n: shipments.length, v: sum(shipments, "amount") },
      products: { n: products.length, qty: sum(products, "ordered_qty") },
      paymentsIn: { n: paymentsToday.length, v: sum(paymentsToday, "amount") },
      receivables: { n: receivables.length, v: rcvTotal },
      payables: { n: suppPayables.length, v: sum(suppPayables, "due") },
      advances: { n: suppAdvances.length, v: sum(suppAdvances, "advance") },
      supplierPaid: { n: suppPaidToday.length, v: sum(suppPaidToday, "amount") },
      expenses: { n: expensesToday.length, v: sum(expensesToday, "amount") }
    },
    ordersToday,
    shipments,
    products,
    paymentsToday,
    receivables,
    suppPayables,
    suppAdvances,
    suppPaidToday,
    expensesToday
  };
});

export { operationsCenter_get as default };
//# sourceMappingURL=operations-center.get.mjs.map

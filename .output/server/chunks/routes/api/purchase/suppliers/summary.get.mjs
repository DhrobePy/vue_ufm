import { h as defineEventHandler, p as getQuery, G as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const summary_get = defineEventHandler(async (event) => {
  const { search = "", status = "active" } = getQuery(event);
  let hasAdjNotes = false;
  try {
    await query("SELECT 1 FROM purchase_adjustment_notes LIMIT 1");
    hasAdjNotes = true;
  } catch {
  }
  const adjDebitSub = hasAdjNotes ? `COALESCE((
        SELECT SUM(pan.amount)
        FROM purchase_adjustment_notes pan
        JOIN purchase_orders_adnan po2 ON pan.purchase_order_id = po2.id
        WHERE po2.supplier_id = s.id
          AND pan.note_type = 'debit'
          AND pan.status = 'posted'
      ), 0)` : "0";
  const adjCreditSub = hasAdjNotes ? `COALESCE((
        SELECT SUM(pan.amount)
        FROM purchase_adjustment_notes pan
        JOIN purchase_orders_adnan po2 ON pan.purchase_order_id = po2.id
        WHERE po2.supplier_id = s.id
          AND pan.note_type = 'credit'
          AND pan.status = 'posted'
      ), 0)` : "0";
  const adjCountSub = hasAdjNotes ? `(
        SELECT COUNT(*)
        FROM purchase_adjustment_notes pan
        JOIN purchase_orders_adnan po2 ON pan.purchase_order_id = po2.id
        WHERE po2.supplier_id = s.id AND pan.status = 'posted'
      )` : "0";
  let sql = `
    SELECT
      s.id,
      s.supplier_code,
      s.company_name,
      s.phone,
      s.email,
      s.payment_terms,
      s.status,
      COUNT(DISTINCT po.id) AS total_orders,
      COALESCE(SUM(po.quantity_kg), 0) AS total_ordered_kg,
      COALESCE(SUM(po.total_order_value), 0) AS total_ordered_value,
      COALESCE((
        SELECT SUM(grn.quantity_received_kg)
        FROM goods_received_adnan grn
        WHERE grn.supplier_id = s.id
          AND grn.grn_status IN ('verified', 'posted')
      ), 0) AS total_received_kg,
      COALESCE((
        SELECT SUM(COALESCE(grn.expected_quantity, grn.quantity_received_kg) * po_r.unit_price_per_kg)
        FROM goods_received_adnan grn
        LEFT JOIN purchase_orders_adnan po_r ON grn.purchase_order_id = po_r.id
        WHERE grn.supplier_id = s.id
          AND grn.grn_status IN ('verified', 'posted')
      ), 0) AS total_receivable_value,
      COALESCE((
        SELECT SUM(p.amount_paid)
        FROM purchase_payments_adnan p
        JOIN purchase_orders_adnan po2 ON p.purchase_order_id = po2.id
        WHERE po2.supplier_id = s.id
          AND COALESCE(p.is_posted, 1) = 1   /* NULL = legacy payment (treat as posted); 0 = voided */
      ), 0) AS total_paid,
      ${adjDebitSub} AS total_adj_debit,
      ${adjCreditSub} AS total_adj_credit,
      ${adjCountSub} AS adj_count,
      MAX(po.po_date) AS last_order_date,
      COUNT(DISTINCT CASE WHEN po.po_status = 'approved' THEN po.id END) AS active_orders,
      COUNT(DISTINCT CASE WHEN po.delivery_status = 'completed' THEN po.id END) AS completed_orders
    FROM suppliers s
    LEFT JOIN purchase_orders_adnan po
      ON s.id = po.supplier_id AND po.po_status != 'cancelled'
    WHERE 1=1
  `;
  const params = [];
  if (status !== "all") {
    sql += " AND s.status = ?";
    params.push(status);
  }
  if (search) {
    sql += " AND (s.company_name LIKE ? OR s.supplier_code LIKE ? OR s.phone LIKE ?)";
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  sql += " GROUP BY s.id ORDER BY total_paid DESC, total_orders DESC";
  const rows = await query(sql, params);
  const suppliers = rows.map((s) => {
    var _a, _b, _c, _d;
    const adjDebit = Number((_a = s.total_adj_debit) != null ? _a : 0);
    const adjCredit = Number((_b = s.total_adj_credit) != null ? _b : 0);
    const receivable = Number((_c = s.total_receivable_value) != null ? _c : 0);
    const paid = Number((_d = s.total_paid) != null ? _d : 0);
    const net_adjustment = adjDebit - adjCredit;
    const balance_payable = receivable + adjDebit - (paid + adjCredit);
    const balance_due = balance_payable > 0 ? balance_payable : 0;
    const advance = balance_payable < 0 ? Math.abs(balance_payable) : 0;
    return { ...s, net_adjustment, balance_payable, balance_due, advance };
  });
  const totals = suppliers.reduce((acc, s) => {
    acc.suppliers++;
    acc.total_orders += Number(s.total_orders);
    acc.ordered_kg += Number(s.total_ordered_kg);
    acc.ordered_value += Number(s.total_ordered_value);
    acc.received_kg += Number(s.total_received_kg);
    acc.receivable_value += Number(s.total_receivable_value);
    acc.paid += Number(s.total_paid);
    acc.adj_debit += Number(s.total_adj_debit);
    acc.adj_credit += Number(s.total_adj_credit);
    if (s.adj_count > 0) acc.suppliers_with_adj++;
    acc.balance_due += s.balance_due;
    acc.advance += s.advance;
    return acc;
  }, {
    suppliers: 0,
    total_orders: 0,
    ordered_kg: 0,
    ordered_value: 0,
    received_kg: 0,
    receivable_value: 0,
    paid: 0,
    adj_debit: 0,
    adj_credit: 0,
    suppliers_with_adj: 0,
    balance_due: 0,
    advance: 0
  });
  totals.net_adj = totals.adj_debit - totals.adj_credit;
  return { suppliers, totals };
});

export { summary_get as default };
//# sourceMappingURL=summary.get.mjs.map

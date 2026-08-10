import { q as defineEventHandler, X as getUserSession, m as createError, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reconcile_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  }
  const [check1, check2, check3, check4, check5, check6, check7] = await Promise.all([
    // Stale balance_payable — stored value doesn't match computed value
    query(
      `SELECT po.id, po.po_number, po.supplier_name, po.po_date,
              po.delivery_status, po.payment_status,
              po.balance_payable AS stored_balance,
              ROUND(
                COALESCE(grn_agg.total_expected,0) * po.unit_price_per_kg
                + COALESCE(po.total_adjustment_amount,0)
                - COALESCE(po.total_paid,0)
              , 2) AS computed_balance
       FROM purchase_orders_adnan po
       LEFT JOIN (
         SELECT purchase_order_id, SUM(expected_quantity) AS total_expected
         FROM goods_received_adnan WHERE grn_status != 'cancelled'
         GROUP BY purchase_order_id
       ) grn_agg ON grn_agg.purchase_order_id = po.id
       WHERE po.po_status != 'cancelled'
       HAVING ABS(COALESCE(stored_balance,0) - COALESCE(computed_balance,0)) > 1
       ORDER BY ABS(COALESCE(stored_balance,0) - COALESCE(computed_balance,0)) DESC
       LIMIT 30`
    ),
    // Origin confusion — 'Other' with non-empty remarks
    query(
      `SELECT id, po_number, supplier_name, wheat_origin, remarks, quantity_kg, po_date, delivery_status
       FROM purchase_orders_adnan
       WHERE po_status != 'cancelled'
         AND wheat_origin = 'Other'
         AND remarks IS NOT NULL AND TRIM(remarks) != ''
       ORDER BY po_date DESC
       LIMIT 20`
    ),
    // Stuck adjustment notes — draft/approved older than 7 days
    query(
      `SELECT pan.id, pan.note_number, pan.note_type, pan.amount, pan.status, pan.created_at,
              po.po_number, po.supplier_name,
              DATEDIFF(NOW(), pan.created_at) AS days_pending
       FROM purchase_adjustment_notes pan
       JOIN purchase_orders_adnan po ON pan.purchase_order_id = po.id
       WHERE pan.status IN ('draft','approved')
         AND pan.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY pan.created_at ASC
       LIMIT 20`
    ),
    // GRN line total doesn't match quantity × unit price (data entry error)
    query(
      `SELECT purchase_order_id AS id, grn_number, po_number, supplier_name, grn_date,
              quantity_received_kg, unit_price_per_kg, total_value AS stored_total,
              ROUND(quantity_received_kg * unit_price_per_kg, 2) AS computed_total
       FROM goods_received_adnan
       WHERE grn_status != 'cancelled'
       HAVING ABS(stored_total - computed_total) > 1
       ORDER BY ABS(stored_total - computed_total) DESC
       LIMIT 20`
    ),
    // Posted payments exceed the PO's total payable (should show payment_status='overpaid')
    query(
      `SELECT po.id, po.po_number, po.supplier_name,
              (po.total_order_value + COALESCE(po.total_adjustment_amount,0)) AS payable,
              COALESCE(pay_agg.total_paid,0) AS total_posted_paid,
              po.payment_status
       FROM purchase_orders_adnan po
       JOIN (
         SELECT purchase_order_id, SUM(amount_paid) AS total_paid
         FROM purchase_payments_adnan WHERE is_posted = 1
         GROUP BY purchase_order_id
       ) pay_agg ON pay_agg.purchase_order_id = po.id
       WHERE po.po_status != 'cancelled'
         AND pay_agg.total_paid > (po.total_order_value + COALESCE(po.total_adjustment_amount,0)) + 1
         AND po.payment_status != 'overpaid'
       ORDER BY (pay_agg.total_paid - (po.total_order_value + COALESCE(po.total_adjustment_amount,0))) DESC
       LIMIT 20`
    ),
    // PO marked delivery-completed with zero recorded GRNs — impossible state
    query(
      `SELECT po.id, po.po_number, po.supplier_name, po.po_date, po.delivery_status, po.po_status
       FROM purchase_orders_adnan po
       LEFT JOIN goods_received_adnan g ON g.purchase_order_id = po.id AND g.grn_status != 'cancelled'
       WHERE po.po_status != 'cancelled'
         AND po.delivery_status IN ('completed', 'closed')
       GROUP BY po.id
       HAVING COUNT(g.id) = 0
       ORDER BY po.po_date DESC
       LIMIT 20`
    ),
    // Denormalized total_received_qty on the PO doesn't match the live GRN sum
    query(
      `SELECT po.id, po.po_number, po.supplier_name,
              po.total_received_qty AS stored_qty,
              COALESCE(grn_agg.total_qty, 0) AS computed_qty
       FROM purchase_orders_adnan po
       LEFT JOIN (
         SELECT purchase_order_id, SUM(quantity_received_kg) AS total_qty
         FROM goods_received_adnan WHERE grn_status != 'cancelled'
         GROUP BY purchase_order_id
       ) grn_agg ON grn_agg.purchase_order_id = po.id
       WHERE po.po_status != 'cancelled'
       HAVING ABS(COALESCE(stored_qty,0) - COALESCE(computed_qty,0)) > 1
       ORDER BY ABS(COALESCE(stored_qty,0) - COALESCE(computed_qty,0)) DESC
       LIMIT 20`
    )
  ]);
  return { check1, check2, check3, check4, check5, check6, check7 };
});

export { reconcile_get as default };
//# sourceMappingURL=reconcile.get.mjs.map

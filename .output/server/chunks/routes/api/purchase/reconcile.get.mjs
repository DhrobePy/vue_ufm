import { p as defineEventHandler, V as getUserSession, l as createError, aj as query } from '../../../nitro/nitro.mjs';
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
  const [check1, check2, check3] = await Promise.all([
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
    )
  ]);
  return { check1, check2, check3 };
});

export { reconcile_get as default };
//# sourceMappingURL=reconcile.get.mjs.map

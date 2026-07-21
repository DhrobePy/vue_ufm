import { o as defineEventHandler, M as getRouterParam, k as createError, ad as queryOne, ac as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [po, grns, payments] = await Promise.all([
    queryOne(
      `SELECT o.*, s.company_name, s.phone, s.address AS supplier_address,
              s.payment_terms AS supplier_payment_terms,
              b.name AS branch_name,
              cr.display_name AS created_by_name,
              lk.display_name AS locked_by_name,
              c.name AS commodity_name, c.unit AS commodity_unit
       FROM purchase_orders_adnan o
       LEFT JOIN suppliers s ON s.id = o.supplier_id
       LEFT JOIN branches b  ON b.id = o.branch_id
       LEFT JOIN users cr    ON cr.id = o.created_by_user_id
       LEFT JOIN users lk    ON lk.id = o.delivery_locked_by_user_id
       LEFT JOIN purchase_commodities c ON c.id = o.commodity_id
       WHERE o.id = ?`,
      [id]
    ),
    query(
      `SELECT g.*, b.name AS unload_branch_name
       FROM goods_received_adnan g
       LEFT JOIN branches b ON b.id = g.unload_point_branch_id
       WHERE g.purchase_order_id = ?
       ORDER BY g.grn_date DESC`,
      [id]
    ),
    query(
      `SELECT p.*, ba.bank_name, ba.account_number,
              cr.display_name AS created_by_name,
              ap.display_name AS approved_by_name
       FROM purchase_payments_adnan p
       LEFT JOIN bank_accounts ba ON ba.id = p.bank_account_id
       LEFT JOIN users cr ON cr.id = p.created_by_user_id
       LEFT JOIN users ap ON ap.id = p.approved_by_user_id
       WHERE p.purchase_order_id = ?
       ORDER BY p.payment_date DESC`,
      [id]
    )
  ]);
  if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
  return { po, grns, payments };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

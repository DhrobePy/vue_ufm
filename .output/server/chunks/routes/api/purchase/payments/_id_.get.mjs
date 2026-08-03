import { q as defineEventHandler, R as getRouterParam, m as createError, ao as queryOne } from '../../../../nitro/nitro.mjs';
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
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const payment = await queryOne(
    `SELECT p.*,
            po.po_number, po.supplier_name AS po_supplier_name,
            po.total_order_value, po.total_received_value, po.balance_payable,
            ba.bank_name
     FROM purchase_payments_adnan p
     LEFT JOIN purchase_orders_adnan po ON p.purchase_order_id = po.id
     LEFT JOIN bank_accounts ba ON p.bank_account_id = ba.id
     WHERE p.id = ?`,
    [id]
  );
  if (!payment) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
  return { payment };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

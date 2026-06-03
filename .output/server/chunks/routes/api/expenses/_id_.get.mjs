import { h as defineEventHandler, v as getRouterParam, e as createError, H as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const expense = await queryOne(
    `SELECT e.*,
            cat.category_name, cat.category_code, cat.chart_of_account_id,
            coa.account_code AS gl_account_code, coa.name AS gl_account_name,
            sub.subcategory_name,
            COALESCE(sub.unit_of_measurement, '') AS unit_type,
            cr.display_name AS created_by_name,
            ap.display_name AS approved_by_name,
            ap.email        AS approved_by_email,
            b.name AS branch_name,
            ba.bank_name, ba.account_number, ba.account_name AS bank_account_name
     FROM expense_vouchers e
     LEFT JOIN expense_categories cat    ON cat.id = e.category_id
     LEFT JOIN chart_of_accounts  coa   ON coa.id = e.expense_account_id
     LEFT JOIN expense_subcategories sub ON sub.id = e.subcategory_id
     LEFT JOIN users cr  ON cr.id = e.created_by_user_id
     LEFT JOIN users ap  ON ap.id = e.approved_by_user_id
     LEFT JOIN branches b ON b.id = e.branch_id
     LEFT JOIN bank_accounts ba ON ba.id = e.bank_account_id
     WHERE e.id = ?`,
    [id]
  );
  if (!expense) throw createError({ statusCode: 404, statusMessage: "Expense not found" });
  return { expense };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

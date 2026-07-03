import { j as defineEventHandler, u as getQuery, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const coa_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const type = q.type || "";
  const status = q.status || "";
  const where = [];
  const params = [];
  if (search) {
    where.push("(c.name LIKE ? OR c.account_number LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (type) {
    where.push("c.account_type_group = ?");
    params.push(type);
  }
  if (status) {
    where.push("c.status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const accounts = await query(
    `SELECT c.id, c.account_number, c.name, c.account_type, c.account_type_group,
            c.normal_balance, c.status, c.is_active, c.description,
            COALESCE(SUM(tl.debit_amount)  - SUM(tl.credit_amount), 0) AS balance
     FROM chart_of_accounts c
     LEFT JOIN transaction_lines tl ON tl.account_id = c.id
     ${w}
     GROUP BY c.id
     ORDER BY c.account_type_group, c.account_number, c.name`,
    params
  );
  return { accounts };
});

export { coa_get as default };
//# sourceMappingURL=coa.get.mjs.map

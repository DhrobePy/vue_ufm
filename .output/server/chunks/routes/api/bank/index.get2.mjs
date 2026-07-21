import { o as defineEventHandler, ac as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async () => {
  const types = await query(
    `SELECT t.id, t.name, t.nature, t.description, t.is_active, t.created_at,
            t.chart_of_account_id, c.name AS gl_account_name, c.account_number AS gl_account_number
     FROM bank_tx_transaction_types t
     LEFT JOIN chart_of_accounts c ON c.id = t.chart_of_account_id
     ORDER BY t.name ASC`
  );
  return { types };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map

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

const pettyCashAccounts_get = defineEventHandler(async () => {
  const accounts = await query(
    `SELECT p.id, p.account_name, p.current_balance, p.branch_id, b.name AS branch_name
     FROM branch_petty_cash_accounts p
     LEFT JOIN branches b ON b.id = p.branch_id
     WHERE p.status = 'active'
     ORDER BY p.account_name`
  );
  return { accounts };
});

export { pettyCashAccounts_get as default };
//# sourceMappingURL=petty-cash-accounts.get.mjs.map

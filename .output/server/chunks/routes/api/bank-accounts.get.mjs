import { q as defineEventHandler, aq as query } from '../../nitro/nitro.mjs';
import 'node:child_process';
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

const bankAccounts_get = defineEventHandler(async () => {
  const accounts = await query(
    `SELECT id, bank_name, account_number, account_name, branch_name, account_type, status, chart_of_account_id
     FROM bank_accounts
     WHERE status = 'active' OR status IS NULL
     ORDER BY bank_name`
  );
  return { accounts };
});

export { bankAccounts_get as default };
//# sourceMappingURL=bank-accounts.get.mjs.map

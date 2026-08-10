import { q as defineEventHandler, X as getUserSession, m as createError, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const bankAccounts_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const accounts = await query(
    `SELECT id, bank_name, account_number, account_name, branch_name, account_type, chart_of_account_id
     FROM bank_accounts
     WHERE status = 'active' OR status IS NULL
     ORDER BY bank_name`
  );
  return { accounts };
});

export { bankAccounts_get as default };
//# sourceMappingURL=bank-accounts.get.mjs.map

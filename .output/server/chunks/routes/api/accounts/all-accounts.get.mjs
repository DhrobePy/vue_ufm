import { V as defineEventHandler, b8 as query } from '../../../nitro/nitro.mjs';
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

const allAccounts_get = defineEventHandler(async () => {
  const rows = await query(
    `SELECT a.id, a.account_number AS code, a.name, a.account_type AS type, a.normal_balance,
            COALESCE(SUM(l.debit_amount), 0) AS debit, COALESCE(SUM(l.credit_amount), 0) AS credit
     FROM chart_of_accounts a LEFT JOIN transaction_lines l ON l.account_id = a.id
     WHERE a.account_type <> 'Bank'
     GROUP BY a.id, a.account_number, a.name, a.account_type, a.normal_balance
     ORDER BY a.account_number`
  );
  return { rows: rows.map((r) => {
    var _a;
    return {
      ...r,
      debit: Number(r.debit),
      credit: Number(r.credit),
      balance: String((_a = r.normal_balance) != null ? _a : "").toLowerCase() === "debit" ? Number(r.debit) - Number(r.credit) : Number(r.credit) - Number(r.debit)
    };
  }) };
});

export { allAccounts_get as default };
//# sourceMappingURL=all-accounts.get.mjs.map

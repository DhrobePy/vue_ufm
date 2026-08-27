import { q as defineEventHandler, ar as query } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async () => {
  const accounts = await query(
    `SELECT ba.id, ba.bank_name, ba.account_name, ba.account_number, ba.branch_name,
            ba.account_type, ba.status, ba.chart_of_account_id, ba.legacy_tx_account_id,
            tx.id AS tx_account_id,
            COALESCE(tx.opening_balance, ba.initial_balance, 0)
              + COALESCE(SUM(CASE WHEN t.entry_type='credit' AND t.status='approved' THEN t.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN t.entry_type='debit'  AND t.status='approved' THEN t.amount ELSE 0 END), 0) AS balance
     FROM bank_accounts ba
     LEFT JOIN bank_tx_accounts tx ON tx.id = ba.legacy_tx_account_id
     LEFT JOIN bank_transactions t ON t.bank_tx_account_id = tx.id
     WHERE ba.status = 'active' OR ba.status IS NULL
     GROUP BY ba.id
     ORDER BY ba.bank_name`
  );
  return {
    accounts,
    total_balance: accounts.reduce((s, a) => s + Number(a.balance || 0), 0)
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

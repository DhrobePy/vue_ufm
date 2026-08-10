import { q as defineEventHandler, R as getRouterParam, m as createError, aq as queryOne, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid transaction ID" });
  const [txn, auditLog] = await Promise.all([
    queryOne(
      `SELECT t.*, a.bank_name, a.account_name, a.account_number,
              u.display_name AS created_by_name
       FROM bank_transactions t
       JOIN bank_tx_accounts a ON a.id = t.bank_tx_account_id
       LEFT JOIN users u ON u.id = t.created_by_user_id
       WHERE t.id = ?`,
      [id]
    ),
    query(
      `SELECT l.*, u.display_name AS user_name
       FROM bank_tx_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.tx_id = ?
       ORDER BY l.created_at ASC`,
      [id]
    )
  ]);
  if (!txn) throw createError({ statusCode: 404, statusMessage: "Transaction not found" });
  return { transaction: txn, auditLog };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

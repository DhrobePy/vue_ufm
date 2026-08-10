import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const TYPE_MAP = {
  credit_orders: "sales",
  Order: "sales",
  customer_payments: "payment",
  debit_vouchers: "expense",
  GeneralTransaction: "general",
  InternalTransfer: "transfer",
  BankAccount: "general"
};
const dailyLog_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const q = getQuery(event);
  const date = q.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const rows = await query(
    `SELECT
       je.id,
       TIME_FORMAT(je.created_at, '%H:%i')  AS time,
       je.description,
       je.related_document_type             AS doc_type,
       je.related_document_id               AS doc_id,
       tl.debit_amount                      AS debit,
       tl.credit_amount                     AS credit,
       c.name                               AS account,
       c.account_number                     AS code,
       u.display_name                       AS posted_by
     FROM journal_entries je
     JOIN transaction_lines tl ON tl.journal_entry_id = je.id
     JOIN chart_of_accounts c   ON c.id = tl.account_id
     LEFT JOIN users u           ON u.id = je.created_by_user_id
     WHERE je.transaction_date = ?
       AND je.is_reversed = 0
     ORDER BY je.id, tl.id`,
    [date]
  );
  const map = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (!map.has(row.id)) {
      const docType = (_a = row.doc_type) != null ? _a : "";
      const ref = row.doc_id ? `${docType}#${row.doc_id}` : docType || `JE-${row.id}`;
      map.set(row.id, {
        id: row.id,
        time: (_b = row.time) != null ? _b : "\u2014",
        description: row.description,
        ref,
        type: (_c = TYPE_MAP[docType]) != null ? _c : "general",
        postedBy: (_d = row.posted_by) != null ? _d : "\u2014",
        lines: []
      });
    }
    map.get(row.id).lines.push({
      account: row.account,
      code: (_e = row.code) != null ? _e : "",
      debit: Number(row.debit) || 0,
      credit: Number(row.credit) || 0
    });
  }
  return { entries: [...map.values()] };
});

export { dailyLog_get as default };
//# sourceMappingURL=daily-log.get.mjs.map

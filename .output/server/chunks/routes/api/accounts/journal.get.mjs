import { n as defineEventHandler, C as getQuery, a8 as query, a1 as paginate } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const journal_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const from = q.date_from || "";
  const to = q.date_to || "";
  const page = Number(q.page) || 1;
  const { limit, offset } = paginate(page, 20);
  const where = [];
  const params = [];
  if (search) {
    where.push("je.description LIKE ?");
    params.push(`%${search}%`);
  }
  if (from) {
    where.push("je.transaction_date >= ?");
    params.push(from);
  }
  if (to) {
    where.push("je.transaction_date <= ?");
    params.push(to);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const entries = await query(
    `SELECT je.id, je.transaction_date AS date, je.description,
            je.related_document_type AS type, je.is_reversed,
            u.display_name AS posted_by,
            COALESCE(SUM(tl.debit_amount),  0) AS debit_total,
            COALESCE(SUM(tl.credit_amount), 0) AS credit_total
     FROM journal_entries je
     LEFT JOIN users u ON u.id = je.created_by_user_id
     LEFT JOIN transaction_lines tl ON tl.journal_entry_id = je.id
     ${w}
     GROUP BY je.id
     ORDER BY je.transaction_date DESC, je.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const entryIds = entries.map((e) => e.id);
  let lines = [];
  if (entryIds.length) {
    lines = await query(
      `SELECT tl.journal_entry_id, tl.debit_amount, tl.credit_amount, tl.description,
              c.name AS account_name, c.account_number
       FROM transaction_lines tl
       JOIN chart_of_accounts c ON c.id = tl.account_id
       WHERE tl.journal_entry_id IN (${entryIds.map(() => "?").join(",")})`,
      entryIds
    );
  }
  const linesByEntry = {};
  for (const l of lines) {
    if (!linesByEntry[l.journal_entry_id]) linesByEntry[l.journal_entry_id] = [];
    linesByEntry[l.journal_entry_id].push(l);
  }
  const enriched = entries.map((e) => {
    var _a;
    return {
      ...e,
      lines: (_a = linesByEntry[e.id]) != null ? _a : [],
      total: Number(e.debit_total)
    };
  });
  return { entries: enriched, total: enriched.length, page, perPage: limit };
});

export { journal_get as default };
//# sourceMappingURL=journal.get.mjs.map

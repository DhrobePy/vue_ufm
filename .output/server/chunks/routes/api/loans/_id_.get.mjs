import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, aq as queryOne, ap as query } from '../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid loan ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const loan = await queryOne(
    `SELECT l.*, c.name AS customer_name, s.company_name AS supplier_name,
            u.display_name AS created_by
     FROM loans l
     LEFT JOIN customers c ON c.id = l.customer_id
     LEFT JOIN suppliers s ON s.id = l.supplier_id
     LEFT JOIN users u ON u.id = l.created_by_user_id
     WHERE l.id = ?`,
    [id]
  );
  if (!loan) throw createError({ statusCode: 404, statusMessage: "Loan not found" });
  const [jeLines, repayments] = await Promise.all([
    loan.journal_entry_id ? query(
      `SELECT tl.debit_amount, tl.credit_amount, tl.description, coa.name AS account_name
           FROM transaction_lines tl JOIN chart_of_accounts coa ON coa.id = tl.account_id
           WHERE tl.journal_entry_id = ?`,
      [loan.journal_entry_id]
    ) : Promise.resolve([]),
    query(
      `SELECT r.*, u.display_name AS collected_by
       FROM loan_repayments r LEFT JOIN users u ON u.id = r.created_by_user_id
       WHERE r.loan_id = ? ORDER BY r.repayment_date, r.id`,
      [id]
    )
  ]);
  return { loan, je_lines: jeLines, repayments };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

import { q as defineEventHandler, X as getUserSession, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, m as createError, as as readBody, ap as query } from '../../../nitro/nitro.mjs';
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

const DEBIT_NORMAL_TYPES = /* @__PURE__ */ new Set([
  "Bank",
  "Petty Cash",
  "Cash",
  "Accounts Receivable",
  "Other Current Asset",
  "Fixed Asset",
  "Expense",
  "Cost of Goods Sold",
  "Other Expense"
]);
const coa_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (![...ADMIN_ROLES, ...ACCOUNTS_ROLES].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const body = await readBody(event);
  const { name, account_number, account_type, account_type_group, description, branch_id } = body != null ? body : {};
  if (!(name == null ? void 0 : name.trim())) throw createError({ statusCode: 400, statusMessage: "name is required" });
  if (!account_type) throw createError({ statusCode: 400, statusMessage: "account_type is required" });
  const normalBalance = DEBIT_NORMAL_TYPES.has(account_type) ? "Debit" : "Credit";
  const result = await query(
    `INSERT INTO chart_of_accounts
       (name, account_number, account_type, account_type_group, normal_balance,
        description, branch_id, status, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1)`,
    [
      name.trim(),
      (account_number == null ? void 0 : account_number.trim()) || null,
      account_type,
      (account_type_group == null ? void 0 : account_type_group.trim()) || account_type,
      normalBalance,
      (description == null ? void 0 : description.trim()) || null,
      branch_id || null
    ]
  );
  return { ok: true, id: result.insertId, normal_balance: normalBalance };
});

export { coa_post as default };
//# sourceMappingURL=coa.post.mjs.map

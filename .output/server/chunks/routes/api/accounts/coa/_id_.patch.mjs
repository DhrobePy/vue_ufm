import { q as defineEventHandler, X as getUserSession, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, m as createError, as as readBody, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (![...ADMIN_ROLES, ...ACCOUNTS_ROLES].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const id = Number((_c = event.context.params) == null ? void 0 : _c.id);
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid account ID" });
  const body = await readBody(event);
  const { name, account_number, description, status, is_active } = body != null ? body : {};
  const sets = [];
  const params = [];
  if (name !== void 0) {
    sets.push("name = ?");
    params.push(String(name).trim());
  }
  if (account_number !== void 0) {
    sets.push("account_number = ?");
    params.push((account_number == null ? void 0 : account_number.trim()) || null);
  }
  if (description !== void 0) {
    sets.push("description = ?");
    params.push((description == null ? void 0 : description.trim()) || null);
  }
  if (status !== void 0) {
    sets.push("status = ?");
    params.push(status);
  }
  if (is_active !== void 0) {
    sets.push("is_active = ?");
    params.push(is_active ? 1 : 0);
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  params.push(id);
  await query(`UPDATE chart_of_accounts SET ${sets.join(", ")} WHERE id = ?`, params);
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

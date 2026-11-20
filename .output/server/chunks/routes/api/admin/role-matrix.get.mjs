import { B as defineEventHandler, aM as query, b4 as resolvePermissions } from '../../../nitro/nitro.mjs';
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

const MODULES = {
  dashboard: "Dashboard",
  credit_sales: "Credit Sales",
  purchase: "Purchase",
  expenses: "Expenses",
  bank: "Bank",
  accounts: "Accounts (GL)",
  sales: "Sales Reports",
  production: "Production",
  dispatch: "Dispatch",
  collector: "Collector",
  customers: "Customers",
  products: "Products",
  pos: "POS",
  fleet: "Fleet",
  hr: "HR"
};
const roleMatrix_get = defineEventHandler(async () => {
  var _a, _b, _c;
  const users = await query(`SELECT u.id, u.role, EXISTS(SELECT 1 FROM user_permissions p WHERE p.user_id = u.id) AS custom FROM users u WHERE u.status = 'active' ORDER BY u.role, u.id`);
  const roles = /* @__PURE__ */ new Map();
  for (const u of users) {
    const r = (_a = roles.get(u.role)) != null ? _a : { role: u.role, users: 0, customUsers: 0, presetUsers: 0, mods: {} };
    r.users++;
    Number(u.custom) ? r.customUsers++ : r.presetUsers++;
    const perms = ["superadmin", "admin"].includes(String(u.role).toLowerCase()) ? null : await resolvePermissions(u.id, u.role);
    for (const k of Object.keys(MODULES)) {
      const on = perms === null ? true : !!((_b = perms[k]) == null ? void 0 : _b.enabled);
      if (on) r.mods[k] = ((_c = r.mods[k]) != null ? _c : 0) + 1;
    }
    roles.set(u.role, r);
  }
  return { modules: MODULES, roles: [...roles.values()] };
});

export { roleMatrix_get as default };
//# sourceMappingURL=role-matrix.get.mjs.map

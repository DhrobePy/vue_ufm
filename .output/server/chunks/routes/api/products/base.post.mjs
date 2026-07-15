import { o as defineEventHandler, O as getUserSession, k as createError, ac as readBody, a9 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PROD_ROLES = ["admin", "superadmin", "production manager-srg", "production manager-demra"];
const base_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const body = await readBody(event);
  const { base_name, base_sku, category, description } = body;
  if (!(base_name == null ? void 0 : base_name.trim())) throw createError({ statusCode: 400, statusMessage: "Product name is required" });
  const result = await query(
    `INSERT INTO products (base_name, base_sku, category, description, status) VALUES (?, ?, ?, ?, 'active')`,
    [base_name.trim(), (base_sku == null ? void 0 : base_sku.trim()) || null, category || "Flour", description || null]
  );
  return { id: result.insertId, message: "Product created" };
});

export { base_post as default };
//# sourceMappingURL=base.post.mjs.map

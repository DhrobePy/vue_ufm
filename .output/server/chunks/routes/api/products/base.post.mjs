import { h as defineEventHandler, M as readBody, e as createError, K as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const base_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { base_name, category, description } = body;
  if (!(base_name == null ? void 0 : base_name.trim())) throw createError({ statusCode: 400, statusMessage: "Product name is required" });
  const result = await query(
    `INSERT INTO products (base_name, category, description, status) VALUES (?, ?, ?, 'active')`,
    [base_name.trim(), category || "Flour", description || null]
  );
  return { id: result.insertId, message: "Product created" };
});

export { base_post as default };
//# sourceMappingURL=base.post.mjs.map

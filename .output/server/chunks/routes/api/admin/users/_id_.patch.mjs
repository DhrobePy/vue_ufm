import { g as defineEventHandler, t as getRouterParam, d as createError, G as readBody, m as getDb } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  const body = await readBody(event);
  const {
    display_name,
    email,
    role,
    status,
    password
  } = body != null ? body : {};
  if (!display_name || !email || !role)
    throw createError({ statusCode: 400, statusMessage: "display_name, email, and role are required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const setClauses = [
      "display_name = ?",
      "email = ?",
      "role = ?",
      "status = ?"
    ];
    const params = [
      display_name.trim(),
      email.toLowerCase().trim(),
      role,
      status != null ? status : "active"
    ];
    if (password && password.length >= 8) {
      setClauses.push("password_hash = ?", "plain_password = ?");
      params.push(password, password);
    }
    params.push(id);
    await conn.query(
      `UPDATE users SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

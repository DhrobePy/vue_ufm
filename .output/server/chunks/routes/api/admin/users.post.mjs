import { g as defineEventHandler, G as readBody, d as createError, m as getDb, F as queryOne } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const users_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    display_name,
    email,
    password,
    role,
    status = "active",
    telegram_chat_id
  } = body != null ? body : {};
  if (!display_name || !email || !password || !role)
    throw createError({ statusCode: 400, statusMessage: "display_name, email, password, and role are required" });
  if (password.length < 8)
    throw createError({ statusCode: 400, statusMessage: "Password must be at least 8 characters" });
  const db = getDb();
  const existing = await queryOne(
    "SELECT id FROM users WHERE email = ?",
    [email.toLowerCase().trim()]
  );
  if (existing)
    throw createError({ statusCode: 409, statusMessage: "A user with this email already exists" });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO users
         (display_name, email, password_hash, plain_password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        display_name.trim(),
        email.toLowerCase().trim(),
        password,
        // password_hash (plain for dev)
        password,
        // plain_password for dev convenience
        role,
        status
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { users_post as default };
//# sourceMappingURL=users.post.mjs.map

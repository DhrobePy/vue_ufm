import { q as defineEventHandler, at as readBody, X as getUserSession, m as createError, z as getDb, ar as queryOne, g as auditLog } from '../../../nitro/nitro.mjs';
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

const users_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const actorId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  const {
    display_name,
    email,
    password,
    role,
    status = "active"
  } = body != null ? body : {};
  if (!display_name || !email || !password || !role)
    throw createError({ statusCode: 400, statusMessage: "display_name, email, password, and role are required" });
  if (password.length < 8)
    throw createError({ statusCode: 400, statusMessage: "Password must be at least 8 characters" });
  const db = getDb();
  const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()]);
  if (existing)
    throw createError({ statusCode: 409, statusMessage: "A user with this email already exists" });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO users
         (display_name, email, password_hash, plain_password, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        display_name.trim(),
        email.toLowerCase().trim(),
        password,
        password,
        role,
        status
      ]
    );
    const newId = result.insertId;
    await auditLog(conn, {
      userId: actorId,
      action: "user_created",
      module: "admin",
      recordType: "user",
      recordId: newId,
      referenceNumber: email.toLowerCase().trim(),
      description: `User "${display_name.trim()}" (${email.toLowerCase().trim()}) created with role [${role}] \xB7 status: ${status} \xB7 by ${actorName}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: newId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { users_post as default };
//# sourceMappingURL=users.post.mjs.map

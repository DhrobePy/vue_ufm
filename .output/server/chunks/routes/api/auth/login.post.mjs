import { n as defineEventHandler, aa as readBody, j as createError, a8 as queryOne, aq as setUserSession, as as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DEV_USERS = {
  "admin@fmc.com": { password: "admin123", role: "admin", name: "Dev Admin", id: 1 },
  "manager@fmc.com": { password: "manager1", role: "manager", name: "Dev Manager", id: 2 },
  "user@fmc.com": { password: "user1234", role: "user", name: "Dev User", id: 3 }
};
const login_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { email, password } = body != null ? body : {};
  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: "Email and password are required" });
  const emailLower = email.toLowerCase().trim();
  let user = null;
  let dbError = null;
  try {
    user = await queryOne(
      "SELECT id, display_name, email, password_hash, plain_password, role, status FROM users WHERE email = ? LIMIT 1",
      [emailLower]
    );
  } catch (err) {
    dbError = err;
    console.warn("[login] DB unreachable, falling back to dev-mode credentials:", (_a = err == null ? void 0 : err.code) != null ? _a : err == null ? void 0 : err.message);
  }
  const config = useRuntimeConfig();
  const devLoginEnabled = config.devLogin === "true" || config.devLogin === true || !!dbError;
  if (!user && devLoginEnabled) {
    const devUser = DEV_USERS[emailLower];
    if (!devUser || devUser.password !== password)
      throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
    await setUserSession(event, {
      user: { id: devUser.id, name: devUser.name, email: emailLower, role: devUser.role }
    });
    return { ok: true, user: { id: devUser.id, name: devUser.name, role: devUser.role } };
  }
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  if (user.status !== "active")
    throw createError({ statusCode: 403, statusMessage: "Account is not active" });
  const plainMatch = !!user.plain_password && user.plain_password === password;
  let bcryptMatch = false;
  if (!plainMatch && user.password_hash) {
    const normalised = user.password_hash.startsWith("$2y$") ? user.password_hash.replace("$2y$", "$2b$") : user.password_hash;
    try {
      bcryptMatch = await bcrypt.compare(password, normalised);
    } catch {
    }
  }
  if (!plainMatch && !bcryptMatch)
    throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.display_name,
      email: user.email,
      role: user.role
    }
  });
  return { ok: true, user: { id: user.id, name: user.display_name, role: user.role } };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

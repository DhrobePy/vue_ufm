import { w as defineEventHandler, aI as readBody, t as createError, G as getAppSettings, aG as queryOne, b9 as setUserSession, aF as query, Z as getRequestIP, be as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
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

const DEV_USERS = {
  "admin@fmc.com": { password: "admin123", role: "admin", name: "Dev Admin", id: 1 },
  "manager@fmc.com": { password: "manager1", role: "manager", name: "Dev Manager", id: 2 },
  "user@fmc.com": { password: "user1234", role: "user", name: "Dev User", id: 3 }
};
const login_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const { email, password } = body != null ? body : {};
  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: "Email and password are required" });
  const emailLower = email.toLowerCase().trim();
  const maxAttempts = Math.max(3, Number((await getAppSettings()).security_policy.maxLoginAttempts) || 5);
  const recentFails = async () => {
    var _a2, _b2;
    try {
      return Number((_b2 = (_a2 = await queryOne(
        `SELECT COUNT(*) c FROM login_attempts
       WHERE email = ? AND success = 0 AND created_at > (NOW() - INTERVAL 15 MINUTE)
         AND created_at > COALESCE((SELECT MAX(created_at) FROM login_attempts WHERE email = ? AND success = 1), '2000-01-01')`,
        [emailLower, emailLower]
      )) == null ? void 0 : _a2.c) != null ? _b2 : 0);
    } catch {
      return 0;
    }
  };
  if (await recentFails() >= maxAttempts)
    throw createError({ statusCode: 429, statusMessage: `Too many failed attempts \u2014 try again in 15 minutes` });
  const failed = async () => {
    var _a2;
    try {
      await query(`INSERT INTO login_attempts (email, success, ip_address, failure_reason) VALUES (?, 0, ?, 'bad credentials')`, [emailLower, String((_a2 = getRequestIP(event, { xForwardedFor: true })) != null ? _a2 : "0.0.0.0").slice(0, 45)]);
    } catch {
    }
  };
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
  const devLoginEnabled = String(config.devLogin) === "true";
  if (dbError && !devLoginEnabled)
    throw createError({ statusCode: 503, statusMessage: "Service temporarily unavailable \u2014 please try again in a moment" });
  if (!user && devLoginEnabled) {
    const devUser = DEV_USERS[emailLower];
    if (!devUser || devUser.password !== password) {
      await failed();
      throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
    }
    await setUserSession(event, {
      user: { id: devUser.id, name: devUser.name, email: emailLower, role: devUser.role },
      loggedInAt: Date.now()
    });
    return { ok: true, user: { id: devUser.id, name: devUser.name, role: devUser.role } };
  }
  if (!user) {
    await failed();
    throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  }
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
  if (!plainMatch && !bcryptMatch) {
    await failed();
    throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  }
  try {
    await query(`INSERT INTO login_attempts (email, success, ip_address) VALUES (?, 1, ?)`, [emailLower, String((_b = getRequestIP(event, { xForwardedFor: true })) != null ? _b : "0.0.0.0").slice(0, 45)]);
  } catch {
  }
  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.display_name,
      email: user.email,
      role: user.role
    },
    loggedInAt: Date.now()
    // Settings → Security → Session timeout counts from here
  });
  return { ok: true, user: { id: user.id, name: user.display_name, role: user.role } };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

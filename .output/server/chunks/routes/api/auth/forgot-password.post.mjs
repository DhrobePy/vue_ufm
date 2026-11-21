import { Z as defineEventHandler, bq as readBody, aw as getRequestIP, N as createError, bn as query, bY as sendTelegram } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const forgotPassword_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event), email = String((_a = body == null ? void 0 : body.email) != null ? _a : "").trim().toLowerCase().slice(0, 190);
  const ip = String((_b = getRequestIP(event, { xForwardedFor: true })) != null ? _b : "0.0.0.0").slice(0, 45);
  const answer = { ok: true, message: "If that e-mail belongs to an account, the administrator has been told and will set a new password for you. Please contact them if it is urgent." };
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: "Enter the e-mail address you sign in with." });
  try {
    const [byEmail] = await query(`SELECT COUNT(*) n FROM password_reset_requests WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`, [email]);
    const [byIp] = await query(`SELECT COUNT(*) n FROM password_reset_requests WHERE ip_address = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`, [ip]);
    if (Number(byEmail.n) >= 3 || Number(byIp.n) >= 10) return answer;
    const [u] = await query(`SELECT id, display_name, status FROM users WHERE email = ? LIMIT 1`, [email]);
    await query(`INSERT INTO password_reset_requests (email, user_id, ip_address) VALUES (?, ?, ?)`, [email, (_c = u == null ? void 0 : u.id) != null ? _c : null, ip]);
    if (u && u.status === "active") {
      const esc = (s) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
      sendTelegram(`\u{1F511} <b>Password reset requested</b>
${esc(String(u.display_name))} (${esc(email)})
Set a new password in Admin \u2192 Users, then tell them.`).catch(() => {
      });
    }
  } catch (e) {
    console.warn("[forgot-password]", e);
  }
  return answer;
});

export { forgotPassword_post as default };
//# sourceMappingURL=forgot-password.post.mjs.map

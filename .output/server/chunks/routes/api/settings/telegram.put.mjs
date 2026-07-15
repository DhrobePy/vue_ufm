import { n as defineEventHandler, N as getUserSession, j as createError, aa as readBody, ai as sendTelegram, a7 as query, af as resetTelegramCache } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const telegram_put = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const body = await readBody(event);
  const chatId = String((_c = body == null ? void 0 : body.chat_id) != null ? _c : "").trim();
  const token = (body == null ? void 0 : body.token) !== void 0 ? String(body.token).trim() : void 0;
  const upsert = async (key, value) => query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value]
  );
  if (token !== void 0 && token !== "") await upsert("telegram_bot_token", token);
  await upsert("telegram_chat_id", chatId);
  resetTelegramCache();
  if (body == null ? void 0 : body.send_test) {
    await sendTelegram("\u{1F514} <b>Ujjal FMC ERP</b> \u2014 Telegram notifications are connected.");
  }
  return { ok: true };
});

export { telegram_put as default };
//# sourceMappingURL=telegram.put.mjs.map

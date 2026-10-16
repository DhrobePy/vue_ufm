import { t as defineEventHandler, Y as getRouterParam, a2 as getUserSession, p as createError, aC as readBody, aA as queryOne, az as query } from '../../../../nitro/nitro.mjs';
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

const notes_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const note = String((_c = (_b = await readBody(event)) == null ? void 0 : _b.note) != null ? _c : "").trim().slice(0, 2e3);
  if (!id || !note) throw createError({ statusCode: 400, statusMessage: "A note is required" });
  if (!await queryOne("SELECT id FROM customers WHERE id = ?", [id])) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
  await query(`INSERT INTO customer_notes (customer_id, note, created_by_user_id) VALUES (?, ?, ?)`, [id, note, Number(session.user.id)]);
  return { ok: true };
});

export { notes_post as default };
//# sourceMappingURL=notes.post.mjs.map

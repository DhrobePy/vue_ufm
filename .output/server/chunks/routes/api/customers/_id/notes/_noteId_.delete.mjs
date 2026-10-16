import { u as defineEventHandler, a0 as getRouterParam, a5 as getUserSession, r as createError, aD as queryOne, aC as query } from '../../../../../nitro/nitro.mjs';
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

const _noteId__delete = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const noteId = Number(getRouterParam(event, "noteId"));
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const isAdmin = ["admin", "superadmin"].includes(String((_b = session.user.role) != null ? _b : "").toLowerCase());
  const n = await queryOne("SELECT id, kind, created_by_user_id FROM customer_notes WHERE id = ? AND customer_id = ?", [noteId, id]);
  if (!n) throw createError({ statusCode: 404, statusMessage: "Note not found" });
  if (n.kind === "status") throw createError({ statusCode: 409, statusMessage: "Status history cannot be deleted" });
  if (!isAdmin && Number(n.created_by_user_id) !== Number(session.user.id))
    throw createError({ statusCode: 403, statusMessage: "You can only delete your own notes" });
  await query("DELETE FROM customer_notes WHERE id = ?", [noteId]);
  return { ok: true };
});

export { _noteId__delete as default };
//# sourceMappingURL=_noteId_.delete.mjs.map

import { q as defineEventHandler, as as readBody, m as createError, X as getUserSession, ap as query } from '../../../../nitro/nitro.mjs';
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

const consolidationSuggestions_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const idA = Number(body == null ? void 0 : body.trip_id_a);
  const idB = Number(body == null ? void 0 : body.trip_id_b);
  if (!idA || !idB || idA === idB)
    throw createError({ statusCode: 400, statusMessage: "trip_id_a and trip_id_b are required and must differ" });
  const lo = Math.min(idA, idB);
  const hi = Math.max(idA, idB);
  const session = await getUserSession(event);
  const userId = Number((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || null;
  await query(
    `INSERT INTO fleet_trip_consolidation_dismissals (trip_id_a, trip_id_b, dismissed_by_user_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE dismissed_at = CURRENT_TIMESTAMP, dismissed_by_user_id = VALUES(dismissed_by_user_id)`,
    [lo, hi, userId]
  );
  return { ok: true };
});

export { consolidationSuggestions_post as default };
//# sourceMappingURL=consolidation-suggestions.post.mjs.map

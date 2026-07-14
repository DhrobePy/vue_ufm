import { n as defineEventHandler, H as getRouterParam, j as createError, K as getUserSession, a4 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const amendments_get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const amendments = await query(
    `SELECT a.*, ru.display_name AS requested_by_name, du.display_name AS decided_by_name
     FROM order_amendments a
     LEFT JOIN users ru ON ru.id = a.requested_by
     LEFT JOIN users du ON du.id = a.decided_by
     WHERE a.order_id = ?
     ORDER BY a.id DESC`,
    [id]
  );
  return { amendments };
});

export { amendments_get as default };
//# sourceMappingURL=amendments.get.mjs.map

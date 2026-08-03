import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, z as getDb, H as getOrderGateState } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const gates_get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const conn = await getDb().getConnection();
  try {
    const gate = await getOrderGateState(conn, id);
    return { ok: true, gate };
  } finally {
    conn.release();
  }
});

export { gates_get as default };
//# sourceMappingURL=gates.get.mjs.map

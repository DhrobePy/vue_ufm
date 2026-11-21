import { Z as defineEventHandler, Q as crmUser, as as getQuery, aU as nextActions, bS as scopedHealth } from '../../../nitro/nitro.mjs';
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

const actions_get = defineEventHandler(async (event) => {
  const me = await crmUser(event), q = getQuery(event);
  const r = await nextActions(await scopedHealth(event), { userId: me.id, limit: Math.min(60, Math.max(1, Number(q.limit) || 25)) });
  return q.mine === "1" ? { ...r, actions: r.actions.filter((a) => a.owner_user_id === me.id) } : r;
});

export { actions_get as default };
//# sourceMappingURL=actions.get.mjs.map

import { m as defineEventHandler, J as getUserSession } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const me_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  return (_a = session == null ? void 0 : session.user) != null ? _a : null;
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

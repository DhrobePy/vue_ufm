import { q as defineEventHandler, X as getUserSession } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const me_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  return (_a = session == null ? void 0 : session.user) != null ? _a : null;
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

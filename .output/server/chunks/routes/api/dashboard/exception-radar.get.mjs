import { q as defineEventHandler, X as getUserSession, m as createError, a4 as maybeTriggerOwnerDigest, C as getExceptionRadar } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const exceptionRadar_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  maybeTriggerOwnerDigest();
  return getExceptionRadar();
});

export { exceptionRadar_get as default };
//# sourceMappingURL=exception-radar.get.mjs.map

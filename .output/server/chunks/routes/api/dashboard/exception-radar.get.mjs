import { n as defineEventHandler, N as getUserSession, j as createError, W as maybeTriggerOwnerDigest, x as getExceptionRadar } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
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

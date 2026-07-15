import { o as defineEventHandler, j as clearUserSession } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const logout_post = defineEventHandler(async (event) => {
  await clearUserSession(event);
  return { ok: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map

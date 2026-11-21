import { X as defineEventHandler, O as crmUser, be as readBody, bP as useRuntimeConfig, K as KINDS, f as AREAS, a2 as discover } from '../../../../nitro/nitro.mjs';
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

const discover_post = defineEventHandler(async (event) => {
  var _a, _b;
  await crmUser(event);
  const b = await readBody(event);
  const key = String((_a = useRuntimeConfig(event).googlePlacesKey) != null ? _a : "");
  return { ...await discover(String((_b = b == null ? void 0 : b.district) != null ? _b : ""), Array.isArray(b == null ? void 0 : b.kinds) ? b.kinds : [], key), areas: Object.keys(AREAS), kinds: Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, v.label])) };
});

export { discover_post as default };
//# sourceMappingURL=discover.post.mjs.map

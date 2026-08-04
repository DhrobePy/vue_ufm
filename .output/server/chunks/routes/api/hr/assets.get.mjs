import { q as defineEventHandler, ao as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const assets_get = defineEventHandler(async () => {
  const assets = await query("SELECT * FROM hr_assets ORDER BY name");
  return { assets };
});

export { assets_get as default };
//# sourceMappingURL=assets.get.mjs.map

import { q as defineEventHandler, ap as query } from '../../../nitro/nitro.mjs';
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

const assets_get = defineEventHandler(async () => {
  const assets = await query("SELECT * FROM hr_assets ORDER BY name");
  return { assets };
});

export { assets_get as default };
//# sourceMappingURL=assets.get.mjs.map

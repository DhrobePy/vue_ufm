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

const index_get = defineEventHandler(async () => {
  const departments = await query("SELECT * FROM hr_departments ORDER BY name");
  return { departments };
});

export { index_get as default };
//# sourceMappingURL=index.get5.mjs.map

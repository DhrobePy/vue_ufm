import { h as defineEventHandler, G as query } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_get = defineEventHandler(async () => {
  const departments = await query("SELECT * FROM hr_departments ORDER BY name");
  return { departments };
});

export { index_get as default };
//# sourceMappingURL=index.get5.mjs.map

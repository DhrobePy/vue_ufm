import { n as defineEventHandler, a8 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async () => {
  const holidays = await query("SELECT * FROM hr_holidays ORDER BY holiday_date");
  return { holidays };
});

export { index_get as default };
//# sourceMappingURL=index.get7.mjs.map

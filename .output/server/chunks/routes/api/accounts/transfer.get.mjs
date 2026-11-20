import { y as defineEventHandler, aK as query } from '../../../nitro/nitro.mjs';
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

const transfer_get = defineEventHandler(async () => {
  const rows = await query(`SELECT id, TRIM(CONCAT(first_name, ' ', COALESCE(last_name, ''))) AS name FROM employees WHERE status IN ('active', 'Active') OR status IS NULL ORDER BY first_name`);
  return { employees: rows };
});

export { transfer_get as default };
//# sourceMappingURL=transfer.get.mjs.map

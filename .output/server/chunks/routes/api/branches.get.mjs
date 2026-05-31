import { h as defineEventHandler, G as query } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const branches_get = defineEventHandler(async () => {
  const branches = await query(
    `SELECT id, name, code, address, phone_number AS phone, status
     FROM branches
     ORDER BY id`
  );
  return { branches };
});

export { branches_get as default };
//# sourceMappingURL=branches.get.mjs.map

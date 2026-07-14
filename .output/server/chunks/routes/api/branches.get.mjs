import { n as defineEventHandler, a4 as query } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const branches_get = defineEventHandler(async () => {
  const branches = await query(
    `SELECT id, name, code, address, phone_number AS phone, status,
            branch_type, source_branch_id
     FROM branches
     ORDER BY branch_type = 'factory' DESC, id`
  );
  return { branches };
});

export { branches_get as default };
//# sourceMappingURL=branches.get.mjs.map

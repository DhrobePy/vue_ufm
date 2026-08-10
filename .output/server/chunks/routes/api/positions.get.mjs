import { q as defineEventHandler, ap as query } from '../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const positions_get = defineEventHandler(async () => {
  const positions = await query(
    `SELECT p.id, p.title, d.name AS department
     FROM positions p
     LEFT JOIN departments d ON d.id = p.department_id
     ORDER BY p.title`
  );
  return { positions };
});

export { positions_get as default };
//# sourceMappingURL=positions.get.mjs.map

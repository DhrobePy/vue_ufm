import { q as defineEventHandler, J as getQuery, aq as queryOne, ap as query } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const batchId = q.batchId ? Number(q.batchId) : null;
  if (batchId) {
    const batch = await queryOne("SELECT * FROM hr_bonus_batches WHERE id = ?", [batchId]);
    const employees = await query(`
      SELECT eb.*, e.first_name, e.last_name FROM hr_employee_bonuses eb
      JOIN hr_employees e ON eb.employee_id = e.id
      WHERE eb.batch_id = ? ORDER BY e.first_name
    `, [batchId]);
    return { batch, employees };
  }
  const batches = await query("SELECT * FROM hr_bonus_batches ORDER BY created_at DESC LIMIT 100");
  return { batches };
});

export { index_get as default };
//# sourceMappingURL=index.get4.mjs.map

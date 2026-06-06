import { h as defineEventHandler, p as getQuery, K as queryOne, J as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
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

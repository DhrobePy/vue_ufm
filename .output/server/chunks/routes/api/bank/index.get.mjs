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
  const types = await query(
    `SELECT id, name, nature, description, is_active, created_at FROM bank_tx_transaction_types ORDER BY name ASC`
  );
  return { types };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

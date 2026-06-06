import { h as defineEventHandler, J as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const rules_get = defineEventHandler(async () => {
  const rules = await query(
    `SELECT * FROM preventive_maintenance_rules ORDER BY rule_name`,
    []
  );
  return { rules };
});

export { rules_get as default };
//# sourceMappingURL=rules.get.mjs.map

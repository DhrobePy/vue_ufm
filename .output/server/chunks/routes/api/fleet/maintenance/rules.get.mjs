import { q as defineEventHandler, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
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

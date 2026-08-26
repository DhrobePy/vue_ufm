import { q as defineEventHandler, aq as query } from '../../../nitro/nitro.mjs';
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

const activity_get = defineEventHandler(async () => {
  try {
    const rows = await query(
      `SELECT l.id, l.action, l.module, l.record_type, l.reference_number,
              l.description, l.severity, l.created_at,
              u.display_name AS user_name
       FROM system_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT 20`
    );
    return rows;
  } catch {
    return [];
  }
});

export { activity_get as default };
//# sourceMappingURL=activity.get.mjs.map

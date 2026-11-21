import { Z as defineEventHandler, bn as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const passwordResets_get = defineEventHandler(async () => ({
  requests: await query(
    `SELECT r.id, r.user_id, u.display_name, r.email, MAX(r.created_at) AS requested_at, COUNT(*) AS times
     FROM password_reset_requests r JOIN users u ON u.id = r.user_id
     WHERE r.status = 'open' AND r.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) GROUP BY r.user_id ORDER BY requested_at DESC LIMIT 20`
  ).catch(() => [])
}));

export { passwordResets_get as default };
//# sourceMappingURL=password-resets.get.mjs.map

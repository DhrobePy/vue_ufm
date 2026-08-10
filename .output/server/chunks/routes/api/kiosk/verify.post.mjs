import { q as defineEventHandler, as as readBody, aq as queryOne } from '../../../nitro/nitro.mjs';
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

const verify_post = defineEventHandler(async (event) => {
  const { device_id } = await readBody(event);
  if (!device_id) return { success: false, message: "No device ID" };
  const branch = await queryOne(
    "SELECT id, name, address AS location FROM branches WHERE id = ?",
    [parseInt(device_id)]
  );
  if (!branch) return { success: false, message: "Unknown branch/device" };
  return { success: true, branch };
});

export { verify_post as default };
//# sourceMappingURL=verify.post.mjs.map

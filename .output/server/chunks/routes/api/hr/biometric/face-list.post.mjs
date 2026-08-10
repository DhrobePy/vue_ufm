import { q as defineEventHandler, as as readBody, m as createError, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const faceList_post = defineEventHandler(async (event) => {
  const { action, employee_id } = await readBody(event);
  if (action === "delete") {
    if (!employee_id) throw createError({ statusCode: 400, statusMessage: "employee_id required" });
    await query("DELETE FROM hr_face_encodings WHERE employee_id = ?", [employee_id]);
    return { ok: true, message: "Face ID deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { faceList_post as default };
//# sourceMappingURL=face-list.post.mjs.map

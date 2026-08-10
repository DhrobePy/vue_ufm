import { q as defineEventHandler, as as readBody, m as createError, z as getDb } from '../../../../nitro/nitro.mjs';
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

const face_post = defineEventHandler(async (event) => {
  const { employee_id, descriptor } = await readBody(event);
  if (!employee_id || !Array.isArray(descriptor))
    throw createError({ statusCode: 400, statusMessage: "employee_id and descriptor array required" });
  if (descriptor.length !== 128)
    throw createError({ statusCode: 400, statusMessage: "Descriptor must be exactly 128 floats" });
  const db = getDb();
  await db.query(`
    INSERT INTO hr_face_encodings (employee_id, face_descriptor, created_at)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE face_descriptor = VALUES(face_descriptor), created_at = NOW()
  `, [employee_id, JSON.stringify(descriptor.map(Number))]);
  return { success: true, message: "Face ID saved." };
});

export { face_post as default };
//# sourceMappingURL=face.post.mjs.map

import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, ap as query } from '../../../../../nitro/nitro.mjs';
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

const documents_post = defineEventHandler(async (event) => {
  const vehicleId = Number(getRouterParam(event, "id"));
  if (!vehicleId) throw createError({ statusCode: 400, statusMessage: "Invalid vehicle ID" });
  const body = await readBody(event);
  const { document_type, document_number, issue_date, expiry_date, notes } = body != null ? body : {};
  if (!document_type) throw createError({ statusCode: 400, statusMessage: "document_type is required" });
  const result = await query(
    `INSERT INTO vehicle_documents (vehicle_id, document_type, document_number, issue_date, expiry_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [vehicleId, document_type, document_number || null, issue_date || null, expiry_date || null, notes || null]
  );
  return { ok: true, id: result.insertId };
});

export { documents_post as default };
//# sourceMappingURL=documents.post.mjs.map

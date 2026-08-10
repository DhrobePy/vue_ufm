import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, ap as query } from '../../../../nitro/nitro.mjs';
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

const VALID_STATUS = ["Scheduled", "In Progress", "Completed", "Cancelled"];
const VALID_PAYMENT_STATUS = ["Pending", "Partially Paid", "Paid"];
const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid rental ID" });
  const body = await readBody(event);
  const { status, payment_status, notes } = body != null ? body : {};
  const sets = [];
  const params = [];
  if (status !== void 0) {
    if (!VALID_STATUS.includes(status)) throw createError({ statusCode: 400, statusMessage: "Invalid status" });
    sets.push("status = ?");
    params.push(status);
  }
  if (payment_status !== void 0) {
    if (!VALID_PAYMENT_STATUS.includes(payment_status)) throw createError({ statusCode: 400, statusMessage: "Invalid payment_status" });
    sets.push("payment_status = ?");
    params.push(payment_status);
  }
  if (notes !== void 0) {
    sets.push("notes = ?");
    params.push((notes == null ? void 0 : notes.trim()) || null);
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  params.push(id);
  await query(`UPDATE vehicle_rentals SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`, params);
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

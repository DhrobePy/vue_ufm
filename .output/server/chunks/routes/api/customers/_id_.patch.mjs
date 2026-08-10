import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, ap as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  const body = await readBody(event);
  const {
    name,
    business_name,
    phone_number,
    business_address,
    customer_type,
    credit_limit,
    status
  } = body != null ? body : {};
  if (!name || !phone_number)
    throw createError({ statusCode: 400, statusMessage: "name and phone_number are required" });
  await query(
    `UPDATE customers
     SET name             = ?,
         business_name    = ?,
         phone_number     = ?,
         business_address = ?,
         customer_type    = ?,
         credit_limit     = ?,
         status           = ?,
         updated_at       = NOW()
     WHERE id = ?`,
    [
      name.trim(),
      business_name || null,
      phone_number,
      business_address || null,
      customer_type != null ? customer_type : "Credit",
      credit_limit ? Number(credit_limit) : 0,
      status != null ? status : "active",
      id
    ]
  );
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

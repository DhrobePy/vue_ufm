import { u as defineEventHandler, aS as requireAction, a0 as getRouterParam, r as createError, aF as readBody, aD as queryOne, aC as query, A as ACCOUNTS_ROLES } from '../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a;
  await requireAction(
    event,
    { module: "customers", page: "list", action: "edit", roleFallback: ACCOUNTS_ROLES },
    "Only Accounts / admin (or a user granted Customers \u2192 Edit) may edit customers"
  );
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
  const dup = await queryOne("SELECT id, name FROM customers WHERE phone_number = ? AND id <> ? LIMIT 1", [phone_number, id]);
  if (dup) throw createError({ statusCode: 409, statusMessage: `Another customer already uses this phone number (${dup.name})` });
  const cur = await queryOne("SELECT credit_limit FROM customers WHERE id = ?", [id]);
  if (cur && Number((_a = cur.credit_limit) != null ? _a : 0) !== (credit_limit ? Number(credit_limit) : 0))
    await requireAction(
      event,
      { module: "credit_sales", page: "credit-limits", action: "update", roleFallback: ACCOUNTS_ROLES },
      "Only Accounts / admin (or a user granted Credit Limits) may change credit limits"
    );
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

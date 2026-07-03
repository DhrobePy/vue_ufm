import { j as defineEventHandler, F as getUserSession, f as createError, C as getRouterParam, _ as readBody, Y as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PROD_ROLES = ["admin", "superadmin", "production manager-srg", "production manager-demra"];
const _id__put = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid variant ID" });
  const body = await readBody(event);
  const { weight_variant, grade, sku, unit_of_measure, weight_kg, status } = body;
  if (!(weight_variant == null ? void 0 : weight_variant.trim()))
    throw createError({ statusCode: 400, statusMessage: "weight_variant is required" });
  const validUom = ["pcs", "litre", "kg", "gm", "bag"];
  const uom = unit_of_measure && validUom.includes(unit_of_measure) ? unit_of_measure : "bag";
  const validStatus = ["active", "inactive"];
  const st = status && validStatus.includes(status) ? status : "active";
  const result = await query(
    `UPDATE product_variants
     SET weight_variant = ?, grade = ?, sku = ?, unit_of_measure = ?, weight_kg = ?, status = ?
     WHERE id = ? AND status != 'deleted'`,
    [weight_variant.trim(), grade || null, sku || null, uom, weight_kg ? Number(weight_kg) : null, st, id]
  );
  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: "Variant not found" });
  return { ok: true, message: "Variant updated" };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

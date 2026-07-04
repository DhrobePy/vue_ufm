import { m as defineEventHandler, a4 as readBody, i as createError, a2 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const pricing_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action, variantId, branchId, unitPrice, effectiveDate, status, priceId } = body != null ? body : {};
  if (action === "set_price") {
    if (!variantId || !branchId || unitPrice == null)
      throw createError({ statusCode: 400, statusMessage: "variantId, branchId and unitPrice are required" });
    const price = Number(unitPrice);
    if (isNaN(price) || price < 0)
      throw createError({ statusCode: 400, statusMessage: "Invalid unit price" });
    const date = effectiveDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const priceStatus = status || "active";
    await query(
      `UPDATE product_prices SET is_active = 0
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
      [variantId, branchId]
    );
    const result = await query(
      `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [variantId, branchId, price, date, priceStatus]
    );
    return { ok: true, priceId: result.insertId };
  }
  if (action === "deactivate") {
    if (!priceId)
      throw createError({ statusCode: 400, statusMessage: "priceId is required" });
    await query(
      `UPDATE product_prices SET is_active = 0, status = 'inactive' WHERE id = ?`,
      [priceId]
    );
    return { ok: true };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action. Use set_price or deactivate." });
});

export { pricing_post as default };
//# sourceMappingURL=pricing.post.mjs.map

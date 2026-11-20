import { y as defineEventHandler, aa as getUserSession, u as createError, aN as readBody, N as getDb } from '../../../nitro/nitro.mjs';
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

const PROD_ROLES = ["admin", "superadmin", "production manager-srg", "production manager-demra"];
const variants_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const body = await readBody(event);
  const { product_id, weight_variant, sku, grade, barcode, unit_of_measure, weight_kg, unit_price, cost_price } = body;
  if (!product_id || !weight_variant) {
    throw createError({ statusCode: 422, statusMessage: "product_id and weight_variant are required" });
  }
  const validUom = ["pcs", "litre", "kg", "gm", "bag"];
  const uom = unit_of_measure && validUom.includes(unit_of_measure) ? unit_of_measure : "bag";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    let finalSku = (sku == null ? void 0 : sku.trim()) || null;
    if (!finalSku) {
      const [[bp]] = await conn.query(`SELECT base_sku FROM products WHERE id = ?`, [product_id]);
      if (bp == null ? void 0 : bp.base_sku) {
        const g = String(grade != null ? grade : "").trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        finalSku = [String(bp.base_sku).toUpperCase().trim(), String(weight_variant).replace(/[^a-zA-Z0-9]/g, "").toUpperCase(), ...g ? [g.slice(0, 1)] : []].join("-");
      }
    }
    const [result] = await conn.query(
      `INSERT INTO product_variants
         (product_id, weight_variant, sku, grade, barcode, unit_of_measure, weight_kg, unit_price, cost_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        weight_variant,
        finalSku,
        grade || null,
        barcode || null,
        uom,
        weight_kg ? Number(weight_kg) : null,
        unit_price || 0,
        cost_price || 0
      ]
    );
    return { id: result.insertId, message: "Variant created" };
  } finally {
    conn.release();
  }
});

export { variants_post as default };
//# sourceMappingURL=variants.post.mjs.map

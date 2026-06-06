import { h as defineEventHandler, L as readBody, e as createError, n as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const variants_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { product_id, weight_variant, grade, barcode, unit_price, cost_price } = body;
  if (!product_id || !weight_variant) {
    throw createError({ statusCode: 422, statusMessage: "product_id and weight_variant are required" });
  }
  const db = await getDb();
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO product_variants (product_id, weight_variant, grade, barcode, unit_price, cost_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product_id, weight_variant, grade || null, barcode || null, unit_price || 0, cost_price || 0]
    );
    return { id: result.insertId, message: "Variant created" };
  } finally {
    conn.release();
  }
});

export { variants_post as default };
//# sourceMappingURL=variants.post.mjs.map

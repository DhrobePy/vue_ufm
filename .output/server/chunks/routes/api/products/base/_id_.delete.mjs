import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, z as getDb, g as auditLog } from '../../../../nitro/nitro.mjs';
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

const ADMIN_ROLES = ["admin", "superadmin"];
const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const id = Number(getRouterParam(event, "id"));
  const userId = Number((_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) || 1;
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid product ID" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[product]] = await conn.query(
      `SELECT id, base_name, status FROM products WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!product) throw createError({ statusCode: 404, statusMessage: "Product not found" });
    if (product.status === "deleted")
      throw createError({ statusCode: 400, statusMessage: "Product is already deleted" });
    await conn.query(`UPDATE products SET status = 'deleted' WHERE id = ?`, [id]);
    const [variantRows] = await conn.query(
      `SELECT id FROM product_variants WHERE product_id = ? AND status = 'active'`,
      [id]
    );
    const variantIds = variantRows.map((v) => v.id);
    if (variantIds.length) {
      await conn.query(
        `UPDATE product_variants SET status = 'inactive' WHERE id IN (?)`,
        [variantIds]
      );
      await conn.query(
        `UPDATE product_prices SET is_active = 0 WHERE variant_id IN (?) AND is_active = 1`,
        [variantIds]
      );
    }
    await auditLog(conn, {
      userId,
      action: "deleted",
      module: "products",
      recordType: "product",
      recordId: id,
      description: `Product "${product.base_name}" deleted \u2014 cascade-archived ${variantIds.length} variant(s) and their active prices`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: `Product deleted (${variantIds.length} variant(s) archived)` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

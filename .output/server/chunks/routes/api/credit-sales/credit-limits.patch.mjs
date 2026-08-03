import { q as defineEventHandler, aq as readBody, m as createError, z as getDb } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const creditLimits_patch = defineEventHandler(async (event) => {
  var _a;
  const { updates } = (_a = await readBody(event)) != null ? _a : {};
  if (!Array.isArray(updates) || !updates.length) {
    throw createError({ statusCode: 400, statusMessage: "updates array is required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const u of updates) {
      if (!u.id || u.credit_limit === void 0) continue;
      await conn.query(
        `UPDATE customers SET credit_limit = ?, updated_at = NOW() WHERE id = ?`,
        [Number(u.credit_limit), Number(u.id)]
      );
    }
    await conn.commit();
    return { ok: true, updated: updates.length };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { creditLimits_patch as default };
//# sourceMappingURL=credit-limits.patch.mjs.map

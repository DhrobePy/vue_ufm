import { q as defineEventHandler, R as getRouterParam, as as readBody, X as getUserSession, z as getDb, m as createError, g as auditLog } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[sup]] = await conn.query(`SELECT * FROM suppliers WHERE id = ?`, [id]);
    if (!sup) throw createError({ statusCode: 404, statusMessage: "Supplier not found" });
    const fields = ["company_name", "supplier_code", "contact_person", "phone", "email", "address", "city", "supplier_type", "credit_limit", "payment_terms", "status", "notes"];
    const sets = [];
    const vals = [];
    for (const f of fields) {
      if (body[f] !== void 0) {
        sets.push(`${f} = ?`);
        vals.push(body[f]);
      }
    }
    if (!sets.length) {
      await conn.rollback();
      return { message: "Nothing to update" };
    }
    sets.push("updated_at = NOW()");
    await conn.query(`UPDATE suppliers SET ${sets.join(", ")} WHERE id = ?`, [...vals, id]);
    await auditLog(conn, {
      userId,
      action: "user_updated",
      module: "purchase",
      recordType: "supplier",
      recordId: id,
      description: `Supplier "${sup.company_name}" updated`
    });
    await conn.commit();
    return { message: "Supplier updated successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

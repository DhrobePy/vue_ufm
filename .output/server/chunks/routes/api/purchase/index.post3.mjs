import { q as defineEventHandler, as as readBody, m as createError, X as getUserSession, z as getDb, g as auditLog } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const body = await readBody(event);
  if (!((_a = body.company_name) == null ? void 0 : _a.trim())) throw createError({ statusCode: 422, statusMessage: "company_name is required" });
  const session = await getUserSession(event);
  const userId = (_c = (_b = session == null ? void 0 : session.user) == null ? void 0 : _b.id) != null ? _c : 1;
  const role = ((_e = (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.role) != null ? _e : "").toLowerCase();
  if (!["admin", "superadmin", "accounts", "superadmin"].includes(role) && !role.includes("account")) {
    throw createError({ statusCode: 403, statusMessage: "Insufficient permissions" });
  }
  const code = ((_f = body.supplier_code) == null ? void 0 : _f.trim()) || `SUP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO suppliers
         (supplier_code, company_name, contact_person, phone, email, address, city,
          supplier_type, credit_limit, payment_terms, status, notes, current_balance, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        code,
        body.company_name.trim(),
        body.contact_person || null,
        body.phone || null,
        body.email || null,
        body.address || null,
        body.city || null,
        body.supplier_type || "local",
        body.credit_limit || 0,
        body.payment_terms || null,
        body.status || "active",
        body.notes || null,
        userId
      ]
    );
    const newId = result.insertId;
    await auditLog(conn, {
      userId,
      action: "user_created",
      module: "purchase",
      recordType: "supplier",
      recordId: newId,
      description: `Supplier "${body.company_name}" created`
    });
    await conn.commit();
    return { id: newId, supplier_code: code, message: "Supplier created successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map

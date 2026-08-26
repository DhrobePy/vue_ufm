import { q as defineEventHandler, at as readBody, X as getUserSession, m as createError, aT as userCanAction, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, z as getDb, g as auditLog } from '../../../nitro/nitro.mjs';
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

const partners_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const canLink = await userCanAction({
    userId,
    role,
    module: "trading",
    page: "partners",
    action: "link_partner",
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES]
  });
  if (!canLink) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to manage business partners" });
  const action = String((_b = body == null ? void 0 : body.action) != null ? _b : "link");
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    if (action === "unlink") {
      const partnerId2 = Number(body == null ? void 0 : body.partner_id);
      if (!partnerId2) throw createError({ statusCode: 400, statusMessage: "partner_id required" });
      await conn.query(`UPDATE customers SET business_partner_id = NULL WHERE business_partner_id = ?`, [partnerId2]);
      await conn.query(`UPDATE suppliers SET business_partner_id = NULL WHERE business_partner_id = ?`, [partnerId2]);
      await conn.query(`DELETE FROM business_partners WHERE id = ?`, [partnerId2]);
      await auditLog(conn, {
        userId,
        action: "deleted",
        module: "trading",
        recordType: "business_partner",
        recordId: partnerId2,
        description: `Business partner #${partnerId2} unlinked`,
        severity: "info"
      });
      await conn.commit();
      return { ok: true };
    }
    const customerId = Number(body == null ? void 0 : body.customer_id);
    const supplierId = Number(body == null ? void 0 : body.supplier_id);
    if (!customerId || !supplierId)
      throw createError({ statusCode: 400, statusMessage: "customer_id and supplier_id are required" });
    const [[cust]] = await conn.query(
      `SELECT id, name, business_partner_id FROM customers WHERE id = ? FOR UPDATE`,
      [customerId]
    );
    const [[supp]] = await conn.query(
      `SELECT id, company_name, business_partner_id FROM suppliers WHERE id = ? FOR UPDATE`,
      [supplierId]
    );
    if (!cust) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    if (!supp) throw createError({ statusCode: 404, statusMessage: "Supplier not found" });
    if (cust.business_partner_id) throw createError({ statusCode: 409, statusMessage: `${cust.name} is already linked to a partner` });
    if (supp.business_partner_id) throw createError({ statusCode: 409, statusMessage: `${supp.company_name} is already linked to a partner` });
    const name = String((body == null ? void 0 : body.name) || cust.name).slice(0, 180);
    const [res] = await conn.query(
      `INSERT INTO business_partners (name, notes, created_by_user_id) VALUES (?, ?, ?)`,
      [name, (_c = body == null ? void 0 : body.notes) != null ? _c : null, userId]
    );
    const partnerId = res.insertId;
    await conn.query(`UPDATE customers SET business_partner_id = ? WHERE id = ?`, [partnerId, customerId]);
    await conn.query(`UPDATE suppliers SET business_partner_id = ? WHERE id = ?`, [partnerId, supplierId]);
    await auditLog(conn, {
      userId,
      action: "created",
      module: "trading",
      recordType: "business_partner",
      recordId: partnerId,
      referenceNumber: name,
      description: `Business partner "${name}" linked \u2014 customer ${cust.name} + supplier ${supp.company_name}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: partnerId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { partners_post as default };
//# sourceMappingURL=partners.post.mjs.map

import { p as defineEventHandler, O as getRouterParam, l as createError, V as getUserSession, am as readBody, y as getDb, f as auditLog } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid commodity ID" });
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role) && !role.includes("account")) {
    throw createError({ statusCode: 403, statusMessage: "Only accounts/admin can manage the commodity catalog" });
  }
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1);
  const body = await readBody(event);
  const { name, unit, inventory_account_id, status, origins, supplier_ids } = body != null ? body : {};
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[current]] = await conn.query(`SELECT name FROM purchase_commodities WHERE id = ?`, [id]);
    if (!current) throw createError({ statusCode: 404, statusMessage: "Commodity not found" });
    const setParts = [];
    const setParams = [];
    if (name !== void 0) {
      setParts.push("name = ?");
      setParams.push(String(name).trim());
    }
    if (unit !== void 0) {
      setParts.push("unit = ?");
      setParams.push(unit);
    }
    if (inventory_account_id !== void 0) {
      setParts.push("inventory_account_id = ?");
      setParams.push(inventory_account_id || null);
    }
    if (status !== void 0) {
      setParts.push("status = ?");
      setParams.push(status);
    }
    if (setParts.length) {
      setParts.push("updated_at = NOW()");
      await conn.query(`UPDATE purchase_commodities SET ${setParts.join(", ")} WHERE id = ?`, [...setParams, id]);
    }
    if (Array.isArray(origins)) {
      await conn.query(`DELETE FROM purchase_commodity_origins WHERE commodity_id = ?`, [id]);
      const cleanOrigins = origins.map((o) => String(o).trim()).filter(Boolean);
      for (let i = 0; i < cleanOrigins.length; i++) {
        await conn.query(
          `INSERT INTO purchase_commodity_origins (commodity_id, origin_name, sort_order) VALUES (?, ?, ?)`,
          [id, cleanOrigins[i], i]
        );
      }
    }
    if (Array.isArray(supplier_ids)) {
      await conn.query(`DELETE FROM supplier_commodities WHERE commodity_id = ?`, [id]);
      for (const supId of supplier_ids) {
        await conn.query(
          `INSERT IGNORE INTO supplier_commodities (supplier_id, commodity_id) VALUES (?, ?)`,
          [Number(supId), id]
        );
      }
    }
    await auditLog(conn, {
      userId,
      action: "other",
      module: "purchase",
      recordType: "commodity",
      recordId: id,
      referenceNumber: name != null ? name : current.name,
      description: `Commodity "${current.name}" updated`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

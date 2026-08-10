import { q as defineEventHandler, X as getUserSession, m as createError, as as readBody, z as getDb, g as auditLog } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const commodities_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role) && !role.includes("account")) {
    throw createError({ statusCode: 403, statusMessage: "Only accounts/admin can manage the commodity catalog" });
  }
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1);
  const body = await readBody(event);
  const {
    name,
    unit = "KG",
    inventory_account_id = null,
    origins = [],
    supplier_ids = []
  } = body != null ? body : {};
  if (!name || !String(name).trim())
    throw createError({ statusCode: 422, statusMessage: "Commodity name is required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO purchase_commodities (name, unit, inventory_account_id, status) VALUES (?, ?, ?, 'active')`,
      [String(name).trim(), unit, inventory_account_id || null]
    );
    const id = result.insertId;
    const cleanOrigins = origins.map((o) => String(o).trim()).filter(Boolean);
    for (let i = 0; i < cleanOrigins.length; i++) {
      await conn.query(
        `INSERT INTO purchase_commodity_origins (commodity_id, origin_name, sort_order) VALUES (?, ?, ?)`,
        [id, cleanOrigins[i], i]
      );
    }
    for (const supId of supplier_ids) {
      await conn.query(
        `INSERT IGNORE INTO supplier_commodities (supplier_id, commodity_id) VALUES (?, ?)`,
        [Number(supId), id]
      );
    }
    await auditLog(conn, {
      userId,
      action: "other",
      module: "purchase",
      recordType: "commodity",
      recordId: id,
      referenceNumber: name,
      description: `Commodity "${name}" (${unit}) added to procurement catalog \u2014 ${cleanOrigins.length} origin(s), ${supplier_ids.length} linked supplier(s)`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { commodities_post as default };
//# sourceMappingURL=commodities.post.mjs.map

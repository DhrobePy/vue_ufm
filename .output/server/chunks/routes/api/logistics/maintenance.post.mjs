import { n as defineEventHandler, aa as readBody, N as getUserSession, j as createError, v as getDb } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const maintenance_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    vehicle_id,
    maintenance_date,
    maintenance_type,
    description,
    cost,
    service_provider,
    odometer_reading,
    next_service_date,
    invoice_number,
    notes
  } = body != null ? body : {};
  if (!vehicle_id || !maintenance_type) {
    throw createError({ statusCode: 400, statusMessage: "vehicle_id and maintenance_type are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO maintenance_logs
         (vehicle_id, maintenance_date, maintenance_type, description, cost,
          service_provider, odometer_reading, next_service_date, invoice_number, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        maintenance_date != null ? maintenance_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        maintenance_type,
        description != null ? description : null,
        Number(cost || 0),
        service_provider != null ? service_provider : null,
        odometer_reading ? Number(odometer_reading) : null,
        next_service_date != null ? next_service_date : null,
        invoice_number != null ? invoice_number : null,
        notes != null ? notes : null,
        userId
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { maintenance_post as default };
//# sourceMappingURL=maintenance.post.mjs.map

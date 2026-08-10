import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, z as getDb, B as getDeliveryQrSecret } from '../../../../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const gatePass_get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const conn = await getDb().getConnection();
  try {
    const [[sale]] = await conn.query(
      `SELECT s.id, s.sale_number, s.sale_date, s.quantity, s.unit, s.origin,
              c.name AS customer_name, c.business_address AS customer_address,
              pc.name AS commodity_name, b.name AS branch_name,
              cdc.gate_out_at, cdc.confirmed_at, cdc.driver_name, cdc.vehicle_number
       FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id
       JOIN purchase_commodities pc ON pc.id = s.commodity_id
       LEFT JOIN branches b ON b.id = s.branch_id
       LEFT JOIN commodity_dispatch_confirmations cdc ON cdc.sale_id = s.id
       WHERE s.id = ?`,
      [id]
    );
    if (!sale) throw createError({ statusCode: 404, statusMessage: "Sale not found" });
    const secret = await getDeliveryQrSecret(conn);
    const sig = crypto.createHmac("sha256", secret).update(`CTDELIV|${sale.sale_number}`).digest("hex").slice(0, 16);
    return { sale, verify_path: `/trading/verify/${sale.id}?sig=${sig}` };
  } finally {
    conn.release();
  }
});

export { gatePass_get as default };
//# sourceMappingURL=gate-pass.get.mjs.map

import { q as defineEventHandler, R as getRouterParam, m as createError, ar as readBody, X as getUserSession, K as getRequestHeader, aP as userCanAction, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, D as DISPATCH_ROLES, z as getDb, aI as sendTelegram, g as auditLog } from '../../../../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dispatch_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const ip = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : null;
  const canDispatch = await userCanAction({
    userId,
    role,
    module: "trading",
    page: "dispatch",
    action: "dispatch",
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES, ...DISPATCH_ROLES]
  });
  if (!canDispatch) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to dispatch commodity sales" });
  const action = String((_e = body == null ? void 0 : body.action) != null ? _e : "");
  if (!["gate_out", "deliver"].includes(action))
    throw createError({ statusCode: 400, statusMessage: "action must be gate_out or deliver" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[sale]] = await conn.query(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`,
      [id]
    );
    if (!sale) throw createError({ statusCode: 404, statusMessage: "Sale not found" });
    if (sale.status !== "posted") throw createError({ statusCode: 409, statusMessage: `Sale is ${sale.status}` });
    if (body == null ? void 0 : body.sig) {
      const [[secretRow]] = await conn.query(
        `SELECT setting_value FROM system_settings WHERE setting_key = 'invoice_qr_secret'`
      );
      if (secretRow == null ? void 0 : secretRow.setting_value) {
        const expected = crypto.createHmac("sha256", secretRow.setting_value).update(`CTDELIV|${sale.sale_number}`).digest("hex").slice(0, 16);
        if (expected !== String(body.sig))
          throw createError({ statusCode: 403, statusMessage: "Invalid QR signature" });
      }
    }
    const [[conf]] = await conn.query(
      `SELECT * FROM commodity_dispatch_confirmations WHERE sale_id = ? FOR UPDATE`,
      [id]
    );
    let stage;
    if (action === "gate_out") {
      if (conf == null ? void 0 : conf.gate_out_at) throw createError({ statusCode: 409, statusMessage: `Already gated out on ${conf.gate_out_at}` });
      await conn.query(
        `INSERT INTO commodity_dispatch_confirmations
           (sale_id, sale_number, gate_out_at, gate_out_by_user_id, gate_out_by_name,
            driver_name, vehicle_number, gate_note)
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           gate_out_at = NOW(), gate_out_by_user_id = VALUES(gate_out_by_user_id),
           gate_out_by_name = VALUES(gate_out_by_name), driver_name = VALUES(driver_name),
           vehicle_number = VALUES(vehicle_number), gate_note = VALUES(gate_note)`,
        [
          id,
          sale.sale_number,
          userId,
          userName,
          (_f = body == null ? void 0 : body.driver_name) != null ? _f : null,
          (_g = body == null ? void 0 : body.vehicle_number) != null ? _g : null,
          (_h = body == null ? void 0 : body.note) != null ? _h : null
        ]
      );
      stage = "gate_out";
    } else {
      if (!(conf == null ? void 0 : conf.gate_out_at)) throw createError({ statusCode: 409, statusMessage: "Gate-out must be recorded before delivery confirmation" });
      if (conf == null ? void 0 : conf.confirmed_at) {
        await conn.query(
          `INSERT INTO commodity_qr_scan_log (sale_id, sale_number, stage, reused, scanned_by_user_id, scanned_by_name, ip)
           VALUES (?, ?, 'done', 1, ?, ?, ?)`,
          [id, sale.sale_number, userId, userName, ip]
        );
        await conn.commit();
        sendTelegram(
          `\u26A0\uFE0F <b>COMMODITY QR RE-SCANNED AFTER DELIVERY</b>
${sale.sale_number} \u2014 already delivered ${conf.confirmed_at}
Scanned again by ${userName}`,
          "dispatch"
        );
        throw createError({ statusCode: 409, statusMessage: `Already delivered on ${conf.confirmed_at} by ${conf.confirmed_by_name}` });
      }
      await conn.query(
        `UPDATE commodity_dispatch_confirmations
         SET confirmed_at = NOW(), confirmed_by_user_id = ?, confirmed_by_name = ?, received_by = ?, note = ?
         WHERE sale_id = ?`,
        [userId, userName, (_i = body == null ? void 0 : body.received_by) != null ? _i : null, (_j = body == null ? void 0 : body.note) != null ? _j : null, id]
      );
      stage = "delivered";
    }
    await conn.query(
      `INSERT INTO commodity_qr_scan_log (sale_id, sale_number, stage, reused, scanned_by_user_id, scanned_by_name, ip)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
      [id, sale.sale_number, stage, userId, userName, ip]
    );
    await auditLog(conn, {
      userId,
      action: stage === "delivered" ? "delivered" : "status_changed",
      module: "trading",
      recordType: "commodity_sale",
      recordId: id,
      referenceNumber: sale.sale_number,
      description: `Commodity ${sale.sale_number} ${stage === "delivered" ? "delivery confirmed" : "gated out"} by ${userName}`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(
      stage === "delivered" ? `\u{1F4E6} <b>Commodity Delivered</b>
${sale.sale_number} \u2014 ${sale.customer_name}
Confirmed by ${userName}` : `\u{1F69A} <b>Commodity Gate-Out</b>
${sale.sale_number} \u2014 ${sale.customer_name}
${(body == null ? void 0 : body.vehicle_number) ? `Vehicle ${body.vehicle_number} \xB7 ` : ""}by ${userName}`,
      "dispatch"
    );
    return { ok: true, stage };
  } catch (e) {
    await conn.rollback().catch(() => {
    });
    throw e;
  } finally {
    conn.release();
  }
});

export { dispatch_post as default };
//# sourceMappingURL=dispatch.post.mjs.map

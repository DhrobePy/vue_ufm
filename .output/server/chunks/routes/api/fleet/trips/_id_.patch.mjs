import { q as defineEventHandler, R as getRouterParam, m as createError, as as readBody, aq as queryOne, ap as query } from '../../../../nitro/nitro.mjs';
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
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const body = await readBody(event);
  const action = body.action;
  const trip = await queryOne(
    `SELECT t.*, v.id AS vid FROM trips t JOIN fleet_vehicles v ON v.id = t.vehicle_id WHERE t.id = ?`,
    [id]
  );
  if (!trip) throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  if (action === "start") {
    await query(`UPDATE trips SET trip_status = 'in_progress' WHERE id = ?`, [id]);
    await query(`UPDATE fleet_vehicles SET status = 'busy' WHERE id = ?`, [trip.vid]);
    return { ok: true, status: "in_progress" };
  }
  if (action === "complete") {
    await query(`UPDATE trips SET trip_status = 'completed' WHERE id = ?`, [id]);
    await query(`UPDATE fleet_vehicles SET status = 'available' WHERE id = ?`, [trip.vid]);
    return { ok: true, status: "completed" };
  }
  if (action === "cancel") {
    await query(`UPDATE trips SET trip_status = 'cancelled' WHERE id = ?`, [id]);
    await query(`UPDATE fleet_vehicles SET status = 'available' WHERE id = ?`, [trip.vid]);
    return { ok: true, status: "cancelled" };
  }
  if (action === "close") {
    await query(`UPDATE trips SET trip_status = 'closed' WHERE id = ?`, [id]);
    return { ok: true, status: "closed" };
  }
  if (action === "report") {
    await query(`UPDATE trips SET report_status = 'reported' WHERE id = ?`, [id]);
    return { ok: true, report_status: "reported" };
  }
  if (action === "add_expense") {
    const { category, description, amount, incurred_by } = body;
    if (!amount) throw createError({ statusCode: 400, statusMessage: "amount required" });
    await query(
      `INSERT INTO trip_expenses (trip_id, category, description, amount, incurred_by) VALUES (?,?,?,?,?)`,
      [id, category || null, description || null, Number(amount), incurred_by || null]
    );
    return { ok: true };
  }
  if (action === "add_advance") {
    const { amount, purpose, given_by } = body;
    if (!amount) throw createError({ statusCode: 400, statusMessage: "amount required" });
    await query(
      `INSERT INTO trip_advances (trip_id, amount, purpose, given_by) VALUES (?,?,?,?)`,
      [id, Number(amount), purpose || null, given_by || null]
    );
    await query(
      `UPDATE trips SET advance_amount = advance_amount + ? WHERE id = ?`,
      [Number(amount), id]
    );
    return { ok: true };
  }
  throw createError({ statusCode: 400, statusMessage: `Unknown action: ${action}` });
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

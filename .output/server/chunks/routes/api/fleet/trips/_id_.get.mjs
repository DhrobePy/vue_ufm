import { n as defineEventHandler, I as getRouterParam, j as createError, a7 as queryOne, a6 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [trip, advances, expenses] = await Promise.all([
    queryOne(
      `SELECT t.*,
              v.registration_no AS vehicle_no, v.vehicle_type, v.make, v.model,
              d.full_name AS driver_name, d.mobile AS driver_mobile,
              c.name AS customer_name, c.phone_number AS customer_phone
       FROM trips t
       JOIN fleet_vehicles v  ON v.id = t.vehicle_id
       JOIN fleet_drivers d   ON d.id = t.driver_id
       LEFT JOIN customers c  ON c.id = t.customer_id
       WHERE t.id = ?`,
      [id]
    ),
    query(`SELECT * FROM trip_advances WHERE trip_id = ? ORDER BY given_at`, [id]),
    query(`SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY incurred_at`, [id])
  ]);
  if (!trip) throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  const totalAdvances = advances.reduce((s, a) => s + Number(a.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const settlement = {
    revenue: Number(trip.trip_charge),
    total_advance: totalAdvances,
    total_expense: totalExpenses,
    final_balance: Number(trip.trip_charge) - totalAdvances - totalExpenses
  };
  return { trip, advances, expenses, settlement };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

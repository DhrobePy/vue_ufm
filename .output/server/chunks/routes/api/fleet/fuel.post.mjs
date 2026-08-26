import { q as defineEventHandler, X as getUserSession, at as readBody, m as createError, ar as queryOne, z as getDb, aj as postFleetExpenseGl } from '../../../nitro/nitro.mjs';
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

const fuel_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const userId = Number((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || 1;
  const body = await readBody(event);
  const {
    vehicle_id,
    driver_id,
    fuel_date,
    fuel_type,
    quantity_liters,
    price_per_liter,
    total_amount,
    odometer_reading,
    station_name,
    receipt_no,
    trip_id,
    payment_method,
    cash_account_id,
    bank_account_id
  } = body != null ? body : {};
  if (!vehicle_id || !fuel_date || !quantity_liters)
    throw createError({ statusCode: 400, statusMessage: "vehicle_id, fuel_date, quantity_liters are required" });
  const prev = await queryOne(
    `SELECT odometer_reading FROM fleet_fuel_logs
     WHERE vehicle_id = ? AND fuel_date <= ? AND odometer_reading IS NOT NULL
     ORDER BY fuel_date DESC, id DESC LIMIT 1`,
    [Number(vehicle_id), fuel_date]
  );
  const qty = Number(quantity_liters);
  const price = price_per_liter ? Number(price_per_liter) : null;
  const total = total_amount ? Number(total_amount) : price && qty ? Math.round(price * qty * 100) / 100 : null;
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO fleet_fuel_logs
         (vehicle_id, driver_id, fuel_date, fuel_type,
          quantity_liters, price_per_liter, total_amount,
          odometer_reading, previous_odometer,
          station_name, receipt_no, trip_id, payment_method, cash_account_id, bank_account_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        Number(vehicle_id),
        driver_id ? Number(driver_id) : null,
        fuel_date,
        fuel_type || "DIESEL",
        qty,
        price,
        total,
        odometer_reading ? Number(odometer_reading) : null,
        (_b = prev == null ? void 0 : prev.odometer_reading) != null ? _b : null,
        station_name || null,
        receipt_no || null,
        trip_id ? Number(trip_id) : null,
        payment_method === "bank" ? "bank" : payment_method === "cash" ? "cash" : null,
        cash_account_id ? Number(cash_account_id) : null,
        bank_account_id ? Number(bank_account_id) : null
      ]
    );
    const fuelLogId = result.insertId;
    if (payment_method && total) {
      const journalEntryId = await postFleetExpenseGl({
        conn,
        expenseAccountName: "Fuel Expense",
        paymentMethod: payment_method === "bank" ? "bank" : "cash",
        cashAccountId: cash_account_id ? Number(cash_account_id) : null,
        bankAccountId: bank_account_id ? Number(bank_account_id) : null,
        amount: total,
        date: fuel_date,
        description: `Fuel \u2014 ${fuel_type || "DIESEL"} ${qty}L${station_name ? " @ " + station_name : ""}`,
        relatedDocumentType: "FleetFuelLog",
        relatedDocumentId: fuelLogId,
        userId
      });
      await conn.query(`UPDATE fleet_fuel_logs SET journal_entry_id = ? WHERE id = ?`, [journalEntryId, fuelLogId]);
    }
    if (odometer_reading) {
      await conn.query(
        `UPDATE fleet_vehicles SET current_odometer = ? WHERE id = ? AND current_odometer < ?`,
        [Number(odometer_reading), Number(vehicle_id), Number(odometer_reading)]
      );
    }
    await conn.commit();
    return { ok: true, id: fuelLogId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { fuel_post as default };
//# sourceMappingURL=fuel.post.mjs.map

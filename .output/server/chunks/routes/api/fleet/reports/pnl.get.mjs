import { h as defineEventHandler, p as getQuery, G as query } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const pnl_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const year = Number(q.year || (/* @__PURE__ */ new Date()).getFullYear());
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const revenue = await query(
    `SELECT DATE_FORMAT(trip_date, '%Y-%m') AS month, COALESCE(SUM(trip_charge),0) AS amount
     FROM trips WHERE trip_date BETWEEN ? AND ? GROUP BY month ORDER BY month`,
    [from, to]
  );
  const tripExpenses = await query(
    `SELECT DATE_FORMAT(t.trip_date, '%Y-%m') AS month, COALESCE(SUM(e.amount),0) AS amount
     FROM trip_expenses e JOIN trips t ON t.id = e.trip_id
     WHERE t.trip_date BETWEEN ? AND ? GROUP BY month ORDER BY month`,
    [from, to]
  );
  const fuelCost = await query(
    `SELECT DATE_FORMAT(fuel_date, '%Y-%m') AS month, COALESCE(SUM(total_amount),0) AS amount
     FROM fleet_fuel_logs WHERE fuel_date BETWEEN ? AND ? GROUP BY month ORDER BY month`,
    [from, to]
  );
  const maintCost = await query(
    `SELECT DATE_FORMAT(request_date, '%Y-%m') AS month, COALESCE(SUM(total_cost),0) AS amount
     FROM maintenance_requests WHERE request_date BETWEEN ? AND ? GROUP BY month ORDER BY month`,
    [from, to]
  );
  const months = [];
  for (let m = 1; m <= 12; m++) months.push(`${year}-${String(m).padStart(2, "0")}`);
  const toMap = (rows2) => Object.fromEntries(rows2.map((r) => [r.month, Number(r.amount)]));
  const revMap = toMap(revenue);
  const expMap = toMap(tripExpenses);
  const fuelMap = toMap(fuelCost);
  const maintMap = toMap(maintCost);
  const rows = months.map((m) => {
    const rev = revMap[m] || 0;
    const exp = expMap[m] || 0;
    const fuel = fuelMap[m] || 0;
    const maint = maintMap[m] || 0;
    const totalCost = exp + fuel + maint;
    return { month: m, revenue: rev, trip_expenses: exp, fuel_cost: fuel, maint_cost: maint, total_cost: totalCost, profit: rev - totalCost };
  });
  const totals = rows.reduce((acc, r) => ({
    revenue: acc.revenue + r.revenue,
    trip_expenses: acc.trip_expenses + r.trip_expenses,
    fuel_cost: acc.fuel_cost + r.fuel_cost,
    maint_cost: acc.maint_cost + r.maint_cost,
    total_cost: acc.total_cost + r.total_cost,
    profit: acc.profit + r.profit
  }), { revenue: 0, trip_expenses: 0, fuel_cost: 0, maint_cost: 0, total_cost: 0, profit: 0 });
  const [minRow] = await query(`SELECT MIN(YEAR(trip_date)) AS min_year FROM trips`, []);
  const minYear = Number((minRow == null ? void 0 : minRow.min_year) || year);
  const years = Array.from({ length: (/* @__PURE__ */ new Date()).getFullYear() - minYear + 2 }, (_, i) => minYear + i);
  return { rows, totals, year, years };
});

export { pnl_get as default };
//# sourceMappingURL=pnl.get.mjs.map

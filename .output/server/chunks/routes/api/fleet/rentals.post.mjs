import { q as defineEventHandler, X as getUserSession, m as createError, au as readBody, z as getDb, E as getGLAccountId, am as postJournalEntry, ai as postCustomerLedger, g as auditLog, aO as sendTelegram } from '../../../nitro/nitro.mjs';
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

const rentals_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const body = await readBody(event);
  const {
    vehicle_id,
    customer_id,
    rental_type,
    start_datetime,
    end_datetime,
    rate,
    total_amount,
    notes
  } = body != null ? body : {};
  if (!vehicle_id) throw createError({ statusCode: 400, statusMessage: "vehicle_id is required" });
  if (!customer_id) throw createError({ statusCode: 400, statusMessage: "customer_id is required" });
  if (!start_datetime || !end_datetime) throw createError({ statusCode: 400, statusMessage: "start and end date/time are required" });
  const total = Number(total_amount);
  if (!total || total <= 0) throw createError({ statusCode: 400, statusMessage: "total_amount must be greater than 0" });
  if (new Date(end_datetime) < new Date(start_datetime))
    throw createError({ statusCode: 400, statusMessage: "End date cannot be before the start date" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[vehicle]] = await conn.query(`SELECT registration_no FROM fleet_vehicles WHERE id = ?`, [vehicle_id]);
    const [[customer]] = await conn.query(`SELECT name FROM customers WHERE id = ? FOR UPDATE`, [customer_id]);
    if (!vehicle) throw createError({ statusCode: 404, statusMessage: "Vehicle not found" });
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    const [[incomeAcc]] = await conn.query(
      `SELECT id FROM chart_of_accounts WHERE name = 'Vehicle Rental Income' AND status = 'active' LIMIT 1`
    );
    if (!arId || !incomeAcc)
      throw createError({ statusCode: 422, statusMessage: `Missing GL account setup (AR / Vehicle Rental Income) \u2014 check Chart of Accounts` });
    const startDate = String(start_datetime).slice(0, 10);
    const journalEntryId = await postJournalEntry(conn, {
      date: startDate,
      description: `Vehicle rental for ${customer.name} (${vehicle.registration_no})`,
      docType: "VehicleRental",
      docId: 0,
      // patched below once the rental row exists
      userId,
      lines: [
        { accountId: arId, debit: total, credit: 0, memo: `Rental \u2014 ${vehicle.registration_no}` },
        { accountId: incomeAcc.id, debit: 0, credit: total, memo: `Rental income from ${customer.name}` }
      ]
    });
    const [result] = await conn.query(
      `INSERT INTO vehicle_rentals
         (vehicle_id, customer_id, rental_type, start_datetime, end_datetime,
          rate, total_amount, status, notes, journal_entry_id, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?)`,
      [
        Number(vehicle_id),
        Number(customer_id),
        rental_type || "Daily",
        start_datetime,
        end_datetime,
        Number(rate) || 0,
        total,
        (notes == null ? void 0 : notes.trim()) || null,
        journalEntryId,
        userId
      ]
    );
    const rentalId = result.insertId;
    await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [rentalId, journalEntryId]);
    await postCustomerLedger(conn, {
      customerId: Number(customer_id),
      date: startDate,
      transactionType: "invoice",
      referenceType: "vehicle_rental",
      referenceId: rentalId,
      invoiceNumber: `RENT-${rentalId}`,
      description: `Vehicle rental \u2014 ${vehicle.registration_no} (${rental_type || "Daily"})`,
      debit: total,
      credit: 0,
      journalEntryId,
      userId
    });
    await auditLog(conn, {
      userId,
      action: "created",
      module: "fleet",
      recordType: "vehicle_rental",
      recordId: rentalId,
      referenceNumber: `RENT-${rentalId}`,
      description: `Vehicle rental booked \u2014 ${vehicle.registration_no} for ${customer.name} \u2014 \u09F3${total.toLocaleString()}`,
      severity: "info"
    });
    await conn.commit();
    sendTelegram(`\u{1F69A} <b>Vehicle Rental Booked</b>
${vehicle.registration_no} \u2192 ${customer.name}
\u09F3${total.toLocaleString()} (${rental_type || "Daily"})
by ${userName}`, "orders");
    return { ok: true, id: rentalId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { rentals_post as default };
//# sourceMappingURL=rentals.post.mjs.map

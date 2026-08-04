import { getDb } from '~/server/utils/db'
import { getGLAccountId, postJournalEntry, postCustomerLedger } from '~/server/utils/creditOrders'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'

/**
 * POST /api/fleet/rentals — vehicle rental income (spec: logistics/rentals),
 * previously entirely unbuilt in Vue despite pre-seeded 'Vehicle Rental
 * Income' and AR GL accounts. Invoice-style: DR Accounts Receivable /
 * CR Vehicle Rental Income, posted immediately at booking (matches legacy),
 * plus a customer_ledger debit row so it counts toward the same
 * ledger-truth outstanding balance every other module uses.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`

  const body = await readBody(event)
  const {
    vehicle_id, customer_id, rental_type, start_datetime, end_datetime,
    rate, total_amount, notes,
  } = body ?? {}

  if (!vehicle_id) throw createError({ statusCode: 400, statusMessage: 'vehicle_id is required' })
  if (!customer_id) throw createError({ statusCode: 400, statusMessage: 'customer_id is required' })
  if (!start_datetime || !end_datetime) throw createError({ statusCode: 400, statusMessage: 'start and end date/time are required' })
  const total = Number(total_amount)
  if (!total || total <= 0) throw createError({ statusCode: 400, statusMessage: 'total_amount must be greater than 0' })
  if (new Date(end_datetime) < new Date(start_datetime))
    throw createError({ statusCode: 400, statusMessage: 'End date cannot be before the start date' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[vehicle]] = await conn.query<any>(`SELECT registration_no FROM fleet_vehicles WHERE id = ?`, [vehicle_id])
    const [[customer]] = await conn.query<any>(`SELECT name FROM customers WHERE id = ? FOR UPDATE`, [customer_id])
    if (!vehicle) throw createError({ statusCode: 404, statusMessage: 'Vehicle not found' })
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    const arId  = await getGLAccountId(conn, 'Accounts Receivable')
    const [[incomeAcc]] = await conn.query<any>(
      `SELECT id FROM chart_of_accounts WHERE name = 'Vehicle Rental Income' AND status = 'active' LIMIT 1`,
    )
    if (!arId || !incomeAcc)
      throw createError({ statusCode: 422, statusMessage: `Missing GL account setup (AR / Vehicle Rental Income) — check Chart of Accounts` })

    const startDate = String(start_datetime).slice(0, 10)
    const journalEntryId = await postJournalEntry(conn, {
      date: startDate,
      description: `Vehicle rental for ${customer.name} (${vehicle.registration_no})`,
      docType: 'VehicleRental',
      docId: 0, // patched below once the rental row exists
      userId,
      lines: [
        { accountId: arId, debit: total, credit: 0, memo: `Rental — ${vehicle.registration_no}` },
        { accountId: incomeAcc.id, debit: 0, credit: total, memo: `Rental income from ${customer.name}` },
      ],
    })

    const [result] = await conn.query<any>(
      `INSERT INTO vehicle_rentals
         (vehicle_id, customer_id, rental_type, start_datetime, end_datetime,
          rate, total_amount, status, notes, journal_entry_id, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?)`,
      [
        Number(vehicle_id), Number(customer_id), rental_type || 'Daily',
        start_datetime, end_datetime, Number(rate) || 0, total,
        notes?.trim() || null, journalEntryId, userId,
      ],
    )
    const rentalId = result.insertId

    await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [rentalId, journalEntryId])

    await postCustomerLedger(conn, {
      customerId: Number(customer_id),
      date: startDate,
      transactionType: 'invoice',
      referenceType: 'vehicle_rental',
      referenceId: rentalId,
      invoiceNumber: `RENT-${rentalId}`,
      description: `Vehicle rental — ${vehicle.registration_no} (${rental_type || 'Daily'})`,
      debit: total,
      credit: 0,
      journalEntryId,
      userId,
    })

    await auditLog(conn, {
      userId, action: 'created', module: 'fleet', recordType: 'vehicle_rental',
      recordId: rentalId, referenceNumber: `RENT-${rentalId}`,
      description: `Vehicle rental booked — ${vehicle.registration_no} for ${customer.name} — ৳${total.toLocaleString()}`,
      severity: 'info',
    })

    await conn.commit()
    sendTelegram(`🚚 <b>Vehicle Rental Booked</b>\n${vehicle.registration_no} → ${customer.name}\n৳${total.toLocaleString()} (${rental_type || 'Daily'})\nby ${userName}`, 'orders')
    return { ok: true, id: rentalId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

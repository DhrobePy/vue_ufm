/**
 * Server plugin — runs once at Nitro startup.
 * Applies safe, idempotent schema patches so they don't need a manual
 * migration step on the production server.
 */
import { getDb } from '~/server/utils/db'

export default defineNitroPlugin(async () => {
  try {
    const db = getDb()
    // Add order_id to customer_payments so payments can be linked back to
    // the specific credit order they were collected for.
    // MySQL 8.0+ silently no-ops if the column already exists.
    await db.query(
      `ALTER TABLE customer_payments
       ADD COLUMN IF NOT EXISTS order_id INT NULL DEFAULT NULL
         COMMENT 'credit_orders.id this payment was collected for'`,
    )
  } catch (e) {
    console.warn('[db-migrate] customer_payments.order_id patch failed:', e)
  }

  try {
    const db2 = getDb()
    await db2.query(
      `ALTER TABLE credit_orders
       ADD COLUMN IF NOT EXISTS production_seq INT NOT NULL DEFAULT 0
         COMMENT 'Manual production priority rank set by admin (0 = unset)'`,
    )
  } catch (e) {
    console.warn('[db-migrate] credit_orders.production_seq patch failed:', e)
  }

  // ── purchase_payments_adnan column extensions ─────────────────────────────
  // The original schema used minimal columns.  The payment API now stores
  // richer denormalised data.  Each ADD COLUMN IF NOT EXISTS is a no-op when
  // the column already exists.
  const paymentCols: [string, string][] = [
    ['payment_voucher_number', 'VARCHAR(30)  NULL DEFAULT NULL'],
    ['po_number',              'VARCHAR(30)  NULL DEFAULT NULL'],
    ['supplier_id',            'INT UNSIGNED NULL DEFAULT NULL'],
    ['supplier_name',          'VARCHAR(180) NULL DEFAULT NULL'],
    ['amount_paid',            'DECIMAL(15,2) NULL DEFAULT NULL'],
    ['bank_name',              'VARCHAR(120) NULL DEFAULT NULL'],
    ['payment_type',           "VARCHAR(30)  NOT NULL DEFAULT 'regular'"],
    ['remarks',                'TEXT         NULL DEFAULT NULL'],
  ]
  for (const [col, def] of paymentCols) {
    try {
      const db3 = getDb()
      await db3.query(
        `ALTER TABLE purchase_payments_adnan ADD COLUMN IF NOT EXISTS ${col} ${def}`,
      )
    } catch (e) {
      console.warn(`[db-migrate] purchase_payments_adnan.${col} patch failed:`, e)
    }
  }
})

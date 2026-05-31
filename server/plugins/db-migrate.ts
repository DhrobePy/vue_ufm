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
    // Never crash the server over a migration — log and continue.
    console.warn('[db-migrate] customer_payments.order_id patch failed:', e)
  }
})

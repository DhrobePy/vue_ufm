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
})

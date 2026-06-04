/**
 * Server plugin — runs once at Nitro startup.
 * Applies safe, idempotent schema patches so they don't need a manual
 * migration step on the production server.
 *
 * MySQL 5.7 compatibility:
 *   Use plain  ADD COLUMN (not ADD COLUMN IF NOT EXISTS — MySQL 8.0+ only).
 *   The catch block silently swallows error 1060 "Duplicate column name",
 *   which means the column already exists — that is the expected outcome on
 *   every restart after the first.  Any other error is still logged.
 *
 * Order matters:
 *   1. CREATE TABLE IF NOT EXISTS (parent tables first)
 *   2. ADD COLUMN patches on existing tables
 *   3. MODIFY COLUMN patches (widen ENUMs → VARCHAR)
 */
import { getDb } from '~/server/utils/db'

/** Add a column; silently skip if it already exists (MySQL 5.7-safe). */
async function addCol(db: any, table: string, col: string, def: string) {
  try {
    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`)
  } catch (e: any) {
    // 1060 = Duplicate column name — column already present, nothing to do
    if (e?.errno !== 1060 && !String(e?.message ?? '').includes('Duplicate column')) {
      console.warn(`[db-migrate] ${table}.${col} ADD COLUMN failed:`, e)
    }
  }
}

export default defineNitroPlugin(async () => {
  const db = getDb()

  // ── 1. Ensure purchase_orders_adnan exists ────────────────────────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders_adnan (
        id                         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        po_number                  VARCHAR(30)  NOT NULL UNIQUE,
        po_date                    DATE         NOT NULL,
        supplier_id                INT UNSIGNED,
        supplier_name              VARCHAR(180),
        wheat_origin               VARCHAR(80),
        expected_delivery_date     DATE,
        quantity_kg                DECIMAL(12,3) NOT NULL,
        unit_price_per_kg          DECIMAL(10,4) NOT NULL,
        total_order_value          DECIMAL(15,2) NOT NULL,
        total_received_qty         DECIMAL(12,3) DEFAULT 0,
        qty_yet_to_receive         DECIMAL(12,3),
        total_paid                 DECIMAL(15,2) DEFAULT 0,
        balance_payable            DECIMAL(15,2),
        po_status                  ENUM('pending','confirmed','partial','closed','cancelled') DEFAULT 'pending',
        delivery_status            ENUM('pending','partial','completed') DEFAULT 'pending',
        payment_status             ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
        is_delivery_locked         TINYINT(1) DEFAULT 0,
        delivery_lock_reason       TEXT,
        delivery_locked_by_user_id INT UNSIGNED,
        delivery_locked_at         DATETIME,
        branch_id                  INT UNSIGNED,
        created_by_user_id         INT UNSIGNED,
        remarks                    TEXT,
        created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at                 DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] purchase_orders_adnan create failed:', e)
  }

  // ── 2. Ensure goods_received_adnan exists ─────────────────────────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS goods_received_adnan (
        id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        grn_number               VARCHAR(30) NOT NULL UNIQUE,
        grn_date                 DATE NOT NULL,
        purchase_order_id        INT UNSIGNED,
        po_number                VARCHAR(30),
        supplier_id              INT UNSIGNED,
        supplier_name            VARCHAR(180),
        quantity_received_kg     DECIMAL(12,3) NOT NULL,
        unit_price_per_kg        DECIMAL(10,4),
        total_value              DECIMAL(15,2),
        weight_variance          DECIMAL(10,3) DEFAULT 0,
        variance_percentage      DECIMAL(8,4)  DEFAULT 0,
        quality_grade            ENUM('A','B','C','R') DEFAULT 'A',
        truck_number             VARCHAR(40),
        transporter_name         VARCHAR(120),
        unload_point_name        VARCHAR(120),
        unload_point_branch_id   INT UNSIGNED,
        grn_status               ENUM('draft','confirmed','rejected') DEFAULT 'confirmed',
        notes                    TEXT,
        created_by_user_id       INT UNSIGNED,
        created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] goods_received_adnan create failed:', e)
  }

  // ── 3. Ensure purchase_payments_adnan exists ──────────────────────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_payments_adnan (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        purchase_order_id    INT UNSIGNED,
        payment_date         DATE NOT NULL,
        amount               DECIMAL(15,2) NOT NULL DEFAULT 0,
        payment_method       ENUM('bank','cash','cheque','other') DEFAULT 'bank',
        reference_number     VARCHAR(80),
        bank_account_id      INT UNSIGNED,
        payment_status       ENUM('pending','approved','rejected') DEFAULT 'approved',
        created_by_user_id   INT UNSIGNED,
        approved_by_user_id  INT UNSIGNED,
        notes                TEXT,
        created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] purchase_payments_adnan create failed:', e)
  }

  // ── 4. Ensure supplier_ledger exists ──────────────────────────────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS supplier_ledger (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id      INT UNSIGNED NOT NULL,
        entry_date       DATE NOT NULL,
        entry_type       ENUM('Purchase Order','Payment Made','Credit Note','Opening Balance','Adjustment') NOT NULL,
        reference_number VARCHAR(80),
        description      TEXT,
        debit_amount     DECIMAL(15,2) DEFAULT 0,
        credit_amount    DECIMAL(15,2) DEFAULT 0,
        running_balance  DECIMAL(15,2) DEFAULT 0,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] supplier_ledger create failed:', e)
  }

  // ── 5. purchase_payments_adnan column extensions ──────────────────────────
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
    await addCol(db, 'purchase_payments_adnan', col, def)
  }

  // ── 6. customer_payments column extensions ───────────────────────────────
  const cpCols: [string, string][] = [
    ['order_id',                'INT NULL DEFAULT NULL COMMENT \'credit_orders.id this payment was collected for\''],
    ['payment_number',          'VARCHAR(30) NULL DEFAULT NULL'],
    ['payment_type',            "VARCHAR(30) NULL DEFAULT 'invoice_payment'"],
    ['cash_account_id',         'INT UNSIGNED NULL DEFAULT NULL'],
    ['cheque_number',           'VARCHAR(50) NULL DEFAULT NULL'],
    ['cheque_date',             'DATE NULL DEFAULT NULL'],
    ['bank_transaction_type',   'VARCHAR(50) NULL DEFAULT NULL'],
    ['journal_entry_id',        'INT UNSIGNED NULL DEFAULT NULL'],
    ['collected_by_employee_id','INT UNSIGNED NULL DEFAULT NULL'],
    ['allocated_amount',        'DECIMAL(15,2) NULL DEFAULT NULL'],
    ['allocation_status',       "VARCHAR(30) NULL DEFAULT NULL COMMENT 'allocated | partial | unallocated'"],
  ]
  for (const [col, def] of cpCols) {
    await addCol(db, 'customer_payments', col, def)
  }

  // Widen payment_method from old ENUM to VARCHAR(50) so new values fit
  try {
    await db.query(
      `ALTER TABLE customer_payments MODIFY COLUMN payment_method VARCHAR(50) NULL DEFAULT NULL`,
    )
  } catch (e) {
    console.warn('[db-migrate] customer_payments.payment_method widen failed:', e)
  }

  // ── 7. credit_orders.production_seq ──────────────────────────────────────
  await addCol(
    db, 'credit_orders', 'production_seq',
    "INT NOT NULL DEFAULT 0 COMMENT 'Manual production priority rank set by admin (0 = unset)'",
  )

  // ── 8. bank_accounts.opening_balance ─────────────────────────────────────
  //   Used by unified-ledger endpoint to calculate the pre-GL seed balance.
  await addCol(
    db, 'bank_accounts', 'opening_balance',
    "DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Pre-GL seed balance — balance at the time this account was first connected to GL'",
  )

  // ── 9. Widen customer_ledger.transaction_type → VARCHAR(50) ──────────────
  //   Original column may be a narrow ENUM that doesn't include all values
  //   used by the application ('payment', 'invoice', 'advance_payment',
  //   'debit_note', 'credit_note', 'credit_note_applied').
  //   MODIFY COLUMN to VARCHAR(50) makes it accept any value.
  try {
    await db.query(
      `ALTER TABLE customer_ledger MODIFY COLUMN transaction_type VARCHAR(50) NULL DEFAULT NULL`,
    )
  } catch (e) {
    console.warn('[db-migrate] customer_ledger.transaction_type widen failed:', e)
  }

  // ── 10. Widen customer_ledger.reference_type → VARCHAR(50) ───────────────
  //   Guard against a narrow ENUM here too.
  try {
    await db.query(
      `ALTER TABLE customer_ledger MODIFY COLUMN reference_type VARCHAR(50) NULL DEFAULT NULL`,
    )
  } catch (e) {
    console.warn('[db-migrate] customer_ledger.reference_type widen failed:', e)
  }
})

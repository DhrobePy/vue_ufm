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

  // ── 11. purchase_payments_adnan — columns added post-launch ──────────────
  //   Previously these were run via ALTER TABLE inside request handlers
  //   (every POST /api/purchase/payments).  Moved here so DDL runs once at
  //   startup and never inside a transaction.
  await addCol(db, 'purchase_payments_adnan', 'is_posted',       'TINYINT(1) NOT NULL DEFAULT 1')
  await addCol(db, 'purchase_payments_adnan', 'journal_entry_id','INT DEFAULT NULL')

  // ── 12. purchase_orders_adnan — po_payment_terms ─────────────────────────
  //   Previously run inside every POST /api/purchase/orders request.
  await addCol(db, 'purchase_orders_adnan', 'po_payment_terms', "VARCHAR(50) DEFAULT 'Credit 30'")

  // ── 13. notifications table ───────────────────────────────────────────────
  //   Previously created via CREATE TABLE IF NOT EXISTS inside every
  //   GET /api/notifications request (polled every 30 s per user — very hot).
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id           INT          AUTO_INCREMENT PRIMARY KEY,
        stable_id    VARCHAR(150) NOT NULL,
        user_id      INT          NOT NULL,
        text         VARCHAR(500) NOT NULL,
        type         ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
        route        VARCHAR(300) NOT NULL DEFAULT '/',
        module       VARCHAR(50),
        reference_id INT,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_stable (stable_id),
        INDEX  idx_user_time (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  } catch (e) {
    console.warn('[db-migrate] notifications create failed:', e)
  }

  // ── 14. system_settings table ─────────────────────────────────────────────
  //   Previously created on every GET/PUT /api/settings/documents request.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key   VARCHAR(120) NOT NULL PRIMARY KEY,
        setting_value MEDIUMTEXT,
        updated_by    INT          DEFAULT NULL,
        updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  } catch (e) {
    console.warn('[db-migrate] system_settings create failed:', e)
  }

  // ── 15. order_deletion_log table ─────────────────────────────────────────
  //   Previously created on every DELETE /api/credit-sales/:id request.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_deletion_log (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        order_id           INT NOT NULL,
        order_number       VARCHAR(50) NOT NULL,
        customer_id        INT,
        customer_name      VARCHAR(200),
        total_amount       DECIMAL(15,2),
        amount_paid        DECIMAL(15,2),
        balance_due        DECIMAL(15,2),
        order_status       VARCHAR(50),
        deleted_by_user_id INT,
        deleted_by_name    VARCHAR(200),
        deletion_reason    TEXT,
        deleted_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address         VARCHAR(45),
        INDEX idx_order_id (order_id),
        INDEX idx_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  } catch (e) {
    console.warn('[db-migrate] order_deletion_log create failed:', e)
  }

  // ── 16. user_permissions table ───────────────────────────────────────────────
  //   One row per user. Stores the full permission blob as JSON.
  //   NOTE: users.id is BIGINT UNSIGNED — user_id must match exactly.
  //   No FK constraint (avoids type-mismatch failures on different MySQL/MariaDB
  //   versions where the implicit type may differ from the declared schema).
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id          BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        data_scope       VARCHAR(20)     NOT NULL DEFAULT 'branch'
                           COMMENT 'all | branch | own',
        allowed_branches LONGTEXT        NULL     COMMENT 'JSON array of branch slugs',
        permissions      LONGTEXT        NOT NULL COMMENT 'JSON: {module_key:{enabled,pages:[],actions:{pg:{act:bool}}}}',
        updated_by       BIGINT UNSIGNED NULL,
        updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_updated_at (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] user_permissions create failed:', e)
  }

  // ── 17. product_variants — reorder_level ─────────────────────────────────
  //   Referenced by hub.get.ts (Products Hub) for the stock-level indicator.
  await addCol(
    db, 'product_variants', 'reorder_level',
    "INT NOT NULL DEFAULT 0 COMMENT 'Minimum stock level — triggers low-stock indicator in Products Hub'",
  )

  // ── 18. products — description ────────────────────────────────────────────
  //   Previously dropped in the component layer; now fetched by hub.get.ts.
  await addCol(
    db, 'products', 'description',
    'TEXT NULL DEFAULT NULL',
  )

  // ── 19. product_variants — barcode ────────────────────────────────────────
  //   Queried by hub.get.ts; missing from production schema.
  await addCol(
    db, 'product_variants', 'barcode',
    'VARCHAR(100) NULL DEFAULT NULL',
  )

  // ── 20. product_variants — stock_qty ─────────────────────────────────────
  //   Authoritative on-hand quantity.  Used by hub.get.ts and pos/products.get.ts.
  await addCol(
    db, 'product_variants', 'stock_qty',
    "DECIMAL(12,3) NOT NULL DEFAULT 0 COMMENT 'Authoritative stock quantity'",
  )

  // ── 21. product_variants — reserved_qty ──────────────────────────────────
  //   Quantity reserved for pending orders.  Available stock = stock_qty - reserved_qty.
  await addCol(
    db, 'product_variants', 'reserved_qty',
    "DECIMAL(12,3) NOT NULL DEFAULT 0 COMMENT 'Reserved for pending orders'",
  )

  // ── 22. product_variants — unit_price ─────────────────────────────────────
  //   Fallback base price when no branch-specific product_prices row exists.
  //   Used by hub.get.ts (base_price) and pos/products.get.ts (COALESCE fallback).
  await addCol(
    db, 'product_variants', 'unit_price',
    "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Fallback base price if no branch price set'",
  )

  // ── 23. credit_orders — dispatch_pin ──────────────────────────────────────
  //   6-digit numeric PIN printed on the invoice.  Dispatcher enters it on the
  //   mobile scan page (/d/:order_number) to confirm goods have left the warehouse.
  //   Status transition: ready_to_ship → dispatched.
  await addCol(
    db, 'credit_orders', 'dispatch_pin',
    "VARCHAR(10) NULL DEFAULT NULL COMMENT '6-digit PIN for dispatcher to confirm dispatch via QR scan'",
  )

  // ── 24. credit_orders — delivery_pin ─────────────────────────────────────
  //   Provisioned for future driver-side delivery confirmation.
  //   Not active yet — toggle in Admin > Settings > Delivery when needed.
  await addCol(
    db, 'credit_orders', 'delivery_pin',
    "VARCHAR(10) NULL DEFAULT NULL COMMENT '6-digit PIN for driver delivery confirmation (provisioned, not active)'",
  )

  // ── 25. order_delivery_scans table ───────────────────────────────────────
  //   Audit trail of every QR scan: who scanned, what PIN was tried, result.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_delivery_scans (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id     INT UNSIGNED NOT NULL,
        order_number VARCHAR(50)  NOT NULL,
        scan_type    ENUM('view','dispatch','delivery') NOT NULL DEFAULT 'view',
        pin_used     VARCHAR(10)  NULL,
        pin_correct  TINYINT(1)   NOT NULL DEFAULT 0,
        scanned_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ip_address   VARCHAR(45)  NULL,
        user_agent   VARCHAR(500) NULL,
        notes        VARCHAR(255) NULL,
        INDEX idx_order_id  (order_id),
        INDEX idx_order_num (order_number),
        INDEX idx_scanned   (scanned_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] order_delivery_scans create failed:', e)
  }

  // ── 26. Backfill dispatch_pin / delivery_pin for pre-QR-system orders ────────
  //   Orders created before migrations #23-24 ran have NULL dispatch_pin.
  //   Without a PIN they can never be confirmed via QR scan.
  //   This generates and saves PINs for all such orders (runs once; idempotent
  //   because subsequent restarts find dispatch_pin IS NOT NULL for all rows).
  try {
    const [nullRows] = await db.query(
      `SELECT id FROM credit_orders WHERE dispatch_pin IS NULL LIMIT 500`,
    ) as any
    if (Array.isArray(nullRows) && nullRows.length > 0) {
      for (const row of nullRows) {
        const dp   = Math.floor(100000 + Math.random() * 900000).toString()
        const delp = Math.floor(100000 + Math.random() * 900000).toString()
        await db.query(
          `UPDATE credit_orders SET dispatch_pin = ?, delivery_pin = ? WHERE id = ?`,
          [dp, delp, row.id],
        )
      }
      console.log(`[db-migrate] backfilled dispatch_pin for ${nullRows.length} order(s)`)
    }
  } catch (e) {
    console.warn('[db-migrate] backfill dispatch_pin failed:', e)
  }

  console.log('[db-migrate] startup migrations complete')
})

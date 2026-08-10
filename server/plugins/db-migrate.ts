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

/**
 * Rename a column when a table pre-existed under a different name than the
 * one our CREATE TABLE IF NOT EXISTS assumed (so that statement was a no-op).
 * Safe to run every restart: 1054 = old name doesn't exist (already renamed,
 * or a fresh install already has the new name from CREATE TABLE); 1060 =
 * new name already exists too — leave both alone rather than guess.
 */
async function renameCol(db: any, table: string, oldName: string, newName: string, def: string) {
  try {
    await db.query(`ALTER TABLE \`${table}\` CHANGE COLUMN \`${oldName}\` \`${newName}\` ${def}`)
  } catch (e: any) {
    if (e?.errno !== 1054 && e?.errno !== 1060) {
      console.warn(`[db-migrate] ${table} rename ${oldName}->${newName} failed:`, e)
    }
  }
}

/** Add a UNIQUE key; silently skip if it already exists or data violates it. */
async function addUnique(db: any, table: string, keyName: string, cols: string) {
  try {
    await db.query(`ALTER TABLE \`${table}\` ADD UNIQUE KEY \`${keyName}\` (${cols})`)
  } catch (e: any) {
    // 1061 = key name already exists, 1557/1062 = duplicate data would violate it
    if (![1061, 1557, 1062].includes(e?.errno)) {
      console.warn(`[db-migrate] ${table} ADD UNIQUE ${keyName} failed:`, e)
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

  // payment_type was ALSO a restrictive ENUM('advance','invoice_payment',
  // 'partial_payment') in the original schema, so the addCol() attempt above
  // silently no-op'd (column already existed) and never widened it. Any new
  // payment_type value (e.g. from the customer-level Collect Payment flow)
  // was rejected by MySQL with a data-truncated error — the "server error"
  // seen on /credit-sales/collect. Same fix as payment_method above.
  try {
    await db.query(
      `ALTER TABLE customer_payments MODIFY COLUMN payment_type VARCHAR(30) NULL DEFAULT 'invoice_payment'`,
    )
  } catch (e) {
    console.warn('[db-migrate] customer_payments.payment_type widen failed:', e)
  }

  // allocation_status has the same restrictive-ENUM history; widen for the
  // same reason even though current values happen to already fit its enum.
  try {
    await db.query(
      `ALTER TABLE customer_payments MODIFY COLUMN allocation_status VARCHAR(30) NULL DEFAULT 'unallocated'`,
    )
  } catch (e) {
    console.warn('[db-migrate] customer_payments.allocation_status widen failed:', e)
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

  // ── 26. credit_orders.status ENUM → VARCHAR ─────────────────────────────────
  //   Migration #42 below relabels 'dispatched'/'shipped' orders to the new
  //   'goods_on_board' value, and workflow.post.ts / verify/confirm.post.ts
  //   write 'goods_on_board' and 'shipped' directly — neither value was ever
  //   in status's original restrictive ENUM, so every one of those writes
  //   failed with "Data truncated for column 'status'" (or silently blanked
  //   the column under non-strict SQL mode). Converting to VARCHAR removes
  //   this whole class of bug — matches the fix already applied to
  //   payment_type. (An earlier version of this migration first widened the
  //   ENUM to a fixed value list before converting to VARCHAR — pointless
  //   and, once this VARCHAR conversion has run once, actively broken: it
  //   permanently fails every restart after, since existing rows already
  //   hold values like 'goods_on_board' that the fixed list never included.
  //   Removed; this VARCHAR conversion alone is sufficient and idempotent.)
  //   MUST run before #42's backfill UPDATE, hence its placement here.
  try {
    await db.query(`
      ALTER TABLE credit_orders MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'pending_approval'
    `)
  } catch (e) {
    console.warn('[db-migrate] credit_orders.status VARCHAR widen failed:', e)
  }

  // ── 27. Backfill dispatch_pin / delivery_pin for pre-QR-system orders ────────
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

  // ── 28. products — base_sku ──────────────────────────────────────────────
  await addCol(db, 'products', 'base_sku', "VARCHAR(50) NULL DEFAULT NULL COMMENT 'Short unique SKU prefix, e.g. UFF'")

  // ── 29. product_variants — sku ────────────────────────────────────────────
  await addCol(db, 'product_variants', 'sku', "VARCHAR(100) NULL DEFAULT NULL COMMENT 'Full auto-generated SKU, e.g. UFF-50KG-A'")

  // ── 30. product_variants — grade ─────────────────────────────────────────
  await addCol(db, 'product_variants', 'grade', "VARCHAR(50) NULL DEFAULT NULL COMMENT 'e.g. A-Grade, B'")

  // ── 31. product_variants — unit_of_measure ────────────────────────────────
  await addCol(db, 'product_variants', 'unit_of_measure', "VARCHAR(20) NOT NULL DEFAULT 'bag' COMMENT 'pcs | litre | kg | gm | bag'")

  // ── 32. product_variants — weight_kg ─────────────────────────────────────
  await addCol(db, 'product_variants', 'weight_kg', "DECIMAL(8,2) NULL DEFAULT NULL COMMENT 'Numeric weight for calculations'")

  // ── 33. price_change_log table ───────────────────────────────────────────
  //   Audit trail for every price set / update / archive / engine event.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS price_change_log (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        variant_id  INT UNSIGNED NOT NULL,
        branch_id   INT UNSIGNED NOT NULL,
        old_price   DECIMAL(10,2) NULL,
        new_price   DECIMAL(10,2) NULL,
        change_type VARCHAR(20)  NOT NULL DEFAULT 'set'
                      COMMENT 'set | update | archive | engine',
        changed_by  VARCHAR(150) NULL,
        changed_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        note        VARCHAR(255) NULL,
        INDEX idx_variant  (variant_id),
        INDEX idx_branch   (branch_id),
        INDEX idx_changed  (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] price_change_log create failed:', e)
  }

  // ── 34. branches — branch_type + source_branch_id (regional pricing) ──────
  //   factory      = produces flour, has ex-factory base prices
  //   sales_region = district sales point; price = source factory + charges
  //   office       = administrative, never priced
  await addCol(db, 'branches', 'branch_type', "VARCHAR(20) NULL DEFAULT NULL COMMENT 'factory | sales_region | office'")
  await addCol(db, 'branches', 'source_branch_id', "INT UNSIGNED NULL DEFAULT NULL COMMENT 'Factory branch that feeds this sales region'")
  // server/api/branches.post.ts / [id].put.ts write this denormalized flag
  // alongside branch_type but this migration never created the column —
  // a fresh/wiped database was missing it entirely until now.
  await addCol(db, 'branches', 'is_factory', "TINYINT(1) NOT NULL DEFAULT 0")

  // Seed branch_type once — only rows still NULL are touched
  try {
    await db.query(`UPDATE branches SET branch_type = 'factory' WHERE branch_type IS NULL AND id IN (1, 2)`)
    await db.query(`UPDATE branches SET branch_type = 'office' WHERE branch_type IS NULL AND code = 'HO'`)
    await db.query(`UPDATE branches SET branch_type = 'sales_region' WHERE branch_type IS NULL`)
    await db.query(`UPDATE branches SET is_factory = (branch_type = 'factory')`)
  } catch (e) {
    console.warn('[db-migrate] branch_type seed failed:', e)
  }

  // ── 35. branch_price_components — named charges per branch ────────────────
  //   charge_type 'base'       → baked into the stored region price
  //   charge_type 'mini_truck' → per-bag surcharge applied at order time only
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS branch_price_components (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        branch_id    INT UNSIGNED NOT NULL,
        name         VARCHAR(100) NOT NULL COMMENT 'e.g. Freight (Big Truck), Handling, Toll',
        weight_class VARCHAR(10)  NOT NULL DEFAULT 'all' COMMENT '50 | 74 | all',
        charge_type  VARCHAR(20)  NOT NULL DEFAULT 'base' COMMENT 'base | mini_truck',
        amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
        is_active    TINYINT(1)   NOT NULL DEFAULT 1,
        sort_order   INT          NOT NULL DEFAULT 0,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bpc_branch (branch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] branch_price_components create failed:', e)
  }

  // ── 36. user_approval_limits — delegated order-approval authority ─────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_approval_limits (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id          INT UNSIGNED NOT NULL UNIQUE,
        max_order_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        set_by_user_id   INT UNSIGNED NULL,
        created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] user_approval_limits failed:', e) }

  // ── 37. order_approval_conditions — production hold + dispatch clearance ──
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_approval_conditions (
        id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id               INT UNSIGNED NOT NULL UNIQUE,
        production_hold        TINYINT(1) NOT NULL DEFAULT 0,
        production_hold_note   VARCHAR(255) NULL,
        production_released_by INT UNSIGNED NULL,
        production_released_at DATETIME NULL,
        dispatch_hold          TINYINT(1) NOT NULL DEFAULT 0,
        condition_type         VARCHAR(30) NULL COMMENT 'manual | outstanding_below | outstanding_after_ship | amount_received',
        condition_amount       DECIMAL(14,2) NULL,
        auto_release           TINYINT(1) NOT NULL DEFAULT 0,
        accounts_note          VARCHAR(255) NULL,
        dispatch_cleared       TINYINT(1) NOT NULL DEFAULT 0,
        dispatch_cleared_by    INT UNSIGNED NULL,
        dispatch_cleared_at    DATETIME NULL,
        dispatch_cleared_note  VARCHAR(255) NULL,
        created_by_user_id     INT UNSIGNED NULL,
        created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_oac_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] order_approval_conditions failed:', e) }

  // order_approval_conditions ALSO already existed in production (an older
  // approval-gate table with different column names: production_note,
  // cleared_by/cleared_at/clearance_note, approved_by_user_id — no
  // created_by_user_id, no UNIQUE on order_id, and a condition_type ENUM
  // missing 'outstanding_after_ship'). CREATE TABLE IF NOT EXISTS above was
  // therefore a no-op. Reconcile the old table to the names/shape every
  // gates/workflow/payment-watch query in this codebase actually uses.
  await renameCol(db, 'order_approval_conditions', 'production_note', 'production_hold_note', 'VARCHAR(255) NULL DEFAULT NULL')
  await renameCol(db, 'order_approval_conditions', 'cleared_by', 'dispatch_cleared_by', 'INT UNSIGNED NULL DEFAULT NULL')
  await renameCol(db, 'order_approval_conditions', 'cleared_at', 'dispatch_cleared_at', 'DATETIME NULL DEFAULT NULL')
  await renameCol(db, 'order_approval_conditions', 'clearance_note', 'dispatch_cleared_note', 'VARCHAR(255) NULL DEFAULT NULL')
  await addCol(db, 'order_approval_conditions', 'created_by_user_id', 'INT UNSIGNED NULL DEFAULT NULL')
  // approved_by_user_id was NOT NULL with no default in the old table — our
  // code never populates it, so every insert failed. Make it optional.
  // On an install where CREATE TABLE above actually ran (this column was
  // never in that definition), the bare MODIFY always failed with "Unknown
  // column" — forever, every restart, since the column plain doesn't exist
  // to widen. addCol first so both cases converge: already-present (old
  // table) -> addCol no-ops, MODIFY widens it; absent (fresh table) ->
  // addCol creates it nullable outright, MODIFY is a harmless no-op.
  await addCol(db, 'order_approval_conditions', 'approved_by_user_id', 'BIGINT UNSIGNED NULL DEFAULT NULL')
  try {
    await db.query(`ALTER TABLE order_approval_conditions MODIFY COLUMN approved_by_user_id BIGINT UNSIGNED NULL DEFAULT NULL`)
  } catch (e) { console.warn('[db-migrate] order_approval_conditions.approved_by_user_id widen failed:', e) }
  // condition_type was a 3-value ENUM missing 'outstanding_after_ship' —
  // widen to VARCHAR so no condition type can ever be truncated again.
  try {
    await db.query(`ALTER TABLE order_approval_conditions MODIFY COLUMN condition_type VARCHAR(30) NULL DEFAULT NULL`)
  } catch (e) { console.warn('[db-migrate] order_approval_conditions.condition_type widen failed:', e) }
  // One row per order — our gates.post.ts / workflow.post.ts rely on
  // ON DUPLICATE KEY UPDATE via this constraint; the old table had none.
  await addUnique(db, 'order_approval_conditions', 'uniq_oac_order', 'order_id')

  // ── 38. order_amendments — pre/post-dispatch change control ───────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_amendments (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        amendment_number   VARCHAR(30) NOT NULL UNIQUE,
        order_id           INT UNSIGNED NOT NULL,
        regime             VARCHAR(10) NOT NULL COMMENT 'pre | post (dispatch)',
        amend_type         VARCHAR(30) NOT NULL COMMENT 'transport | price | qty | correction | freight | rebate',
        description        VARCHAR(500) NULL,
        old_values         LONGTEXT NULL COMMENT 'JSON snapshot before',
        new_values         LONGTEXT NULL COMMENT 'JSON snapshot after / requested',
        flat_amount        DECIMAL(14,2) NULL COMMENT 'post regime: signed ± posted as debit/credit note',
        status             VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        requested_by       INT UNSIGNED NOT NULL,
        decided_by         INT UNSIGNED NULL,
        decided_at         DATETIME NULL,
        decision_note      VARCHAR(255) NULL,
        journal_entry_id   INT UNSIGNED NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_amd_order (order_id),
        INDEX idx_amd_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] order_amendments failed:', e) }

  // ── 39. credit_orders — delivery type + mini-truck surcharge ──────────────
  await addCol(db, 'credit_orders', 'delivery_type', "VARCHAR(20) NOT NULL DEFAULT 'big_truck' COMMENT 'big_truck | mini_truck'")
  await addCol(db, 'credit_orders', 'mini_truck_surcharge', "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'order-level surcharge included in total_amount'")

  // ── 40. payment_allocations — one payment split across orders ─────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_allocations (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payment_id       INT UNSIGNED NOT NULL,
        order_id         INT UNSIGNED NOT NULL,
        allocated_amount DECIMAL(14,2) NOT NULL,
        as_advance       TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = order not dispatched yet, counts as advance',
        created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pa_payment (payment_id),
        INDEX idx_pa_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] payment_allocations failed:', e) }

  // payment_allocations already existed in production (an older table with
  // payment_id/order_id/allocated_amount/allocation_date/allocated_by_user_id)
  // so CREATE TABLE IF NOT EXISTS above was a no-op and never added the new
  // as_advance column the Collect Payment flow relies on. Retrofit it.
  await addCol(db, 'payment_allocations', 'as_advance',
    "TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = order not dispatched yet, counts as advance'")

  // ── 41. user_approval_limits — transaction (payment) approval limit ───────
  await addCol(db, 'user_approval_limits', 'max_transaction_amount',
    "DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT 'Max single payment/transaction this user may record; 0 = no personal cap'")

  // ── 42. Pipeline split: goods_on_board (accounting pivot) vs shipped ──────
  // Per REBUILD_SPEC.md §2.3/§2.8, "shipped" used to double as the pivot
  // (invoice posts) AND "truck departed". We split those into two real
  // stages: ready_to_ship -> goods_on_board (ledger posts here) -> shipped
  // (truck departed, no money) -> delivered. Every existing order whose
  // status is literally 'shipped' or 'dispatched' already means "invoice
  // posted" under the OLD scheme, so it must be relabelled to
  // goods_on_board — but ONLY ONCE. Re-running this on every restart would
  // wrongly relabel future, genuinely-shipped (post-goods-on-board) orders
  // back to goods_on_board, so it's guarded by a one-shot settings flag.
  try {
    const [[flag]] = await db.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'migrated_goods_on_board_split'`,
    ) as any
    if (!flag) {
      const [result] = await db.query(
        `UPDATE credit_orders SET status = 'goods_on_board' WHERE status IN ('shipped', 'dispatched')`,
      ) as any
      await db.query(
        `INSERT INTO system_settings (setting_key, setting_value) VALUES ('migrated_goods_on_board_split', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [String(result?.affectedRows ?? 0)],
      )
      console.log(`[db-migrate] goods_on_board split: relabelled ${result?.affectedRows ?? 0} order(s)`)
    }
  } catch (e) {
    console.warn('[db-migrate] goods_on_board split backfill failed:', e)
  }

  // ── 43. credit_pending_requests — maker/checker queue (spec §2.4/§3) ──────
  // A payment that exceeds the maker's personal transaction limit is queued
  // here instead of hard-blocked; a checker with sufficient authority (or
  // admin) reviews and re-submits it under their own limit.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_pending_requests (
        id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        request_type        VARCHAR(30)  NOT NULL COMMENT 'payment | collect_payment',
        payload              LONGTEXT     NOT NULL COMMENT 'JSON — exact original request body',
        order_id             INT UNSIGNED NULL,
        customer_id          INT UNSIGNED NULL,
        amount               DECIMAL(14,2) NOT NULL,
        reference_label      VARCHAR(255) NULL,
        requested_by_user_id INT UNSIGNED NOT NULL,
        requested_reason     VARCHAR(255) NULL COMMENT 'why it was queued, e.g. limit exceeded',
        status               VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        decided_by_user_id   INT UNSIGNED NULL,
        decided_at           DATETIME     NULL,
        decision_note        VARCHAR(255) NULL,
        result_payment_id    INT UNSIGNED NULL COMMENT 'customer_payments.id once posted',
        created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cpr_status (status),
        INDEX idx_cpr_customer (customer_id),
        INDEX idx_cpr_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] credit_pending_requests failed:', e) }

  // ── 44. Over-delivery handling (spec §2.9) ─────────────────────────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_order_over_deliveries (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        od_number            VARCHAR(30)  NOT NULL UNIQUE,
        order_id             INT UNSIGNED NOT NULL,
        customer_id          INT UNSIGNED NOT NULL,
        od_date              DATE         NOT NULL,
        total_extra_qty      DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_extra_amount   DECIMAL(14,2) NOT NULL DEFAULT 0,
        resolution           VARCHAR(20)  NOT NULL DEFAULT 'bill' COMMENT 'bill | retrieve | writeoff',
        notes                VARCHAR(500) NULL,
        status               VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        created_by_user_id   INT UNSIGNED NOT NULL,
        approved_by_user_id  INT UNSIGNED NULL,
        approved_at          DATETIME     NULL,
        decision_note        VARCHAR(255) NULL,
        retrieved_at         DATETIME     NULL,
        retrieved_by_user_id INT UNSIGNED NULL,
        journal_entry_id     INT UNSIGNED NULL,
        created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_od_order (order_id),
        INDEX idx_od_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_order_over_delivery_items (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        od_id          INT UNSIGNED NOT NULL,
        order_item_id  INT UNSIGNED NULL,
        product_id     INT UNSIGNED NULL,
        variant_id     INT UNSIGNED NULL,
        extra_qty      DECIMAL(12,2) NOT NULL,
        unit_price     DECIMAL(12,2) NOT NULL,
        line_total     DECIMAL(14,2) NOT NULL,
        INDEX idx_odi_od (od_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] over-delivery tables failed:', e) }

  // ── 45. stock_adjustments — inventory correction workflow (spec §2.9) ─────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        adj_number          VARCHAR(30)  NOT NULL UNIQUE,
        variant_id          INT UNSIGNED NOT NULL,
        delta               INT          NOT NULL COMMENT 'signed — negative = decrease, positive = increase',
        reason              VARCHAR(255) NOT NULL,
        notes               VARCHAR(500) NULL,
        status              VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        created_by_user_id  INT UNSIGNED NOT NULL,
        approved_by_user_id INT UNSIGNED NULL,
        approved_at         DATETIME     NULL,
        decision_note       VARCHAR(255) NULL,
        journal_entry_id    INT UNSIGNED NULL,
        created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sa_variant (variant_id),
        INDEX idx_sa_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] stock_adjustments failed:', e) }

  // ── 46. customer_payments / payment_allocations — proper reversal tracking ─
  // Previously "reversed" was detected by string-matching notes for
  // 'REVERSED' — fragile, and the old reverse endpoint didn't restore
  // split/advance order balances or post a reversing JE. Real columns let
  // the hardened endpoint (and any future reporting) tell reversed
  // payments apart reliably.
  await addCol(db, 'customer_payments', 'reversed_at',
    "DATETIME NULL COMMENT 'set when this payment is reversed'")
  await addCol(db, 'customer_payments', 'reversed_by_user_id',
    "INT UNSIGNED NULL")
  await addCol(db, 'customer_payments', 'reversal_reason',
    "VARCHAR(255) NULL")
  await addCol(db, 'customer_payments', 'reversal_journal_entry_id',
    "INT UNSIGNED NULL COMMENT 'the reversing JE, distinct from journal_entry_id (the original posting)'")
  await addCol(db, 'payment_allocations', 'reversed',
    "TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 once the parent payment has been reversed'")

  // ── 47. Backfill: customer_ledger.invoice_number for payment rows ─────────
  // credit-sales/[id]/payment.post.ts used to write whatever the collector
  // typed into "Reference Number" (a bank slip number, e.g. "1232") into the
  // ledger's invoice_number/reference column instead of the system's own
  // PAY-YYYYMMDD-#### number — every other ledger writer uses the system
  // number there. Cosmetic only (balances were never wrong), but it made the
  // Customer Ledger page's Reference column show raw bank slips instead of
  // something a user could trace back to the payment. Safe to re-run: only
  // touches rows that still disagree with the real payment_number.
  try {
    await db.query(`
      UPDATE customer_ledger l
      JOIN customer_payments p ON p.id = l.reference_id
      SET l.invoice_number = p.payment_number
      WHERE l.reference_type = 'customer_payment'
        AND (l.invoice_number IS NULL OR l.invoice_number <> p.payment_number)
    `)
  } catch (e) {
    console.warn('[db-migrate] customer_ledger invoice_number backfill failed:', e)
  }

  // ── 48. Two-stage QR delivery (spec §2.8) ──────────────────────────────────
  // Replaces the single-stage, unauthenticated PIN scan with the spec's
  // gate-scan → delivery-scan state machine: goods_on_board -> [gate scan,
  // driver+vehicle captured, login required] -> shipped -> [delivery scan] ->
  // delivered. One row per order (UNIQUE order_id) makes double-delivery
  // impossible at the DB level; every scan (including a reuse after
  // delivered) is logged separately in cr_qr_scan_log.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cr_delivery_confirmations (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id              INT UNSIGNED NOT NULL,
        order_number          VARCHAR(50)  NULL,
        gate_out_at           DATETIME     NULL,
        gate_out_by_user_id   INT UNSIGNED NULL,
        gate_out_by_name      VARCHAR(120) NULL,
        driver_name           VARCHAR(150) NULL,
        vehicle_number        VARCHAR(100) NULL,
        gate_note             VARCHAR(500) NULL,
        confirmed_at          DATETIME     NULL,
        confirmed_by_user_id  INT UNSIGNED NULL,
        confirmed_by_name     VARCHAR(120) NULL,
        received_by           VARCHAR(150) NULL,
        note                  VARCHAR(500) NULL,
        created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_dc_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS cr_qr_scan_log (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id           INT UNSIGNED NOT NULL,
        order_number       VARCHAR(50)  NULL,
        stage              VARCHAR(20)  NULL,
        reused             TINYINT(1)   NOT NULL DEFAULT 0,
        scanned_by_user_id INT UNSIGNED NULL,
        scanned_by_name    VARCHAR(120) NULL,
        ip                 VARCHAR(64)  NULL,
        scanned_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_qsl_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] two-stage QR delivery tables failed:', e)
  }

  // ── 49. Recycle Bin engine (spec §2.11) ────────────────────────────────────
  // Generic snapshot/restore for deletes, replacing today's hard-cascade
  // (which only kept a summary tombstone, not the actual row data — once
  // gone it was gone). One batch per delete operation; one item row per
  // captured table row, full JSON snapshot. Items insert in capture order
  // (child rows first, mirroring the order things get deleted in) so
  // restore can simply replay by id DESC — parent rows first, satisfying
  // FK constraints, then children. See server/utils/recycleBin.ts.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS recycle_bin_batches (
        id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        entity_type         VARCHAR(50)  NOT NULL COMMENT 'credit_order | customer | ...',
        label                VARCHAR(200) NOT NULL COMMENT 'human-readable — order number, customer name, etc.',
        customer_id          INT UNSIGNED NULL,
        item_count           INT UNSIGNED NOT NULL DEFAULT 0,
        status               VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT 'active | restored | purged',
        deleted_by_user_id   INT UNSIGNED NULL,
        deleted_by_name      VARCHAR(120) NULL,
        deleted_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        restored_by_user_id  INT UNSIGNED NULL,
        restored_at          DATETIME     NULL,
        purged_by_user_id    INT UNSIGNED NULL,
        purged_at            DATETIME     NULL,
        notes                VARCHAR(500) NULL,
        INDEX idx_rbb_entity (entity_type),
        INDEX idx_rbb_status (status),
        INDEX idx_rbb_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS recycle_bin_items (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        batch_id       INT UNSIGNED NOT NULL,
        table_name     VARCHAR(100) NOT NULL,
        op             VARCHAR(10)  NOT NULL COMMENT 'delete | update — what restore must undo',
        row_pk_col     VARCHAR(64)  NOT NULL,
        row_pk_val     VARCHAR(64)  NOT NULL,
        snapshot_json  LONGTEXT     NOT NULL,
        created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rbi_batch (batch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] recycle bin tables failed:', e)
  }

  // ── 50. Multi-commodity procurement (spec §2.12) ───────────────────────────
  // Purchase was hardcoded to wheat (a free-text `wheat_origin` + fixed
  // MT-denominated quantity/price). This adds a real commodity catalog —
  // one commodity per PO, each with its own unit, allowed origins, and
  // optionally-scoped supplier list ("no links = show all" — see
  // server/api/purchase/commodities.get.ts). `quantity_kg`/`unit_price_per_kg`
  // stay the underlying storage columns for every commodity (renaming them
  // across ~15 read sites wasn't worth the risk to a money-critical table);
  // only the 'MT' unit gets the existing MT-entry ×1000-to-kg UX — every
  // other unit stores what the user typed 1:1. Wheat is seeded as the
  // default commodity and every existing PO is backfilled onto it, so
  // current wheat flows are byte-for-byte unchanged.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_commodities (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name                  VARCHAR(100) NOT NULL,
        unit                  VARCHAR(10)  NOT NULL DEFAULT 'KG' COMMENT 'KG|MT|pcs|bag|litre|ton|box',
        inventory_account_id  INT UNSIGNED NULL COMMENT 'chart_of_accounts.id — reserved for future GRN GL posting',
        status                VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT 'active | inactive',
        sort_order            INT UNSIGNED NOT NULL DEFAULT 0,
        created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_commodity_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_commodity_origins (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        commodity_id  INT UNSIGNED NOT NULL,
        origin_name   VARCHAR(100) NOT NULL,
        sort_order    INT UNSIGNED NOT NULL DEFAULT 0,
        INDEX idx_pco_commodity (commodity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS supplier_commodities (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id   INT UNSIGNED NOT NULL,
        commodity_id  INT UNSIGNED NOT NULL,
        UNIQUE KEY uq_supplier_commodity (supplier_id, commodity_id),
        INDEX idx_sc_commodity (commodity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) {
    console.warn('[db-migrate] purchase commodity tables failed:', e)
  }

  await addCol(db, 'purchase_orders_adnan', 'commodity_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // Seed "Wheat" as commodity #1 (idempotent) and backfill every PO that
  // predates this migration onto it, then seed its historical origin list
  // (the values that used to be hardcoded in create.vue / edit.vue).
  try {
    await db.query(
      `INSERT IGNORE INTO purchase_commodities (name, unit, status, sort_order) VALUES ('Wheat', 'MT', 'active', 0)`,
    )
    const [[wheat]] = await db.query<any>(`SELECT id FROM purchase_commodities WHERE name = 'Wheat'`)
    if (wheat?.id) {
      await db.query(
        `UPDATE purchase_orders_adnan SET commodity_id = ? WHERE commodity_id IS NULL`, [wheat.id],
      )
      const [[originCnt]] = await db.query<any>(
        `SELECT COUNT(*) AS n FROM purchase_commodity_origins WHERE commodity_id = ?`, [wheat.id],
      )
      if (!originCnt.n) {
        const origins = ['কানাডা', 'রাশিয়া', 'Australia', 'Ukraine', 'India', 'USA', 'Argentina', 'Local', 'Brazil', 'Other']
        for (let i = 0; i < origins.length; i++) {
          await db.query(
            `INSERT INTO purchase_commodity_origins (commodity_id, origin_name, sort_order) VALUES (?, ?, ?)`,
            [wheat.id, origins[i], i],
          )
        }
      }
    }
  } catch (e) {
    console.warn('[db-migrate] wheat commodity seed failed:', e)
  }

  // ── 51. Bank auto-bridge — link a bank_transactions row back to the
  //    customer_payments row that created it (spec §2.4 step 9 / §4.6) ──────
  await addCol(db, 'bank_transactions', 'source_payment_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // ── 52. Bank reconciliation — mark individual bank_transactions rows as
  //    cleared against the real bank statement, independent of their
  //    approval status ──────────────────────────────────────────────────────
  await addCol(db, 'bank_transactions', 'reconciled_at',         'DATETIME NULL DEFAULT NULL')
  await addCol(db, 'bank_transactions', 'reconciled_by_user_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // ── 53. Unify the two bank-account lists ────────────────────────────────────
  // bank_accounts (GL-linked, chart_of_account_id) and bank_tx_accounts (the
  // standalone day-to-day module the Bank > Accounts cards actually manage)
  // are two separate tables tracking the same real-world accounts, matched
  // only by account_number. Users saw two lists and neither side ever posted
  // a journal entry for transactions entered through the transaction module.
  //
  // Fix: bank_accounts becomes the ONE user-facing account list (create/edit
  // goes through it from now on); bank_tx_accounts stays as an internal
  // mirror so the existing transaction/reconciliation/dashboard code (all
  // keyed to bank_tx_account_id) keeps working unchanged — linked via
  // bank_accounts.legacy_tx_account_id. Every bank_tx_accounts row without a
  // matching bank_accounts row (by account_number) gets one auto-created here
  // (+ a chart_of_accounts entry) so no existing account silently disappears
  // from the unified list.
  await addCol(db, 'bank_accounts', 'legacy_tx_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'bank_tx_transaction_types', 'chart_of_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'bank_transactions', 'journal_entry_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'bank_transactions', 'transfer_pair_id', 'INT UNSIGNED NULL DEFAULT NULL')

  try {
    const [txAccounts] = await db.query<any>(`SELECT * FROM bank_tx_accounts`)
    for (const txAcc of txAccounts as any[]) {
      const [[match]] = await db.query<any>(
        `SELECT id, legacy_tx_account_id FROM bank_accounts WHERE account_number = ? LIMIT 1`,
        [txAcc.account_number],
      )
      if (match) {
        if (!match.legacy_tx_account_id) {
          await db.query(`UPDATE bank_accounts SET legacy_tx_account_id = ? WHERE id = ?`, [txAcc.id, match.id])
        }
        continue
      }

      // No matching GL-linked account — create both a chart_of_accounts row
      // and a bank_accounts row so this account survives in the unified list.
      const [coaRes] = await db.query<any>(
        `INSERT INTO chart_of_accounts
           (account_number, account_type, account_type_group, normal_balance, status, is_active, description, name)
         VALUES (?, 'Bank', 'Asset', 'Debit', 'active', 1, ?, ?)`,
        [
          txAcc.account_number || null,
          `Auto-created from bank account "${txAcc.bank_name}" during account-list unification`,
          `${txAcc.bank_name} — ${txAcc.account_name}`.slice(0, 255),
        ],
      )
      await db.query(
        `INSERT INTO bank_accounts
           (chart_of_account_id, bank_name, branch_name, account_name, account_number,
            account_type, initial_balance, current_balance, status, legacy_tx_account_id)
         VALUES (?, ?, ?, ?, ?, 'Other', ?, ?, ?, ?)`,
        [
          coaRes.insertId, txAcc.bank_name, txAcc.branch_name || null, txAcc.account_name, txAcc.account_number,
          Number(txAcc.opening_balance ?? 0), Number(txAcc.opening_balance ?? 0),
          txAcc.status === 'active' ? 'active' : 'inactive', txAcc.id,
        ],
      )
    }
  } catch (e) {
    console.warn('[db-migrate] bank account unification backfill failed:', e)
  }

  // ── 54. product_variants.cost_price — written by variants.post.ts but
  //    never had a migration creating it ─────────────────────────────────────
  await addCol(db, 'product_variants', 'cost_price', "DECIMAL(12,2) NULL DEFAULT NULL COMMENT 'Purchase/production cost, for margin reporting'")

  // ── 56. user_action_limits — per-action delegated ৳ caps (legacy parity).
  //    Finer-grained than user_approval_limits' two columns: one row per
  //    user × action_key (approve_order | amend_order | collect_payment |
  //    partial_delivery, + trading/loan keys later). approve_order/
  //    collect_payment fall back to the legacy columns when no row exists.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_action_limits (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id        INT UNSIGNED NOT NULL,
        action_key     VARCHAR(40)  NOT NULL,
        max_amount     DECIMAL(14,2) NOT NULL DEFAULT 0,
        set_by_user_id INT UNSIGNED NULL,
        created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_ual_user_action (user_id, action_key),
        INDEX idx_ual_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] user_action_limits create failed:', e) }

  // ── 55. customers.business_address — read/written by customers create/edit,
  //    credit-limits report, and the payment receipt, but schema_seed.sql only
  //    ever defined a plain `address` column, and no migration ever added
  //    this one. Caused "Unknown column 'c.address'"/'business_address' 500s
  //    on every one of those pages.
  await addCol(db, 'customers', 'business_address', 'VARCHAR(255) NULL DEFAULT NULL')

  // ── 57. Commodity Trading module (legacy Phases 0-9 parity) ─────────────────
  // Business partners: link one customer + one supplier as a single real-world
  // party. Additive only — customers/suppliers keep their own rows/FKs.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS business_partners (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name               VARCHAR(180) NOT NULL,
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] business_partners create failed:', e) }
  await addCol(db, 'customers', 'business_partner_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'suppliers', 'business_partner_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // Sellable flag on the procurement commodity catalog
  await addCol(db, 'purchase_commodities', 'is_sellable', 'TINYINT(1) NOT NULL DEFAULT 0')

  // Weighted-average-cost inventory, split per origin ('' = untracked bucket —
  // deliberately NOT NULL: MySQL unique keys treat NULLs as distinct, which
  // would silently allow duplicate commodity×branch rows).
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_inventory (
        id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        commodity_id      INT UNSIGNED NOT NULL,
        branch_id         INT UNSIGNED NOT NULL DEFAULT 0,
        origin            VARCHAR(100) NOT NULL DEFAULT '',
        qty_on_hand       DECIMAL(14,3) NOT NULL DEFAULT 0,
        weighted_avg_cost DECIMAL(14,4) NOT NULL DEFAULT 0,
        updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_ci_commodity_branch_origin (commodity_id, branch_id, origin)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] commodity_inventory create failed:', e) }

  // Commodity sales — own table, deliberately NOT overloaded onto credit_orders
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_sales (
        id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_number              VARCHAR(30)  NOT NULL UNIQUE,
        customer_id              INT UNSIGNED NOT NULL,
        commodity_id             INT UNSIGNED NOT NULL,
        branch_id                INT UNSIGNED NULL,
        origin                   VARCHAR(100) NOT NULL DEFAULT '',
        source_purchase_order_id INT UNSIGNED NULL COMMENT 'optional traceability tag, no FK by convention',
        sale_date                DATE NOT NULL,
        quantity                 DECIMAL(14,3) NOT NULL,
        unit                     VARCHAR(10) NOT NULL DEFAULT 'KG',
        unit_price               DECIMAL(14,4) NOT NULL,
        total_amount             DECIMAL(14,2) NOT NULL,
        advance_paid             DECIMAL(14,2) NOT NULL DEFAULT 0,
        amount_paid              DECIMAL(14,2) NOT NULL DEFAULT 0,
        balance_due              DECIMAL(14,2) NOT NULL DEFAULT 0,
        cogs_amount              DECIMAL(14,2) NOT NULL DEFAULT 0,
        stock_override           TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'sold past on-hand stock with explicit override',
        status                   VARCHAR(20) NOT NULL DEFAULT 'posted' COMMENT 'posted | pending_approval | rejected',
        journal_entry_id         INT UNSIGNED NULL,
        customer_ledger_id       INT UNSIGNED NULL COMMENT 'the invoice ledger row this sale created',
        notes                    VARCHAR(500) NULL,
        created_by_user_id       INT UNSIGNED NOT NULL,
        created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cs_customer (customer_id),
        INDEX idx_cs_commodity (commodity_id),
        INDEX idx_cs_date (sale_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] commodity_sales create failed:', e) }

  // Payments against commodity sales — own table, deliberately NOT
  // customer_payments (whose reversal paths parse allocations as
  // credit-order maps). customer_ledger_id pins the exact ledger row this
  // payment created, so a reversal targets precisely that row.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_sale_payments (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payment_number     VARCHAR(30) NOT NULL UNIQUE,
        sale_id            INT UNSIGNED NOT NULL,
        customer_id        INT UNSIGNED NOT NULL,
        payment_date       DATE NOT NULL,
        amount             DECIMAL(14,2) NOT NULL,
        payment_method     VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_account_id    INT UNSIGNED NULL,
        cash_account_id    INT UNSIGNED NULL,
        reference_number   VARCHAR(80) NULL,
        journal_entry_id   INT UNSIGNED NULL,
        customer_ledger_id INT UNSIGNED NULL,
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_csp_sale (sale_id),
        INDEX idx_csp_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] commodity_sale_payments create failed:', e) }

  // Edit chain — one row per edit attempt; links old sale -> replacement so
  // the view page can reconstruct a timeline and forward old links.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_sale_edits (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        old_sale_id          INT UNSIGNED NOT NULL,
        old_sale_number      VARCHAR(30) NOT NULL,
        new_sale_id          INT UNSIGNED NULL,
        new_sale_number      VARCHAR(30) NULL,
        change_summary       LONGTEXT NULL COMMENT 'JSON field diff',
        reason               VARCHAR(500) NOT NULL,
        status               VARCHAR(20) NOT NULL DEFAULT 'pending_approval' COMMENT 'pending_approval | approved | rejected',
        requested_by_user_id INT UNSIGNED NOT NULL,
        decided_by_user_id   INT UNSIGNED NULL,
        decided_at           DATETIME NULL,
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cse_old (old_sale_id),
        INDEX idx_cse_new (new_sale_id),
        INDEX idx_cse_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] commodity_sale_edits create failed:', e) }

  // Partner settlements — netting a linked partner's AR against their AP
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS business_partner_settlements (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        settlement_number  VARCHAR(30) NOT NULL UNIQUE,
        partner_id         INT UNSIGNED NOT NULL,
        customer_id        INT UNSIGNED NOT NULL,
        supplier_id        INT UNSIGNED NOT NULL,
        amount             DECIMAL(14,2) NOT NULL,
        settlement_date    DATE NOT NULL,
        journal_entry_id   INT UNSIGNED NULL,
        customer_ledger_id INT UNSIGNED NULL,
        supplier_ledger_id INT UNSIGNED NULL,
        status             VARCHAR(20) NOT NULL DEFAULT 'posted' COMMENT 'posted | reversed',
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bps_partner (partner_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] business_partner_settlements create failed:', e) }

  // Dedicated dispatch subsystem (own tables + own HMAC namespace, mirrors
  // cr_delivery_confirmations / cr_qr_scan_log)
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_dispatch_confirmations (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_id              INT UNSIGNED NOT NULL,
        sale_number          VARCHAR(30) NULL,
        gate_out_at          DATETIME NULL,
        gate_out_by_user_id  INT UNSIGNED NULL,
        gate_out_by_name     VARCHAR(120) NULL,
        driver_name          VARCHAR(150) NULL,
        vehicle_number       VARCHAR(100) NULL,
        gate_note            VARCHAR(500) NULL,
        confirmed_at         DATETIME NULL,
        confirmed_by_user_id INT UNSIGNED NULL,
        confirmed_by_name    VARCHAR(120) NULL,
        received_by          VARCHAR(150) NULL,
        note                 VARCHAR(500) NULL,
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_cdc_sale (sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_qr_scan_log (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_id            INT UNSIGNED NOT NULL,
        sale_number        VARCHAR(30) NULL,
        stage              VARCHAR(20) NULL,
        reused             TINYINT(1) NOT NULL DEFAULT 0,
        scanned_by_user_id INT UNSIGNED NULL,
        scanned_by_name    VARCHAR(120) NULL,
        ip                 VARCHAR(64) NULL,
        scanned_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cqsl_sale (sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] commodity dispatch tables failed:', e) }

  // GRN branch — costing needs to know WHICH branch received the goods.
  // (Legacy found its costing silently dead because this was missing.)
  await addCol(db, 'goods_received_adnan', 'unload_point_branch_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // ── 58. Loans module (related-party cash advances) ──────────────────────────
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        loan_number          VARCHAR(30) NOT NULL UNIQUE,
        customer_id          INT UNSIGNED NULL,
        supplier_id          INT UNSIGNED NULL,
        principal_amount     DECIMAL(14,2) NOT NULL,
        amount_repaid        DECIMAL(14,2) NOT NULL DEFAULT 0,
        balance_due          DECIMAL(14,2) NOT NULL DEFAULT 0,
        loan_date            DATE NOT NULL,
        expected_return_date DATE NULL,
        purpose              VARCHAR(500) NULL,
        payment_method       VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_account_id      INT UNSIGNED NULL,
        cash_account_id      INT UNSIGNED NULL,
        reference_number     VARCHAR(80) NULL,
        status               VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'pending_approval | active | closed | rejected',
        journal_entry_id     INT UNSIGNED NULL,
        created_by_user_id   INT UNSIGNED NOT NULL,
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_loans_customer (customer_id),
        INDEX idx_loans_supplier (supplier_id),
        INDEX idx_loans_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS loan_repayments (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        repayment_number   VARCHAR(30) NOT NULL UNIQUE,
        loan_id            INT UNSIGNED NOT NULL,
        customer_id        INT UNSIGNED NULL,
        supplier_id        INT UNSIGNED NULL,
        amount             DECIMAL(14,2) NOT NULL,
        repayment_date     DATE NOT NULL,
        payment_method     VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_account_id    INT UNSIGNED NULL,
        cash_account_id    INT UNSIGNED NULL,
        reference_number   VARCHAR(80) NULL,
        journal_entry_id   INT UNSIGNED NULL,
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lr_loan (loan_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] loans tables failed:', e) }

  // ── 59. Other Sales — Trading commodities through the credit-order flow ─────
  await addCol(db, 'credit_orders', 'is_other_sales', "TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Trading commodity sale via credit-order flow — skips production'")
  await addCol(db, 'credit_order_items', 'commodity_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'credit_order_items', 'commodity_origin', 'VARCHAR(100) NULL DEFAULT NULL')
  // Commodity line items have no product_id — the original NOT NULL must go.
  // Type unknown across deployments (INT vs INT UNSIGNED) — try both.
  try {
    await db.query(`ALTER TABLE credit_order_items MODIFY COLUMN product_id INT UNSIGNED NULL DEFAULT NULL`)
  } catch {
    try {
      await db.query(`ALTER TABLE credit_order_items MODIFY COLUMN product_id INT NULL DEFAULT NULL`)
    } catch (e) { console.warn('[db-migrate] credit_order_items.product_id nullable failed:', e) }
  }

  // ── 60. POS full rebuild — split payment, exit-release gate, ledger ─────────
  await addCol(db, 'orders', 'cash_amount', "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Paid now (cash/card/mobile banking/bank)'")
  await addCol(db, 'orders', 'credit_amount', "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Left on customer account (POS credit)'")
  await addCol(db, 'orders', 'exit_status', "VARCHAR(20) NOT NULL DEFAULT 'cleared' COMMENT 'cleared | pending_approval'")
  await addCol(db, 'orders', 'exit_cleared_by_user_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'orders', 'exit_cleared_at', 'DATETIME NULL DEFAULT NULL')
  await addCol(db, 'orders', 'exit_requested_by_user_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'orders', 'exit_requested_at', 'DATETIME NULL DEFAULT NULL')
  await addCol(db, 'orders', 'exit_verify_sig', 'VARCHAR(32) NULL DEFAULT NULL')
  await addCol(db, 'orders', 'cash_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'orders', 'bank_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'orders', 'recycled_at', 'DATETIME NULL DEFAULT NULL')

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pos_customer_ledger (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_id        INT UNSIGNED NOT NULL,
        order_id           INT UNSIGNED NULL,
        transaction_date   DATE NOT NULL,
        transaction_type   VARCHAR(20) NOT NULL COMMENT 'sale | payment | adjustment',
        description        VARCHAR(255) NULL,
        debit_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
        credit_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
        reference_number   VARCHAR(50) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pcl_customer (customer_id),
        INDEX idx_pcl_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] pos_customer_ledger failed:', e) }

  // cash_verification_log (EOD) already exists from the legacy import —
  // just add the next-day bank-deposit-confirmation columns it lacks.
  await addCol(db, 'cash_verification_log', 'deposited_at', 'DATETIME NULL DEFAULT NULL')
  await addCol(db, 'cash_verification_log', 'deposited_by_user_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'cash_verification_log', 'deposit_reference', 'VARCHAR(100) NULL DEFAULT NULL')
  await addCol(db, 'cash_verification_log', 'cash_account_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // production_schedule.bags_completed — pages/production/index.vue's Update
  // Progress action previously only mutated local Vue state (lost on refresh).
  await addCol(db, 'production_schedule', 'bags_completed', 'INT UNSIGNED NOT NULL DEFAULT 0')
  await addCol(db, 'production_schedule', 'target_bags', 'INT UNSIGNED NULL DEFAULT NULL')

  // Fleet fuel/maintenance previously posted no GL entry at all (raw log
  // rows only) — add the payment-account + journal-entry link so both flows
  // can post a real double-entry (DR expense / CR cash-or-bank) like every
  // other spend path in the app.
  await addCol(db, 'fleet_fuel_logs', 'payment_method', "VARCHAR(10) NULL DEFAULT NULL COMMENT 'cash | bank'")
  await addCol(db, 'fleet_fuel_logs', 'cash_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'fleet_fuel_logs', 'bank_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'fleet_fuel_logs', 'journal_entry_id', 'INT UNSIGNED NULL DEFAULT NULL')

  await addCol(db, 'maintenance_requests', 'payment_method', "VARCHAR(10) NULL DEFAULT NULL COMMENT 'cash | bank'")
  await addCol(db, 'maintenance_requests', 'cash_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'maintenance_requests', 'bank_account_id', 'INT UNSIGNED NULL DEFAULT NULL')
  await addCol(db, 'maintenance_requests', 'journal_entry_id', 'INT UNSIGNED NULL DEFAULT NULL')

  // pos_qr_scan_log — every POS exit-QR scan attempt, with reuse flagging.
  // Previously the Vue port only tracked exit_status as a static column on
  // orders (cleared | pending_approval) with no scan history at all, so a
  // re-scan after exit was already cleared went completely unnoticed.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pos_qr_scan_log (
        id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id           BIGINT UNSIGNED NOT NULL,
        order_number       VARCHAR(50) NULL,
        reused             TINYINT(1) NOT NULL DEFAULT 0,
        scanned_by_user_id BIGINT UNSIGNED NULL,
        scanned_by_name    VARCHAR(120) NULL,
        ip                 VARCHAR(64) NULL,
        scanned_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY idx_pqsl_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] pos_qr_scan_log failed:', e) }

  // fleet_trip_consolidation_dismissals — per-pair "no thanks" state for the
  // trip-consolidation suggestion engine (pages/fleet/trips/index.vue). The
  // suggestion itself is derived read-only from `trips`/`fleet_vehicles` on
  // every request — this table only remembers pairs a dispatcher explicitly
  // dismissed so they don't get nagged again on reload. trip_id_a/b are
  // always stored normalized (a < b) so a pair has exactly one row.
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS fleet_trip_consolidation_dismissals (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        trip_id_a             INT UNSIGNED NOT NULL,
        trip_id_b             INT UNSIGNED NOT NULL,
        dismissed_by_user_id  INT UNSIGNED NULL,
        dismissed_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_ftcd_pair (trip_id_a, trip_id_b)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  } catch (e) { console.warn('[db-migrate] fleet_trip_consolidation_dismissals failed:', e) }

  console.log('[db-migrate] startup migrations complete')
})

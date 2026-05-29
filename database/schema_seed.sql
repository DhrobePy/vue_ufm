-- ============================================================
--  ujjalfmc_saas — Full Schema + Seed Data
--  Run: mysql -u root < database/schema_seed.sql
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS ujjalfmc_saas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ujjalfmc_saas;

-- ── branches ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  address    VARCHAR(255),
  phone      VARCHAR(30),
  is_active  TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO branches (name, address, phone) VALUES
  ('Sirajgonj',  'Sirajgonj Sadar, Rajshahi Division', '01700-000001'),
  ('Demra',      'Demra, Dhaka', '01700-000002'),
  ('Head Office','Dhaka', '01700-000003');

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  display_name     VARCHAR(120) NOT NULL,
  email            VARCHAR(180) NOT NULL UNIQUE,
  password_hash    VARCHAR(255),
  role             ENUM('admin','manager','accounts','collector','production','viewer') DEFAULT 'viewer',
  status           ENUM('active','pending','suspended') DEFAULT 'active',
  branch_id        INT UNSIGNED,
  last_login_at    DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users (display_name, email, role, status, branch_id, last_login_at) VALUES
  ('System Admin',      'admin@ujjalfmc.com',      'admin',      'active', NULL,      NOW()),
  ('Rafiqul Islam',     'rafiq@ujjalfmc.com',       'manager',    'active', 1,         NOW()),
  ('Karim Ahmed',       'karim@ujjalfmc.com',       'accounts',   'active', 1,         DATE_SUB(NOW(), INTERVAL 1 DAY)),
  ('Sumaiya Begum',     'sumaiya@ujjalfmc.com',     'collector',  'active', 2,         DATE_SUB(NOW(), INTERVAL 2 DAY)),
  ('Mahbub Hossain',    'mahbub@ujjalfmc.com',      'production', 'active', 1,         DATE_SUB(NOW(), INTERVAL 3 DAY)),
  ('Nasrin Akhter',     'nasrin@ujjalfmc.com',      'accounts',   'active', 2,         DATE_SUB(NOW(), INTERVAL 4 DAY)),
  ('Pending User',      'pending@ujjalfmc.com',     'viewer',     'pending',NULL,      NULL),
  ('Suspended User',    'suspended@ujjalfmc.com',   'viewer',     'suspended',NULL,    NULL);

-- ── audit_logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED,
  user_name    VARCHAR(120),
  action       VARCHAR(80) NOT NULL,
  entity_type  VARCHAR(60),
  entity_id    INT UNSIGNED,
  description  VARCHAR(400),
  severity     ENUM('info','warning','error') DEFAULT 'info',
  ip_address   VARCHAR(45),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO audit_logs (user_name, action, entity_type, entity_id, description, severity) VALUES
  ('Karim Ahmed',    'approve',   'credit_order',    1,  'Order CR-20260520-0001 approved',               'info'),
  ('System',         'login_fail','user',            NULL,'Failed login attempt — unknown@mail.com',       'warning'),
  ('Rafiqul Islam',  'create',    'bank_transaction',1,  'Bank transaction BTX-20260525-0001 created',    'info'),
  ('System Admin',   'suspend',   'user',            8,  'User "Suspended User" deactivated',             'warning'),
  ('Karim Ahmed',    'approve',   'expense_voucher', 3,  'Expense EXP-20260523-0001 approved',            'info'),
  ('Mahbub Hossain', 'update',    'credit_order',    2,  'Order marked ready_to_ship',                    'info'),
  ('System',         'login',     'user',            1,  'Admin login from 192.168.1.10',                 'info'),
  ('Rafiqul Islam',  'create',    'purchase_order',  1,  'PO PO-20260515-0001 created',                   'info');

-- ── bank_accounts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bank_accounts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bank_name    VARCHAR(120) NOT NULL,
  account_name VARCHAR(180),
  account_number VARCHAR(60),
  branch_name  VARCHAR(120),
  account_type ENUM('current','savings','loan') DEFAULT 'current',
  balance      DECIMAL(15,2) DEFAULT 0,
  status       ENUM('active','inactive') DEFAULT 'active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO bank_accounts (bank_name, account_name, account_number, branch_name, account_type) VALUES
  ('Islami Bank Bangladesh', 'Ujjal Flour Mills Ltd.', '20501190200148201', 'Sirajgonj',  'current'),
  ('Dutch-Bangla Bank',      'Ujjal Flour Mills Ltd.', '1050110000012345',  'Sirajgonj',  'current'),
  ('BRAC Bank',              'Ujjal Flour Mills Ltd.', '3050160000067890',  'Sirajgonj',  'current'),
  ('Sonali Bank',            'Ujjal Flour Mills Ltd.', '0100010000099911',  'Demra',       'current');

-- Update opening balances
UPDATE bank_accounts SET balance = 2840000 WHERE account_number = '20501190200148201';
UPDATE bank_accounts SET balance = 1080000 WHERE account_number = '1050110000012345';
UPDATE bank_accounts SET balance =  480000 WHERE account_number = '3050160000067890';
UPDATE bank_accounts SET balance =  320000 WHERE account_number = '0100010000099911';

-- ── bank_transactions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bank_transactions (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_number VARCHAR(40) UNIQUE,
  bank_account_id    INT UNSIGNED NOT NULL,
  related_account_id INT UNSIGNED,
  transaction_date   DATE NOT NULL,
  description        VARCHAR(300) NOT NULL,
  transaction_type   ENUM('credit','debit') NOT NULL,
  amount             DECIMAL(15,2) NOT NULL,
  balance_after      DECIMAL(15,2),
  reference_number   VARCHAR(80),
  category           ENUM('receipt','payment','transfer','salary','utility','other') DEFAULT 'other',
  status             ENUM('pending','approved','rejected') DEFAULT 'pending',
  notes              TEXT,
  created_by         INT UNSIGNED,
  approved_by        INT UNSIGNED,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bank_account_id)    REFERENCES bank_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (related_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO bank_transactions
  (transaction_number, bank_account_id, transaction_date, description, transaction_type, amount, balance_after, reference_number, category, status) VALUES
  ('BTX-20260510-0001', 1, '2026-05-10', 'Transfer from DBBL',                     'credit', 200000, 2000000, 'IFT-20510',   'transfer', 'approved'),
  ('BTX-20260512-0001', 1, '2026-05-12', 'Supplier payment — Gazi Enterprise',     'debit',  450000, 1550000, 'CHQ-002335',  'payment',  'approved'),
  ('BTX-20260515-0001', 1, '2026-05-15', 'Customer payment — Al-Amin Trading',     'credit', 820000, 2370000, 'BEFTN-00118', 'receipt',  'approved'),
  ('BTX-20260518-0001', 1, '2026-05-18', 'Electricity bill — May',                 'debit',   18600, 2351400, 'DESCO-20526', 'utility',  'approved'),
  ('BTX-20260520-0001', 1, '2026-05-20', 'Customer payment — Karim Stores',        'credit', 360000, 2711400, 'bKash-7B4L1',  'receipt', 'approved'),
  ('BTX-20260522-0001', 1, '2026-05-22', 'Labour wages — May 3rd week',            'debit',  120000, 2591400, 'CHQ-002341',  'salary',   'approved'),
  ('BTX-20260523-0001', 1, '2026-05-23', 'Supplier payment — wheat purchase',      'debit',  250000, 2341400, 'BEFTN-00125', 'payment',  'pending'),
  ('BTX-20260525-0001', 1, '2026-05-25', 'Customer payment — Rahim Traders',       'credit', 500000, 2841400, 'bKash-8A3K2',  'receipt', 'pending'),
  ('BTX-20260518-0002', 2, '2026-05-18', 'Transfer to Islami Bank',                'debit',  200000,  900000, 'IFT-20510',   'transfer', 'approved'),
  ('BTX-20260522-0002', 2, '2026-05-22', 'Customer payment — Nur Traders',         'credit', 280000, 1180000, 'Nagad-9C5M',  'receipt',  'approved'),
  ('BTX-20260524-0001', 2, '2026-05-24', 'Office supplies',                        'debit',   12500, 1167500, 'PO-2024-119', 'payment',  'pending'),
  ('BTX-20260520-0002', 3, '2026-05-20', 'Salary — Office staff',                 'debit',   85000,  480000, 'CHQ-002339',  'salary',   'approved'),
  ('BTX-20260525-0002', 3, '2026-05-25', 'Customer payment — New',                 'credit',  75000,  555000, 'bKash-5C2F',  'receipt',  'pending');

-- ── suppliers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  supplier_code    VARCHAR(30) UNIQUE,
  company_name     VARCHAR(180) NOT NULL,
  contact_person   VARCHAR(120),
  phone            VARCHAR(30),
  mobile           VARCHAR(30),
  email            VARCHAR(180),
  address          TEXT,
  city             VARCHAR(80),
  country          VARCHAR(60) DEFAULT 'Bangladesh',
  supplier_type    ENUM('local','international','broker') DEFAULT 'local',
  payment_terms    INT DEFAULT 30 COMMENT 'days',
  credit_limit     DECIMAL(15,2) DEFAULT 0,
  current_balance  DECIMAL(15,2) DEFAULT 0,
  status           ENUM('active','inactive','blacklisted') DEFAULT 'active',
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO suppliers (supplier_code, company_name, contact_person, phone, city, supplier_type, payment_terms, current_balance) VALUES
  ('SUP-001', 'Gazi Enterprise',          'Md. Gazi',          '01711-100001', 'Dhaka',       'local',         30, 1200000),
  ('SUP-002', 'Al-Fatah Trading',         'Abdul Fatah',        '01711-100002', 'Chittagong',  'broker',        21, 850000),
  ('SUP-003', 'Rahim Commodities',        'Rahim Sheikh',       '01711-100003', 'Sirajgonj',   'local',         15, 420000),
  ('SUP-004', 'Global Wheat Corp',        'Mr. James',          '01711-100004', 'Dhaka',       'international', 45, 2800000),
  ('SUP-005', 'Orient Commodities',       'Shakil Ahmed',       '01711-100005', 'Dhaka',       'broker',        30, 680000),
  ('SUP-006', 'AgriTrade BD',             'Farhan Hossain',     '01711-100006', 'Narayanganj', 'local',         14, 310000);

-- ── customers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(180) NOT NULL,
  business_name    VARCHAR(180),
  phone_number     VARCHAR(30),
  mobile           VARCHAR(30),
  email            VARCHAR(180),
  address          TEXT,
  city             VARCHAR(80),
  customer_type    ENUM('credit','cash','wholesale') DEFAULT 'credit',
  credit_limit     DECIMAL(15,2) DEFAULT 0,
  current_balance  DECIMAL(15,2) DEFAULT 0,
  payment_terms    INT DEFAULT 30 COMMENT 'days',
  status           ENUM('active','inactive','blacklisted') DEFAULT 'active',
  branch_id        INT UNSIGNED,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO customers (name, business_name, phone_number, city, customer_type, credit_limit, current_balance, payment_terms, status, branch_id) VALUES
  ('Rahim Traders Ltd.',     'Rahim Flour Store',      '01811-200001', 'Sirajgonj',  'credit',    2000000, 1240000, 30, 'active',     1),
  ('Karim Stores',           'Karim Flour Depot',      '01811-200002', 'Sirajgonj',  'credit',    1500000,  820000, 21, 'active',     1),
  ('Al-Amin Trading',        'Al-Amin General Store',  '01811-200003', 'Pabna',       'credit',    1000000,  450000, 30, 'active',     1),
  ('Nur Traders',            'Nur Atta House',         '01811-200004', 'Bogura',      'credit',     800000,  680000, 14, 'active',     1),
  ('Haque Brothers',         'Haque Flour Mills',      '01811-200005', 'Rajshahi',    'credit',    1200000,  320000, 30, 'active',     2),
  ('Siddiqui & Sons',        'Siddiqui Trading Co.',   '01811-200006', 'Natore',      'credit',     500000,  490000, 14, 'active',     1),
  ('Badhon Flour Traders',   'Badhon Traders',         '01811-200007', 'Sirajgonj',  'credit',     600000,  180000, 21, 'active',     1),
  ('Dhaka Bakeries Co.',     'Dhaka Bakers Ltd.',      '01811-200008', 'Dhaka',       'credit',    3000000, 1800000, 30, 'active',     2),
  ('National Biscuit Ltd.',  'National Foods',         '01811-200009', 'Dhaka',       'credit',    2500000,  960000, 45, 'active',     2),
  ('Sundarban Foods',        'Sundarban Trading',      '01811-200010', 'Khulna',      'credit',     700000,  210000, 30, 'active',     2),
  ('Bismillah Trading',      NULL,                     '01811-200011', 'Sirajgonj',  'cash',          0,       0,   0, 'active',     1),
  ('Al Baraka Store',        NULL,                     '01811-200012', 'Sirajgonj',  'cash',          0,       0,   0, 'active',     1);

-- ── products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  base_name   VARCHAR(180) NOT NULL,
  category    VARCHAR(80),
  description TEXT,
  status      ENUM('active','inactive') DEFAULT 'active',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO products (base_name, category) VALUES
  ('2Hati Moida',   'Flour'),
  ('1Hati Moida',   'Flour'),
  ('Aam Moida',     'Flour'),
  ('Ruti Moida',    'Flour'),
  ('Elders Atta',   'Atta'),
  ('Mota Vushi',    'Bran'),
  ('Chikon Vushi',  'Bran'),
  ('Super Moida',   'Flour');

-- ── product_variants ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id      INT UNSIGNED NOT NULL,
  weight_variant  VARCHAR(30) NOT NULL COMMENT 'e.g. 50kg, 74kg',
  barcode         VARCHAR(60),
  unit_price      DECIMAL(10,2) DEFAULT 0,
  cost_price      DECIMAL(10,2) DEFAULT 0,
  stock_qty       INT DEFAULT 0          COMMENT 'bags in stock',
  reserved_qty    INT DEFAULT 0          COMMENT 'bags reserved for approved orders',
  reorder_level   INT DEFAULT 50,
  status          ENUM('active','inactive') DEFAULT 'active',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO product_variants (product_id, weight_variant, barcode, unit_price, cost_price, stock_qty, reserved_qty, reorder_level) VALUES
  (1, '50kg', '8901234567001',  2100.00, 1900.00,  850, 200, 100),
  (1, '74kg', '8901234567002',  3100.00, 2800.00,  320,  80,  50),
  (2, '50kg', '8901234567003',  1950.00, 1750.00,  620, 150,  80),
  (2, '74kg', '8901234567004',  2900.00, 2600.00,  280,  60,  40),
  (3, '50kg', '8901234567005',  1800.00, 1620.00,  480, 100,  80),
  (4, '50kg', '8901234567006',  1850.00, 1650.00,  360,  90,  60),
  (5, '50kg', '8901234567009',  1700.00, 1500.00,  220,  60,  50),
  (6, '37kg', '8901234567010',   850.00,  720.00, 1200, 300, 200),
  (7, '55kg', '8901234567011',  1100.00,  950.00,  890, 200, 150),
  (8, '50kg', '8901234567012',  2050.00, 1850.00,  410, 100,  60),
  (8, '74kg', '8901234567013',  3050.00, 2750.00,  175,  40,  30);

-- ── raw_material_stocks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS raw_material_stocks (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  location      VARCHAR(120),
  stock_mt      DECIMAL(10,2) DEFAULT 0  COMMENT 'current stock in metric tonnes',
  capacity_mt   DECIMAL(10,2) DEFAULT 0  COMMENT 'silo/storage capacity in MT',
  reorder_mt    DECIMAL(10,2) DEFAULT 0  COMMENT 'reorder trigger level in MT',
  status        ENUM('active','inactive') DEFAULT 'active',
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO raw_material_stocks (name, location, stock_mt, capacity_mt, reorder_mt) VALUES
  ('Hard Wheat (Import)', 'Silo A — Sirajgonj', 185, 500, 100),
  ('Soft Wheat (Local)',  'Silo B — Sirajgonj', 120, 300,  80),
  ('Ground Store',        'Open Storage',         45, 200,  60);

-- ── credit_orders ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_orders (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number          VARCHAR(30) NOT NULL UNIQUE,
  customer_id           INT UNSIGNED NOT NULL,
  branch_id             INT UNSIGNED,
  order_date            DATE NOT NULL,
  required_date         DATE,
  priority              ENUM('normal','high','urgent') DEFAULT 'normal',
  status                ENUM('pending_approval','escalated','approved','in_production',
                             'ready_to_ship','partial_delivery','delivered','completed',
                             'rejected','cancelled','dispatched') DEFAULT 'pending_approval',
  delivery_address      TEXT,
  special_notes         TEXT,
  total_amount          DECIMAL(15,2) DEFAULT 0,
  amount_paid           DECIMAL(15,2) DEFAULT 0,
  balance_due           DECIMAL(15,2) DEFAULT 0,
  total_weight_kg       DECIMAL(10,2),
  created_by_user_id    INT UNSIGNED,
  approved_by_user_id   INT UNSIGNED,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id)        REFERENCES customers(id),
  FOREIGN KEY (branch_id)          REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id)REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO credit_orders
  (order_number, customer_id, branch_id, order_date, required_date, priority, status,
   total_amount, amount_paid, balance_due, total_weight_kg, created_by_user_id, approved_by_user_id)
VALUES
  ('CR-20260520-0001', 1, 1, '2026-05-20', '2026-05-25', 'normal',  'delivered',       840000,  500000,  340000, 400.00, 2, 2),
  ('CR-20260521-0001', 2, 1, '2026-05-21', '2026-05-26', 'high',    'in_production',  1200000,  200000, 1000000, 600.00, 2, 2),
  ('CR-20260521-0002', 3, 1, '2026-05-21', '2026-05-27', 'normal',  'approved',        650000,       0,  650000, 325.00, 2, 2),
  ('CR-20260522-0001', 4, 1, '2026-05-22', '2026-05-28', 'urgent',  'pending_approval',960000,       0,  960000, 480.00, 3, NULL),
  ('CR-20260522-0002', 5, 2, '2026-05-22', '2026-05-29', 'normal',  'ready_to_ship',  1800000,  600000, 1200000, 900.00, 2, 2),
  ('CR-20260523-0001', 6, 1, '2026-05-23', '2026-05-30', 'high',    'pending_approval', 420000,      0,  420000, 210.00, 3, NULL),
  ('CR-20260523-0002', 8, 2, '2026-05-23', '2026-05-28', 'urgent',  'escalated',      1540000,       0, 1540000, 770.00, 2, NULL),
  ('CR-20260524-0001', 9, 2, '2026-05-24', '2026-05-29', 'normal',  'approved',        730000,  100000,  630000, 365.00, 2, 2),
  ('CR-20260524-0002', 1, 1, '2026-05-24', '2026-05-30', 'high',    'in_production',  1080000,       0, 1080000, 540.00, 2, 2),
  ('CR-20260525-0001', 2, 1, '2026-05-25', '2026-05-31', 'normal',  'pending_approval', 630000,     0,  630000, 315.00, 3, NULL),
  ('CR-20260525-0002', 3, 1, '2026-05-25', '2026-06-01', 'normal',  'pending_approval', 450000,     0,  450000, 225.00, 3, NULL),
  ('CR-20260525-0003', 10,2, '2026-05-25', '2026-06-01', 'high',    'ready_to_ship',   875000,  200000,  675000, 437.50, 2, 2),
  ('CR-20260526-0001', 4, 1, '2026-05-26', '2026-06-02', 'urgent',  'pending_approval', 720000,     0,  720000, 360.00, 3, NULL),
  ('CR-20260526-0002', 5, 2, '2026-05-26', '2026-06-03', 'normal',  'approved',        990000,       0,  990000, 495.00, 2, 2),
  ('CR-20260526-0003', 7, 1, '2026-05-26', '2026-06-02', 'normal',  'completed',       560000,  560000,       0, 280.00, 2, 2);

-- ── credit_order_items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_order_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED NOT NULL,
  product_id      INT UNSIGNED,
  variant_id      INT UNSIGNED,
  qty_bags        INT NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  line_total      DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id)    REFERENCES credit_orders(id)  ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id)       ON DELETE SET NULL,
  FOREIGN KEY (variant_id)  REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO credit_order_items (order_id, product_id, variant_id, qty_bags, unit_price, discount_amount, line_total) VALUES
  (1,  1, 1, 200, 2100.00,  0,     420000.00),
  (1,  1, 2, 100, 3100.00,  0,     310000.00),
  (1,  6, 8, 100,  850.00,  0,      85000.00),
  (2,  1, 2, 300, 3100.00,  0,     930000.00),
  (2,  5, 7, 100, 1700.00,  0,     170000.00),
  (3,  3, 5, 250, 1800.00,  0,     450000.00),
  (3,  4, 6, 100, 1850.00,  0,     185000.00),
  (4,  1, 1, 300, 2100.00,  0,     630000.00),
  (4,  1, 2, 100, 3100.00,  0,     310000.00),
  (5,  8,10, 400, 2050.00,  0,     820000.00),
  (5,  5, 7, 400, 1700.00,  0,     680000.00),
  (5,  7, 9, 200, 1100.00,  0,     220000.00),
  (6,  3, 5, 150, 1800.00,  0,     270000.00),
  (6,  6, 8, 150,  850.00,  0,     127500.00),
  (7,  1, 2, 300, 3100.00,  0,     930000.00),
  (7,  4, 6, 200, 1850.00,  0,     370000.00),
  (8,  2, 3, 250, 1950.00,  0,     487500.00),
  (8,  6, 8, 100,  850.00,  0,      85000.00),
  (9,  1, 1, 300, 2100.00,  0,     630000.00),
  (9,  5, 7, 200, 1700.00,  0,     340000.00),
  (10, 3, 5, 250, 1800.00,  0,     450000.00),
  (11, 2, 3, 150, 1950.00,  0,     292500.00),
  (12, 8,10, 250, 2050.00,  0,     512500.00),
  (12, 6, 8, 200,  850.00,  0,     170000.00),
  (13, 1, 2, 150, 3100.00,  0,     465000.00),
  (13, 5, 7, 150, 1700.00,  0,     255000.00),
  (14, 1, 1, 300, 2100.00,  0,     630000.00),
  (14, 4, 6, 150, 1850.00,  0,     277500.00),
  (14, 7, 9,  75, 1100.00,  0,      82500.00),
  (15, 3, 5, 200, 1800.00,  0,     360000.00),
  (15, 6, 8, 100,  850.00,  0,      85000.00),
  (15, 7, 9, 100, 1100.00,  0,     110000.00);

-- ── credit_order_workflow ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_order_workflow (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id             INT UNSIGNED NOT NULL,
  from_status          VARCHAR(40),
  to_status            VARCHAR(40) NOT NULL,
  action               VARCHAR(60),
  performed_by_user_id INT UNSIGNED,
  comments             TEXT,
  performed_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES credit_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at) VALUES
  (1, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-20 09:00:00'),
  (1, 'pending_approval','approved',         'approved', 2, 'Approved — within credit limit',                   '2026-05-20 10:30:00'),
  (1, 'approved',       'in_production',    'started',  5, 'Production started',                               '2026-05-20 14:00:00'),
  (1, 'in_production',  'ready_to_ship',    'completed',5, 'Production complete',                              '2026-05-21 11:00:00'),
  (1, 'ready_to_ship',  'delivered',        'delivered',2, 'Delivered to customer',                            '2026-05-22 16:00:00'),
  (2, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-21 08:30:00'),
  (2, 'pending_approval','approved',         'approved', 2, 'Approved',                                         '2026-05-21 10:00:00'),
  (2, 'approved',       'in_production',    'started',  5, 'Production started',                               '2026-05-21 13:00:00'),
  (3, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-21 09:00:00'),
  (3, 'pending_approval','approved',         'approved', 2, 'Approved',                                         '2026-05-22 09:30:00'),
  (4, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-22 08:00:00'),
  (5, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-22 09:00:00'),
  (5, 'pending_approval','approved',         'approved', 2, 'Approved — high value order',                      '2026-05-22 11:00:00'),
  (5, 'approved',       'in_production',    'started',  5, 'Production started',                               '2026-05-23 08:00:00'),
  (5, 'in_production',  'ready_to_ship',    'completed',5, 'Production complete — ready for dispatch',         '2026-05-24 15:00:00'),
  (6, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-23 10:00:00'),
  (7, NULL,             'pending_approval', 'created',  2, 'Order created',                                    '2026-05-23 11:00:00'),
  (7, 'pending_approval','escalated',        'escalated',2, 'Escalated — customer near credit limit',           '2026-05-23 14:00:00'),
  (8, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-24 08:00:00'),
  (8, 'pending_approval','approved',         'approved', 2, 'Approved',                                         '2026-05-24 10:00:00'),
  (9, NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-24 09:00:00'),
  (9, 'pending_approval','approved',         'approved', 2, 'Approved',                                         '2026-05-24 11:00:00'),
  (9, 'approved',       'in_production',    'started',  5, 'Production started',                               '2026-05-24 14:00:00'),
  (12,NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-25 08:30:00'),
  (12,'pending_approval','approved',          'approved', 2, 'Approved',                                        '2026-05-25 10:00:00'),
  (12,'approved',       'in_production',    'started',  5, 'Production started',                               '2026-05-25 12:00:00'),
  (12,'in_production',  'ready_to_ship',    'completed',5, 'Production complete',                              '2026-05-26 09:00:00'),
  (14,NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-26 08:00:00'),
  (14,'pending_approval','approved',          'approved', 2, 'Approved',                                        '2026-05-26 09:30:00'),
  (15,NULL,             'pending_approval', 'created',  3, 'Order created',                                    '2026-05-26 10:00:00'),
  (15,'pending_approval','approved',          'approved', 2, 'Approved',                                        '2026-05-26 11:00:00'),
  (15,'approved',       'in_production',    'started',  5, 'Production complete',                              '2026-05-26 13:00:00'),
  (15,'in_production',  'ready_to_ship',    'completed',5, 'Ready to ship',                                    '2026-05-26 16:00:00'),
  (15,'ready_to_ship',  'delivered',        'delivered',2, 'Delivered',                                        '2026-05-27 10:00:00'),
  (15,'delivered',      'completed',        'completed',3, 'Payment received in full',                         '2026-05-27 12:00:00');

-- ── customer_payments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_payments (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id           INT UNSIGNED NOT NULL,
  credit_order_id       INT UNSIGNED,
  payment_date          DATE NOT NULL,
  amount                DECIMAL(15,2) NOT NULL,
  payment_method        ENUM('cash','bkash','nagad','bank','cheque','other') DEFAULT 'cash',
  reference_number      VARCHAR(80),
  bank_account_id       INT UNSIGNED,
  collected_by_user_id  INT UNSIGNED,
  allocation_status     ENUM('unallocated','allocated','partial') DEFAULT 'unallocated',
  notes                 TEXT,
  created_by_user_id    INT UNSIGNED,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id)           REFERENCES customers(id),
  FOREIGN KEY (credit_order_id)       REFERENCES credit_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (bank_account_id)       REFERENCES bank_accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (collected_by_user_id)  REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id)    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO customer_payments (customer_id, credit_order_id, payment_date, amount, payment_method, reference_number, allocation_status, created_by_user_id) VALUES
  (1, 1, '2026-05-22', 500000, 'bank',  'BEFTN-001-2026', 'allocated',   3),
  (2, 2, '2026-05-23', 200000, 'bkash', 'BK-8A3K2JG9P1', 'allocated',   4),
  (5, 5, '2026-05-24', 600000, 'bank',  'BEFTN-002-2026', 'allocated',   3),
  (8, 8, '2026-05-24', 100000, 'cash',  NULL,             'allocated',   4),
  (9, 12,'2026-05-25', 200000, 'bank',  'BEFTN-003-2026', 'allocated',   3),
  (7, 15,'2026-05-27', 560000, 'bank',  'BEFTN-004-2026', 'allocated',   3),
  (1, NULL,'2026-05-15',250000,'cash',  NULL,             'unallocated', 4),
  (3, NULL,'2026-05-18',150000,'nagad', 'NG-7B9X3LP2Q4', 'unallocated', 4);

-- ── purchase_orders_adnan ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders_adnan (
  id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_number                VARCHAR(30) NOT NULL UNIQUE,
  po_date                  DATE NOT NULL,
  supplier_id              INT UNSIGNED,
  supplier_name            VARCHAR(180),
  wheat_origin             VARCHAR(80),
  expected_delivery_date   DATE,
  quantity_kg              DECIMAL(12,3) NOT NULL,
  unit_price_per_kg        DECIMAL(10,4) NOT NULL,
  total_order_value        DECIMAL(15,2) NOT NULL,
  total_received_qty       DECIMAL(12,3) DEFAULT 0,
  qty_yet_to_receive       DECIMAL(12,3),
  total_paid               DECIMAL(15,2) DEFAULT 0,
  balance_payable          DECIMAL(15,2),
  po_status                ENUM('pending','confirmed','partial','closed','cancelled') DEFAULT 'pending',
  delivery_status          ENUM('pending','partial','completed') DEFAULT 'pending',
  payment_status           ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
  is_delivery_locked       TINYINT(1) DEFAULT 0,
  delivery_lock_reason     TEXT,
  delivery_locked_by_user_id INT UNSIGNED,
  delivery_locked_at       DATETIME,
  branch_id                INT UNSIGNED,
  created_by_user_id       INT UNSIGNED,
  remarks                  TEXT,
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id)              REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (branch_id)               REFERENCES branches(id)  ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id)      REFERENCES users(id)     ON DELETE SET NULL,
  FOREIGN KEY (delivery_locked_by_user_id) REFERENCES users(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO purchase_orders_adnan
  (po_number, po_date, supplier_id, supplier_name, wheat_origin, expected_delivery_date,
   quantity_kg, unit_price_per_kg, total_order_value, total_received_qty, qty_yet_to_receive,
   total_paid, balance_payable, po_status, delivery_status, payment_status, branch_id, created_by_user_id)
VALUES
  ('PO-20260510-0001','2026-05-10',1,'Gazi Enterprise',       'কানাডা',  '2026-05-18', 48000, 45.00, 2160000, 48000, 0,      1620000,  540000, 'closed',  'completed','partial', 1, 2),
  ('PO-20260515-0001','2026-05-15',2,'Al-Fatah Trading',      'রাশিয়া',  '2026-05-23', 32000, 41.50, 1328000, 25000, 7000,    800000,  528000, 'partial', 'partial',  'partial', 1, 2),
  ('PO-20260518-0001','2026-05-18',3,'Rahim Commodities',     'Australia','2026-05-25', 60000, 45.00, 2700000,     0, 60000,        0, 2700000, 'confirmed','pending',  'unpaid',  1, 2),
  ('PO-20260520-0001','2026-05-20',4,'Global Wheat Corp',     'Ukraine',  '2026-05-28',100000, 43.00, 4300000,     0,100000,        0, 4300000, 'confirmed','pending',  'unpaid',  2, 2),
  ('PO-20260522-0001','2026-05-22',5,'Orient Commodities',    'India',    '2026-05-30', 40000, 40.00, 1600000,     0, 40000,        0, 1600000, 'pending', 'pending',  'unpaid',  1, 2),
  ('PO-20260524-0001','2026-05-24',6,'AgriTrade BD',          'Local',    '2026-06-01', 20000, 38.00,  760000,     0, 20000,        0,  760000, 'pending', 'pending',  'unpaid',  1, 3);

-- ── goods_received_adnan ──────────────────────────────────────
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
  variance_percentage      DECIMAL(8,4) DEFAULT 0,
  quality_grade            ENUM('A','B','C','R') DEFAULT 'A',
  truck_number             VARCHAR(40),
  transporter_name         VARCHAR(120),
  unload_point_name        VARCHAR(120),
  unload_point_branch_id   INT UNSIGNED,
  grn_status               ENUM('draft','confirmed','rejected') DEFAULT 'confirmed',
  notes                    TEXT,
  created_by_user_id       INT UNSIGNED,
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id)       REFERENCES purchase_orders_adnan(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id)             REFERENCES suppliers(id)             ON DELETE SET NULL,
  FOREIGN KEY (unload_point_branch_id)  REFERENCES branches(id)              ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id)      REFERENCES users(id)                 ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO goods_received_adnan
  (grn_number, grn_date, purchase_order_id, po_number, supplier_id, supplier_name,
   quantity_received_kg, unit_price_per_kg, total_value, quality_grade, truck_number, grn_status,
   unload_point_branch_id, created_by_user_id)
VALUES
  ('GRN-20260513-0001','2026-05-13',1,'PO-20260510-0001',1,'Gazi Enterprise',      48000, 45.00,2160000,'A','Dhaka Metro TRK-01','confirmed',1,5),
  ('GRN-20260519-0001','2026-05-19',2,'PO-20260515-0001',2,'Al-Fatah Trading',     25000, 41.50,1037500,'B','CTG-45-K-1122',    'confirmed',1,5);

-- ── purchase_payments_adnan ───────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_payments_adnan (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id    INT UNSIGNED,
  payment_date         DATE NOT NULL,
  amount               DECIMAL(15,2) NOT NULL,
  payment_method       ENUM('bank','cash','cheque','other') DEFAULT 'bank',
  reference_number     VARCHAR(80),
  bank_account_id      INT UNSIGNED,
  payment_status       ENUM('pending','approved','rejected') DEFAULT 'approved',
  created_by_user_id   INT UNSIGNED,
  approved_by_user_id  INT UNSIGNED,
  notes                TEXT,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id)    REFERENCES purchase_orders_adnan(id) ON DELETE SET NULL,
  FOREIGN KEY (bank_account_id)      REFERENCES bank_accounts(id)         ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id)   REFERENCES users(id)                 ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id)  REFERENCES users(id)                 ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO purchase_payments_adnan
  (purchase_order_id, payment_date, amount, payment_method, reference_number, bank_account_id, created_by_user_id, approved_by_user_id)
VALUES
  (1,'2026-05-14',1000000,'bank','BEFTN-PO-0001',1,3,2),
  (1,'2026-05-20', 620000,'bank','BEFTN-PO-0002',1,3,2),
  (2,'2026-05-19', 500000,'bank','BEFTN-PO-0003',1,3,2),
  (2,'2026-05-22', 300000,'bank','BEFTN-PO-0004',1,3,2);

-- ── expense_categories ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_categories (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name  VARCHAR(120) NOT NULL,
  category_code  VARCHAR(20),
  is_active      TINYINT(1) DEFAULT 1,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO expense_categories (category_name, category_code) VALUES
  ('Fuel & Transport',  'FUEL'),
  ('Labour & Wages',    'LABR'),
  ('Maintenance',       'MAINT'),
  ('Office & Admin',    'OFFICE'),
  ('Utilities',         'UTIL'),
  ('Marketing',         'MKT'),
  ('Other',             'OTHER');

-- ── expense_subcategories ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_subcategories (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id      INT UNSIGNED NOT NULL,
  subcategory_name VARCHAR(120) NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO expense_subcategories (category_id, subcategory_name) VALUES
  (1, 'Vehicle Fuel'),
  (1, 'Driver Allowance'),
  (1, 'Vehicle Hire'),
  (2, 'Daily Labour'),
  (2, 'Overtime'),
  (2, 'Contractor'),
  (3, 'Vehicle Repair'),
  (3, 'Machine Repair'),
  (3, 'Building Maintenance'),
  (4, 'Stationery'),
  (4, 'Printing'),
  (4, 'Software/Internet'),
  (5, 'Electricity'),
  (5, 'Water & Gas'),
  (6, 'Advertising'),
  (6, 'Promotions');

-- ── expense_vouchers ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_vouchers (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_number       VARCHAR(30) NOT NULL UNIQUE,
  expense_date         DATE NOT NULL,
  category_id          INT UNSIGNED,
  subcategory_id       INT UNSIGNED,
  unit_quantity        DECIMAL(10,2),
  per_unit_cost        DECIMAL(10,2),
  total_amount         DECIMAL(12,2) NOT NULL,
  payment_method       ENUM('Cash','Bank Transfer','Cheque','Mobile Banking') DEFAULT 'Cash',
  bank_account_id      INT UNSIGNED,
  handled_by_person    VARCHAR(120),
  remarks              TEXT,
  status               ENUM('pending','approved','rejected') DEFAULT 'pending',
  branch_id            INT UNSIGNED,
  created_by_user_id   INT UNSIGNED,
  approved_by_user_id  INT UNSIGNED,
  approved_at          DATETIME,
  rejection_reason     TEXT,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id)          REFERENCES expense_categories(id)    ON DELETE SET NULL,
  FOREIGN KEY (subcategory_id)       REFERENCES expense_subcategories(id) ON DELETE SET NULL,
  FOREIGN KEY (bank_account_id)      REFERENCES bank_accounts(id)         ON DELETE SET NULL,
  FOREIGN KEY (branch_id)            REFERENCES branches(id)              ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id)   REFERENCES users(id)                 ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id)  REFERENCES users(id)                 ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO expense_vouchers (voucher_number, expense_date, category_id, subcategory_id, unit_quantity, per_unit_cost, total_amount, payment_method, handled_by_person, remarks, status, branch_id, created_by_user_id, approved_by_user_id, approved_at) VALUES
  ('EXP-20260520-0001','2026-05-20',1,1, 50,  250.00, 12500.00,'Cash',         'Karim Driver',       'Fuel for TRK-02 (Sirajgonj route)',         'approved',1,3,2,'2026-05-20 11:00:00'),
  ('EXP-20260521-0001','2026-05-21',4,10, 1, 3200.00,  3200.00,'Cash',         'Office Staff',       'Office supplies — printer cartridge',        'approved',1,3,2,'2026-05-21 10:00:00'),
  ('EXP-20260521-0002','2026-05-21',2,5,  1, 8000.00,  8000.00,'Cash',         'Production Team',    'Driver overtime allowance',                  'approved',1,5,2,'2026-05-21 14:00:00'),
  ('EXP-20260522-0001','2026-05-22',3,7,  1,24000.00, 24000.00,'Bank Transfer','Workshop',           'Maintenance: TRK-01 brake service',          'approved',1,3,2,'2026-05-22 09:30:00'),
  ('EXP-20260523-0001','2026-05-23',5,13, 1,15000.00, 15000.00,'Bank Transfer','DESCO',              'Monthly electricity bill — Sirajgonj plant', 'approved',1,3,2,'2026-05-23 11:00:00'),
  ('EXP-20260524-0001','2026-05-24',1,1, 40,  250.00, 10000.00,'Cash',         'Rahim Driver',       'Fuel for delivery run Sirajgonj-Dhaka',       'approved',2,6,2,'2026-05-24 10:00:00'),
  ('EXP-20260524-0002','2026-05-24',2,4, 10, 1200.00, 12000.00,'Cash',         'Site Supervisor',    'Daily labour — loading/unloading',            'approved',1,5,2,'2026-05-24 16:00:00'),
  ('EXP-20260525-0001','2026-05-25',1,1, 60,  250.00, 15000.00,'Cash',         'Jalal Driver',       'Fuel for TRK-03',                             'pending', 1,3,NULL,NULL),
  ('EXP-20260525-0002','2026-05-25',4,11, 1,  800.00,   800.00,'Cash',         'Admin Staff',        'Photocopy and printing expenses',             'pending', 1,3,NULL,NULL),
  ('EXP-20260525-0003','2026-05-25',3,8,  1, 5500.00,  5500.00,'Cash',         'Technician',         'Mill belt replacement',                       'pending', 1,5,NULL,NULL),
  ('EXP-20260526-0001','2026-05-26',2,5,  5, 2000.00, 10000.00,'Cash',         'Production Manager', 'Overtime — night shift 3 workers',            'pending', 1,5,NULL,NULL),
  ('EXP-20260526-0002','2026-05-26',1,3,  1,18000.00, 18000.00,'Bank Transfer','Transport Co.',      'Hired truck for bulk delivery',               'pending', 2,6,NULL,NULL);

-- ── production_schedule (optional, used by production-queue API) ──
CREATE TABLE IF NOT EXISTS production_schedule (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  credit_order_id   INT UNSIGNED,
  scheduled_date    DATE,
  progress_pct      TINYINT DEFAULT 0,
  started_at        DATETIME,
  completed_at      DATETIME,
  notes             TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credit_order_id) REFERENCES credit_orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO production_schedule (credit_order_id, scheduled_date, progress_pct, started_at) VALUES
  (2, '2026-05-21', 65, '2026-05-21 13:00:00'),
  (9, '2026-05-24', 40, '2026-05-24 14:00:00');

-- ── customer_ledger (optional, ledger API falls back to orders+payments if missing) ──
CREATE TABLE IF NOT EXISTS customer_ledger (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id     INT UNSIGNED NOT NULL,
  entry_date      DATE NOT NULL,
  entry_type      ENUM('Sale Invoice','Payment Received','Credit Note','Opening Balance','Adjustment') NOT NULL,
  reference_number VARCHAR(80),
  description     TEXT,
  debit_amount    DECIMAL(15,2) DEFAULT 0,
  credit_amount   DECIMAL(15,2) DEFAULT 0,
  running_balance DECIMAL(15,2) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── vehicles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(30) NOT NULL UNIQUE,
  vehicle_type   ENUM('own','rented','outsourced') DEFAULT 'own',
  category       ENUM('truck','van','pickup','mini_truck') DEFAULT 'truck',
  capacity_mt    DECIMAL(6,2),
  driver_name    VARCHAR(120),
  driver_phone   VARCHAR(30),
  status         ENUM('active','maintenance','retired') DEFAULT 'active',
  next_service   DATE,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO vehicles (vehicle_number, vehicle_type, category, capacity_mt, driver_name, driver_phone, status, next_service) VALUES
  ('TRK-01', 'own',    'truck',      15,   'Kamal Hossain', '01711-300001', 'active',      '2026-06-15'),
  ('TRK-02', 'own',    'truck',      15,   'Rahim Driver',  '01711-300002', 'active',      '2026-07-01'),
  ('TRK-03', 'rented', 'truck',      10,   'Jalal Mia',     '01711-300003', 'active',      NULL),
  ('TRK-04', 'own',    'truck',      15,   NULL,            NULL,           'maintenance', '2026-05-28'),
  ('VAN-01', 'own',    'van',        3,    'Sabu Rahman',   '01711-300004', 'active',      '2026-08-10'),
  ('VAN-02', 'own',    'van',        3,    'Noor Ahmed',    '01711-300005', 'active',      '2026-07-20'),
  ('PKP-01', 'own',    'pickup',     1.5,  'Faruk Hasan',   '01711-300006', 'active',      '2026-09-01');

-- ── pos_sales ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pos_sales (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  receipt_number   VARCHAR(40) UNIQUE,
  sale_date        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  branch_id        INT UNSIGNED,
  customer_name    VARCHAR(120) DEFAULT 'Walk-in',
  product_variant_id INT UNSIGNED,
  product_name     VARCHAR(180),
  quantity         INT NOT NULL DEFAULT 1,
  unit_price       DECIMAL(10,2) NOT NULL,
  discount         DECIMAL(10,2) DEFAULT 0,
  total_amount     DECIMAL(15,2) NOT NULL,
  payment_method   ENUM('cash','mobile_banking','card','credit') DEFAULT 'cash',
  cashier_name     VARCHAR(120),
  notes            TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id)          REFERENCES branches(id)          ON DELETE SET NULL,
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO pos_sales (receipt_number, sale_date, branch_id, customer_name, product_variant_id, product_name, quantity, unit_price, total_amount, payment_method, cashier_name) VALUES
  ('POS-20260519-0001', '2026-05-19 09:10:00', 1, 'Walk-in',        1, '2Hati Moida 50kg',  10, 2100, 21000, 'cash',           'Karim Ahmed'),
  ('POS-20260519-0002', '2026-05-19 10:30:00', 1, 'Rahim Traders',  3, '1Hati Moida 50kg',  20, 1950, 39000, 'mobile_banking', 'Karim Ahmed'),
  ('POS-20260520-0001', '2026-05-20 08:45:00', 1, 'Walk-in',        5, 'Elders Atta 50kg',  15, 1700, 25500, 'cash',           'Karim Ahmed'),
  ('POS-20260520-0002', '2026-05-20 11:15:00', 2, 'Walk-in',        1, '2Hati Moida 50kg',   8, 2100, 16800, 'cash',           'Nasrin Akhter'),
  ('POS-20260521-0001', '2026-05-21 09:00:00', 1, 'Karim Depot',    3, '1Hati Moida 50kg',  25, 1950, 48750, 'mobile_banking', 'Karim Ahmed'),
  ('POS-20260521-0002', '2026-05-21 14:20:00', 1, 'Walk-in',        6, 'Mota Vushi 37kg',   30,  850, 25500, 'cash',           'Karim Ahmed'),
  ('POS-20260522-0001', '2026-05-22 08:30:00', 1, 'Walk-in',        1, '2Hati Moida 50kg',  12, 2100, 25200, 'cash',           'Karim Ahmed'),
  ('POS-20260522-0002', '2026-05-22 10:00:00', 2, 'Flour Depot',    5, 'Elders Atta 50kg',  20, 1700, 34000, 'card',           'Nasrin Akhter'),
  ('POS-20260523-0001', '2026-05-23 09:15:00', 1, 'Walk-in',        7, 'Chikon Vushi 55kg', 15, 1100, 16500, 'cash',           'Karim Ahmed'),
  ('POS-20260523-0002', '2026-05-23 13:30:00', 1, 'Nur Traders',    3, '1Hati Moida 50kg',  30, 1950, 58500, 'mobile_banking', 'Karim Ahmed'),
  ('POS-20260524-0001', '2026-05-24 08:00:00', 1, 'Walk-in',        1, '2Hati Moida 50kg',  18, 2100, 37800, 'cash',           'Karim Ahmed'),
  ('POS-20260524-0002', '2026-05-24 09:30:00', 2, 'Walk-in',        1, '2Hati Moida 50kg',  10, 2100, 21000, 'cash',           'Nasrin Akhter'),
  ('POS-20260524-0003', '2026-05-24 15:00:00', 1, 'Ahmed Stores',   4, 'Ruti Moida 50kg',   20, 1850, 37000, 'mobile_banking', 'Karim Ahmed'),
  ('POS-20260525-0001', '2026-05-25 08:10:00', 1, 'Walk-in',        1, '2Hati Moida 50kg',  22, 2100, 46200, 'cash',           'Karim Ahmed'),
  ('POS-20260525-0002', '2026-05-25 10:45:00', 1, 'City Flour',     3, '1Hati Moida 50kg',  35, 1950, 68250, 'mobile_banking', 'Karim Ahmed'),
  ('POS-20260525-0003', '2026-05-25 13:00:00', 2, 'Walk-in',        5, 'Elders Atta 50kg',  12, 1700, 20400, 'cash',           'Nasrin Akhter');

SET foreign_key_checks = 1;

-- ── Done ─────────────────────────────────────────────────────
SELECT 'Schema and seed data loaded successfully.' AS status;

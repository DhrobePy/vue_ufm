-- ═══════════════════════════════════════════════════════════════
-- Fleet ERP Migration v2 — Full Fleet Management Module
-- Run once against: ujjalfmc_saas (dev) / ujjalfmc_vue_ufm (prod)
-- SAFE: Uses IF NOT EXISTS / IF EXISTS — will not break existing data
-- ═══════════════════════════════════════════════════════════════

-- ── 1. FLEET VEHICLES (new comprehensive table) ───────────────
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  registration_no   VARCHAR(40) NOT NULL UNIQUE,
  vehicle_type      ENUM('TRUCK','PICKUP','VAN','MINI_TRUCK','AIRPORT_SHUTTLE','OTHER') DEFAULT 'TRUCK',
  make              VARCHAR(80),
  model             VARCHAR(80),
  engine_no         VARCHAR(80),
  chassis_no        VARCHAR(80),
  year_of_mfg       YEAR,
  fuel_type         ENUM('DIESEL','PETROL','CNG','ELECTRIC','HYBRID') DEFAULT 'DIESEL',
  ownership_type    ENUM('OWNED','RENTED','LEASED','BORROWED') DEFAULT 'OWNED',
  weight_capacity_kg DECIMAL(10,2),
  current_odometer  INT UNSIGNED DEFAULT 0,
  status            ENUM('available','busy','repair','inactive') DEFAULT 'available',
  assigned_driver_id INT UNSIGNED,
  remarks           TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_status (status)
) ENGINE=InnoDB;

-- ── 2. VEHICLE DOCUMENTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id      INT UNSIGNED NOT NULL,
  document_type   VARCHAR(80)  NOT NULL,
  document_no     VARCHAR(120),
  issue_date      DATE,
  expiry_date     DATE,
  issuing_authority VARCHAR(120),
  attachment_url  VARCHAR(500),
  notes           TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vehicle (vehicle_id),
  KEY idx_expiry (expiry_date)
) ENGINE=InnoDB;

-- ── 3. VEHICLE TYRE HISTORY ───────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_tyre_history (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id       INT UNSIGNED NOT NULL,
  position         VARCHAR(40),
  brand            VARCHAR(80),
  size             VARCHAR(40),
  fitted_date      DATE,
  odometer_fitted  INT UNSIGNED,
  removed_date     DATE,
  odometer_removed INT UNSIGNED,
  cost             DECIMAL(12,2),
  notes            TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vehicle (vehicle_id)
) ENGINE=InnoDB;

-- ── 4. VEHICLE BATTERY HISTORY ────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_battery_history (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id   INT UNSIGNED NOT NULL,
  brand        VARCHAR(80),
  capacity_ah  INT,
  fitted_date  DATE,
  removed_date DATE,
  cost         DECIMAL(12,2),
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vehicle (vehicle_id)
) ENGINE=InnoDB;

-- ── 5. FLEET DRIVERS (new comprehensive table) ────────────────
CREATE TABLE IF NOT EXISTS fleet_drivers (
  id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name                VARCHAR(120) NOT NULL,
  mobile                   VARCHAR(30),
  nid                      VARCHAR(30),
  address                  TEXT,
  joining_date             DATE,
  photo_url                VARCHAR(500),
  emergency_contact_name   VARCHAR(120),
  emergency_contact_mobile VARCHAR(30),
  status                   ENUM('active','inactive','suspended') DEFAULT 'active',
  assigned_vehicle_id      INT UNSIGNED,
  remarks                  TEXT,
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_status (status)
) ENGINE=InnoDB;

-- ── 6. DRIVER DOCUMENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_documents (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  driver_id       INT UNSIGNED NOT NULL,
  document_type   VARCHAR(80)  NOT NULL,
  document_no     VARCHAR(120),
  issue_date      DATE,
  expiry_date     DATE,
  issuing_authority VARCHAR(120),
  attachment_url  VARCHAR(500),
  expiry_status   ENUM('valid','expiring_soon','expired') DEFAULT 'valid',
  notes           TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_driver (driver_id),
  KEY idx_expiry (expiry_date)
) ENGINE=InnoDB;

-- ── 7. DRIVER EMPLOYMENT HISTORY ─────────────────────────────
CREATE TABLE IF NOT EXISTS driver_employment_history (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  driver_id    INT UNSIGNED NOT NULL,
  company_name VARCHAR(200),
  designation  VARCHAR(120),
  start_date   DATE,
  end_date     DATE,
  remarks      TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_driver (driver_id)
) ENGINE=InnoDB;

-- ── 8. TRIPS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_number         VARCHAR(40) NOT NULL UNIQUE,
  trip_date           DATE NOT NULL,
  departure_time      TIME,
  origin              VARCHAR(200),
  destination         VARCHAR(200),
  customer_id         INT UNSIGNED,
  vehicle_id          INT UNSIGNED NOT NULL,
  driver_id           INT UNSIGNED NOT NULL,
  estimated_duration  DECIMAL(5,2),
  quantity            DECIMAL(10,2),
  weight_kg           DECIMAL(12,2),
  goods_description   TEXT,
  trip_charge         DECIMAL(12,2) DEFAULT 0,
  advance_amount      DECIMAL(12,2) DEFAULT 0,
  destination_account VARCHAR(200),
  payment_date        DATE,
  trip_status         ENUM('scheduled','in_progress','completed','cancelled','closed') DEFAULT 'scheduled',
  report_status       ENUM('unreported','reported') DEFAULT 'unreported',
  notes               TEXT,
  created_by_user_id  INT UNSIGNED,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_date (trip_date),
  KEY idx_status (trip_status),
  KEY idx_vehicle (vehicle_id),
  KEY idx_driver (driver_id)
) ENGINE=InnoDB;

-- ── 9. TRIP ADVANCES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_advances (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id   INT UNSIGNED NOT NULL,
  amount    DECIMAL(12,2) NOT NULL,
  purpose   VARCHAR(200),
  given_by  VARCHAR(120),
  given_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes     TEXT,
  KEY idx_trip (trip_id)
) ENGINE=InnoDB;

-- ── 10. TRIP EXPENSES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_expenses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id     INT UNSIGNED NOT NULL,
  category    VARCHAR(80),
  description VARCHAR(200),
  amount      DECIMAL(12,2) NOT NULL,
  incurred_by VARCHAR(120),
  receipt_url VARCHAR(500),
  incurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes       TEXT,
  KEY idx_trip (trip_id)
) ENGINE=InnoDB;

-- ── 11. FLEET FUEL LOGS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS fleet_fuel_logs (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id           INT UNSIGNED NOT NULL,
  driver_id            INT UNSIGNED,
  fuel_date            DATE NOT NULL,
  fuel_type            ENUM('DIESEL','PETROL','CNG','ELECTRIC') DEFAULT 'DIESEL',
  quantity_liters      DECIMAL(10,3) NOT NULL,
  price_per_liter      DECIMAL(10,4),
  total_amount         DECIMAL(12,2),
  odometer_reading     INT UNSIGNED,
  previous_odometer    INT UNSIGNED,
  station_name         VARCHAR(120),
  receipt_no           VARCHAR(80),
  trip_id              INT UNSIGNED,
  created_by_user_id   INT UNSIGNED,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vehicle (vehicle_id),
  KEY idx_date (fuel_date)
) ENGINE=InnoDB;

-- ── 12. PREVENTIVE MAINTENANCE RULES ─────────────────────────
CREATE TABLE IF NOT EXISTS preventive_maintenance_rules (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_name    VARCHAR(200) NOT NULL,
  vehicle_type VARCHAR(80),
  interval_km  INT UNSIGNED,
  interval_days INT UNSIGNED,
  description  TEXT,
  is_active    TINYINT(1) DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 13. MAINTENANCE REQUESTS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_no          VARCHAR(40) UNIQUE,
  vehicle_id          INT UNSIGNED NOT NULL,
  request_date        DATE NOT NULL,
  repair_type         ENUM('corrective','preventive') DEFAULT 'corrective',
  station_supplier    VARCHAR(200),
  issue_description   TEXT,
  status              ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  completed_date      DATE,
  total_cost          DECIMAL(12,2) DEFAULT 0,
  odometer_at_request INT UNSIGNED,
  created_by_user_id  INT UNSIGNED,
  approved_by_user_id INT UNSIGNED,
  notes               TEXT,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vehicle (vehicle_id),
  KEY idx_status (status),
  KEY idx_date (request_date)
) ENGINE=InnoDB;

-- ── 14. MAINTENANCE TASKS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  maintenance_id INT UNSIGNED NOT NULL,
  description    VARCHAR(300) NOT NULL,
  service_cost   DECIMAL(12,2) DEFAULT 0,
  is_completed   TINYINT(1) DEFAULT 0,
  KEY idx_maint (maintenance_id)
) ENGINE=InnoDB;

-- ── 15. MAINTENANCE MATERIALS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_materials (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  maintenance_id INT UNSIGNED NOT NULL,
  item_name      VARCHAR(200) NOT NULL,
  quantity       DECIMAL(10,3) NOT NULL,
  unit_rate      DECIMAL(12,4),
  amount         DECIMAL(12,2),
  KEY idx_maint (maintenance_id)
) ENGINE=InnoDB;

-- ── 16. FLEET ITEM CATEGORIES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS fleet_item_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description TEXT,
  parent_id   INT UNSIGNED,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 17. FLEET ITEMS (Parts & Supplies) ───────────────────────
CREATE TABLE IF NOT EXISTS fleet_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED,
  item_code     VARCHAR(60) UNIQUE,
  item_name     VARCHAR(200) NOT NULL,
  unit          VARCHAR(30) DEFAULT 'pcs',
  current_stock DECIMAL(12,3) DEFAULT 0,
  reorder_level DECIMAL(12,3) DEFAULT 0,
  unit_cost     DECIMAL(12,4),
  description   TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category (category_id)
) ENGINE=InnoDB;

-- ── 18. FLEET PURCHASES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS fleet_purchases (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_number          VARCHAR(40) UNIQUE,
  supplier_id        INT UNSIGNED,
  supplier_name      VARCHAR(200),
  purchase_date      DATE NOT NULL,
  status             ENUM('pending','approved','received','cancelled') DEFAULT 'pending',
  total_amount       DECIMAL(14,2) DEFAULT 0,
  paid_amount        DECIMAL(14,2) DEFAULT 0,
  notes              TEXT,
  created_by_user_id INT UNSIGNED,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_date (purchase_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fleet_purchase_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT UNSIGNED NOT NULL,
  item_id     INT UNSIGNED,
  item_name   VARCHAR(200),
  quantity    DECIMAL(12,3) NOT NULL,
  unit_rate   DECIMAL(12,4),
  amount      DECIMAL(12,2),
  KEY idx_purchase (purchase_id)
) ENGINE=InnoDB;

-- ── SEED: Sample fleet_vehicles ───────────────────────────────
INSERT IGNORE INTO fleet_vehicles (registration_no, vehicle_type, make, model, fuel_type, ownership_type, weight_capacity_kg, current_odometer, status) VALUES
  ('DHAKA-TRK-01', 'TRUCK',  'Tata',  '1613',  'DIESEL', 'OWNED',  15000, 45200, 'available'),
  ('DHAKA-TRK-02', 'TRUCK',  'Isuzu', 'NQR',   'DIESEL', 'OWNED',  12000, 38100, 'available'),
  ('DHAKA-TRK-03', 'TRUCK',  'Tata',  '407',   'DIESEL', 'RENTED', 10000, 22500, 'available'),
  ('DHAKA-TRK-04', 'TRUCK',  'Tata',  '1613',  'DIESEL', 'OWNED',  15000, 61800, 'repair'),
  ('DHAKA-VAN-01', 'VAN',    'Toyota','Hiace',  'DIESEL', 'OWNED',  3000,  78200, 'available'),
  ('DHAKA-VAN-02', 'VAN',    'Toyota','Hiace',  'DIESEL', 'OWNED',  3000,  55400, 'available'),
  ('DHAKA-PKP-01', 'PICKUP', 'Toyota','Hilux',  'DIESEL', 'OWNED',  1500,  32100, 'available');

-- ── SEED: Sample fleet_drivers ────────────────────────────────
INSERT IGNORE INTO fleet_drivers (full_name, mobile, joining_date, status) VALUES
  ('Kamal Hossain', '01711-300001', '2020-01-15', 'active'),
  ('Rahim Mia',     '01711-300002', '2020-03-10', 'active'),
  ('Jalal Uddin',   '01711-300003', '2021-06-01', 'active'),
  ('Sabu Rahman',   '01711-300004', '2019-11-20', 'active'),
  ('Noor Ahmed',    '01711-300005', '2022-02-14', 'active'),
  ('Faruk Hasan',   '01711-300006', '2021-09-05', 'active');

-- ── SEED: Preventive maintenance rules ────────────────────────
INSERT IGNORE INTO preventive_maintenance_rules (rule_name, interval_km, interval_days, description) VALUES
  ('Engine Oil Change',    5000,  90,  'Replace engine oil and filter every 5,000 km or 90 days'),
  ('Air Filter Change',   15000, 180, 'Clean or replace air filter every 15,000 km'),
  ('Brake Inspection',    10000, 120, 'Check brake pads, disc and fluid'),
  ('Tyre Rotation',       10000, NULL,'Rotate tyres and check pressure'),
  ('Full Annual Service', 30000, 365, 'Comprehensive annual service including all filters, belts, hoses');

-- ── SEED: Item categories ──────────────────────────────────────
INSERT IGNORE INTO fleet_item_categories (name, description) VALUES
  ('Engine Parts',   'Engine related spare parts'),
  ('Tyres & Wheels', 'Tyres, rims, tubes'),
  ('Brakes',         'Brake pads, discs, fluid'),
  ('Electrical',     'Battery, alternator, fuses, wiring'),
  ('Lubricants',     'Engine oil, gear oil, grease'),
  ('Filters',        'Oil, air, fuel, coolant filters'),
  ('Body Parts',     'Mirrors, lights, bumpers, glass'),
  ('Tools',          'Workshop tools and equipment');

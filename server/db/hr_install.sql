-- ============================================================
-- Ujjal FMC ERP — HR Module Full Install (rigghrm migrated)
-- Database  : ujjalfmc_saas
-- Prefix    : hr_ on all tables (branches table reused from ERP)
-- Run once  — safe to re-run (DROP IF EXISTS + CREATE IF NOT EXISTS)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- ── DROP OLD WRONG-SCHEMA TABLES ──────────────────────────────
DROP TABLE IF EXISTS `hr_payroll_items`;
DROP TABLE IF EXISTS `hr_payroll_details`;
DROP TABLE IF EXISTS `hr_loan_installments`;
DROP TABLE IF EXISTS `hr_loans`;
DROP TABLE IF EXISTS `hr_salary_advances`;
DROP TABLE IF EXISTS `hr_payrolls`;
DROP TABLE IF EXISTS `hr_leave_requests`;
DROP TABLE IF EXISTS `hr_leaves`;
DROP TABLE IF EXISTS `hr_attendance`;
DROP TABLE IF EXISTS `hr_salary_structures`;
DROP TABLE IF EXISTS `hr_employee_bonuses`;
DROP TABLE IF EXISTS `hr_employee_promotions`;
DROP TABLE IF EXISTS `hr_employee_certificates`;
DROP TABLE IF EXISTS `hr_employee_incentives`;
DROP TABLE IF EXISTS `hr_employee_shifts`;
DROP TABLE IF EXISTS `hr_overtime_records`;
DROP TABLE IF EXISTS `hr_piece_rate_logs`;
DROP TABLE IF EXISTS `hr_pf_ledger`;
DROP TABLE IF EXISTS `hr_tds_ledger`;
DROP TABLE IF EXISTS `hr_gratuity_disbursements`;
DROP TABLE IF EXISTS `hr_terminations`;
DROP TABLE IF EXISTS `hr_disciplinary_cases`;
DROP TABLE IF EXISTS `hr_grievances`;
DROP TABLE IF EXISTS `hr_job_applications`;
DROP TABLE IF EXISTS `hr_onboarding_checklists`;
DROP TABLE IF EXISTS `hr_performance_reviews`;
DROP TABLE IF EXISTS `hr_documents`;
DROP TABLE IF EXISTS `hr_training_enrollments`;
DROP TABLE IF EXISTS `hr_accident_register`;
DROP TABLE IF EXISTS `hr_asset_assignments`;
DROP TABLE IF EXISTS `hr_journal_entries`;
DROP TABLE IF EXISTS `hr_telegram_log`;
DROP TABLE IF EXISTS `hr_device_punch_log`;
DROP TABLE IF EXISTS `hr_user_face_encodings`;
DROP TABLE IF EXISTS `hr_employees`;
DROP TABLE IF EXISTS `hr_positions`;
DROP TABLE IF EXISTS `hr_departments`;
DROP TABLE IF EXISTS `hr_holidays`;
DROP TABLE IF EXISTS `hr_bonus_batches`;
DROP TABLE IF EXISTS `hr_shifts`;
DROP TABLE IF EXISTS `hr_overtime_settings`;
DROP TABLE IF EXISTS `hr_piece_rate_cards`;
DROP TABLE IF EXISTS `hr_pf_settings`;
DROP TABLE IF EXISTS `hr_gratuity_settings`;
DROP TABLE IF EXISTS `hr_tax_settings`;
DROP TABLE IF EXISTS `hr_job_openings`;
DROP TABLE IF EXISTS `hr_training_programs`;
DROP TABLE IF EXISTS `hr_assets`;
DROP TABLE IF EXISTS `hr_chart_of_accounts`;
DROP TABLE IF EXISTS `hr_telegram_settings`;
DROP TABLE IF EXISTS `hr_biometric_devices`;
DROP TABLE IF EXISTS `hr_audit_logs`;
DROP TABLE IF EXISTS `hr_settings`;

-- ── DEPARTMENTS ───────────────────────────────────────────────
CREATE TABLE `hr_departments` (
  `id`         int(11) NOT NULL AUTO_INCREMENT,
  `name`       varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `hr_departments` (`id`,`name`) VALUES
  (1,'General'),(2,'Production'),(3,'Administration'),(4,'Finance'),(5,'Human Resources');

-- ── POSITIONS ─────────────────────────────────────────────────
CREATE TABLE `hr_positions` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `name`          varchar(100) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hpos_dept` (`department_id`),
  CONSTRAINT `fk_hpos_dept` FOREIGN KEY (`department_id`) REFERENCES `hr_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `hr_positions` (`id`,`name`,`department_id`) VALUES
  (1,'General Worker',2),(2,'Supervisor',2),(3,'Manager',3),
  (4,'Accountant',4),(5,'HR Officer',5);

-- ── EMPLOYEES ─────────────────────────────────────────────────
CREATE TABLE `hr_employees` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `first_name`   varchar(100) NOT NULL,
  `last_name`    varchar(100) DEFAULT '',
  `email`        varchar(150) DEFAULT NULL,
  `phone`        varchar(30) DEFAULT NULL,
  `address`      text DEFAULT NULL,
  `position_id`  int(11) DEFAULT NULL,
  `hire_date`    date DEFAULT NULL,
  `base_salary`  decimal(12,2) DEFAULT 0.00,
  `status`       enum('active','inactive','terminated','on_leave') DEFAULT 'active',
  `branch_id`    int unsigned DEFAULT 1,
  `bank_name`    varchar(100) DEFAULT '',
  `bank_account` varchar(50) DEFAULT '',
  `bank_branch`  varchar(100) DEFAULT '',
  `device_pin`   varchar(30) DEFAULT NULL COMMENT 'PIN on biometric device',
  `photo`        varchar(255) DEFAULT NULL,
  `nid`          varchar(50) DEFAULT NULL,
  `dob`          date DEFAULT NULL,
  `gender`       enum('male','female','other') DEFAULT NULL,
  `blood_group`  varchar(5) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `created_at`   datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hemp_pos`    (`position_id`),
  KEY `fk_hemp_branch` (`branch_id`),
  CONSTRAINT `fk_hemp_pos`    FOREIGN KEY (`position_id`) REFERENCES `hr_positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hemp_branch` FOREIGN KEY (`branch_id`)  REFERENCES `branches`      (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── FACE ENCODINGS ────────────────────────────────────────────
CREATE TABLE `hr_user_face_encodings` (
  `id`              int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`     int(11) NOT NULL,
  `face_descriptor` longtext DEFAULT NULL COMMENT 'JSON float array',
  `created_at`      datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hface_emp` (`employee_id`),
  CONSTRAINT `fk_hface_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── ATTENDANCE ────────────────────────────────────────────────
CREATE TABLE `hr_attendance` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`  int(11) NOT NULL,
  `date`         date NOT NULL,
  `clock_in`     time DEFAULT NULL,
  `clock_out`    time DEFAULT NULL,
  `status`       enum('present','absent','late','half_day','holiday','leave') DEFAULT 'present',
  `manual_entry` tinyint(1) DEFAULT 0,
  `branch_id`    int unsigned DEFAULT NULL,
  `notes`        varchar(255) DEFAULT NULL,
  `created_at`   datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hatt_emp_date` (`employee_id`,`date`),
  KEY `fk_hatt_emp`    (`employee_id`),
  KEY `fk_hatt_branch` (`branch_id`),
  CONSTRAINT `fk_hatt_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── SALARY STRUCTURES ─────────────────────────────────────────
CREATE TABLE `hr_salary_structures` (
  `id`                  int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`         int(11) NOT NULL,
  `basic_salary`        decimal(12,2) DEFAULT 0.00,
  `house_allowance`     decimal(10,2) DEFAULT 0.00,
  `transport_allowance` decimal(10,2) DEFAULT 0.00,
  `medical_allowance`   decimal(10,2) DEFAULT 0.00,
  `other_allowances`    decimal(10,2) DEFAULT 0.00,
  `provident_fund`      decimal(10,2) DEFAULT 0.00,
  `tax_deduction`       decimal(10,2) DEFAULT 0.00,
  `other_deductions`    decimal(10,2) DEFAULT 0.00,
  `gross_salary`        decimal(12,2) DEFAULT 0.00,
  `net_salary`          decimal(12,2) DEFAULT 0.00,
  `updated_date`        datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hss_emp` (`employee_id`),
  CONSTRAINT `fk_hss_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PAYROLLS ──────────────────────────────────────────────────
CREATE TABLE `hr_payrolls` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`      int(11) NOT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end`   date NOT NULL,
  `gross_salary`     decimal(12,2) DEFAULT 0.00,
  `deductions`       decimal(12,2) DEFAULT 0.00,
  `net_salary`       decimal(12,2) DEFAULT 0.00,
  `status`           enum('pending_approval','approved','paid','rejected') DEFAULT 'pending_approval',
  `branch_id`        int unsigned DEFAULT NULL,
  `paid_at`          datetime DEFAULT NULL,
  `payment_note`     varchar(500) DEFAULT NULL,
  `created_at`       datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_hemp_period` (`employee_id`,`pay_period_start`),
  KEY `fk_hpay_emp`    (`employee_id`),
  KEY `fk_hpay_branch` (`branch_id`),
  CONSTRAINT `fk_hpay_emp`    FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hpay_branch` FOREIGN KEY (`branch_id`)  REFERENCES `branches`      (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PAYROLL DETAILS ───────────────────────────────────────────
CREATE TABLE `hr_payroll_details` (
  `id`                         int(11) NOT NULL AUTO_INCREMENT,
  `payroll_id`                 int(11) NOT NULL,
  `basic_salary`               decimal(12,2) DEFAULT 0.00,
  `house_allowance`            decimal(10,2) DEFAULT 0.00,
  `transport_allowance`        decimal(10,2) DEFAULT 0.00,
  `medical_allowance`          decimal(10,2) DEFAULT 0.00,
  `other_allowances`           decimal(10,2) DEFAULT 0.00,
  `gross_salary`               decimal(12,2) DEFAULT 0.00,
  `days_in_month`              tinyint(3) DEFAULT 30,
  `absent_days`                tinyint(3) DEFAULT 0,
  `daily_rate`                 decimal(10,4) DEFAULT 0.0000,
  `absence_deduction`          decimal(10,2) DEFAULT 0.00,
  `salary_advance_deduction`   decimal(10,2) DEFAULT 0.00,
  `loan_installment_deduction` decimal(10,2) DEFAULT 0.00,
  `provident_fund`             decimal(10,2) DEFAULT 0.00,
  `tax_deduction`              decimal(10,2) DEFAULT 0.00,
  `other_deductions`           decimal(10,2) DEFAULT 0.00,
  `total_deductions`           decimal(12,2) DEFAULT 0.00,
  `net_salary`                 decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hpd_payroll` (`payroll_id`),
  CONSTRAINT `fk_hpd_pay` FOREIGN KEY (`payroll_id`) REFERENCES `hr_payrolls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── LOANS ─────────────────────────────────────────────────────
CREATE TABLE `hr_loans` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`      int(11) NOT NULL,
  `loan_date`        date DEFAULT NULL,
  `amount`           decimal(12,2) DEFAULT 0.00,
  `installments`     int(11) DEFAULT 12,
  `monthly_payment`  decimal(10,2) DEFAULT 0.00,
  `installment_type` enum('monthly','bi_weekly','weekly') DEFAULT 'monthly',
  `status`           enum('active','paid','cancelled') DEFAULT 'active',
  `branch_id`        int unsigned DEFAULT NULL,
  `purpose`          varchar(255) DEFAULT NULL,
  `created_at`       datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hloan_emp` (`employee_id`),
  CONSTRAINT `fk_hloan_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── LOAN INSTALLMENTS ─────────────────────────────────────────
CREATE TABLE `hr_loan_installments` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `loan_id`      int(11) NOT NULL,
  `due_date`     date DEFAULT NULL,
  `amount`       decimal(10,2) DEFAULT 0.00,
  `status`       enum('pending','paid') DEFAULT 'pending',
  `paid_date`    date DEFAULT NULL,
  `payroll_id`   int(11) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hinst_loan` (`loan_id`),
  CONSTRAINT `fk_hinst_loan` FOREIGN KEY (`loan_id`) REFERENCES `hr_loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── SALARY ADVANCES ───────────────────────────────────────────
CREATE TABLE `hr_salary_advances` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`   int(11) NOT NULL,
  `advance_date`  date DEFAULT NULL,
  `amount`        decimal(10,2) DEFAULT 0.00,
  `reason`        text DEFAULT NULL,
  `status`        enum('pending','approved','rejected','deducted') DEFAULT 'pending',
  `advance_month` tinyint(2) DEFAULT NULL,
  `advance_year`  year(4) DEFAULT NULL,
  `branch_id`     int(11) DEFAULT NULL,
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hadv_emp` (`employee_id`),
  CONSTRAINT `fk_hadv_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── LEAVES ────────────────────────────────────────────────────
CREATE TABLE `hr_leaves` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type`  varchar(50) DEFAULT 'casual',
  `start_date`  date DEFAULT NULL,
  `end_date`    date DEFAULT NULL,
  `reason`      text DEFAULT NULL,
  `status`      enum('pending','approved','rejected') DEFAULT 'pending',
  `branch_id`   int(11) DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hlv_emp` (`employee_id`),
  CONSTRAINT `fk_hlv_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── HOLIDAYS ──────────────────────────────────────────────────
CREATE TABLE `hr_holidays` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `holiday_name` varchar(150) NOT NULL,
  `description`  text DEFAULT NULL,
  `created_at`   datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hholiday_date` (`holiday_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `hr_holidays` (`holiday_date`,`holiday_name`) VALUES
  ('2025-02-21','Language Martyrs Day'),
  ('2025-03-26','Independence Day'),
  ('2025-04-14','Bengali New Year'),
  ('2025-05-01','International Labour Day'),
  ('2025-08-15','National Mourning Day'),
  ('2025-12-16','Victory Day'),
  ('2025-12-25','Christmas Day');

-- ── SHIFTS ────────────────────────────────────────────────────
CREATE TABLE `hr_shifts` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `name`          varchar(100) NOT NULL,
  `start_time`    time NOT NULL,
  `end_time`      time NOT NULL,
  `type`          enum('day','evening','night','rotating') DEFAULT 'day',
  `grace_minutes` tinyint(3) UNSIGNED DEFAULT 15,
  `working_days`  varchar(100) DEFAULT 'mon,tue,wed,thu,fri,sat',
  `notes`         text DEFAULT NULL,
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `hr_shifts` (`id`,`name`,`start_time`,`end_time`,`type`) VALUES
  (1,'Morning Shift','08:00:00','16:00:00','day'),
  (2,'Evening Shift','16:00:00','00:00:00','evening'),
  (3,'Night Shift','00:00:00','08:00:00','night');

-- ── EMPLOYEE SHIFTS ───────────────────────────────────────────
CREATE TABLE `hr_employee_shifts` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`    int(11) NOT NULL,
  `shift_id`       int(11) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to`   date DEFAULT NULL,
  `created_at`     datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hes_emp`   FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hes_shift` FOREIGN KEY (`shift_id`)    REFERENCES `hr_shifts`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── OVERTIME ──────────────────────────────────────────────────
CREATE TABLE `hr_overtime_settings` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `normal_rate`    decimal(4,2) DEFAULT 1.50,
  `holiday_rate`   decimal(4,2) DEFAULT 2.00,
  `max_daily_ot`   tinyint(4) DEFAULT 4,
  `max_monthly_ot` tinyint(4) DEFAULT 60,
  `auto_approve`   tinyint(1) DEFAULT 0,
  `updated_at`     datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `hr_overtime_settings` (`id`) VALUES (1);

CREATE TABLE `hr_overtime_records` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `shift_id`    int(11) DEFAULT NULL,
  `ot_date`     date NOT NULL,
  `ot_hours`    decimal(4,2) DEFAULT 0.00,
  `ot_minutes`  tinyint(3) DEFAULT 0,
  `rate_type`   enum('1.5x','2x','flat') DEFAULT '1.5x',
  `amount`      decimal(10,2) DEFAULT 0.00,
  `reason`      text DEFAULT NULL,
  `status`      enum('pending','approved','rejected','paid') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hot_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PIECE RATE ────────────────────────────────────────────────
CREATE TABLE `hr_piece_rate_cards` (
  `id`         int(11) NOT NULL AUTO_INCREMENT,
  `item_name`  varchar(150) NOT NULL,
  `unit`       varchar(50) DEFAULT 'piece',
  `rate`       decimal(10,2) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `active`     tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_piece_rate_logs` (
  `id`              int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`     int(11) NOT NULL,
  `rate_card_id`    int(11) NOT NULL,
  `production_date` date NOT NULL,
  `qty_produced`    int(11) DEFAULT 0,
  `defects`         int(11) DEFAULT 0,
  `net_earn`        decimal(10,2) DEFAULT 0.00,
  `notes`           text DEFAULT NULL,
  `created_at`      datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hpr_emp`  FOREIGN KEY (`employee_id`)  REFERENCES `hr_employees`       (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hpr_card` FOREIGN KEY (`rate_card_id`) REFERENCES `hr_piece_rate_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PROVIDENT FUND ────────────────────────────────────────────
CREATE TABLE `hr_pf_settings` (
  `id`                 int(11) NOT NULL AUTO_INCREMENT,
  `employee_rate`      decimal(5,2) DEFAULT 7.00,
  `employer_rate`      decimal(5,2) DEFAULT 7.00,
  `eligibility_months` tinyint(4) DEFAULT 6,
  `mandatory`          tinyint(1) DEFAULT 1,
  `vesting_months`     tinyint(4) DEFAULT 12,
  `updated_at`         datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `hr_pf_settings` (`id`) VALUES (1);

CREATE TABLE `hr_pf_ledger` (
  `id`                    int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`           int(11) NOT NULL,
  `month`                 char(7) NOT NULL COMMENT 'YYYY-MM',
  `basic_salary`          decimal(10,2) DEFAULT NULL,
  `employee_contribution` decimal(10,2) DEFAULT 0.00,
  `employer_contribution` decimal(10,2) DEFAULT 0.00,
  `cumulative_balance`    decimal(12,2) DEFAULT 0.00,
  `created_at`            datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hpf_emp_month` (`employee_id`,`month`),
  CONSTRAINT `fk_hpf_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── GRATUITY ──────────────────────────────────────────────────
CREATE TABLE `hr_gratuity_settings` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `rate_per_year` decimal(4,2) DEFAULT 1.00,
  `min_years`     decimal(4,2) DEFAULT 1.00,
  `max_months`    tinyint(4) DEFAULT 30,
  `basis`         enum('basic','gross') DEFAULT 'basic',
  `updated_at`    datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `hr_gratuity_settings` (`id`) VALUES (1);

CREATE TABLE `hr_gratuity_disbursements` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`      int(11) NOT NULL,
  `termination_date` date NOT NULL,
  `reason`           varchar(50) DEFAULT NULL,
  `years_of_service` decimal(6,2) DEFAULT NULL,
  `basic_salary`     decimal(10,2) DEFAULT NULL,
  `amount`           decimal(12,2) DEFAULT NULL,
  `payment_date`     date DEFAULT NULL,
  `notes`            text DEFAULT NULL,
  `created_at`       datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hgrat_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TAX / TDS ─────────────────────────────────────────────────
CREATE TABLE `hr_tax_settings` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `fiscal_year`    varchar(10) DEFAULT '2024-25',
  `tax_free_limit` int(11) DEFAULT 350000,
  `slabs_json`     text DEFAULT NULL,
  `updated_at`     datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `hr_tax_settings` (`id`,`slabs_json`) VALUES (1,
  '[{"from":350001,"to":450000,"rate":5},{"from":450001,"to":750000,"rate":10},{"from":750001,"to":1150000,"rate":15},{"from":1150001,"to":1650000,"rate":20},{"from":1650001,"to":0,"rate":25}]');

CREATE TABLE `hr_tds_ledger` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`    int(11) NOT NULL,
  `month`          char(7) NOT NULL COMMENT 'YYYY-MM',
  `gross_salary`   decimal(10,2) DEFAULT NULL,
  `taxable_income` decimal(12,2) DEFAULT NULL,
  `tax_slab`       varchar(20) DEFAULT NULL,
  `annual_tax`     decimal(10,2) DEFAULT 0.00,
  `monthly_tds`    decimal(10,2) DEFAULT 0.00,
  `created_at`     datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_htds_emp_month` (`employee_id`,`month`),
  CONSTRAINT `fk_htds_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TERMINATIONS ──────────────────────────────────────────────
CREATE TABLE `hr_terminations` (
  `id`                 int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`        int(11) NOT NULL,
  `reason`             enum('resignation','termination','retirement','end_of_contract','deceased') NOT NULL,
  `last_working_day`   date NOT NULL,
  `notice_days_served` int(11) DEFAULT 0,
  `years_of_service`   decimal(6,2) DEFAULT NULL,
  `gratuity`           decimal(12,2) DEFAULT 0.00,
  `notice_pay`         decimal(10,2) DEFAULT 0.00,
  `leave_encashment`   decimal(10,2) DEFAULT 0.00,
  `loan_recovery`      decimal(10,2) DEFAULT 0.00,
  `total_settlement`   decimal(12,2) DEFAULT 0.00,
  `status`             enum('pending_ff','ff_ready','settled') DEFAULT 'pending_ff',
  `remarks`            text DEFAULT NULL,
  `created_at`         datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hterm_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── DISCIPLINARY ──────────────────────────────────────────────
CREATE TABLE `hr_disciplinary_cases` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`    int(11) NOT NULL,
  `violation_type` varchar(50) NOT NULL,
  `date_raised`    date NOT NULL,
  `hearing_date`   date DEFAULT NULL,
  `action_taken`   varchar(50) DEFAULT NULL,
  `details`        text DEFAULT NULL,
  `status`         enum('open','hearing','closed') DEFAULT 'open',
  `created_by`     int(11) DEFAULT NULL,
  `created_at`     datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hdisc_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_grievances` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `category`    varchar(80) NOT NULL,
  `filed_on`    date NOT NULL,
  `description` text DEFAULT NULL,
  `resolution`  text DEFAULT NULL,
  `status`      enum('open','in_review','resolved') DEFAULT 'open',
  `resolved_at` datetime DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hgriev_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── RECRUITMENT ───────────────────────────────────────────────
CREATE TABLE `hr_job_openings` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `title`       varchar(150) NOT NULL,
  `department`  varchar(100) DEFAULT NULL,
  `openings`    tinyint(3) DEFAULT 1,
  `emp_type`    enum('permanent','contract','part_time') DEFAULT 'permanent',
  `salary_min`  decimal(10,2) DEFAULT NULL,
  `salary_max`  decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `posted_date` date DEFAULT NULL,
  `deadline`    date DEFAULT NULL,
  `status`      enum('open','closed','on_hold') DEFAULT 'open',
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_job_applications` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `job_id`           int(11) NOT NULL,
  `applicant_name`   varchar(150) NOT NULL,
  `email`            varchar(150) DEFAULT NULL,
  `phone`            varchar(20) DEFAULT NULL,
  `experience_years` decimal(4,1) DEFAULT 0.0,
  `expected_salary`  decimal(10,2) DEFAULT NULL,
  `resume_path`      varchar(255) DEFAULT NULL,
  `stage`            enum('new','screening','interview','offered','hired','rejected') DEFAULT 'new',
  `applied_on`       date DEFAULT NULL,
  `notes`            text DEFAULT NULL,
  `created_at`       datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_happ_job` FOREIGN KEY (`job_id`) REFERENCES `hr_job_openings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_onboarding_checklists` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `step_key`    varchar(80) NOT NULL,
  `step_label`  varchar(150) DEFAULT NULL,
  `done`        tinyint(1) DEFAULT 0,
  `done_at`     datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_honboard_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PERFORMANCE ───────────────────────────────────────────────
CREATE TABLE `hr_performance_reviews` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`   int(11) NOT NULL,
  `cycle`         varchar(50) NOT NULL,
  `reviewer`      varchar(100) DEFAULT NULL,
  `criteria_json` text DEFAULT NULL,
  `score`         decimal(5,2) DEFAULT NULL,
  `rating`        varchar(30) DEFAULT NULL,
  `comments`      text DEFAULT NULL,
  `review_date`   date DEFAULT NULL,
  `status`        enum('pending','completed') DEFAULT 'pending',
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hperf_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── DOCUMENTS ─────────────────────────────────────────────────
CREATE TABLE `hr_documents` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) DEFAULT NULL,
  `name`        varchar(200) NOT NULL,
  `category`    varchar(80) DEFAULT NULL,
  `file_path`   varchar(255) DEFAULT NULL,
  `file_size`   varchar(20) DEFAULT NULL,
  `file_type`   varchar(20) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes`       text DEFAULT NULL,
  `uploaded_on` date DEFAULT (curdate()),
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hdoc_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TRAINING ──────────────────────────────────────────────────
CREATE TABLE `hr_training_programs` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `title`         varchar(200) NOT NULL,
  `category`      varchar(80) DEFAULT NULL,
  `trainer`       varchar(150) DEFAULT NULL,
  `start_date`    date DEFAULT NULL,
  `duration_days` tinyint(3) DEFAULT 1,
  `capacity`      smallint(5) DEFAULT 20,
  `cost`          decimal(10,2) DEFAULT 0.00,
  `description`   text DEFAULT NULL,
  `status`        enum('planned','ongoing','completed','cancelled') DEFAULT 'planned',
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_training_enrollments` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `program_id`  int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `enrolled_at` datetime DEFAULT current_timestamp(),
  `completed`   tinyint(1) DEFAULT 0,
  `score`       decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_henroll_prog` FOREIGN KEY (`program_id`)  REFERENCES `hr_training_programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_henroll_emp`  FOREIGN KEY (`employee_id`) REFERENCES `hr_employees`          (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── ACCIDENTS ─────────────────────────────────────────────────
CREATE TABLE `hr_accident_register` (
  `id`                int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`       int(11) NOT NULL,
  `incident_date`     date NOT NULL,
  `incident_type`     varchar(80) NOT NULL,
  `severity`          enum('minor','moderate','serious','fatal') DEFAULT 'minor',
  `location`          varchar(150) DEFAULT NULL,
  `days_lost`         smallint(5) DEFAULT 0,
  `medical_cost`      decimal(10,2) DEFAULT 0.00,
  `description`       text DEFAULT NULL,
  `corrective_action` text DEFAULT NULL,
  `reported_by`       varchar(100) DEFAULT NULL,
  `status`            enum('open','investigating','closed') DEFAULT 'open',
  `closed_at`         date DEFAULT NULL,
  `created_at`        datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hacc_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── ASSETS ────────────────────────────────────────────────────
CREATE TABLE `hr_assets` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `asset_code`     varchar(50) NOT NULL,
  `name`           varchar(200) NOT NULL,
  `category`       varchar(80) DEFAULT NULL,
  `serial_no`      varchar(100) DEFAULT NULL,
  `purchase_value` decimal(12,2) DEFAULT NULL,
  `purchase_date`  date DEFAULT NULL,
  `status`         enum('available','assigned','maintenance','retired') DEFAULT 'available',
  `notes`          text DEFAULT NULL,
  `created_at`     datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hasset_code` (`asset_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_asset_assignments` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `asset_id`      int(11) NOT NULL,
  `employee_id`   int(11) NOT NULL,
  `assigned_on`   date NOT NULL,
  `due_date`      date DEFAULT NULL,
  `condition_in`  varchar(20) DEFAULT 'good',
  `condition_out` varchar(20) DEFAULT NULL,
  `returned_on`   date DEFAULT NULL,
  `notes`         text DEFAULT NULL,
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hasgn_asset` FOREIGN KEY (`asset_id`)    REFERENCES `hr_assets`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hasgn_emp`   FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BONUS ─────────────────────────────────────────────────────
CREATE TABLE `hr_bonus_batches` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `name`           varchar(150) DEFAULT NULL,
  `bonus_type`     varchar(50) DEFAULT 'festival',
  `calc_method`    varchar(30) DEFAULT 'flat',
  `calc_value`     decimal(10,2) DEFAULT 0.00,
  `eligible_group` varchar(50) DEFAULT 'all',
  `total_amount`   decimal(14,2) DEFAULT 0.00,
  `disburse_date`  date DEFAULT NULL,
  `notes`          text DEFAULT NULL,
  `status`         enum('draft','approved','paid') DEFAULT 'draft',
  `created_at`     datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_employee_bonuses` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `batch_id`    int(11) DEFAULT NULL,
  `amount`      decimal(10,2) DEFAULT 0.00,
  `bonus_date`  date DEFAULT NULL,
  `status`      enum('pending','paid') DEFAULT 'pending',
  `notes`       text DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_heb_emp`   FOREIGN KEY (`employee_id`) REFERENCES `hr_employees`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_heb_batch` FOREIGN KEY (`batch_id`)   REFERENCES `hr_bonus_batches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PROMOTIONS ────────────────────────────────────────────────
CREATE TABLE `hr_employee_promotions` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`      int(11) NOT NULL,
  `type`             enum('promotion','increment','transfer','demotion') DEFAULT 'promotion',
  `prev_salary`      decimal(10,2) DEFAULT NULL,
  `new_salary`       decimal(10,2) DEFAULT NULL,
  `effective_date`   date DEFAULT NULL,
  `status`           enum('pending','approved','rejected') DEFAULT 'approved',
  `prev_position_id` int(11) DEFAULT NULL,
  `new_position_id`  int(11) DEFAULT NULL,
  `approved_by`      int(11) DEFAULT NULL,
  `remarks`          text DEFAULT NULL,
  `created_at`       datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hprom_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── CERTIFICATES ──────────────────────────────────────────────
CREATE TABLE `hr_employee_certificates` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `name`        varchar(200) DEFAULT NULL,
  `issued_by`   varchar(150) DEFAULT NULL,
  `issued_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes`       text DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hcert_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── INCENTIVES ────────────────────────────────────────────────
CREATE TABLE `hr_employee_incentives` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `amount`      decimal(10,2) DEFAULT 0.00,
  `reason`      varchar(200) DEFAULT NULL,
  `date`        date DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hincent_emp` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── CHART OF ACCOUNTS (HR) ────────────────────────────────────
CREATE TABLE `hr_chart_of_accounts` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `account_name` varchar(150) NOT NULL,
  `account_type` varchar(50) DEFAULT NULL,
  `created_at`   datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── JOURNAL ENTRIES (HR) ──────────────────────────────────────
CREATE TABLE `hr_journal_entries` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `account_id`  int(11) DEFAULT NULL,
  `payroll_id`  int(11) DEFAULT NULL,
  `entry_date`  date DEFAULT NULL,
  `debit`       decimal(12,2) DEFAULT 0.00,
  `credit`      decimal(12,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hje_acct` (`account_id`),
  CONSTRAINT `fk_hje_acct` FOREIGN KEY (`account_id`) REFERENCES `hr_chart_of_accounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TELEGRAM ──────────────────────────────────────────────────
CREATE TABLE `hr_telegram_settings` (
  `id`        int(11) NOT NULL AUTO_INCREMENT,
  `bot_token` varchar(255) DEFAULT NULL,
  `bot_name`  varchar(100) DEFAULT NULL,
  `chat_ids`  text DEFAULT NULL,
  `events`    text DEFAULT NULL,
  `templates` text DEFAULT NULL,
  `enabled`   tinyint(1) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `hr_telegram_settings` (`id`,`enabled`) VALUES (1, 0);

CREATE TABLE `hr_telegram_log` (
  `id`         int(11) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(80) DEFAULT NULL,
  `chat_id`    varchar(50) DEFAULT NULL,
  `message`    text DEFAULT NULL,
  `status`     enum('sent','failed') DEFAULT 'sent',
  `sent_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BIOMETRIC DEVICES ─────────────────────────────────────────
CREATE TABLE `hr_biometric_devices` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `serial_no`        varchar(100) NOT NULL,
  `device_name`      varchar(150) DEFAULT NULL,
  `brand`            varchar(50) DEFAULT 'Unknown',
  `model`            varchar(100) DEFAULT NULL,
  `branch_id`        int unsigned DEFAULT NULL,
  `ip_address`       varchar(45) DEFAULT NULL,
  `firmware_version` varchar(50) DEFAULT NULL,
  `protocol`         enum('adms','manual') DEFAULT 'adms',
  `status`           enum('online','offline','pending') DEFAULT 'pending',
  `last_seen`        datetime DEFAULT NULL,
  `last_sync`        datetime DEFAULT NULL,
  `total_records`    int(11) DEFAULT 0,
  `notes`            text DEFAULT NULL,
  `created_at`       datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hbd_serial` (`serial_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr_device_punch_log` (
  `id`            bigint(20) NOT NULL AUTO_INCREMENT,
  `device_serial` varchar(100) NOT NULL,
  `pin`           varchar(50) NOT NULL,
  `employee_id`   int(11) DEFAULT NULL,
  `punch_time`    datetime NOT NULL,
  `punch_type`    tinyint(2) DEFAULT 0,
  `verify_type`   tinyint(2) DEFAULT 1,
  `work_code`     int(11) DEFAULT 0,
  `processed`     tinyint(1) DEFAULT 0,
  `attendance_id` int(11) DEFAULT NULL,
  `raw_line`      text DEFAULT NULL,
  `created_at`    datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hpunch` (`device_serial`,`pin`,`punch_time`),
  KEY `idx_hpunch_time`   (`punch_time`),
  KEY `idx_hprocessed`    (`processed`),
  KEY `idx_hemployee_id`  (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── AUDIT LOGS (HR) ───────────────────────────────────────────
CREATE TABLE `hr_audit_logs` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `user_id`     int(11) DEFAULT NULL,
  `username`    varchar(80) DEFAULT NULL,
  `role`        varchar(50) DEFAULT NULL,
  `branch_id`   int(11) DEFAULT NULL,
  `action`      varchar(80) NOT NULL,
  `module`      varchar(80) DEFAULT NULL,
  `target_id`   int(11) DEFAULT NULL,
  `target_name` varchar(200) DEFAULT NULL,
  `detail`      text DEFAULT NULL,
  `ip_address`  varchar(45) DEFAULT NULL,
  `created_at`  datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_haudit_module` (`module`),
  KEY `idx_haudit_user`   (`username`),
  KEY `idx_haudit_date`   (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── HR SETTINGS ───────────────────────────────────────────────
CREATE TABLE `hr_settings` (
  `id`    int(11) NOT NULL AUTO_INCREMENT,
  `name`  varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hset_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `hr_settings` (`name`,`value`) VALUES
  ('company_name',    'উজ্জ্বল ফ্লাওয়ার মিলস'),
  ('company_address', ''),
  ('company_phone',   ''),
  ('company_email',   ''),
  ('weekly_off',      'friday'),
  ('work_start',      '08:00'),
  ('late_threshold',  '15'),
  ('currency',        'BDT'),
  ('currency_symbol', '৳'),
  ('days_per_month',  '30');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- HR Module schema ready. Run against ujjalfmc_saas.
-- ============================================================

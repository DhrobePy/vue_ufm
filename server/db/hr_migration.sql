-- ============================================================
--  HR Module Migration — ujjalfmc_saas
--  Run once: mysql -u root -p ujjalfmc_saas < server/db/hr_migration.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── Departments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_departments` (
  `id`   int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Positions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_positions` (
  `id`            int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name`          varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `hr_positions_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `hr_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Employees ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_employees` (
  `id`              int(11) NOT NULL AUTO_INCREMENT,
  `first_name`      varchar(100) NOT NULL,
  `last_name`       varchar(100) NOT NULL,
  `email`           varchar(100) NOT NULL,
  `phone`           varchar(20)  DEFAULT NULL,
  `address`         text         DEFAULT NULL,
  `position_id`     int(11)      DEFAULT NULL,
  `hire_date`       date         NOT NULL,
  `base_salary`     decimal(12,2) NOT NULL DEFAULT 0.00,
  `status`          enum('active','on_leave','terminated') NOT NULL DEFAULT 'active',
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at`      datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `position_id` (`position_id`),
  CONSTRAINT `hr_employees_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `hr_positions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Salary Structures ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_salary_structures` (
  `id`                  int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`         int(11) NOT NULL,
  `basic_salary`        decimal(12,2) NOT NULL DEFAULT 0.00,
  `house_allowance`     decimal(12,2) NOT NULL DEFAULT 0.00,
  `transport_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `medical_allowance`   decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_allowances`    decimal(12,2) NOT NULL DEFAULT 0.00,
  `provident_fund`      decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_deduction`       decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_deductions`    decimal(12,2) NOT NULL DEFAULT 0.00,
  `gross_salary`        decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_salary`          decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_date`        date NOT NULL,
  `updated_date`        date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_salary_structures_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Attendance ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_attendance` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`  int(11) NOT NULL,
  `clock_in`     datetime DEFAULT NULL,
  `clock_out`    datetime DEFAULT NULL,
  `status`       varchar(50) NOT NULL DEFAULT 'present',
  `manual_entry` tinyint(1) NOT NULL DEFAULT 0,
  `note`         varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `clock_in_date` ((DATE(`clock_in`))),
  CONSTRAINT `hr_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Leave Requests ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_leave_requests` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type`  varchar(100) NOT NULL,
  `start_date`  date NOT NULL,
  `end_date`    date NOT NULL,
  `reason`      text DEFAULT NULL,
  `status`      enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at`  datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Payrolls ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_payrolls` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`      int(11) NOT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end`   date NOT NULL,
  `gross_salary`     decimal(12,2) NOT NULL,
  `deductions`       decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_salary`       decimal(12,2) NOT NULL,
  `status`           enum('pending_approval','approved','rejected','disbursed') NOT NULL DEFAULT 'pending_approval',
  `created_at`       datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `pay_period` (`pay_period_start`,`pay_period_end`),
  CONSTRAINT `hr_payrolls_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Payroll Items (allowances / deductions breakdown) ────────
CREATE TABLE IF NOT EXISTS `hr_payroll_items` (
  `id`         int(11) NOT NULL AUTO_INCREMENT,
  `payroll_id` int(11) NOT NULL,
  `type`       enum('allowance','deduction') NOT NULL,
  `name`       varchar(255) NOT NULL,
  `amount`     decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payroll_id` (`payroll_id`),
  CONSTRAINT `hr_payroll_items_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `hr_payrolls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Salary Advances ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_salary_advances` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`  int(11) NOT NULL,
  `advance_date` date NOT NULL,
  `amount`       decimal(12,2) NOT NULL,
  `advance_month` varchar(2) DEFAULT NULL,
  `advance_year`  varchar(4) DEFAULT NULL,
  `reason`       text DEFAULT NULL,
  `status`       enum('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
  `created_at`   datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_salary_advances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Loans ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_loans` (
  `id`               int(11) NOT NULL AUTO_INCREMENT,
  `employee_id`      int(11) NOT NULL,
  `loan_date`        date NOT NULL,
  `amount`           decimal(12,2) NOT NULL,
  `installments`     int(11) NOT NULL,
  `monthly_payment`  decimal(12,2) NOT NULL,
  `installment_type` enum('fixed','random') NOT NULL DEFAULT 'fixed',
  `status`           enum('active','paid') NOT NULL DEFAULT 'active',
  `created_at`       datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_loans_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Loan Installments ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_loan_installments` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `loan_id`      int(11) NOT NULL,
  `payroll_id`   int(11) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `amount`       decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `loan_id` (`loan_id`),
  KEY `payroll_id` (`payroll_id`),
  CONSTRAINT `hr_loan_installments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `hr_loans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hr_loan_installments_ibfk_2` FOREIGN KEY (`payroll_id`) REFERENCES `hr_payrolls` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Holidays ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hr_holidays` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `holiday_name` varchar(100) NOT NULL,
  `description`  varchar(255) DEFAULT NULL,
  `created_at`   datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `holiday_date` (`holiday_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Seed Data ────────────────────────────────────────────────
INSERT IGNORE INTO `hr_departments` (`name`) VALUES
  ('Human Resources'), ('Operations'), ('Finance'), ('Technology'), ('Sales');

INSERT IGNORE INTO `hr_positions` (`department_id`, `name`) VALUES
  (1, 'HR Manager'), (1, 'HR Officer'),
  (2, 'Operations Manager'), (2, 'Field Supervisor'),
  (3, 'Finance Manager'), (3, 'Accountant'),
  (4, 'Software Engineer'), (4, 'IT Support'),
  (5, 'Sales Manager'), (5, 'Sales Executive');

INSERT IGNORE INTO `hr_holidays` (`holiday_date`, `holiday_name`, `description`) VALUES
  ('2025-02-21', 'Language Martyrs Day', 'International Mother Language Day'),
  ('2025-03-26', 'Independence Day', 'Bangladesh Independence Day'),
  ('2025-04-14', 'Bangla New Year', 'Pahela Boishakh'),
  ('2025-12-16', 'Victory Day', 'Bangladesh Victory Day'),
  ('2026-02-21', 'Language Martyrs Day', 'International Mother Language Day'),
  ('2026-03-26', 'Independence Day', 'Bangladesh Independence Day'),
  ('2026-04-14', 'Bangla New Year', 'Pahela Boishakh'),
  ('2026-12-16', 'Victory Day', 'Bangladesh Victory Day');

SET FOREIGN_KEY_CHECKS = 1;

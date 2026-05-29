-- ============================================================
-- HR Seed Migration: ujjalfmc_hr → ujjalfmc_saas (hr_ tables)
-- Generated 2026-05-29
-- Run AFTER importing ujjalfmc_hr.sql into ujjalfmc_hr_import
-- ============================================================

USE ujjalfmc_saas;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. DEPARTMENTS ────────────────────────────────────────────
TRUNCATE TABLE hr_departments;
INSERT INTO hr_departments (id, name)
SELECT id, name
FROM ujjalfmc_hr_import.departments;

-- ── 2. POSITIONS ─────────────────────────────────────────────
TRUNCATE TABLE hr_positions;
INSERT INTO hr_positions (id, department_id, name)
SELECT id, department_id, name
FROM ujjalfmc_hr_import.positions;

-- ── 3. EMPLOYEES ─────────────────────────────────────────────
TRUNCATE TABLE hr_employees;
INSERT INTO hr_employees
  (id, first_name, last_name, email, phone, address,
   position_id,
   hire_date, base_salary, status,
   photo, branch_id)
SELECT
  e.id,
  e.first_name,
  e.last_name,
  e.email,
  e.phone,
  e.address,
  e.position_id,
  e.hire_date,
  e.base_salary,
  e.status,
  e.profile_picture,        -- profile_picture → photo
  CONVERT(e.branch_id, UNSIGNED)
FROM ujjalfmc_hr_import.employees e;

-- ── 4. ATTENDANCE ─────────────────────────────────────────────
TRUNCATE TABLE hr_attendance;
INSERT IGNORE INTO hr_attendance
  (id, employee_id, date, clock_in, clock_out, status, manual_entry, branch_id)
SELECT
  id,
  employee_id,
  `date`,
  CASE WHEN clock_in IS NOT NULL AND TIME(clock_in) != '00:00:00' THEN TIME(clock_in) ELSE NULL END,
  CASE WHEN clock_out IS NOT NULL THEN TIME(clock_out) ELSE NULL END,
  status,
  manual_entry,
  CONVERT(branch_id, UNSIGNED)
FROM ujjalfmc_hr_import.attendance;

-- ── 5. SALARY STRUCTURES ──────────────────────────────────────
TRUNCATE TABLE hr_salary_structures;
INSERT INTO hr_salary_structures
  (id, employee_id, basic_salary, house_allowance, transport_allowance,
   medical_allowance, other_allowances, provident_fund, tax_deduction,
   other_deductions, gross_salary, net_salary)
SELECT
  id, employee_id, basic_salary, house_allowance, transport_allowance,
  medical_allowance, other_allowances, provident_fund, tax_deduction,
  other_deductions, gross_salary, net_salary
FROM ujjalfmc_hr_import.salary_structures;

-- ── 6. PAYROLLS ───────────────────────────────────────────────
TRUNCATE TABLE hr_payrolls;
INSERT INTO hr_payrolls
  (id, employee_id, pay_period_start, pay_period_end,
   gross_salary, deductions, net_salary, status, branch_id)
SELECT
  id, employee_id, pay_period_start, pay_period_end,
  gross_salary, deductions, net_salary,
  CASE status
    WHEN 'disbursed' THEN 'paid'   -- map legacy status
    ELSE status
  END,
  CONVERT(branch_id, UNSIGNED)
FROM ujjalfmc_hr_import.payrolls;

-- ── 7. PAYROLL DETAILS ────────────────────────────────────────
TRUNCATE TABLE hr_payroll_details;
INSERT INTO hr_payroll_details
  (id, payroll_id, basic_salary, house_allowance, transport_allowance,
   medical_allowance, other_allowances, gross_salary,
   days_in_month, absent_days, daily_rate, absence_deduction,
   salary_advance_deduction, loan_installment_deduction,
   provident_fund, tax_deduction, other_deductions,
   total_deductions, net_salary)
SELECT
  id, payroll_id, basic_salary, house_allowance, transport_allowance,
  medical_allowance, other_allowances, gross_salary,
  days_in_month, absent_days, daily_rate, absence_deduction,
  salary_advance_deduction, loan_installment_deduction,
  provident_fund, tax_deduction, other_deductions,
  total_deductions, net_salary
FROM ujjalfmc_hr_import.payroll_details;

-- ── 8. LOANS ─────────────────────────────────────────────────
TRUNCATE TABLE hr_loans;
INSERT INTO hr_loans
  (id, employee_id, loan_date, amount, installments,
   monthly_payment, installment_type, status, branch_id)
SELECT
  id, employee_id, loan_date, amount, installments,
  monthly_payment,
  'monthly',              -- source uses 'fixed'/'random'; map to 'monthly'
  status,
  CONVERT(branch_id, UNSIGNED)
FROM ujjalfmc_hr_import.loans;

-- ── 9. LOAN INSTALLMENTS ──────────────────────────────────────
-- Source only contains PAID installments (those actually paid out)
TRUNCATE TABLE hr_loan_installments;
INSERT INTO hr_loan_installments
  (id, loan_id, due_date, paid_date, payment_date, amount, status, payroll_id)
SELECT
  id, loan_id,
  payment_date,           -- used as due_date (closest equivalent)
  payment_date,           -- paid_date
  payment_date,           -- payment_date
  amount,
  'paid',                 -- source records are completed payments
  payroll_id
FROM ujjalfmc_hr_import.loan_installments;

-- ── 10. SALARY ADVANCES ───────────────────────────────────────
TRUNCATE TABLE hr_salary_advances;
INSERT INTO hr_salary_advances
  (id, employee_id, advance_date, amount, reason,
   status, advance_month, advance_year, branch_id)
SELECT
  id, employee_id, advance_date, amount, reason,
  CASE status
    WHEN 'paid' THEN 'deducted'   -- our enum uses 'deducted'
    ELSE status
  END,
  CAST(advance_month AS UNSIGNED),
  advance_year,
  CONVERT(branch_id, UNSIGNED)
FROM ujjalfmc_hr_import.salary_advances;

-- ── 11. LEAVES ───────────────────────────────────────────────
TRUNCATE TABLE hr_leaves;
INSERT INTO hr_leaves
  (id, employee_id, leave_type, start_date, end_date,
   reason, status, branch_id)
SELECT
  id, employee_id, leave_type, start_date, end_date,
  reason, status,
  CONVERT(branch_id, UNSIGNED)
FROM ujjalfmc_hr_import.leaves;

-- ── 12. BONUS BATCHES ────────────────────────────────────────
TRUNCATE TABLE hr_bonus_batches;
INSERT INTO hr_bonus_batches
  (id, name, bonus_type, status, disburse_date, created_at)
SELECT
  id,
  title,                  -- title → name
  bonus_type,
  CASE status
    WHEN 'disbursed' THEN 'paid'
    ELSE status
  END,
  DATE(disbursed_at),     -- disbursed_at DATETIME → disburse_date DATE
  created_at
FROM ujjalfmc_hr_import.bonus_batches;

-- ── 13. EMPLOYEE BONUSES ─────────────────────────────────────
TRUNCATE TABLE hr_employee_bonuses;
INSERT INTO hr_employee_bonuses
  (id, employee_id, batch_id, amount, notes, status)
SELECT
  id, employee_id, batch_id,
  actual_amount,          -- actual_amount → amount
  note,                   -- note → notes
  CASE status
    WHEN 'draft'     THEN 'pending'
    WHEN 'approved'  THEN 'pending'
    WHEN 'paid'      THEN 'paid'
    ELSE 'pending'
  END
FROM ujjalfmc_hr_import.employee_bonuses;

-- ── 14. HOLIDAYS ─────────────────────────────────────────────
-- INSERT IGNORE — keep existing holidays, add new ones
INSERT IGNORE INTO hr_holidays
  (id, holiday_date, holiday_name, description, created_at)
SELECT id, holiday_date, holiday_name, description, created_at
FROM ujjalfmc_hr_import.holidays;

-- ── 15. FACE ENCODINGS ───────────────────────────────────────
-- user_face_encodings.user_id maps via employees.user_id → employees.id
INSERT IGNORE INTO hr_face_encodings (employee_id, face_descriptor, created_at)
SELECT e.id, ufe.face_encoding, ufe.created_at
FROM ujjalfmc_hr_import.user_face_encodings ufe
JOIN ujjalfmc_hr_import.employees e ON e.user_id = ufe.user_id
WHERE ufe.face_encoding IS NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Verify row counts ─────────────────────────────────────────
SELECT 'hr_departments'    AS tbl, COUNT(*) AS cnt FROM hr_departments    UNION ALL
SELECT 'hr_positions',              COUNT(*)         FROM hr_positions      UNION ALL
SELECT 'hr_employees',              COUNT(*)         FROM hr_employees      UNION ALL
SELECT 'hr_attendance',             COUNT(*)         FROM hr_attendance     UNION ALL
SELECT 'hr_salary_structures',      COUNT(*)         FROM hr_salary_structures UNION ALL
SELECT 'hr_payrolls',               COUNT(*)         FROM hr_payrolls       UNION ALL
SELECT 'hr_payroll_details',        COUNT(*)         FROM hr_payroll_details UNION ALL
SELECT 'hr_loans',                  COUNT(*)         FROM hr_loans          UNION ALL
SELECT 'hr_loan_installments',      COUNT(*)         FROM hr_loan_installments UNION ALL
SELECT 'hr_salary_advances',        COUNT(*)         FROM hr_salary_advances UNION ALL
SELECT 'hr_leaves',                 COUNT(*)         FROM hr_leaves         UNION ALL
SELECT 'hr_bonus_batches',          COUNT(*)         FROM hr_bonus_batches  UNION ALL
SELECT 'hr_employee_bonuses',       COUNT(*)         FROM hr_employee_bonuses UNION ALL
SELECT 'hr_holidays',               COUNT(*)         FROM hr_holidays;

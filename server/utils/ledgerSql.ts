/**
 * Customer-ledger running balance, computed when read — NEVER the stored customer_ledger.balance_after.
 * balance_after was stamped in posting order at insert time (and is wrong for back-dated entries and for
 * rows imported from the legacy app), so two screens could disagree. Every screen and export now uses this
 * one expression (date order, id as tie-break), so ledger page, CSV, profile tab and statement always agree.
 * Alias the table as `l`. Window functions: MariaDB >= 10.2.
 */
export const RUNNING_BALANCE_SQL =
  `SUM(l.debit_amount - l.credit_amount) OVER (PARTITION BY l.customer_id ORDER BY l.transaction_date, l.id)`

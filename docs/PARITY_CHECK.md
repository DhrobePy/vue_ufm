# Legacy → new project: functional cross-check (20 Nov 2026)

Source of truth for the legacy side: its own module/page map (`module-page-map.md`, built from the app's routing table) plus the cron scripts and APIs.
**Status key:** ✅ same capability exists · 🟡 exists but narrower / different · ❌ missing · ⛔ switched off on purpose (Fleet, HR, Logistics).
"✅" means the screen and its main action exist. Business **rules** have been verified in depth only for Credit Sales (see section 3).

## 1. Screens and features, module by module

### Credit Sales + Production (38 legacy pages)
| Legacy | New | |
|---|---|---|
| sales hub, role dashboard | Credit Sales dashboard | ✅ |
| sales_dashboard (date-range KPIs) | dashboard cards (this month only) | 🟡 no custom date range |
| all_sales | All Sales | 🟡 status chips + search + "since date"; legacy also had branch / date-range / customer filters, multi-status box, partial-delivery badge |
| product_sales_report (3 tabs: by product/price point, …) | — | ❌ |
| sales_report (date/branch/product/customer + csv/xlsx/pdf export) | — | ❌ |
| dispatch_report (shipped-from-factory, product breakdown) | — | ❌ |
| create_order · backdated_order · credit_order_approval | Create Order · Backdated Entry · Approve Orders | ✅ (rules cross-checked) |
| customer_payment · advance_payment_collection · payment_history | Collect Payment · Payments (+ new advance allotment, refunds) | ✅ |
| outstanding_invoices | ageing + open orders in Collect Payment | 🟡 no stand-alone unpaid-invoice list |
| returns_center (returns · stock adjustment · over-delivery tabs) | return on each order; Over-Deliveries list; Stock Adjustments | 🟡 no single returns list / approval board |
| payment_watch · approval_requests · qr_scan_log | same names | ✅ |
| credit_order_view · admin_edit · invoice · gate pass · verify_delivery · partial_delivery | Order page · Amend · Invoice · Dispatch Slip · QR verify · Record Delivery | ✅ (price-change view is new) |
| credit_production · production_requirement · delivery_schedule · credit_dispatch · order_status | Production Queue · Requirement · Delivery Schedule · Dispatch Queue · Order Status | ✅ |

### Customers (7) — ✅ all (directory, add/edit, credit limits, ageing, ledger, detail) and a new customer profile.

### Products (8)
✅ overview, base products, variants, pricing, Pricing Engine, per-branch inventory · 🟡 `price_manager` (admin bulk price editor) — single-price and engine only · prices are now identical to legacy.

### Expenses (9) — ✅ all (dashboard, create, edit pending, approve/bulk, history, voucher list/print, categories).

### Bank (9) — ✅ dashboard, create/edit, transfer, statement, unified (central) statement, accounts, types, bulk actions · 🟡 view_transaction (detail with audit trail is an API, no dedicated page).

### Accounts (14)
✅ dashboard, chart of accounts, journal, debit vouchers, daily log, GL statement, day-end reconciliation, NBR tax statement, internal transfer, bank accounts · ❌ **all_accounts** (summary of every non-bank balance + CSV) · ⛔ receive_payment (vehicle rentals, Logistics).

### Purchase (17)
✅ dashboard, suppliers (+summary, ledger, credit), commodities/origins catalogue, POs (create/edit/close/print), GRNs (create/edit/print/variance), payments, adjustment notes (DAN/CAN) · 🟡 record_payment "Supplier Sale" barter/settlement sub-flow (not confirmed) · 🟡 reconciliation (API `purchase/reconcile` exists, no page) · ❌ **purchase reports / analytics dashboard** · ❌ **bank_statement** (purchase payments per bank account).

### Trading (13) — ✅ dashboard, commodity sale (create/edit/payment/delete), invoice, gate pass, QR verify, margin report, business partners, partner settlement · 🟡 dispatch board and commodity inventory are sections of the dashboard, not separate pages.

### Loans (4) — ✅ dashboard, disburse, view, repay.

### POS (13)
✅ terminal, dashboard, today's sales, customer ledger + collect, reports, End-of-Day with variance + deposit confirmation, pending approvals, exit QR scan · ❌ **cash_verification** (till variance log) · ❌ **eod_reopen** (admin reopens a closed day) · ❌ **edit_order** (admin corrects qty / price / payment split of a POS sale).

### Admin (14)
✅ users, employees, audit log (user_activity), roles & privileges (per-user permissions), recycle bin, Telegram/company/finance/order/security settings · ❌ **daily_summary** · ❌ **cashflow_dashboard** · ❌ **operations_center** (income/expense drill-down) · ❌ **role_matrix** (who can reach what) · ❌ **db_viewer** (raw table editor — arguably should stay gone) · 🟡 drive_manager (backup cron with Drive upload exists; no manager screen) · ❌ per-user dashboard widget layout · ❌ telegram_ai_users (allow-list for the `/ask` bot) · ⛔ drivers_trucks (Fleet).

### Automation & other
✅ nightly DB backup (with Google Drive), daily digest · ❌ delivery-schedule Telegram alert · ❌ hourly production-shortfall Telegram alert · ❌ Telegram `/ask` AI query bot · ❌ chat · ❌ in-app user manual · ❌ session announcements · ⛔ Fleet / HR / Logistics.

**Tally:** about 100 of ~140 legacy pages are ✅, 9 🟡, 22 ❌, remainder ⛔.

## 2. Data cross-check (same data, both systems) — done, with results
Customer balances, orders, payments, ledger, purchase orders, GRNs, expenses, bank transactions, supplier payables, prices: **identical** (`scripts/verify-parity.mjs`). Open differences found by this audit:

| Check | Result |
|---|---|
| General-ledger trial balance by account (54 accounts) | 47 identical, **7 differ**: Accounts Receivable ৳4.97 L, Credit-sales revenue ৳2.97 L, Demra mill expense ৳0.37 L, GRN Pending ৳4.37 L, Inventory-Wheat ৳15.7 L, Petty Cash Demra ৳0.29 L, Petty Cash Sirajgonj ৳18.6 L |
| **Status 20 Nov 2026** | ✅ **Repaired** with `scripts/repair-gl-parity.mjs` (now part of `cutover-sync.sh`): 6 missing entries inserted, 2 half-posted entries completed, 1 double posting (PV-20260726-0001) removed. Remaining differences are only the 7 entries that exist solely here (4 expense vouchers legacy never posted to the GL = ৳37,180, 3 POS sales) plus whatever legacy posts after the last sync. Bank/cash GL accounts hold identical balances in both (only their ids differ). |
| Cause (journal level) | 6 legacy entries have no twin here (2 GRNs, 2 credit-sale invoices, 1 supplier payment `PV-20260726-0004`, 1 invoice `CR-20260907-0020`); 2 of those exist here with a missing debit or credit line (unbalanced); 10 entries exist only here (4 July expense entries, 3 POS sales incl. 2 for a test customer, 1 re-created supplier payment) |
| Unbalanced journal entries | legacy 3 (old test reversals) · here 5 |
| Bank statement balance (3 of the bank-statement accounts) | differ by ৳13.6 L, ৳15.9 L and ৳2.3 L |
| Stored balances on petty-cash and GL bank accounts | cached figures differ a lot from legacy (petty cash −৳43.1 Cr vs −৳31.8 Cr); these are not synced, so any screen that shows the stored figure instead of computing it from entries would disagree |
| 5 customers that exist only here | #162, #176, #177, #190, #215 (test records) |

## 3. Rule-level verification status
| Module | Verified how | State |
|---|---|---|
| Credit Sales (create, approve, produce, dispatch, deliver, return, over-delivery, cancel, edit, advance, refund, price change) | 190+ automated rules + manual comparison with legacy code | ✅ done |
| Settings | 20+ rules | ✅ done |
| Purchase, Expenses, Bank, Accounts, Trading, POS, Loans, Products/Pricing, Admin | screens exist; **rules not yet compared line by line** | ⏳ not done |

## 4. Suggested order of work
1. **Close the ledger gap** (section 2): repair the 6 missing / 2 half-posted journal entries, archive the 10 Vue-only ones, recompute cached balances → trial balance identical. *Blocks a clean cutover.*
2. **Missing money screens:** all_accounts, purchase bank statement + purchase reports/reconciliation page, POS cash verification / EOD reopen / edit order, returns board.
3. **Owner reports:** daily summary, cashflow dashboard, operations center, sales / product-sales / dispatch reports with export, role matrix.
4. **Automation:** the two Telegram alerts and the `/ask` bot, if still used.
5. **Rule-by-rule comparison** for Purchase → Accounts/Bank → Expenses → Trading/Loans/POS, as was done for Credit Sales.

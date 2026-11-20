# Business-rule comparison: legacy PHP app vs this app

Rule-by-rule read of the legacy code (`core/classes/*Manager.php` and the pages that call them) against the Vue/Nitro endpoints.
Status as of 20 Nov 2026. ✅ = identical now · 🔧 = was different, fixed in this pass · ⚖️ = different ON PURPOSE (owner decision on record — confirm before cutover) · ⏳ = not compared yet.

## Credit Sales, Settings — ✅ (done earlier, see PARITY_CHECK.md)

## Purchase
| Rule | Legacy | Now |
|---|---|---|
| GRN → ledger | DR Inventory-Wheat **Canadian (1400) if origin is Canada, else Russian (1401)** · CR **GRN Pending (2110)** | 🔧 same (was: one commodity account, credit generic Accounts Payable) |
| Supplier payment → ledger | DR **GRN Pending (2110)** for every payment type · CR bank / petty-cash account | 🔧 same (was: Accounts Payable 2010, or "Advance to Suppliers" for advances) |
| Cash payment | needs a petty-cash account + the employee who handled the cash; till balance goes down | 🔧 added (before: a cash payment got **no ledger entry at all**) |
| Mobile-banking payment | n/a | 🔧 now requires the company wallet/bank account (before: no ledger entry) |
| Paying more than received so far | auto-marked advance | 🔧 same |
| Supplier credit (CAN) used on a payment | recorded as a debit so it can't be reused | 🔧 same (before: credit was displayed but never used up) |
| Payment delete | superadmin, **reason required**, till restored, credit released | 🔧 same |
| PO number | plain sequence (max + 1), or typed by hand; duplicates refused | 🔧 same (was `PO-YYYYMMDD-NNNN`) |
| Service purchase (invoice with no per-unit value) | total + remark required | 🔧 added |
| GRN on an admin-locked PO | refused with the lock reason | 🔧 added (before: allowed) |
| Telegram on PO created / GRN recorded / payment made | yes | 🔧 added |
| Adjustment notes (DAN/CAN) | admin only; cancel needs a reason; posting moves the PO's adjustment total and payable; **a posted CAN becomes supplier credit**; delete reverses it (Recycle Bin) | 🔧 same (before: no credit created, no delete, anyone could post) |
| Note numbering | `DAN-YYYY-NNNN` / `CAN-YYYY-NNNN` | 🔧 same everywhere (auto-DAN on over-delivery used another format) |
| Reopen a closed PO | back to partial/pending, **lock released** | 🔧 same |
| "Final delivery" | locks the PO, flags it, offers a draft CAN for any shortfall over 1 KG | 🔧 same (before: closed the PO, no CAN) |
| Over-delivery → draft DAN | yes | ✅ |
| Delivery status maths (pending/partial/completed ≤105 %/over) | yes | ✅ |
| GRN edit / cancel | superadmin only; cancelled can't be edited | ✅ |
| **GRN value basis** | legacy books **weighed (received) quantity × PO price** in the ledger; its supplier statement shows *expected (billed)* quantity | ⚖️ Vue prices a new GRN on **expected quantity** (commit 3eba1dc0, 5 Jun 2026, "pay on expected qty"). Synced GRNs carry legacy's received-based values, so new and old differ in basis. **Owner to confirm which basis the books should use.** |
| Close / reopen PO | Superadmin only | ⚖️ admin may too; "Reverse PO" and "Permanently delete PO" exist only here (same commit) |
| Variance report | open to purchase users | ⚖️ admin only (same commit) |
| Bank cached balance after a payment | decremented | ⏳ not kept (the cached figure is unreliable in legacy too; ledger is the source) |
| Bank-statement bridge for purchase payments | attempted, almost never matched (1 row ever) | ⏳ not replicated |

## Expenses
| Rule | Now |
|---|---|
| Voucher is `pending`; ledger entry + cash/bank movement only on approval; reject needs a reason | ✅ |
| Qty × per-unit cost, when both are given, is the total; total must be > 0 | 🔧 |
| Subcategory must belong to the chosen category | 🔧 |
| Telegram on submitted / approved / rejected | 🔧 added |
| Delete | ⚖️ legacy: pending vouchers can't be deleted (reject instead); approved ones can, reversing the entry. Vue: only pending can be deleted; approved ones are **cancelled** with a reversal entry. Same effect on the books, different path. |

## Bank
| Rule | Now |
|---|---|
| Create → pending, approve / reject with audit, amount > 0 | ✅ |
| Approving a bank transaction | ⚖️ legacy never posts to the ledger; Vue posts a journal entry on approval, **forward-only, by explicit owner decision** (bankTxGL.ts). |
| A bank row mirrored from a customer payment | 🔧 approving it no longer posts a second entry (it would have counted the receipt twice) |

## Ledger / data
- Journal entries, trial balance (54 accounts), customer balances, orders, order lines, payments, purchases, GRNs, expenses, bank transactions: identical after sync (see `verify-parity.mjs`, `repair-gl-parity.mjs`).
- The only standing ledger differences: 4 expense vouchers legacy never posted (৳37,180) and 3 POS sales (legacy keeps POS in separate tables).

## ⏳ Not compared line-by-line yet
POS (rebuilt earlier against the spec), Trading, Loans, Products/Pricing (prices identical; rules not re-read), Production, HR/Payroll, Fleet/Logistics (not migrated), Accounts vouchers/journals/transfers, Admin.

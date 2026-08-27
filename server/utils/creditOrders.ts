/**
 * Shared evaluators + posting helpers for the credit-sales module.
 *
 * Playbook principle P3: any state multiple endpoints must agree on lives in
 * exactly ONE function here — outstanding balance, gate state, approval
 * authority. Endpoints never re-derive these.
 *
 * All functions take a `conn` (connection inside the caller's transaction)
 * so evaluation and enforcement see the same snapshot.
 */

export const ADMIN_ROLES      = ['admin', 'superadmin']
export const ACCOUNTS_ROLES   = ['accounts', 'accounts-srg', 'accounts-demra']
export const SALES_ROLES      = ['sales-srg', 'sales-demra', 'sales-other']
export const PRODUCTION_ROLES = ['production manager-srg', 'production manager-demra']
export const DISPATCH_ROLES   = ['dispatch-srg', 'dispatch-demra', 'dispatchpos-srg', 'dispatchpos-demra']

export const isAdminRole    = (r: string) => ADMIN_ROLES.includes(r)
export const isAccountsRole = (r: string) => ACCOUNTS_ROLES.includes(r) || ADMIN_ROLES.includes(r)

// ─── Customer outstanding — LEDGER TRUTH, never customers.current_balance ────
export interface CustomerExposure {
  /** What the customer actually owes now: Σ ledger debits − Σ credits */
  ledgerOutstanding: number
  /** balance_due on orders created but not yet posted to the ledger (pre-dispatch) */
  pendingExposure: number
  /** ledgerOutstanding + pendingExposure */
  totalExposure: number
}

export async function getCustomerOutstanding(
  conn: any, customerId: number, opts: { excludeOrderId?: number } = {},
): Promise<CustomerExposure> {
  const [[led]] = await conn.query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM customer_ledger WHERE customer_id = ?`,
    [customerId],
  )
  const ledgerOutstanding = Number(led?.bal ?? 0)

  // Orders whose invoice has NOT hit the ledger yet (ledger posts at dispatch)
  const params: any[] = [customerId]
  let excludeSql = ''
  if (opts.excludeOrderId) { excludeSql = ' AND id != ?'; params.push(opts.excludeOrderId) }
  const [[pend]] = await conn.query(
    `SELECT COALESCE(SUM(balance_due), 0) AS pending
     FROM credit_orders
     WHERE customer_id = ?${excludeSql}
       AND status IN ('pending_approval','escalated','approved','in_production','produced','ready_to_ship')`,
    params,
  )
  const pendingExposure = Number(pend?.pending ?? 0)

  return { ledgerOutstanding, pendingExposure, totalExposure: ledgerOutstanding + pendingExposure }
}

/**
 * Credit usage percent. Over-limit or zero-limit customers score 999 —
 * NEVER 0 (the classic `available <= 0 → looks safest` bug).
 */
export function creditUsagePct(exposure: number, creditLimit: number): number {
  if (creditLimit <= 0) return 999
  if (exposure > creditLimit) return 999
  return Math.round((exposure / creditLimit) * 100)
}

// ─── Delegated approval limits ────────────────────────────────────────────────

/** Per-action ৳-limit keys (legacy user_action_limits parity). */
export const ACTION_LIMIT_KEYS = [
  'approve_order', 'amend_order', 'collect_payment', 'partial_delivery',
  'commodity_sale', 'loan_disbursement', 'pos_exit_release', 'early_release',
] as const
export type ActionLimitKey = typeof ACTION_LIMIT_KEYS[number]

/**
 * Per-user per-action ৳ cap from user_action_limits. Returns null when the
 * action has no explicit row for this user — the caller decides the fallback
 * (approve_order/amend_order fall back to user_approval_limits.max_order_amount,
 * collect_payment to max_transaction_amount, partial_delivery to nothing).
 * A row with amount 0 is treated the same as no row (unset), matching the
 * inline-limit editor's "blank/0 clears" convention.
 */
export async function getUserActionLimit(
  conn: any, userId: number, key: ActionLimitKey,
): Promise<number | null> {
  try {
    const [[row]] = await conn.query(
      `SELECT max_amount FROM user_action_limits WHERE user_id = ? AND action_key = ?`,
      [userId, key],
    )
    const amt = Number(row?.max_amount ?? 0)
    return amt > 0 ? amt : null
  } catch {
    return null // table missing (pre-migration restart) — behave as unset
  }
}

/**
 * Max order amount this user may approve.
 * Precedence: admin → Infinity; per-action approve_order limit → that amount;
 * personal row in user_approval_limits → that amount (decides EVERYTHING);
 * accounts family without either → 0 (falls back to the 80% rule evaluated
 * by the caller); others → 0.
 */
export async function getUserApprovalLimit(
  conn: any, userId: number, role: string,
): Promise<{ limit: number; source: 'admin' | 'personal' | 'none' }> {
  if (isAdminRole(role)) return { limit: Infinity, source: 'admin' }
  const actionCap = await getUserActionLimit(conn, userId, 'approve_order')
  if (actionCap !== null) return { limit: actionCap, source: 'personal' }
  const [[row]] = await conn.query(
    `SELECT max_order_amount FROM user_approval_limits WHERE user_id = ?`, [userId],
  )
  // A row with 0 order limit (e.g. only a transaction cap set) = no personal
  // order authority — fall through to the caller's 80% rule, don't hard-block.
  if (row && Number(row.max_order_amount) > 0)
    return { limit: Number(row.max_order_amount), source: 'personal' }
  return { limit: 0, source: 'none' }
}

/**
 * Check the per-user transaction (payment) limit — never throws, so the
 * caller can decide between hard-blocking and queuing for a checker
 * (spec §2.4/§3 maker/checker gate). Admins are always allowed.
 *
 * "No limit configured" (no row / 0) is NOT unlimited — it means the maker
 * hasn't been delegated any personal authority yet, so a fresh submission
 * always queues for a checker. (Previously this defaulted to unlimited/
 * fully-trusted, silently bypassing maker/checker for anyone nobody had
 * gotten around to configuring — the exact gap the legacy app's Jul 2026
 * fix closed.) The one exception: a CHECKER re-posting a request they're
 * reviewing (isCheckerReview=true) is trusted regardless of their own
 * configured cap — the act of being the second, different reviewer with
 * Approval Requests access is itself sufficient authority; the strict
 * "needs a configured limit" rule only applies to the original maker.
 */
export async function checkTransactionLimit(
  conn: any, userId: number, role: string, amount: number, isCheckerReview = false,
): Promise<{ allowed: boolean; cap: number; reason?: 'policy' | 'over_cap' | 'no_cap' }> {
  if (isAdminRole(role)) return { allowed: true, cap: Infinity }
  // Per-action collect_payment cap wins; legacy max_transaction_amount is the fallback
  const actionCap = await getUserActionLimit(conn, userId, 'collect_payment')
  let cap = actionCap ?? 0
  if (cap <= 0) {
    const [[row]] = await conn.query(
      `SELECT max_transaction_amount FROM user_approval_limits WHERE user_id = ?`, [userId],
    )
    cap = Number(row?.max_transaction_amount ?? 0)
  }
  if (isCheckerReview) return { allowed: true, cap }
  // Global policy (legacy "Payment Approval Policy", default ON): EVERY
  // non-admin maker's receipt queues for a checker regardless of their
  // configured limit. Checker re-posting above is exempt by definition.
  const { paymentRequireApproval } = await getCreditWorkflowSettings(conn)
  if (paymentRequireApproval) return { allowed: false, cap, reason: 'policy' }
  if (cap <= 0) return { allowed: false, cap: 0, reason: 'no_cap' }
  return { allowed: amount <= cap, cap, reason: amount <= cap ? undefined : 'over_cap' }
}

/**
 * Queue a payment that exceeded the maker's limit for a checker to review
 * and re-submit under their own authority (spec §2.4 maker/checker gate).
 * Caller must have done NO writes yet — call this, commit, and return; do
 * not proceed with the original posting.
 */
export async function queuePendingRequest(conn: any, opts: {
  requestType: 'payment' | 'collect_payment' | 'commodity_sale' | 'commodity_payment' | 'commodity_sale_edit' | 'loan_disbursement' | 'loan_repayment' | 'pos_exit_release' | 'pos_credit_sale'
  payload: unknown
  orderId?: number | null
  customerId?: number | null
  amount: number
  referenceLabel: string
  requestedBy: number
  requestedReason: string
}): Promise<number> {
  const [res] = await conn.query(
    `INSERT INTO credit_pending_requests
       (request_type, payload, order_id, customer_id, amount, reference_label,
        requested_by_user_id, requested_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      opts.requestType, JSON.stringify(opts.payload), opts.orderId ?? null, opts.customerId ?? null,
      opts.amount, opts.referenceLabel, opts.requestedBy, opts.requestedReason,
    ],
  )
  return res.insertId
}

// ─── Order gates ──────────────────────────────────────────────────────────────
export interface GateState {
  exists: boolean
  productionHold: boolean
  productionReleased: boolean
  dispatchHold: boolean
  dispatchCleared: boolean
  conditionType: string | null            // manual | outstanding_below | outstanding_after_ship | amount_received
  conditionAmount: number | null
  autoRelease: boolean
  accountsNote: string | null
  /** condition currently satisfied by the numbers (independent of clearance) */
  conditionMet: boolean
  /** current measured value for progress display */
  currentValue: number | null
  raw: any
}

/**
 * Credit-workflow policy toggles (system_settings key 'credit_workflow_policy'):
 *  - dispatchGlobalHold: every order is dispatch-held by default until Accounts/
 *    Admin explicitly clears it, independent of any payment condition. ON by
 *    default (matches the legacy app's Jul 2026 feature — safety-first default).
 *  - creditLimitAutoRelease: approving an over-limit order force-sets a
 *    dispatch hold that self-clears once the customer's ledger balance comes
 *    back within their credit limit. OFF by default (opt-in).
 */
export async function getCreditWorkflowSettings(conn: any): Promise<{ dispatchGlobalHold: boolean; creditLimitAutoRelease: boolean; paymentRequireApproval: boolean }> {
  // paymentRequireApproval ON by default — matches the legacy app's
  // "Payment Approval Policy" (every non-admin receipt queues for a checker).
  const defaults = { dispatchGlobalHold: true, creditLimitAutoRelease: false, paymentRequireApproval: true }
  try {
    const [[row]] = await conn.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'credit_workflow_policy'`,
    )
    if (row?.setting_value) {
      // The settings API stores snake_case keys — map them explicitly.
      // (A plain {...defaults, ...parsed} spread would leave the camelCase
      // defaults untouched and silently ignore every stored value.)
      const parsed = JSON.parse(row.setting_value)
      return {
        dispatchGlobalHold:     parsed.dispatch_global_hold      !== undefined ? Boolean(parsed.dispatch_global_hold)      : defaults.dispatchGlobalHold,
        creditLimitAutoRelease: parsed.credit_limit_auto_release !== undefined ? Boolean(parsed.credit_limit_auto_release) : defaults.creditLimitAutoRelease,
        paymentRequireApproval: parsed.payment_require_approval  !== undefined ? Boolean(parsed.payment_require_approval)  : defaults.paymentRequireApproval,
      }
    }
  } catch { /* table/row missing — defaults stand */ }
  return defaults
}

// Orders that have already left the pre-dispatch pipeline — a default hold
// synthesized for display/enforcement is meaningless once past this point.
const PRE_DISPATCH_STATUSES = [
  'draft', 'pending_approval', 'escalated', 'approved',
  'in_production', 'produced', 'ready_to_ship',
]

export async function getOrderGateState(conn: any, orderId: number): Promise<GateState> {
  const none: GateState = {
    exists: false, productionHold: false, productionReleased: false,
    dispatchHold: false, dispatchCleared: false, conditionType: null,
    conditionAmount: null, autoRelease: false, accountsNote: null,
    conditionMet: true, currentValue: null, raw: null,
  }
  let c: any
  try {
    const [[row]] = await conn.query(
      `SELECT * FROM order_approval_conditions WHERE order_id = ? ORDER BY id DESC LIMIT 1`, [orderId],
    )
    c = row
  } catch (e: any) {
    // Table not migrated yet (stale deploy / failed startup migration):
    // degrade to "no gates" instead of turning every dispatch into a 500.
    console.warn('[gates] order_approval_conditions unavailable:', e?.message)
    return none
  }
  if (!c) {
    // No explicit condition row — under the global-hold policy, a pre-dispatch
    // order is held by default (requires explicit Accounts/Admin clearance)
    // rather than free to ship. gates.post.ts's clear_dispatch upserts a real
    // row the first time someone clears it, so this synthesis only matters
    // before that ever happens.
    const { dispatchGlobalHold } = await getCreditWorkflowSettings(conn)
    if (!dispatchGlobalHold) return none
    const [[ord]] = await conn.query(`SELECT status FROM credit_orders WHERE id = ?`, [orderId])
    if (!ord || !PRE_DISPATCH_STATUSES.includes(ord.status)) return none
    return {
      ...none,
      dispatchHold: true, conditionType: 'manual', conditionMet: false,
      accountsNote: 'Held by default dispatch policy — no explicit clearance yet',
    }
  }

  const [[order]] = await conn.query(
    `SELECT customer_id, total_amount, amount_paid, advance_paid, balance_due
     FROM credit_orders WHERE id = ?`, [orderId],
  )

  let conditionMet = true
  let currentValue: number | null = null
  const condAmt = c.condition_amount !== null ? Number(c.condition_amount) : null

  if (c.dispatch_hold && c.condition_type && c.condition_type !== 'manual' && order) {
    const exp = await getCustomerOutstanding(conn, order.customer_id, { excludeOrderId: orderId })
    switch (c.condition_type) {
      case 'outstanding_below':
        // Existing dues (before this invoice) must be at or below the threshold
        currentValue = exp.ledgerOutstanding
        conditionMet = condAmt !== null && exp.ledgerOutstanding <= condAmt
        break
      case 'outstanding_after_ship':
        // Dues INCLUDING this order's unpaid balance must be at or below threshold
        currentValue = exp.ledgerOutstanding + Number(order.balance_due ?? 0)
        conditionMet = condAmt !== null && currentValue <= condAmt
        break
      case 'amount_received':
        // Money received against THIS order (advance + payments)
        currentValue = Number(order.amount_paid ?? 0)
        conditionMet = condAmt !== null && currentValue >= condAmt
        break
      default:
        conditionMet = false
    }
  } else if (c.dispatch_hold && c.condition_type === 'manual') {
    conditionMet = false // manual = only human clearance counts
  }

  return {
    exists: true,
    productionHold:     !!c.production_hold,
    productionReleased: !!c.production_released_at,
    dispatchHold:       !!c.dispatch_hold,
    dispatchCleared:    !!c.dispatch_cleared,
    conditionType:      c.condition_type ?? null,
    conditionAmount:    condAmt,
    autoRelease:        !!c.auto_release,
    accountsNote:       c.accounts_note ?? null,
    conditionMet,
    currentValue,
    raw: c,
  }
}

/** Public/system-attributed writes use this — the established convention in this schema (see auditLog). */
export const SYSTEM_USER_ID = 1

/**
 * Move an order to GOODS ON BOARD — the accounting pivot (spec §2.3). Posts
 * the full invoice to customer_ledger + a balanced JE (Dr AR / Cr Revenue),
 * exactly once (idempotent — checks for an existing invoice row first).
 * Enforces the dispatch-hold gate, self-clearing it when auto-release
 * applies and the condition is met.
 *
 * Caller must hold the order row FOR UPDATE inside its own transaction —
 * this function does not begin/commit. Used by both the authenticated
 * workflow endpoint and the public QR/PIN gate-scan endpoint so the ledger
 * posts identically no matter which door the truck leaves through.
 */
export async function postGoodsOnBoardInvoice(conn: any, opts: {
  orderId: number
  orderNumber: string
  customerId: number
  customerName: string
  totalAmount: number
  balanceDue: number
  userId: number
  userName: string
  /** Backdated entries post with a historical date instead of today. */
  postDate?: string
}): Promise<{ alreadyPosted: boolean; autoReleased: boolean; telegramMsg: string }> {
  const gate = await getOrderGateState(conn, opts.orderId)
  let autoReleased = false

  if (gate.dispatchHold && !gate.dispatchCleared) {
    if (gate.conditionMet && gate.autoRelease) {
      await conn.query(
        `UPDATE order_approval_conditions
         SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
             dispatch_cleared_note = 'Auto-released: condition met at goods-on-board'
         WHERE order_id = ?`,
        [opts.userId, opts.orderId],
      )
      autoReleased = true
    } else {
      throw createError({
        statusCode: 423,
        statusMessage: gate.conditionMet
          ? 'Payment condition met but clearance is manual — ask accounts to grant it (Payment Watch)'
          : `Dispatch blocked — payment clearance pending (${gate.conditionType ?? 'manual'}${gate.conditionAmount ? ` ৳${gate.conditionAmount.toLocaleString()}` : ''})`,
      })
    }
  }

  const [[already]] = await conn.query(
    `SELECT id FROM customer_ledger
     WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice'
     LIMIT 1`,
    [opts.orderId],
  )
  const alreadyPosted = !!already

  if (!already) {
    const postDate = opts.postDate ?? new Date().toISOString().slice(0, 10)
    let jeId: number | null = null
    const arId  = await getGLAccountId(conn, 'Accounts Receivable')
    const revId = await getGLAccountId(conn, 'Revenue')
    if (arId && revId) {
      jeId = await postJournalEntry(conn, {
        date: postDate,
        description: `Sales invoice — ${opts.orderNumber} (${opts.customerName}) — goods on board`,
        docType: 'CreditOrder',
        docId: opts.orderId,
        userId: opts.userId,
        lines: [
          { accountId: arId,  debit: opts.totalAmount, credit: 0, memo: opts.orderNumber },
          { accountId: revId, debit: 0, credit: opts.totalAmount, memo: opts.orderNumber },
        ],
      })
    } else {
      console.warn(`[goods_on_board] Missing GL accounts (AR=${arId}, Rev=${revId}) — ledger posted without JE`)
    }
    await postCustomerLedger(conn, {
      customerId: opts.customerId,
      date: postDate,
      transactionType: 'invoice',
      referenceType: 'credit_order',
      referenceId: opts.orderId,
      invoiceNumber: opts.orderNumber,
      description: `Invoice — ${opts.orderNumber} goods on board (full order value)`,
      debit: opts.totalAmount,
      credit: 0,
      journalEntryId: jeId,
      userId: opts.userId,
    })
  }

  const telegramMsg =
    `🚚 <b>Goods on Board</b>\n` +
    `${opts.orderNumber} — ${opts.customerName}\n` +
    `Invoice ৳${opts.totalAmount.toLocaleString()} posted · balance due ৳${opts.balanceDue.toLocaleString()}\n` +
    `by ${opts.userName}` +
    (autoReleased ? '\n🟢 Dispatch clearance auto-released' : '')

  return { alreadyPosted, autoReleased, telegramMsg }
}

// ─── GL posting helpers — the ONE way money is recorded ──────────────────────
/** Resolve a GL account id by account_type (first matching). */
export async function getGLAccountId(conn: any, accountType: string): Promise<number | null> {
  const [[row]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE account_type = ? ORDER BY id ASC LIMIT 1`,
    [accountType],
  )
  return row?.id ?? null
}

export interface JELine { accountId: number; debit: number; credit: number; memo?: string }

/**
 * Insert a balanced journal entry + lines. Throws if lines don't balance.
 * Returns the journal_entry id.
 */
export async function postJournalEntry(conn: any, opts: {
  date: string
  description: string
  docType: string
  docId: number
  userId: number
  lines: JELine[]
}): Promise<number> {
  const dr = opts.lines.reduce((s, l) => s + l.debit, 0)
  const cr = opts.lines.reduce((s, l) => s + l.credit, 0)
  if (Math.abs(dr - cr) > 0.005)
    throw new Error(`Unbalanced journal entry: DR ${dr} != CR ${cr} (${opts.description})`)

  const [jeRes] = await conn.query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [opts.date, opts.description.slice(0, 255), opts.docType, opts.docId, opts.userId],
  )
  const jeId = jeRes.insertId
  for (const l of opts.lines) {
    await conn.query(
      `INSERT INTO transaction_lines
         (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [jeId, l.accountId, l.debit, l.credit, (l.memo ?? '').slice(0, 255) || null],
    )
  }
  return jeId
}

/**
 * Append a customer_ledger row. balance_after = ledger-truth SUM after this
 * row — computed here so every writer stays consistent.
 */
export async function postCustomerLedger(conn: any, opts: {
  customerId: number
  date: string
  transactionType: string   // invoice | payment | advance_payment | debit_note | credit_note | ...
  referenceType: string
  referenceId: number
  invoiceNumber: string
  description: string
  debit: number
  credit: number
  journalEntryId?: number | null
  userId: number
}): Promise<number> {
  const [[led]] = await conn.query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM customer_ledger WHERE customer_id = ?`,
    [opts.customerId],
  )
  const balanceAfter = Number(led?.bal ?? 0) + opts.debit - opts.credit

  const [res] = await conn.query(
    `INSERT INTO customer_ledger
       (customer_id, transaction_date, transaction_type, reference_type, reference_id,
        invoice_number, description, debit_amount, credit_amount, balance_after,
        journal_entry_id, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      opts.customerId, opts.date, opts.transactionType, opts.referenceType, opts.referenceId,
      opts.invoiceNumber.slice(0, 50), opts.description, opts.debit, opts.credit, balanceAfter,
      opts.journalEntryId ?? null, opts.userId,
    ],
  )
  // Keep the denormalized customers.current_balance in sync with ledger truth
  await conn.query(
    `UPDATE customers SET current_balance = ?, updated_at = NOW() WHERE id = ?`,
    [Math.max(0, balanceAfter), opts.customerId],
  )
  return res.insertId
}

/**
 * PREFIX-YYYYMMDD-0001 using CURDATE() (server TZ) to avoid UTC drift.
 *
 * Derives the next sequence number from the MAX existing suffix for today,
 * not COUNT(*) — a same-day recycle-bin delete drops the row count without
 * freeing the number, so COUNT(*)+1 can regenerate a number that's still in
 * use (or was, and collides with an archived one). MAX-based extraction is
 * immune to that since it only ever counts up.
 */
export async function nextDocNumber(conn: any, prefix: string, table: string, column: string): Promise<string> {
  const [[row]] = await conn.query(`SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d`)
  const datePart = row.d
  const [[last]] = await conn.query(
    `SELECT MAX(CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED)) AS maxSeq
     FROM \`${table}\` WHERE \`${column}\` LIKE ?`,
    [`${prefix}-${datePart}-%`],
  )
  const nextSeq = (Number(last?.maxSeq) || 0) + 1
  return `${prefix}-${datePart}-${String(nextSeq).padStart(4, '0')}`
}

// ─── Branch scoping ───────────────────────────────────────────────────────────
/**
 * Branch id this user's data should be scoped to, or null for full access
 * (admins + accounts see everything). Resolution: employees.branch_id first,
 * then the role suffix (-srg / -demra) against branches.code.
 */
export async function getUserBranchScope(conn: any, userId: number, role: string): Promise<number | null> {
  if (isAdminRole(role) || ACCOUNTS_ROLES.includes(role)) return null
  const suffixed = /-(srg|demra)$/.exec(role)?.[1]
  const [[emp]] = await conn.query(
    `SELECT branch_id FROM employees WHERE user_id = ? LIMIT 1`, [userId],
  )
  if (emp?.branch_id) return Number(emp.branch_id)
  if (suffixed) {
    const [[br]] = await conn.query(
      `SELECT id FROM branches WHERE LOWER(code) = ? LIMIT 1`, [suffixed],
    )
    if (br) return Number(br.id)
  }
  return null
}

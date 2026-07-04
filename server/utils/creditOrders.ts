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
/**
 * Max order amount this user may approve.
 * Precedence: admin → Infinity; personal row in user_approval_limits →
 * that amount (decides EVERYTHING); accounts family without a row → 0
 * (falls back to the 80% rule evaluated by the caller); others → 0.
 */
export async function getUserApprovalLimit(
  conn: any, userId: number, role: string,
): Promise<{ limit: number; source: 'admin' | 'personal' | 'none' }> {
  if (isAdminRole(role)) return { limit: Infinity, source: 'admin' }
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
 * Enforce the per-user transaction (payment) limit. Admins are exempt.
 * A personal max_transaction_amount > 0 caps every single payment the user
 * records; 0 / no row = no personal cap (role checks still apply).
 * Throws 403 when the amount exceeds the cap.
 */
export async function enforceTransactionLimit(
  conn: any, userId: number, role: string, amount: number,
): Promise<void> {
  if (isAdminRole(role)) return
  const [[row]] = await conn.query(
    `SELECT max_transaction_amount FROM user_approval_limits WHERE user_id = ?`, [userId],
  )
  const cap = Number(row?.max_transaction_amount ?? 0)
  if (cap > 0 && amount > cap)
    throw createError({
      statusCode: 403,
      statusMessage: `৳${amount.toLocaleString()} exceeds your transaction limit of ৳${cap.toLocaleString()} — ask admin to record it`,
    })
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
      `SELECT * FROM order_approval_conditions WHERE order_id = ?`, [orderId],
    )
    c = row
  } catch (e: any) {
    // Table not migrated yet (stale deploy / failed startup migration):
    // degrade to "no gates" instead of turning every dispatch into a 500.
    console.warn('[gates] order_approval_conditions unavailable:', e?.message)
    return none
  }
  if (!c) return none

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

/** PREFIX-YYYYMMDD-0001 using CURDATE() (server TZ) to avoid UTC drift. */
export async function nextDocNumber(conn: any, prefix: string, table: string): Promise<string> {
  const [[row]] = await conn.query(
    `SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d, COUNT(*) AS n
     FROM ${table} WHERE DATE(created_at) = CURDATE()`,
  )
  return `${prefix}-${row.d}-${String((row.n ?? 0) + 1).padStart(4, '0')}`
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

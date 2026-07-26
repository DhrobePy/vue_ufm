import { getDb } from '~/server/utils/db'

// Default T&C text — one clause per line, each line becomes a bullet point.
const DEFAULTS: Record<string, string> = {
  tc_purchase_order: [
    'Goods must conform to specified quality standards upon delivery.',
    'Moisture content must not exceed 13% for wheat.',
    'Supplier must provide phytosanitary certificate for imported wheat.',
    'Payment terms as stated above from GRN acceptance.',
    'Any short delivery must be notified before unloading.',
    'Subject to Sirajgonj jurisdiction.',
  ].join('\n'),

  tc_credit_invoice: [
    'Payment due within 30 days of invoice date.',
    'Goods once sold cannot be returned without prior written approval.',
    'Interest @ 2% per month charged on overdue balances.',
    'All disputes subject to Sirajgonj jurisdiction.',
    'This invoice is valid only with authorised company stamp.',
  ].join('\n'),

  // '1' = show the customer's credit limit + outstanding balance block on
  // the printed invoice; '0' hides it (legacy show_invoice_outstanding).
  show_invoice_outstanding: '1',
}

/**
 * GET /api/settings/documents
 * Returns stored T&C for all document types (or defaults if not yet saved).
 * Public — no auth required (needed on print pages before session check on client).
 */
export default defineEventHandler(async () => {
  const db = getDb()
  const conn = await db.getConnection()
  try {
    // system_settings table guaranteed by db-migrate startup plugin.
    const [rows] = await conn.query<any>(
      `SELECT setting_key, setting_value FROM system_settings
       WHERE setting_key IN ('tc_purchase_order','tc_credit_invoice','show_invoice_outstanding')`,
    )

    const result: Record<string, string> = { ...DEFAULTS }
    for (const row of rows) {
      result[row.setting_key] = row.setting_value ?? DEFAULTS[row.setting_key] ?? ''
    }

    return { settings: result }
  } finally {
    conn.release()
  }
})

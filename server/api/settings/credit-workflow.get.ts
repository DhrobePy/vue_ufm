/**
 * GET /api/settings/credit-workflow
 * Dispatch-hold and credit-limit auto-release policy toggles.
 */
import { query } from '~/server/utils/db'

const DEFAULTS = {
  dispatch_global_hold:     true,   // every order held from dispatch until Accounts/Admin explicitly clears it
  credit_limit_auto_release: false, // over-limit orders auto-clear once the customer's balance is back within limit
  payment_require_approval:  true,  // every non-admin receipt queues for a checker regardless of limits
}

export default defineEventHandler(async () => {
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'credit_workflow_policy'`,
    ) as any[]
    if (rows[0]?.setting_value) {
      const parsed = JSON.parse(rows[0].setting_value)
      return { settings: { ...DEFAULTS, ...parsed } }
    }
  } catch { /* fall through */ }
  return { settings: { ...DEFAULTS } }
})

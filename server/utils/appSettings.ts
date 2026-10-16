import { query } from '~/server/utils/db'

/**
 * Company-wide settings that ordinary screens read (prints, order rules, login rules).
 * Stored as one JSON row per group in system_settings. Defaults below are what the app did BEFORE these
 * settings existed, so an untouched install behaves exactly as before.
 */
export const APP_SETTING_GROUPS = {
  company_profile: {
    name: 'Ujjal Flour Mills Co.', tradeName: 'Ujjal FMC', regNo: 'TL-SRG-2018-4821', tin: '', bin: '002148694',
    address: 'Sirajgonj Sadar, Sirajgonj-6700 · Demra, Dhaka-1361', phone: '+880 1711-000000', email: 'accounts@ujjalfmc.com',
  },
  finance_settings: { fyStart: 7, defaultCreditLimit: 0, defaultPaymentTerms: 30, lateRate: 0 },
  order_policy: { auto_approve: false, allow_partial: true, block_overdue: false },
  security_policy: { sessionTimeout: 0, maxLoginAttempts: 5 },
  notify_policy: { telegram: true },
} as const

export type AppSettingGroup = keyof typeof APP_SETTING_GROUPS

let cache: { at: number; value: any } | null = null

export async function getAppSettings(fresh = false): Promise<Record<AppSettingGroup, any>> {
  if (!fresh && cache && Date.now() - cache.at < 15_000) return cache.value   // short TTL: every worker converges within 15 s
  const out: any = {}
  for (const [k, d] of Object.entries(APP_SETTING_GROUPS)) out[k] = { ...d }
  try {
    const rows = await query<{ setting_key: string; setting_value: string }>(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${Object.keys(APP_SETTING_GROUPS).map(() => '?').join(',')})`,
      Object.keys(APP_SETTING_GROUPS))
    for (const r of rows) {
      try { out[r.setting_key] = { ...out[r.setting_key], ...JSON.parse(r.setting_value) } } catch { /* keep defaults */ }
    }
  } catch { /* table missing — defaults */ }
  cache = { at: Date.now(), value: out }
  return out
}
export function resetAppSettingsCache() { cache = null }

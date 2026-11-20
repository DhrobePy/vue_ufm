import { query } from '~/server/utils/db'
import { resolvePermissions } from '~/server/utils/permissions'

/**
 * GET /api/admin/role-matrix — which modules each role's users can reach (legacy admin/role_matrix.php).
 * Uses the same resolver the app enforces with: a user's own permission row if they have one, otherwise their role's default.
 * Read-only overview — change access on a user's Permissions screen.
 */
const MODULES: Record<string, string> = {
  dashboard: 'Dashboard', credit_sales: 'Credit Sales', purchase: 'Purchase', expenses: 'Expenses', bank: 'Bank', accounts: 'Accounts (GL)',
  sales: 'Sales Reports', production: 'Production', dispatch: 'Dispatch', collector: 'Collector', customers: 'Customers', products: 'Products',
  pos: 'POS', fleet: 'Fleet', hr: 'HR',
}

export default defineEventHandler(async () => {
  const users = await query<any>(`SELECT u.id, u.role, EXISTS(SELECT 1 FROM user_permissions p WHERE p.user_id = u.id) AS custom FROM users u WHERE u.status = 'active' ORDER BY u.role, u.id`)
  const roles = new Map<string, { role: string; users: number; customUsers: number; presetUsers: number; mods: Record<string, number> }>()
  for (const u of users) {
    const r = roles.get(u.role) ?? { role: u.role, users: 0, customUsers: 0, presetUsers: 0, mods: {} }
    r.users++; Number(u.custom) ? r.customUsers++ : r.presetUsers++
    const perms = ['superadmin', 'admin'].includes(String(u.role).toLowerCase()) ? null : await resolvePermissions(u.id, u.role)
    for (const k of Object.keys(MODULES)) {
      const on = perms === null ? true : !!perms[k]?.enabled
      if (on) r.mods[k] = (r.mods[k] ?? 0) + 1
    }
    roles.set(u.role, r)
  }
  return { modules: MODULES, roles: [...roles.values()] }
})

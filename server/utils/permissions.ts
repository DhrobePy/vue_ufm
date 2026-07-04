/**
 * Server-side per-action permission check — the enforcement twin of the
 * client's usePermissions().canDo(). UI checks are decoration; this is
 * the gate (playbook P4).
 *
 * Resolution order:
 *  1. admin/superadmin → always allowed
 *  2. user_permissions row → module enabled? page whitelisted? action true?
 *     (module enabled with EMPTY pages list = module-level grant → all allowed)
 *  3. no row at all → role-family fallback the caller provides
 *     (back-compat: users never configured keep their role's defaults)
 */
import { getDb } from '~/server/utils/db'
import { getCachedPerms, setCachedPerms } from '~/server/utils/permCache'

async function loadPerms(userId: number): Promise<Record<string, any> | null> {
  const cached = getCachedPerms(userId)
  if (cached) return cached
  const conn = await getDb().getConnection()
  try {
    const [[row]] = await conn.query<any>(
      `SELECT permissions FROM user_permissions WHERE user_id = ?`, [userId],
    )
    if (!row) {
      setCachedPerms(userId, { __none: true })
      return null
    }
    let perms: Record<string, any> = {}
    try { perms = JSON.parse(row.permissions ?? '{}') } catch { /* empty */ }
    setCachedPerms(userId, perms)
    return perms
  } catch {
    return null // table missing → fall back to roles
  } finally {
    conn.release()
  }
}

export async function userCanAction(opts: {
  userId: number
  role: string
  module: string
  page: string
  action: string
  /** roles allowed when the user has NO user_permissions row */
  roleFallback: string[]
}): Promise<boolean> {
  const role = opts.role.toLowerCase()
  if (['admin', 'superadmin'].includes(role)) return true

  const perms = await loadPerms(opts.userId)
  if (!perms || perms.__none) return opts.roleFallback.includes(role)

  const mod = perms[opts.module]
  if (!mod?.enabled) return false
  if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true // module-level grant
  if (!mod.pages.includes(opts.page)) return false
  return mod.actions?.[opts.page]?.[opts.action] === true
}

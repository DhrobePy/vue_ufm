/**
 * Server-side per-action permission check — the enforcement twin of the
 * client's usePermissions().canDo(). UI checks are decoration; this is
 * the gate (playbook P4).
 *
 * Resolution order:
 *  1. admin/superadmin → always allowed
 *  2. user_permissions row → module enabled? page whitelisted? action true?
 *     (module enabled with EMPTY pages list = module-level grant → all allowed)
 *     (page whitelisted but this action key was never saved for it →
 *      default allow; only an explicitly-unchecked `false` denies. Keeps a
 *      page grant meaning "all its actions" even after new action keys are
 *      added to the registry post-hoc — see usePermissions.ts canDo())
 *  3. no row at all → role-family fallback the caller provides
 *     (back-compat: users never configured keep their role's defaults)
 */
import { getDb } from '~/server/utils/db'
import { getCachedPerms, setCachedPerms } from '~/server/utils/permCache'
import { presetPermissions } from '~/server/utils/permCatalog'

/**
 * The ONE place that answers "what may this user open?" — used by the API gate,
 * /api/me/permissions and userCanAction. Own row wins; no row → role preset.
 */
export async function resolvePermissions(userId: number | string, role: string): Promise<Record<string, any>> {
  const cached = getCachedPerms(userId)
  if (cached) return cached
  let perms: Record<string, any> | null = null
  try {
    const conn = await getDb().getConnection()
    try {
      const [[row]] = await conn.query<any>(`SELECT permissions FROM user_permissions WHERE user_id = ?`, [userId])
      if (row) {
        perms = {}
        try { perms = JSON.parse(row.permissions ?? '{}') } catch { /* empty = no access, same as before */ }
      }
    } finally {
      conn.release()
    }
  } catch {
    return { __preset: true } // DB error — no module access; action checks fall back to roles; not cached
  }
  perms ??= { ...presetPermissions(role), __preset: true as any }
  setCachedPerms(userId, perms)
  return perms
}

export async function userCanAction(opts: {
  userId: number
  role: string
  module: string
  page: string
  action: string
  /** roles always allowed (legacy back-compat for users with no row) */
  roleFallback: string[]
  /** delegable power: only an explicit `true` grant in the user's own row counts (admin always passes) */
  explicit?: boolean
}): Promise<boolean> {
  const role = opts.role.toLowerCase()
  if (['admin', 'superadmin'].includes(role)) return true

  const perms = await resolvePermissions(opts.userId, role)
  if (opts.explicit)
    return !perms.__preset && perms[opts.module]?.enabled === true
      && Array.isArray(perms[opts.module].pages) && perms[opts.module].pages.includes(opts.page)
      && perms[opts.module].actions?.[opts.page]?.[opts.action] === true
  // A role preset only ever WIDENS access — it never removes what the caller's roleFallback already granted.
  const deny = () => !!perms.__preset && opts.roleFallback.includes(role)
  const mod = perms[opts.module]
  if (!mod?.enabled) return deny()
  if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true // module-level grant
  if (!mod.pages.includes(opts.page)) return deny()
  const pageActions = mod.actions?.[opts.page]
  if (!pageActions || !(opts.action in pageActions)) return true // never configured — default allow
  return pageActions[opts.action] === true || deny()
}

/** Session + userCanAction in one call; throws 401/403. Returns the caller. */
export async function requireAction(
  event: any,
  rule: { module: string; page: string; action: string; roleFallback: string[]; explicit?: boolean },
  deniedMessage = 'Your account is not allowed to do this',
): Promise<{ userId: number; role: string }> {
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number(session.user.id)
  const role = String(session.user.role ?? '').toLowerCase()
  if (!(await userCanAction({ userId, role, ...rule })))
    throw createError({ statusCode: 403, statusMessage: deniedMessage })
  return { userId, role }
}

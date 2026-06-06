/**
 * Server-side permission cache.
 *
 * Stores parsed permission objects per user_id in memory to avoid a DB
 * hit on every API request.  TTL is kept short (3 min) so that changes
 * the admin makes in the permissions UI take effect quickly.
 *
 * Import `invalidatePermCache(userId)` from this file in the PUT handler
 * so that a freshly-saved config is picked up immediately.
 */

interface CacheEntry {
  permissions: Record<string, any>
  expiresAt: number
}

// Module-level singleton — shared across all requests in the same process
const cache = new Map<number | string, CacheEntry>()

const TTL_MS = 3 * 60 * 1000 // 3 minutes

export function getCachedPerms(userId: number | string): Record<string, any> | null {
  const entry = cache.get(userId)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(userId)
    return null
  }
  return entry.permissions
}

export function setCachedPerms(userId: number | string, permissions: Record<string, any>): void {
  cache.set(userId, { permissions, expiresAt: Date.now() + TTL_MS })
}

export function invalidatePermCache(userId: number | string): void {
  cache.delete(userId)
}

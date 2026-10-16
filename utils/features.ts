/**
 * Modules switched OFF for now (code and data stay; nothing is deleted). Remove a key to bring the
 * module back — sidebar, route guard, permission editor and search all follow this one list.
 */
export const DISABLED_MODULES: readonly string[] = ['fleet', 'hr']

export const moduleDisabled = (key: string): boolean => DISABLED_MODULES.includes(key)

/** URL belongs to a switched-off module (first path segment == module key). */
export const routeDisabled = (path: string): boolean =>
  DISABLED_MODULES.some(m => path === `/${m}` || path.startsWith(`/${m}/`))

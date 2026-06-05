import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function getDb(): mysql.Pool {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      host:     config.dbHost     || 'localhost',
      port:     Number(config.dbPort) || 3306,
      database: config.dbName     || 'ujjalfmc_saas',
      user:     config.dbUser     || 'root',
      password: config.dbPass     || '',
      waitForConnections: true,
      connectionLimit:    30,         // was 10 — too few under concurrent 30 s polls
      queueLimit:         100,        // queue up to 100 requests before rejecting (was 0 = unlimited — could stack forever)
      connectTimeout:     10_000,     // 10 s — fail fast on DB unreachable
      charset:            'utf8mb4',
      timezone:           '+00:00',
      decimalNumbers:     true,
      enableKeepAlive:    true,       // prevents "Connection lost" after idle periods
      keepAliveInitialDelay: 10_000,
    })
  }
  return pool
}

/** Convenience: run a query and return typed rows */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await getDb().query(sql, params)
  return rows as T[]
}

/** Single row or null */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

/** Simple paginator helper — callers are responsible for capping perPage */
export function paginate(page: number, perPage: number) {
  const p  = Math.max(1, page)
  const pp = Math.min(500, Math.max(1, perPage))   // raised cap to 500
  return { limit: pp, offset: (p - 1) * pp }
}

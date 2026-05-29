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
      connectionLimit:    10,
      queueLimit:         0,
      timezone:           '+00:00',
      decimalNumbers:     true,
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

/** Simple paginator helper */
export function paginate(page: number, perPage: number) {
  const p  = Math.max(1, page)
  const pp = Math.min(100, Math.max(1, perPage))
  return { limit: pp, offset: (p - 1) * pp }
}

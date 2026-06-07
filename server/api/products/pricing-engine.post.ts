import { query, getDb } from '~/server/utils/db'

const DEFAULT_CONFIG = {
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
  branch_surcharges: {} as Record<string, { surcharge_50: number; surcharge_74: number }>,
}

/** Load config from system_settings. */
async function loadConfig() {
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`,
    ) as any[]
    if (rows[0]?.setting_value) return JSON.parse(rows[0].setting_value)
  } catch { /* ignore */ }
  return {}
}

/** Persist config to system_settings (UPSERT). */
async function saveConfig(cfg: object) {
  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('pricing_engine_config', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [JSON.stringify(cfg)],
  )
}

const WEIGHT_MAP: Record<string, string> = {
  '50': '50', '74': '74',
  '50KG': '50', '74KG': '74',
  '50 KG': '50', '74 KG': '74',
  '50kg': '50', '74kg': '74',
}
function mapWeight(wv: string): string {
  if (WEIGHT_MAP[wv]) return WEIGHT_MAP[wv]
  for (const [pat, cls] of Object.entries(WEIGHT_MAP))
    if (wv.toLowerCase().includes(String(parseInt(pat)))) return cls
  return 'custom'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action } = body ?? {}

  // ── SAVE CONFIG ────────────────────────────────────────────────────────────
  if (action === 'save_config') {
    const { bag_50, bag_74, packaging_fee, branch_surcharges } = body
    const current = await loadConfig()
    const updated = {
      ...current,
      formula: {
        bag_50:        Math.max(1, Number(bag_50)   || DEFAULT_CONFIG.formula.bag_50),
        bag_74:        Math.max(1, Number(bag_74)   || DEFAULT_CONFIG.formula.bag_74),
        packaging_fee: Number(packaging_fee)        ?? DEFAULT_CONFIG.formula.packaging_fee,
      },
      branch_surcharges: branch_surcharges ?? current.branch_surcharges ?? {},
    }
    await saveConfig(updated)
    return { ok: true, message: 'Formula config saved.' }
  }

  // ── APPLY PRICES ───────────────────────────────────────────────────────────
  if (action === 'apply_prices') {
    const { base50ByGrade, customPrices, config } = body
    // base50ByGrade: { A: 2500, B: 2200 }
    // customPrices: { "51": 1800 }  (variant_id → flat price)
    // config: { formula, branch_surcharges }

    if (!config?.formula)
      throw createError({ statusCode: 400, statusMessage: 'Config formula missing' })

    const { bag_50, bag_74, packaging_fee } = config.formula
    const surcharges: Record<string, { surcharge_50: number; surcharge_74: number }> =
      config.branch_surcharges ?? {}

    const effDate = new Date().toISOString().slice(0, 10)

    // Load branches + all active variants
    const [branches, allVariants] = await Promise.all([
      query(`SELECT id, name FROM branches WHERE status = 'active'`) as Promise<any[]>,
      query(`
        SELECT pv.id AS variant_id, pv.grade, pv.weight_variant
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id AND p.status = 'active'
        WHERE pv.status = 'active' AND pv.grade IS NOT NULL AND pv.grade != ''
      `) as Promise<any[]>,
    ])

    interface PriceRow { variant_id: number; branch_id: number; unit_price: number }
    const priceRows: PriceRow[] = []

    // Grade-based: 50 and 74 kg variants
    for (const [grade, base50Raw] of Object.entries(base50ByGrade ?? {})) {
      const base50 = Number(base50Raw)
      if (!base50 || base50 <= 0) continue

      const base74 = Math.round(((base50 / bag_50) * bag_74 + packaging_fee) * 100) / 100

      const gradeVariants = allVariants.filter(v => v.grade === grade)
      for (const v of gradeVariants) {
        const wc = mapWeight(v.weight_variant)
        if (wc !== '50' && wc !== '74') continue
        const basePrice = wc === '50' ? base50 : base74

        for (const b of branches) {
          const sc = surcharges[String(b.id)]
          const surcharge = wc === '50' ? Number(sc?.surcharge_50 ?? 0) : Number(sc?.surcharge_74 ?? 0)
          priceRows.push({
            variant_id: v.variant_id,
            branch_id:  b.id,
            unit_price: Math.round((basePrice + surcharge) * 100) / 100,
          })
        }
      }
    }

    // Custom-weight: flat price all branches
    for (const [variantIdStr, priceRaw] of Object.entries(customPrices ?? {})) {
      const price = Number(priceRaw)
      if (!price || price <= 0) continue
      for (const b of branches) {
        priceRows.push({ variant_id: Number(variantIdStr), branch_id: b.id, unit_price: price })
      }
    }

    if (!priceRows.length)
      return { ok: true, totalUpdated: 0, message: 'No prices to apply.' }

    // Batch all writes inside a single transaction
    const affectedVariantIds = [...new Set(priceRows.map(r => r.variant_id))]
    const db   = getDb()
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()

      const placeholders = affectedVariantIds.map(() => '?').join(',')
      await conn.query(
        `UPDATE product_prices SET is_active = 0 WHERE variant_id IN (${placeholders}) AND is_active = 1`,
        affectedVariantIds,
      )

      // 5 values per row: variant_id, branch_id, unit_price, effective_date, is_active
      const values = priceRows.map(r => [r.variant_id, r.branch_id, r.unit_price, effDate, 1])
      await conn.query(
        `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, is_active) VALUES ?`,
        [values],
      )

      await conn.commit()
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }

    return { ok: true, totalUpdated: priceRows.length, message: `Applied — ${priceRows.length} price records updated.` }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})

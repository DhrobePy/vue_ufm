/**
 * GET /api/products/hub
 * Single endpoint that powers the unified Products Hub page.
 * Returns: products+variants+per-branch prices, branches, pricing-engine data.
 */
import { readFileSync } from 'node:fs'
import { resolve }      from 'node:path'
import { query }        from '~/server/utils/db'

const CONFIG_FILE = resolve('server/data/pricing_engine_config.json')
const DEFAULT_CFG = {
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
  branch_surcharges: {} as Record<string, { surcharge_50: number; surcharge_74: number }>,
}

function loadConfig() {
  try {
    const parsed = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
    return { ...DEFAULT_CFG, ...parsed, formula: { ...DEFAULT_CFG.formula, ...(parsed.formula ?? {}) } }
  } catch {
    return { ...DEFAULT_CFG }
  }
}

function mapWeight(wv: string): string {
  const n = parseInt(wv)
  if (n === 50) return '50'
  if (n === 74) return '74'
  return 'custom'
}

export default defineEventHandler(async () => {
  const config = loadConfig()

  const [products, variants, prices, branches, currRows] = await Promise.all([
    // Base products
    query(`
      SELECT id, base_name, category, description, status
      FROM products
      WHERE status != 'deleted'
      ORDER BY category, base_name
    `) as Promise<any[]>,

    // Variants with inventory
    query(`
      SELECT id, product_id, weight_variant, grade, sku,
             weight_kg, unit_of_measure, barcode, status,
             stock_qty, reserved_qty, reorder_level, unit_price AS base_price
      FROM product_variants
      WHERE status = 'active'
      ORDER BY grade, weight_variant
    `) as Promise<any[]>,

    // Active prices per variant × branch
    query(`
      SELECT pp.variant_id, pp.branch_id, pp.id AS price_id,
             pp.unit_price, pp.effective_date
      FROM product_prices pp
      WHERE pp.is_active = 1
    `) as Promise<any[]>,

    // Branches
    query(`SELECT id, name, code FROM branches WHERE status = 'active' ORDER BY id`) as Promise<any[]>,

    // Pricing engine: current prices grouped by grade / branch / weight-class
    query(`
      SELECT pv.grade, pp.branch_id, pv.weight_variant, pv.id AS variant_id,
             MIN(pp.unit_price) AS unit_price
      FROM product_prices pp
      JOIN product_variants pv ON pp.variant_id = pv.id
      WHERE pp.is_active = 1
        AND pv.grade IS NOT NULL AND pv.grade != ''
        AND pv.status = 'active'
      GROUP BY pv.grade, pp.branch_id, pv.weight_variant, pv.id
    `) as Promise<any[]>,
  ])

  // Ensure branch surcharges exist for every branch
  for (const b of branches) {
    if (!config.branch_surcharges[b.id])
      config.branch_surcharges[b.id] = { surcharge_50: 0, surcharge_74: 0 }
  }

  // ── price map: variantId → branchId → { unit_price, effective_date, price_id } ──
  const priceMap = new Map<number, Record<number, any>>()
  for (const p of prices) {
    if (!priceMap.has(p.variant_id)) priceMap.set(p.variant_id, {})
    priceMap.get(p.variant_id)![p.branch_id] = {
      unit_price:     Number(p.unit_price),
      effective_date: p.effective_date,
      price_id:       p.price_id,
    }
  }

  // ── variant map: productId → variant[] ──────────────────────────────────────
  const variantsByProduct = new Map<number, any[]>()
  for (const v of variants) {
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, [])
    variantsByProduct.get(v.product_id)!.push({ ...v, prices: priceMap.get(v.id) ?? {} })
  }

  // ── Pricing engine: gradeData ────────────────────────────────────────────────
  const productNameMap = new Map<number, string>()
  for (const p of products) productNameMap.set(p.id, p.base_name)

  const gradeData: Record<string, Record<string, any[]>> = {}
  const gradedVariants: any[] = []
  for (const v of variants) {
    if (!v.grade) continue
    gradedVariants.push(v)
    const wc = mapWeight(v.weight_variant)
    if (!gradeData[v.grade])      gradeData[v.grade] = {}
    if (!gradeData[v.grade][wc])  gradeData[v.grade][wc] = []
    const vPrices   = priceMap.get(v.id) ?? {}
    const firstBr   = branches[0]
    gradeData[v.grade][wc].push({
      variant_id:     v.id,
      product_name:   productNameMap.get(v.product_id) ?? '',
      weight_variant: v.weight_variant,
      sku:            v.sku,
      uom:            v.unit_of_measure,
      current_price:  firstBr ? (vPrices[firstBr.id]?.unit_price ?? null) : null,
    })
  }

  // current50[grade] = lowest active 50-kg price across branches
  const current50: Record<string, number> = {}
  for (const cr of currRows) {
    const wc = mapWeight(cr.weight_variant)
    if (wc === '50') {
      if (current50[cr.grade] === undefined || Number(cr.unit_price) < current50[cr.grade])
        current50[cr.grade] = Number(cr.unit_price)
    }
  }

  // currentPrices[grade][branchId][wc] & customCurrent[variantId][branchId]
  const currentPrices: Record<string, Record<string, Record<string, number>>> = {}
  const customCurrent: Record<string, Record<string, number>> = {}
  for (const cr of currRows) {
    const g   = cr.grade
    const br  = String(cr.branch_id)
    const wc  = mapWeight(cr.weight_variant)
    const vid = String(cr.variant_id)
    if (wc === '50' || wc === '74') {
      if (!currentPrices[g])       currentPrices[g] = {}
      if (!currentPrices[g][br])   currentPrices[g][br] = {}
      if (currentPrices[g][br][wc] === undefined)
        currentPrices[g][br][wc] = Number(cr.unit_price)
    } else {
      if (!customCurrent[vid])     customCurrent[vid] = {}
      customCurrent[vid][br] = Number(cr.unit_price)
    }
  }

  // customAll: graded variants with non-standard weight
  const customAll = gradedVariants
    .filter(v => mapWeight(v.weight_variant) === 'custom')
    .map(v => ({
      variant_id:     v.id,
      product_name:   productNameMap.get(v.product_id) ?? '',
      weight_variant: v.weight_variant,
      grade:          v.grade,
      uom:            v.unit_of_measure,
      current_price:  branches[0] ? (priceMap.get(v.id) ?? {})[branches[0].id]?.unit_price ?? null : null,
    }))

  const grades = Object.keys(gradeData).sort()

  return {
    products: products.map(p => ({
      ...p,
      variants: variantsByProduct.get(p.id) ?? [],
    })),
    branches,
    engine: { config, grades, gradeData, current50, currentPrices, customCurrent, customAll },
  }
})

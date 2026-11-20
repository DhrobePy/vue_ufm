/** SKU rule from legacy manage_variants.php: BASE-WEIGHT[-G] — the grade part is left out when there is no grade (e.g. USE-1L, not USE-1L-X). */
export function useSkuGenerator() {
  function generateSku(baseSku: string, weight: string, grade: string): string {
    const parts = [baseSku.toUpperCase().trim(), weight.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()]
    const g = (grade ?? '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (g) parts.push(g.slice(0, 1))
    return parts.join('-')
  }
  return { generateSku }
}

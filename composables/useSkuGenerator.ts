export function useSkuGenerator() {
  function generateSku(baseSku: string, weight: string, grade: string): string {
    const prefix = baseSku.toUpperCase().trim()
    const w = weight.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const g = grade.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()[0] ?? 'X'
    return `${prefix}-${w}-${g}`
  }

  return { generateSku }
}

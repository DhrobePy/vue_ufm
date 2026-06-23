export function usePriceFormat() {
  function formatTaka(n: number | string | null | undefined): string {
    if (n == null || n === '') return '—'
    const v = Number(n)
    if (isNaN(v)) return '—'
    return '৳' + Math.round(v).toLocaleString('en-US')
  }

  function formatTakaFull(n: number | string | null | undefined): string {
    if (n == null || n === '') return '—'
    const v = Number(n)
    if (isNaN(v)) return '—'
    return '৳' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return { formatTaka, formatTakaFull }
}

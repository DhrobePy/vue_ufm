export type PrintSize = 'a4' | 'a5' | 'thermal'
export const PRINT_SIZES: { value: PrintSize; label: string }[] = [
  { value: 'a5', label: 'Half page (A5) — saves paper' }, { value: 'a4', label: 'Full page (A4)' }, { value: 'thermal', label: 'Thermal roll (80 mm)' }]
const PAGE_CSS: Record<PrintSize, string> = {
  a4: '@page { size: A4 portrait; margin: 10mm }', a5: '@page { size: A5 landscape; margin: 6mm }', thermal: '@page { size: 80mm auto; margin: 3mm }' }

/** The paper a document prints on, remembered per browser. Default half-page A5 (cuts paper use in half vs A4). Sets the @page rule for the page it is used on. */
export function usePrintSize() {
  const size = useState<PrintSize>('print-size', () => 'a5')
  onMounted(() => { try { const s = localStorage.getItem('erp_print_size') as PrintSize; if (s && PAGE_CSS[s]) size.value = s } catch { /* private mode */ } })
  watch(size, (v) => { try { localStorage.setItem('erp_print_size', v) } catch { /* ignore */ } })
  useHead({ style: [{ key: 'print-page', innerHTML: computed(() => PAGE_CSS[size.value]) }] })
  return { size, sizes: PRINT_SIZES }
}

/** WhatsApp "click to chat" link for a Bangladesh number (01XXXXXXXXX → 8801XXXXXXXXX). Returns null when there is no usable number. */
export function whatsappLink(phone: string | null | undefined, text: string): string | null {
  const d = String(phone ?? '').replace(/\D/g, '')
  const n = d.startsWith('880') ? d : d.startsWith('0') ? '88' + d : d.length === 10 ? '880' + d : ''
  return n.length >= 12 ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null
}

export interface ReportCol { key: string; label: string; align?: 'left' | 'right' | 'center'; fmt?: 'money' | 'qty' | 'text'; sum?: boolean }
export interface ReportSheet { name: string; cols: ReportCol[]; rows: Record<string, any>[]; totals?: boolean }

/** Download helpers for report pages: real .xlsx (numbers stay numbers), Excel-safe CSV (BOM so ৳ and Bangla survive), and print → "Save as PDF". */
export function useReportExport() {
  const save = (blob: Blob, filename: string) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }
  const cell = (c: ReportCol, v: any) => (c.fmt === 'money' || c.fmt === 'qty') ? Number(v ?? 0) : (v ?? '')
  const matrix = (s: ReportSheet) => {
    const body = s.rows.map(r => s.cols.map(c => cell(c, r[c.key])))
    if (s.totals) body.push(s.cols.map((c, i) => i === 0 ? 'TOTAL' : c.sum ? s.rows.reduce((a, r) => a + Number(r[c.key] ?? 0), 0) : ''))
    return [s.cols.map(c => c.label), ...body]
  }
  function csv(filename: string, sheet: ReportSheet) {
    const esc = (v: any) => { const t = String(v ?? ''); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t }
    save(new Blob(['﻿' + matrix(sheet).map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`)
  }
  async function xlsx(filename: string, sheets: ReportSheet[], title?: string) {
    const X = await import('xlsx')
    const wb = X.utils.book_new()
    for (const s of sheets) {
      const aoa = [...(title ? [[title], []] : []), ...matrix(s)]
      const ws = X.utils.aoa_to_sheet(aoa)
      ws['!cols'] = s.cols.map(c => ({ wch: Math.max(c.label.length + 2, c.fmt === 'text' || !c.fmt ? 22 : 14) }))
      X.utils.book_append_sheet(wb, ws, s.name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31))
    }
    X.writeFile(wb, `${filename}.xlsx`)
  }
  const print = () => window.print()
  return { csv, xlsx, print }
}

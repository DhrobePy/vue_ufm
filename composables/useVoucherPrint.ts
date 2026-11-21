/** Printable debit-voucher slip. Kept out of the page SFC so the embedded HTML/script strings cannot confuse the Vue/Nuxt parser. */
export function useVoucherPrint() {
  const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
  function openVoucher(v: any, print: boolean, c: any): boolean {
    const w = window.open('', '_blank', 'width=820,height=720')
    if (!w) return false
    const amount = Number(v.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const row = (k: string, val: unknown) => `<tr><th>${k}</th><td>${esc(val) || '—'}</td></tr>`
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Voucher ${esc(v.voucher_number)}</title><style>
      *{box-sizing:border-box} body{font-family:Inter,Arial,sans-serif;color:#111;padding:28px;font-size:13px}
      .top{display:flex;justify-content:space-between;border-bottom:2px solid #f59e0b;padding-bottom:12px;margin-bottom:18px}
      h1{font-size:18px;margin:0} .muted{color:#666;font-size:11px;margin-top:3px} .no{font-size:16px;font-weight:700;text-align:right}
      table{width:100%;border-collapse:collapse} th{width:34%;text-align:left;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.06em;padding:9px 8px;border-bottom:1px solid #eee} td{padding:9px 8px;border-bottom:1px solid #eee}
      .amt{font-size:20px;font-weight:700;color:#b45309} .sig{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:64px;text-align:center;font-size:11px;color:#666} .sig div{border-top:1px solid #888;padding-top:6px}
      .tag{display:inline-block;padding:2px 10px;border-radius:99px;background:#fef3c7;color:#b45309;font-size:11px;font-weight:600} @media print{body{padding:10mm}}
    </style></head><body>
      <div class="top"><div><h1>${esc(c.name)}</h1><div class="muted">${esc(c.address)}<br>${esc(c.phone)}</div></div><div><div class="no">DEBIT VOUCHER<br>${esc(v.voucher_number)}</div><div class="muted" style="text-align:right">Date: ${esc(String(v.date ?? '').slice(0, 10))}</div></div></div>
      <table>${row('Pay to', v.paid_to)}${row('Purpose', v.purpose)}${row('Expense account', v.expense_account)}${row('Paid from', v.payment_account)}
        <tr><th>Amount</th><td class="amt">৳ ${amount}</td></tr><tr><th>Status</th><td><span class="tag">${esc(v.status)}</span></td></tr>${row('Prepared by', v.created_by)}</table>
      <div class="sig"><div>Prepared by</div><div>Approved by</div><div>Received by</div></div>
      ${print ? '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print()},250)}</scr' + 'ipt>' : '<p style="margin-top:28px"><button onclick="window.print()">Print</button></p>'}
    </body></html>`)
    w.document.close()
    return true
  }
  return { openVoucher }
}

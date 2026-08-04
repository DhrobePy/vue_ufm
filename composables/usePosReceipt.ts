export interface PosReceiptItem { name: string; qty: number; price: number }

export interface PosReceiptData {
  receiptNo: string
  total: number
  subtotal: number
  discount: number
  cashAmount: number
  creditAmount: number
  paymentMethod: string
  customerName: string
  items: PosReceiptItem[]
  verifyUrl?: string
}

/**
 * Shared POS receipt HTML builder — used both right after checkout
 * (components/Pos/SuccessModal.vue) and for reprinting a past sale
 * (pages/pos/today.vue, pages/pos/[id].vue), so a reprint looks identical
 * to the original and always carries the same exit-verification QR.
 */
export function posReceiptHtml(data: PosReceiptData, copyLabel: string): string {
  const rows = data.items.map(i => `
    <tr>
      <td style="padding:2px 0">${i.name}</td>
      <td style="text-align:center;padding:2px 4px">${i.qty}</td>
      <td style="text-align:right;padding:2px 0">৳${(i.price * i.qty).toLocaleString()}</td>
    </tr>`).join('')
  const qrBlock = data.verifyUrl ? `
    <div style="display:flex;justify-content:center;margin-top:8px;"><canvas id="exit-qr" width="90" height="90"></canvas></div>
    <p class="c" style="font-size:9px;color:#666;word-break:break-all;">${data.verifyUrl}</p>
    <script src="https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js"><\/script>
    <script>
      window.addEventListener('load', function() {
        try { new QRious({ element: document.getElementById('exit-qr'), value: ${JSON.stringify(data.verifyUrl)}, size: 90, level: 'M' }); } catch (e) {}
      });
    <\/script>` : ''
  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Receipt ${data.receiptNo}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:monospace;font-size:12px;width:300px;margin:0 auto;padding:10px}
      h2{text-align:center;font-size:15px;margin-bottom:2px}
      .c{text-align:center}
      hr{border:none;border-top:1px dashed #000;margin:6px 0}
      table{width:100%;border-collapse:collapse}
      th{font-size:10px;padding:2px 0;border-bottom:1px solid #000}
      .total{font-weight:bold;font-size:13px}
    </style>
  </head><body>
    <h2>Ujjal Flour Mills</h2>
    <p class="c" style="font-size:10px">${copyLabel}</p>
    <hr/>
    <p class="c">${data.receiptNo}</p>
    <p class="c" style="font-size:10px">${new Date().toLocaleString('en-BD')}</p>
    ${data.customerName ? `<p class="c" style="font-size:11px;margin-top:2px">Customer: ${data.customerName}</p>` : ''}
    <hr/>
    <table>
      <thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">৳${data.subtotal.toLocaleString()}</td></tr>
      ${data.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-৳${data.discount.toLocaleString()}</td></tr>` : ''}
      <tr class="total"><td>TOTAL</td><td style="text-align:right">৳${data.total.toLocaleString()}</td></tr>
      <tr><td style="font-size:10px">Paid now (${data.paymentMethod})</td><td style="text-align:right;font-size:10px">৳${data.cashAmount.toLocaleString()}</td></tr>
      ${data.creditAmount > 0 ? `<tr><td style="font-size:10px">On credit</td><td style="text-align:right;font-size:10px">৳${data.creditAmount.toLocaleString()}</td></tr>` : ''}
    </table>
    ${qrBlock}
    <hr/>
    <p class="c" style="font-size:10px;margin-top:4px">Thank you!</p>
    <script>window.onload=()=>{setTimeout(()=>window.print(),${data.verifyUrl ? 300 : 0})}<\/script>
  </body></html>`
}

/** Open and print all three copies. No setTimeout around window.open() itself
 * — each must run synchronously inside this click handler or the browser's
 * popup blocker silently drops it (only the first, un-deferred one is
 * trusted as a real user gesture). */
export function printPosReceiptCopies(data: PosReceiptData): boolean {
  for (const label of ['Office Copy', 'Customer Copy', 'Delivery Copy']) {
    const win = window.open('', '_blank', 'width=420,height=640')
    if (!win) return false
    win.document.write(posReceiptHtml(data, label))
    win.document.close()
  }
  return true
}

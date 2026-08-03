<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />
        <div class="relative w-full max-w-sm glass-card p-7 text-center space-y-4 animate-slide-up">
          <div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 class="font-display font-bold text-xl text-white">Sale Complete!</h3>
          <div class="text-sm text-gray-400 space-y-0.5">
            <p>Receipt <span class="font-mono text-gold-400">{{ receiptNo }}</span></p>
            <p v-if="customerName">Customer: <span class="text-gray-300">{{ customerName }}</span></p>
            <p>Paid now: <span class="text-gray-300">৳{{ cashAmount.toLocaleString() }} ({{ paymentMethod }})</span></p>
            <p v-if="creditAmount > 0">On credit: <span class="text-orange-400">৳{{ creditAmount.toLocaleString() }}</span></p>
            <p v-if="discount > 0">Discount: <span class="text-orange-400">-৳{{ discount.toLocaleString() }}</span></p>
            <p class="text-base font-bold pt-1">Total: <strong class="text-gold-400">৳{{ total.toLocaleString() }}</strong></p>
            <p v-if="exitStatus === 'pending_approval'" class="text-red-400 text-xs pt-1">⏳ Exit release needs approval before goods can leave — see Pending Approvals.</p>
          </div>
          <div class="flex gap-3">
            <button @click="printAllCopies" class="btn-ghost flex-1 justify-center text-sm">🖨️ Print All (3)</button>
            <button @click="$emit('update:modelValue', false)" class="btn-gold flex-1 justify-center text-sm">New Sale</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  receiptNo: string
  total: number
  subtotal: number
  discount: number
  cashAmount: number
  creditAmount: number
  paymentMethod: string
  customerName: string
  exitStatus: string
  items: Array<{ name: string; qty: number; price: number }>
  verifyUrl?: string
}>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function receiptHtml(copyLabel: string) {
  const rows = props.items.map(i => `
    <tr>
      <td style="padding:2px 0">${i.name}</td>
      <td style="text-align:center;padding:2px 4px">${i.qty}</td>
      <td style="text-align:right;padding:2px 0">৳${(i.price * i.qty).toLocaleString()}</td>
    </tr>`).join('')
  const qrBlock = props.verifyUrl ? `
    <div style="display:flex;justify-content:center;margin-top:8px;"><canvas id="exit-qr" width="90" height="90"></canvas></div>
    <p class="c" style="font-size:9px;color:#666;word-break:break-all;">${props.verifyUrl}</p>
    <script src="https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js"><\/script>
    <script>
      window.addEventListener('load', function() {
        try { new QRious({ element: document.getElementById('exit-qr'), value: ${JSON.stringify(props.verifyUrl)}, size: 90, level: 'M' }); } catch (e) {}
      });
    <\/script>` : ''
  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Receipt ${props.receiptNo}</title>
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
    <p class="c">${props.receiptNo}</p>
    <p class="c" style="font-size:10px">${new Date().toLocaleString('en-BD')}</p>
    ${props.customerName ? `<p class="c" style="font-size:11px;margin-top:2px">Customer: ${props.customerName}</p>` : ''}
    <hr/>
    <table>
      <thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">৳${props.subtotal.toLocaleString()}</td></tr>
      ${props.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-৳${props.discount.toLocaleString()}</td></tr>` : ''}
      <tr class="total"><td>TOTAL</td><td style="text-align:right">৳${props.total.toLocaleString()}</td></tr>
      <tr><td style="font-size:10px">Paid now (${props.paymentMethod})</td><td style="text-align:right;font-size:10px">৳${props.cashAmount.toLocaleString()}</td></tr>
      ${props.creditAmount > 0 ? `<tr><td style="font-size:10px">On credit</td><td style="text-align:right;font-size:10px">৳${props.creditAmount.toLocaleString()}</td></tr>` : ''}
    </table>
    ${qrBlock}
    <hr/>
    <p class="c" style="font-size:10px;margin-top:4px">Thank you!</p>
    <script>window.onload=()=>{setTimeout(()=>window.print(),${props.verifyUrl ? 300 : 0})}<\/script>
  </body></html>`
}

/** Open and print all three copies. No setTimeout around window.open() itself
 * — each must run synchronously inside this click handler or the browser's
 * popup blocker silently drops it (only the first, un-deferred one is
 * trusted as a real user gesture). Same fix the legacy app made after
 * "Print All Copies" was found to only ever print one of three receipts. */
function printAllCopies() {
  for (const label of ['Office Copy', 'Customer Copy', 'Delivery Copy']) {
    const win = window.open('', '_blank', 'width=420,height=640')
    if (!win) { alert('Allow popups to print all copies.'); return }
    win.document.write(receiptHtml(label))
    win.document.close()
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

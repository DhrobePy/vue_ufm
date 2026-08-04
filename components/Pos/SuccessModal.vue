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

/** Open and print all three copies. No setTimeout around window.open() itself
 * — each must run synchronously inside this click handler or the browser's
 * popup blocker silently drops it (only the first, un-deferred one is
 * trusted as a real user gesture). Same fix the legacy app made after
 * "Print All Copies" was found to only ever print one of three receipts. */
function printAllCopies() {
  const ok = printPosReceiptCopies({
    receiptNo: props.receiptNo, total: props.total, subtotal: props.subtotal,
    discount: props.discount, cashAmount: props.cashAmount, creditAmount: props.creditAmount,
    paymentMethod: props.paymentMethod, customerName: props.customerName,
    items: props.items, verifyUrl: props.verifyUrl,
  })
  if (!ok) alert('Allow popups to print all copies.')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />
        <div class="relative w-full sm:max-w-md max-h-[92vh] flex flex-col glass-card rounded-b-none sm:rounded-b-2xl !bg-[#14110d]">
          <div class="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06]">
            <h3 class="section-title">↩️ Refund customer</h3>
            <button class="text-gray-500 hover:text-gray-200 text-lg leading-none" @click="$emit('close')">✕</button>
          </div>
          <div class="overflow-y-auto p-4 sm:p-5 space-y-3 text-xs">
            <p v-if="!info" class="text-center text-gray-500 py-4">Loading…</p>
            <template v-else>
              <p v-if="!info.credit" class="text-gray-500 italic text-center py-4">{{ info.name }} holds no credit — there is nothing to refund. A return only reduces what they owe; money goes back only when they have paid more than they owe.</p>
              <template v-else>
                <p class="text-gray-400 leading-relaxed"><b>{{ info.name }}</b> holds <b class="text-emerald-400">৳{{ money(info.credit) }}</b> in credit (paid more than owed). You may pay back up to that — the ledger and accounts are updated automatically.</p>
                <label class="block space-y-1"><span class="text-gray-500">Amount (৳)</span>
                  <input v-model.number="f.amount" type="number" min="1" :max="info.credit" class="input-glass w-full font-mono" /></label>
                <div class="flex flex-wrap gap-1.5">
                  <button v-for="m in ['Cash','Bank Transfer','Cheque','Mobile Banking']" :key="m" class="px-2.5 py-1 rounded-lg border text-[11px]"
                          :class="f.method === m ? 'bg-gold-500/15 border-gold-500/40 text-gold-300 font-semibold' : 'border-white/[0.08] text-gray-500'" @click="f.method = m">{{ m }}</button>
                </div>
                <label v-if="f.method === 'Cash'" class="block space-y-1"><span class="text-gray-500">Paid from cash account *</span>
                  <select v-model="f.cash" class="input-glass w-full"><option value="">Select…</option><option v-for="a in cash" :key="a.id" :value="a.id">{{ a.account_name }}{{ a.branch_name ? ` — ${a.branch_name}` : '' }}</option></select></label>
                <label v-else class="block space-y-1"><span class="text-gray-500">Paid from bank account *</span>
                  <select v-model="f.bank" class="input-glass w-full"><option value="">Select…</option><option v-for="a in banks" :key="a.id" :value="a.id">{{ a.bank_name }} — {{ a.account_number }}</option></select></label>
                <label class="block space-y-1"><span class="text-gray-500">Reference / note</span>
                  <input v-model="f.notes" maxlength="200" class="input-glass w-full" placeholder="e.g. return RET-… refunded by cash" /></label>
              </template>
              <ul v-if="info.refunds?.length" class="text-[11px] text-gray-500 space-y-0.5 pt-1 border-t border-white/[0.06]">
                <li v-for="r in info.refunds" :key="r.refund_number">{{ r.refund_number }} · {{ String(r.refund_date).slice(0, 10) }} · ৳{{ money(r.amount) }} · {{ r.payment_method }}</li>
              </ul>
            </template>
          </div>
          <div class="flex gap-2 justify-end px-4 sm:px-5 py-3 border-t border-white/[0.06]">
            <button class="btn-ghost text-xs" @click="$emit('close')">Close</button>
            <button v-if="info?.credit" class="btn-gold text-xs" :disabled="saving || !f.amount || f.amount > info.credit || (f.method === 'Cash' ? !f.cash : !f.bank)" @click="submit">{{ saving ? 'Refunding…' : 'Pay refund' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; customerId: number | string; returnId?: number; orderId?: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'done'): void }>()
const { success, error: toastError } = useToast()
const money = (v: any) => Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
const info = ref<any>(null), cash = ref<any[]>([]), banks = ref<any[]>([]), saving = ref(false)
const f = reactive({ amount: 0, method: 'Cash', cash: '' as any, bank: '' as any, notes: '' })

watch(() => props.open, async (o) => {
  if (!o) return
  info.value = null
  try {
    const [i, c, b]: any[] = await Promise.all([
      $fetch(`/api/customers/${props.customerId}/refund-info`), $fetch('/api/lookup/cash-accounts'), $fetch('/api/bank-accounts')])
    info.value = i; cash.value = c.accounts ?? []; banks.value = b.accounts ?? []
    f.amount = i.credit
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not load'); emit('close') }
})

async function submit() {
  saving.value = true
  try {
    await $fetch(`/api/customers/${props.customerId}/refund`, { method: 'POST', body: {
      amount: f.amount, payment_method: f.method, cash_account_id: f.method === 'Cash' ? f.cash : undefined,
      bank_account_id: f.method !== 'Cash' ? f.bank : undefined, notes: f.notes || undefined, return_id: props.returnId, order_id: props.orderId } })
    success(`৳${money(f.amount)} refunded ✓`); emit('done'); emit('close')
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Refund failed') }
  finally { saving.value = false }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

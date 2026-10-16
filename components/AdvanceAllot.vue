<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />
        <div class="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col glass-card rounded-b-none sm:rounded-b-2xl !bg-[#14110d]">
          <div class="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06]">
            <h3 class="section-title">💰 Allot advance credit</h3>
            <button class="text-gray-500 hover:text-gray-200 text-lg leading-none" @click="$emit('close')">✕</button>
          </div>
          <div class="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            <p v-if="loading" class="text-center text-gray-500 py-6">Loading…</p>
            <template v-else-if="data">
              <p v-if="!data.payments.length" class="text-center text-gray-500 italic py-6">This customer has no unallotted advance money.</p>
              <template v-else>
                <p class="text-gray-400 leading-relaxed">
                  <b class="text-emerald-400">৳{{ money(data.total) }}</b> paid earlier is not counted against any order yet. The customer's ledger already has it as a credit —
                  allotting only decides <i>what it pays off</i>: the oldest open orders first (nearest placed), then the opening due.
                </p>

                <div class="space-y-1">
                  <p class="text-[10px] uppercase text-gray-600 font-semibold">Advance on account</p>
                  <div v-for="p in data.payments" :key="p.id" class="flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] px-3 py-2">
                    <span class="font-mono text-gray-300">{{ p.payment_number }}
                      <span v-if="p.legacy" class="ml-1 text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400">OLD APP</span></span>
                    <span class="text-gray-500">{{ p.payment_date }} · {{ p.method }}</span>
                    <span class="font-mono font-semibold text-emerald-400">৳{{ money(p.remaining) }}</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button v-for="s in [['orders_first','Orders first'],['opening_first','Opening due first']]" :key="s[0]"
                          class="px-3 py-1.5 rounded-lg border text-[11px] transition-colors"
                          :class="strategy === s[0] ? 'bg-gold-500/15 border-gold-500/40 text-gold-300 font-semibold' : 'border-white/[0.08] text-gray-500'"
                          @click="strategy = s[0]; load()">{{ s[1] }}</button>
                </div>

                <div class="space-y-1">
                  <p class="text-[10px] uppercase text-gray-600 font-semibold">Plan — untick a line to skip it</p>
                  <p v-if="!rows.length" class="text-gray-500 italic">No open order or opening due to apply it to.</p>
                  <label v-for="(r, i) in rows" :key="i" class="flex items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 cursor-pointer">
                    <input v-model="r.on" type="checkbox" class="accent-emerald-500" />
                    <span class="flex-1 min-w-0 text-gray-300 truncate">
                      <template v-if="r.target === 'opening'">Opening due <span class="text-gray-600">(৳{{ money(data.openingDue) }} unsettled)</span></template>
                      <template v-else><span class="font-mono">{{ r.order_number }}</span> <span class="text-gray-600">{{ r.order_date }} · {{ r.status.replace(/_/g, ' ') }} · owes ৳{{ money(r.owes) }}</span></template>
                    </span>
                    <span class="text-gray-600 hidden sm:inline">← {{ r.payment_number }}</span>
                    <span class="font-mono font-semibold text-gold-400">৳{{ money(r.amount) }}</span>
                  </label>
                  <div v-if="rows.length" class="flex justify-between pt-1 font-semibold">
                    <span class="text-gray-400">To allot now</span><span class="text-emerald-400 font-mono">৳{{ money(chosenTotal) }}</span>
                  </div>
                </div>
              </template>
            </template>
          </div>
          <div class="flex gap-2 justify-end px-4 sm:px-5 py-3 border-t border-white/[0.06]">
            <button class="btn-ghost text-xs" @click="$emit('close')">Close</button>
            <button class="btn-gold text-xs" :disabled="!chosenTotal || saving" @click="apply">{{ saving ? 'Applying…' : 'Apply allotment' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; customerId: number | string; orderId?: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'done'): void }>()
const { success, error: toastError } = useToast()

const money = (v: any) => Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
const loading = ref(false), saving = ref(false)
const strategy = ref('orders_first')
const data = ref<any>(null)
const rows = ref<any[]>([])

async function load() {
  if (!props.customerId) return
  loading.value = true
  try {
    const d: any = await $fetch(`/api/customers/${props.customerId}/advance-credit`, { query: { strategy: strategy.value, order_id: props.orderId || undefined } })
    data.value = d
    const pays = new Map<number, any>(d.payments.map((p: any) => [p.id, p]))
    const ords = new Map<number, any>(d.openOrders.map((o: any) => [o.id, o]))
    rows.value = d.suggestion.map((a: any) => ({
      ...a, on: true, payment_number: pays.get(a.payment_id)?.payment_number,
      order_number: ords.get(a.order_id)?.order_number, order_date: ords.get(a.order_id)?.order_date,
      status: ords.get(a.order_id)?.status ?? '', owes: ords.get(a.order_id)?.balance_due,
    }))
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not load advance credit') }
  finally { loading.value = false }
}
watch(() => props.open, (o) => { if (o) load() })

const chosenTotal = computed(() => rows.value.filter(r => r.on).reduce((s, r) => s + Number(r.amount), 0))

async function apply() {
  saving.value = true
  try {
    await $fetch(`/api/customers/${props.customerId}/allot-advance`, {
      method: 'POST',
      body: { allocations: rows.value.filter(r => r.on).map(r => ({ payment_id: r.payment_id, target: r.target, order_id: r.order_id, amount: r.amount })) },
    })
    success(`৳${money(chosenTotal.value)} of advance allotted ✓`)
    emit('done'); emit('close')
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Allotment failed') }
  finally { saving.value = false }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Business Partners" subtitle="Link a customer + supplier as one party — see both balances, settle AR against AP"
                  :breadcrumb="['Trading', 'Partners']" />

    <!-- Link form -->
    <div class="glass-card p-5 space-y-3 max-w-3xl">
      <h3 class="section-title">Link a Partner</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase font-semibold">Customer *</label>
          <UiSearchSelect v-model="link.customerId" :options="customerOptions" placeholder="Search customer…" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase font-semibold">Supplier *</label>
          <UiSearchSelect v-model="link.supplierId" :options="supplierOptions" placeholder="Search supplier…" /></div>
        <button @click="linkPartner" :disabled="!link.customerId || !link.supplierId || linking" class="btn-gold text-xs py-2.5 disabled:opacity-50">
          {{ linking ? 'Linking…' : 'Link as One Partner' }}
        </button>
      </div>
    </div>

    <!-- Partner list -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Linked Partners</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Partner</th><th class="text-left pr-3">Customer Side</th>
            <th class="text-left pr-3">Supplier Side</th>
            <th class="text-right pr-3">They Owe Us (AR)</th><th class="text-right pr-3">We Owe Them (AP)</th>
            <th class="text-right pr-3">Net</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-for="p in partners" :key="p.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3 text-gray-200 font-medium">{{ p.name }}</td>
              <td class="pr-3 text-gray-400">{{ p.customer_name ?? '—' }}</td>
              <td class="pr-3 text-gray-400">{{ p.supplier_name ?? '—' }}</td>
              <td class="pr-3 text-right font-mono text-orange-400">৳{{ Number(p.receivable).toLocaleString() }}</td>
              <td class="pr-3 text-right font-mono text-blue-300">৳{{ Number(p.payable).toLocaleString() }}</td>
              <td :class="['pr-3 text-right font-mono font-bold', Number(p.receivable) - Number(p.payable) >= 0 ? 'text-emerald-400' : 'text-red-400']">
                ৳{{ (Number(p.receivable) - Number(p.payable)).toLocaleString() }}
              </td>
              <td class="text-right whitespace-nowrap">
                <button v-if="Math.min(Number(p.receivable), Number(p.payable)) > 0" @click="openSettle(p)" class="btn-ghost text-[10px] py-1">🔀 Settle</button>
                <button @click="unlink(p)" class="btn-ghost text-[10px] py-1 text-red-400 ml-1">Unlink</button>
              </td>
            </tr>
            <tr v-if="!partners.length"><td colspan="7" class="py-6 text-center text-gray-600">No linked partners yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Settle panel -->
    <div v-if="settleTarget" class="glass-card p-5 space-y-3 max-w-2xl border border-gold-500/20">
      <h3 class="section-title">Settle — {{ settleTarget.name }}</h3>
      <p class="text-xs text-gray-500">
        Nets what they owe us (AR ৳{{ Number(settleTarget.receivable).toLocaleString() }}) against what we owe them
        (AP ৳{{ Number(settleTarget.payable).toLocaleString() }}). Max settleable: ৳{{ maxSettle.toLocaleString() }}. No cash moves —
        one journal entry (Dr Accounts Payable / Cr Accounts Receivable) plus matching ledger entries on both sides.
      </p>
      <div class="flex items-end gap-3">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount (৳)</label>
          <input v-model.number="settleAmount" type="number" :max="maxSettle" min="0" step="any" class="input-glass text-xs font-mono w-40" /></div>
        <button @click="settleAmount = maxSettle" class="btn-ghost text-[10px] py-2">Max</button>
        <button @click="settle" :disabled="!(settleAmount > 0 && settleAmount <= maxSettle) || settling" class="btn-gold text-xs py-2 disabled:opacity-50">
          {{ settling ? 'Posting…' : 'Post Settlement' }}
        </button>
        <button @click="settleTarget = null" class="btn-ghost text-xs py-2">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, refresh } = await useFetch('/api/trading/partners')
const partners  = computed<any[]>(() => (data.value as any)?.partners ?? [])
const customerOptions = computed(() => ((data.value as any)?.customers ?? []).map((c: any) => ({
  value: c.id, label: c.name, sub: c.phone_number || '' })))
const supplierOptions = computed(() => ((data.value as any)?.suppliers ?? []).map((s: any) => ({
  value: s.id, label: s.name, sub: s.phone || '' })))

const link = reactive({ customerId: '' as any, supplierId: '' as any })
const linking = ref(false)
async function linkPartner() {
  linking.value = true
  try {
    await $fetch('/api/trading/partners', {
      method: 'POST',
      body: { action: 'link', customer_id: Number(link.customerId), supplier_id: Number(link.supplierId) },
    })
    success('Partner linked ✓')
    link.customerId = ''; link.supplierId = ''
    await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Link failed') }
  finally { linking.value = false }
}

async function unlink(p: any) {
  if (!confirm(`Unlink "${p.name}"? Balances are untouched — this only removes the pairing.`)) return
  try {
    await $fetch('/api/trading/partners', { method: 'POST', body: { action: 'unlink', partner_id: p.id } })
    success('Unlinked ✓'); await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Unlink failed') }
}

const settleTarget = ref<any>(null)
const settleAmount = ref(0)
const settling = ref(false)
const maxSettle = computed(() => settleTarget.value
  ? Math.min(Number(settleTarget.value.receivable), Number(settleTarget.value.payable)) : 0)
function openSettle(p: any) { settleTarget.value = p; settleAmount.value = 0 }
async function settle() {
  settling.value = true
  try {
    const res: any = await $fetch('/api/trading/settlement', {
      method: 'POST', body: { partner_id: settleTarget.value.id, amount: settleAmount.value },
    })
    success(`${res.settlement_number} posted — ৳${settleAmount.value.toLocaleString()} netted ✓`)
    settleTarget.value = null
    await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Settlement failed') }
  finally { settling.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Collections" subtitle="Field payment collection · reconciliation · daily summary" :breadcrumb="['Collector']">
      <template #actions>
        <button class="btn-gold text-xs">+ Record Collection</button>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Today's Collections" :value="fmtBDT(stats?.today_total ?? 0)"  trend="Collected today"    trend-up  icon="money"  color="gold" />
      <KpiCard label="Pending Accounts"    :value="String(schedule.length)"           trend="With balance due"  :trend-up="false" icon="users" color="orange" />
      <KpiCard label="Month Total"         :value="fmtBDT(stats?.month_total ?? 0)"  trend="This month"         trend-up  icon="chart"  color="teal" />
      <KpiCard label="Overdue Accounts"    :value="String(schedule.filter(v=>Number(v.outstanding)>100000).length)" trend="High balance"  :trend-up="false" icon="list"  color="red" />
    </div>

    <!-- Today's schedule -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Today's Collection Schedule</h2>
      <div class="space-y-2">
        <div v-if="!schedule.length" class="py-8 text-center text-xs text-gray-600">No outstanding accounts today</div>
        <div v-for="visit in schedule" :key="visit.id"
             class="flex items-center gap-4 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
          <!-- Status dot -->
          <div :class="['w-2 h-2 rounded-full shrink-0',
            visit.status === 'collected' ? 'bg-emerald-400' :
            visit.status === 'partial'   ? 'bg-yellow-400' :
            visit.status === 'skipped'   ? 'bg-red-400' : 'bg-gray-600']" />
          <div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p class="text-xs font-medium text-gray-200 truncate">{{ visit.customer }}</p>
              <p class="text-[11px] text-gray-600">{{ visit.area }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Outstanding</p>
              <p class="text-sm font-bold text-red-400">৳{{ visit.outstanding.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Collected</p>
              <p class="text-sm font-semibold" :class="visit.collected > 0 ? 'text-emerald-400' : 'text-gray-600'">
                {{ visit.collected > 0 ? `৳${visit.collected.toLocaleString()}` : '—' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Method</p>
              <p class="text-xs text-gray-400">{{ visit.method || '—' }}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button v-if="visit.status === 'pending'" class="btn-gold text-xs py-1.5 px-3"
              @click="openCollection(visit)">
              Collect
            </button>
            <span v-else-if="visit.status === 'collected'"
              class="text-xs text-emerald-400 font-medium px-2">✓ Done</span>
            <span v-else-if="visit.status === 'partial'"
              class="text-xs text-yellow-400 font-medium px-2">Partial</span>
            <span v-else class="text-xs text-red-400 font-medium px-2">Skipped</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent collections table -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Recent Collections</h2>
      <UiDataTable :columns="cols" :rows="recentCollections" :per-page="10" exportable search-placeholder="Search…">
        <template #cell-amount="{ value }">
          <span class="font-mono text-xs font-bold text-emerald-400">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-paymentMode="{ value }">
          <span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">{{ value }}</span>
        </template>
      </UiDataTable>
    </div>

    <!-- Collection modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="collectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="collectModal = false" />
          <div class="relative w-full max-w-md glass-card p-6 space-y-5 animate-slide-up">
            <h3 class="font-display font-bold text-lg text-white">Record Collection</h3>
            <div v-if="currentVisit">
              <p class="text-sm text-gray-300 font-medium">{{ currentVisit.customer }}</p>
              <p class="text-xs text-gray-600 mt-0.5">Outstanding: <span class="text-red-400 font-bold">৳{{ currentVisit.outstanding.toLocaleString() }}</span></p>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Amount Collected (৳)</label>
                <input v-model.number="collectForm.amount" type="number" min="0" class="input-glass" placeholder="0" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Payment Method</label>
                <select v-model="collectForm.method" class="input-glass">
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Banking">Mobile Banking (bKash/Nagad)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Notes</label>
                <input v-model="collectForm.notes" class="input-glass" placeholder="Reference / cheque number…" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="collectModal = false" class="btn-ghost flex-1 justify-center">Cancel</button>
              <button @click="saveCollection" class="btn-gold flex-1 justify-center">Save Collection</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, refresh } = await useFetch('/api/collector/schedule')

const stats             = computed(() => (data.value?.stats ?? {}) as any)
const schedule          = computed(() => (data.value?.schedule ?? []) as any[])
const recentCollections = computed(() => (data.value?.recentCollections ?? []) as any[])

// Per-row collected tracking (client-side, reset on refresh)
const collected = ref<Record<number, { amount: number; method: string; status: string }>>({})

const collectModal  = ref(false)
const currentVisit  = ref<any>(null)
const saving        = ref(false)
const collectForm   = reactive({ amount: 0, method: 'Cash', notes: '' })

function visitStatus(visit: any) {
  return collected.value[visit.id]?.status ?? 'pending'
}
function visitCollected(visit: any) {
  return collected.value[visit.id]?.amount ?? 0
}
function visitMethod(visit: any) {
  return collected.value[visit.id]?.method ?? ''
}

function openCollection(visit: any) {
  currentVisit.value = visit
  collectForm.amount = Number(visit.outstanding ?? 0)
  collectForm.method = 'Cash'
  collectForm.notes  = ''
  collectModal.value = true
}

async function saveCollection() {
  if (!currentVisit.value) return
  saving.value = true
  try {
    await $fetch('/api/collector/collect', {
      method: 'POST',
      body: {
        customer_id: currentVisit.value.id,
        amount:      collectForm.amount,
        method:      collectForm.method,
        notes:       collectForm.notes,
      },
    })
    const amt = collectForm.amount
    const out = Number(currentVisit.value.outstanding ?? 0)
    collected.value[currentVisit.value.id] = {
      amount: amt,
      method: collectForm.method,
      status: amt >= out ? 'collected' : 'partial',
    }
    success(`Collection of ৳${amt.toLocaleString()} recorded`)
    collectModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record collection')
  } finally {
    saving.value = false
  }
}

function fmtBDT(n: number) {
  const v = Number(n)
  if (v >= 100000) return `৳${(v / 100000).toFixed(1)}L`
  if (v >= 1000)   return `৳${(v / 1000).toFixed(0)}K`
  return `৳${v.toLocaleString()}`
}

const cols = [
  { key: 'date',        label: 'Date',      sortable: true },
  { key: 'customer',    label: 'Customer',  sortable: true },
  { key: 'amount',      label: 'Amount',    sortable: true },
  { key: 'paymentMode', label: 'Method' },
  { key: 'reference',   label: 'Reference' },
  { key: 'collector',   label: 'Collector' },
]
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

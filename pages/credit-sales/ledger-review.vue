<template>
  <div class="space-y-4 pb-24">
    <UiPageHeader title="Ledger Review" subtitle="Every flagged ledger line — keep it, or delete it (restorable from the Recycle Bin)"
                  :breadcrumb="['Credit Sales', 'Ledger Review']">
      <template #actions><button class="btn-ghost text-xs" @click="refresh()">↻ Refresh</button></template>
    </UiPageHeader>

    <div class="flex gap-1.5 p-1 rounded-xl w-fit" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)">
      <button v-for="v in [['lines', 'Lines to decide'], ['checks', 'Other cross-checks']]" :key="v[0]" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold"
              :class="view === v[0] ? 'btn-gold' : 'text-gray-400 hover:text-gray-100'" @click="view = v[0]">{{ v[1] }}</button>
    </div>

    <!-- ═════ other cross-checks (read-only, need a human explanation or a missing record) ═════ -->
    <div v-if="view === 'checks'" class="space-y-3">
      <div v-if="auditPending" class="glass-card p-8 text-center text-xs text-gray-500">Running the checks…</div>
      <template v-else-if="audit">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-xs text-gray-500">{{ audit.exceptions.length }} item(s) in {{ audit.groups.length }} group(s). These are not lines to delete — each needs an explanation or a missing record.</p>
          <span class="flex-1" /><button class="btn-ghost text-xs" @click="downloadAudit">⬇️ CSV</button>
        </div>
        <div v-for="g in audit.groups" :key="g.code" class="glass-card p-0 overflow-hidden">
          <button class="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left" @click="open = open === g.code ? '' : g.code">
            <span class="sev" :class="'sev-' + g.severity">{{ g.severity }}</span>
            <span class="text-sm font-semibold text-gray-200 flex-1 min-w-[200px]">{{ g.title }}</span>
            <span class="text-xs text-gray-500">{{ g.n }} item(s) · {{ g.customers }} customer(s) · ৳{{ money(g.amount) }}</span>
            <span class="text-gray-600">{{ open === g.code ? '▾' : '▸' }}</span>
          </button>
          <div v-if="open === g.code" class="border-t border-white/[0.06] overflow-x-auto">
            <table class="w-full text-xs min-w-[640px]">
              <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="(e, i) in audit.exceptions.filter((x: any) => x.code === g.code).slice(0, 200)" :key="i" class="hover:bg-white/[0.02]">
                  <td class="p-2.5"><NuxtLink v-if="e.customer_id" :to="`/customers/${e.customer_id}?tab=ledger`" class="text-gray-200 hover:underline">{{ e.customer }}</NuxtLink><span v-else class="text-gray-500">{{ e.customer }}</span></td>
                  <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">{{ e.ref }}</td>
                  <td class="p-2.5 font-mono text-gray-500 whitespace-nowrap">{{ e.date }}</td>
                  <td class="p-2.5 text-right font-mono whitespace-nowrap">৳{{ money(e.amount) }}</td>
                  <td class="p-2.5 text-gray-500">{{ e.detail }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="audit.exceptions.filter((x: any) => x.code === g.code).length > 200" class="p-2.5 text-[11px] text-gray-600">Showing the first 200 — download the CSV for all.</p>
          </div>
        </div>
      </template>
    </div>

    <!-- summary + reason chips -->
    <div v-if="view === 'lines'" class="glass-card p-4 space-y-3">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-400">
        <span><strong class="text-lg font-mono text-amber-400">{{ data?.pending ?? 0 }}</strong> line(s) waiting for a decision</span>
        <span v-if="data">showing <strong class="font-mono text-gray-200">{{ data.total }}</strong> · net <strong class="font-mono" :class="data.net > 0 ? 'text-red-400' : 'text-emerald-400'">৳{{ money(data.net) }}</strong></span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" class="chip" :class="!f.reason ? 'chip-on' : ''" @click="f.reason = ''">All reasons</button>
        <button v-for="r in data?.byReason ?? []" :key="r.reason" type="button" class="chip" :class="f.reason === r.reason ? 'chip-on' : ''" :title="hint(r.reason)" @click="f.reason = r.reason">
          {{ reasonLabel(r.reason) }} <span class="opacity-60">{{ r.n }}</span>
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="f.status" class="input-glass text-xs"><option value="review">To review</option><option value="kept">Kept</option><option value="all">All reviewed &amp; pending</option></select>
        <input v-model.lazy="f.q" class="input-glass text-xs w-full sm:w-64" placeholder="Search customer / reference / description" />
        <button v-if="f.customer_id !== ''" class="chip chip-on" @click="f.customer_id = ''">✕ {{ customerName }}</button>
      </div>
    </div>

    <div v-if="view === 'lines'" class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">
      <!-- customers with flagged lines -->
      <div class="glass-card p-0 overflow-hidden">
        <button class="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-300 xl:cursor-default" @click="showCustomers = !showCustomers">
          <span>Customers with flagged lines ({{ data?.customers?.length ?? 0 }})</span><span class="xl:hidden">{{ showCustomers ? '▾' : '▸' }}</span>
        </button>
        <div :class="showCustomers ? 'block' : 'hidden xl:block'" class="max-h-[60vh] overflow-y-auto divide-y divide-white/[0.05]">
          <button v-for="c in data?.customers ?? []" :key="c.id" type="button" class="w-full text-left px-4 py-2.5 hover:bg-white/[0.04]"
                  :class="String(f.customer_id) === String(c.id) ? 'bg-white/[0.06]' : ''" @click="f.customer_id = c.id; showCustomers = false">
            <div class="flex items-center justify-between gap-2"><span class="text-xs font-semibold text-gray-200 truncate">{{ c.name }}</span><span class="text-[10px] text-amber-400 shrink-0">{{ c.flagged }} flagged</span></div>
            <div class="flex justify-between text-[11px] text-gray-500 mt-0.5">
              <span>now <b class="font-mono text-gray-300">৳{{ money(c.balance_now) }}</b></span>
              <span title="Balance if every flagged line were deleted. For Pilot-period / Not-in-legacy lines this equals what the legacy app shows.">if cleared <b class="font-mono text-emerald-400">৳{{ money(c.balance_without_flagged) }}</b></span>
            </div>
          </button>
          <p v-if="!(data?.customers?.length)" class="p-4 text-xs text-gray-600 text-center">Nothing waiting 🎉</p>
        </div>
      </div>

      <!-- lines -->
      <div class="space-y-3 min-w-0">
        <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
        <div v-else-if="!rows.length" class="glass-card p-8 text-center text-xs text-gray-500">No lines match.</div>

        <!-- table (≥ md) -->
        <div v-else class="hidden md:block glass-card p-0 overflow-x-auto">
          <table class="w-full text-xs min-w-[760px]">
            <thead><tr class="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-gray-600">
              <th class="p-3 w-8"><input type="checkbox" :checked="allSelected" :disabled="f.status === 'kept'" @change="toggleAll" /></th>
              <th class="p-3 text-left">Date</th><th class="p-3 text-left">Customer</th><th class="p-3 text-left">Line</th>
              <th class="p-3 text-right">Debit</th><th class="p-3 text-right">Credit</th><th class="p-3 text-left">Why flagged</th><th class="p-3 w-28"></th></tr></thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="r in rows" :key="r.id" class="hover:bg-white/[0.02] align-top">
                <td class="p-3"><input v-if="r.review_status === 'review'" v-model="sel" type="checkbox" :value="r.id" /></td>
                <td class="p-3 whitespace-nowrap text-gray-500 font-mono">{{ r.date }}</td>
                <td class="p-3"><NuxtLink v-if="r.customer_id" :to="`/customers/${r.customer_id}?tab=ledger`" class="text-gray-200 hover:underline">{{ r.customer }}</NuxtLink><span v-else class="text-gray-500">{{ r.customer }}</span></td>
                <td class="p-3 max-w-[320px]">
                  <div class="text-gray-300"><NuxtLink v-if="r.linked_order_id" :to="`/credit-sales/${r.linked_order_id}`" class="font-mono text-gold-400/90 hover:underline">{{ r.ref }}</NuxtLink><span v-else class="font-mono">{{ r.ref || r.type }}</span> <span class="text-gray-600">· {{ String(r.type).replace(/_/g, ' ') }}</span></div>
                  <div class="text-gray-600 truncate" :title="r.description">{{ r.description }}</div>
                </td>
                <td class="p-3 text-right font-mono">{{ Number(r.debit) ? money(r.debit) : '' }}</td>
                <td class="p-3 text-right font-mono text-emerald-400">{{ Number(r.credit) ? money(r.credit) : '' }}</td>
                <td class="p-3"><span class="badge" :title="hint(r.review_reason)">{{ reasonLabel(r.review_reason) }}</span>
                  <p v-if="r.review_status === 'kept'" class="text-[10px] text-emerald-500 mt-1">✓ kept{{ r.reviewed_by ? ' by ' + r.reviewed_by : '' }}{{ r.review_note ? ' — ' + r.review_note : '' }}</p></td>
                <td class="p-3 text-right whitespace-nowrap">
                  <template v-if="r.review_status === 'review'">
                    <button class="btn-ghost text-[11px] py-1 px-2" @click="decide([r.id], 'keep')">Keep</button>
                    <button class="text-[11px] py-1 px-2 rounded-lg text-red-400 hover:bg-red-500/10" @click="askDelete([r.id])">Delete</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- cards (< md) -->
        <div v-if="rows.length" class="md:hidden space-y-2">
          <div v-for="r in rows" :key="'c' + r.id" class="glass-card p-3 text-xs space-y-1.5">
            <div class="flex items-start gap-2">
              <input v-if="r.review_status === 'review'" v-model="sel" type="checkbox" :value="r.id" class="mt-0.5" />
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-gray-200 truncate">{{ r.customer }}</p>
                <p class="text-gray-500"><span class="font-mono">{{ r.date }}</span> · {{ String(r.type).replace(/_/g, ' ') }} · <span class="font-mono">{{ r.ref }}</span></p>
              </div>
              <span class="font-mono font-bold shrink-0" :class="Number(r.credit) ? 'text-emerald-400' : 'text-gray-200'">৳{{ money(Number(r.debit) || Number(r.credit)) }}{{ Number(r.credit) ? ' Cr' : '' }}</span>
            </div>
            <p class="text-gray-600 break-words">{{ r.description }}</p>
            <div class="flex flex-wrap items-center gap-2"><span class="badge">{{ reasonLabel(r.review_reason) }}</span>
              <span v-if="r.review_status === 'kept'" class="text-emerald-500 text-[10px]">✓ kept</span>
              <span class="flex-1" />
              <template v-if="r.review_status === 'review'">
                <button class="btn-ghost text-[11px] py-1 px-2" @click="decide([r.id], 'keep')">Keep</button>
                <button class="text-[11px] py-1 px-2 rounded-lg text-red-400 border border-red-500/30" @click="askDelete([r.id])">Delete</button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="data && data.total > data.per" class="flex items-center justify-between text-xs text-gray-500">
          <button class="btn-ghost text-xs" :disabled="f.page <= 1" @click="f.page--">← Prev</button>
          <span>Page {{ f.page }} / {{ Math.ceil(data.total / data.per) }}</span>
          <button class="btn-ghost text-xs" :disabled="f.page >= Math.ceil(data.total / data.per)" @click="f.page++">Next →</button>
        </div>
      </div>
    </div>

    <!-- sticky bulk bar -->
    <div v-if="sel.length" class="fixed bottom-3 left-3 right-3 lg:left-[280px] z-40 glass-card px-4 py-3 flex flex-wrap items-center gap-3" style="background:rgba(22,18,14,0.97)">
      <span class="text-xs text-gray-300"><b>{{ sel.length }}</b> selected · net <b class="font-mono">৳{{ money(selectedNet) }}</b></span>
      <span class="flex-1" />
      <button class="btn-ghost text-xs" @click="sel = []">Clear</button>
      <button class="btn-gold text-xs" @click="decide(sel, 'keep')">✓ Keep selected</button>
      <button class="text-xs px-4 py-2 rounded-xl font-semibold bg-red-600 text-white" @click="askDelete(sel)">🗑 Delete selected</button>
    </div>

    <!-- delete dialog -->
    <Teleport to="body">
      <div v-if="del.open" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="del.open = false">
        <form class="glass-card p-5 w-full max-w-md space-y-3" @submit.prevent="confirmDelete">
          <h3 class="font-bold text-red-400">🗑 Delete {{ del.ids.length }} ledger line(s)?</h3>
          <p class="text-xs text-gray-400">The lines — and their journal entries when nothing else uses them — move to the Recycle Bin as one batch you can restore. Each customer's balance is recalculated. The order or payment the line belonged to is <b>not</b> touched.</p>
          <textarea v-model="del.note" rows="2" class="input-glass w-full resize-none" placeholder="Reason (required) — e.g. checked with legacy, entered by mistake" required />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-ghost text-xs" @click="del.open = false">Cancel</button>
            <button class="text-xs px-4 py-2 rounded-xl font-semibold bg-red-600 text-white" :disabled="busy">{{ busy ? 'Deleting…' : 'Delete' }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { success, error: toastError } = useToast()
const route = useRoute()
const view = computed({ get: () => (route.query.view === 'checks' ? 'checks' : 'lines'), set: (v: string) => navigateTo({ query: { ...route.query, view: v === 'lines' ? undefined : v } }, { replace: true }) })
const { data: audit, pending: auditPending } = await useFetch<any>('/api/ledger/audit', { lazy: true, server: false })
const open = ref('')
function downloadAudit() {
  const rows = [['Check', 'Severity', 'Customer', 'Reference', 'Date', 'Amount', 'Detail'], ...(audit.value?.exceptions ?? []).map((e: any) => [e.code, e.severity, e.customer, e.ref, e.date, e.amount, e.detail])]
  const csv = rows.map((r: any[]) => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = `ledger-cross-checks-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
}
const f = reactive({ status: 'review', reason: '', customer_id: (useRoute().query.customer ?? '') as number | string, q: '', page: 1 })
const { data, pending, refresh } = await useFetch<any>('/api/ledger/review', { query: f, watch: [() => f.status, () => f.reason, () => f.customer_id, () => f.q, () => f.page] })
watch(() => [f.status, f.reason, f.customer_id, f.q], () => { f.page = 1; sel.value = [] })
const rows = computed(() => (data.value?.rows ?? []) as any[])
const sel = ref<number[]>([])
const showCustomers = ref(false)
const money = (v: any) => Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
const hint = (c: string) => REVIEW_REASONS[c]?.hint ?? ''
const customerName = computed(() => (data.value?.customers ?? []).find((c: any) => String(c.id) === String(f.customer_id))?.name ?? 'customer')
const reviewable = computed(() => rows.value.filter(r => r.review_status === 'review'))
const allSelected = computed(() => reviewable.value.length > 0 && reviewable.value.every(r => sel.value.includes(r.id)))
const toggleAll = () => { sel.value = allSelected.value ? [] : reviewable.value.map(r => r.id) }
const selectedNet = computed(() => rows.value.filter(r => sel.value.includes(r.id)).reduce((s, r) => s + Number(r.debit) - Number(r.credit), 0))

const busy = ref(false)
async function decide(ids: number[], action: 'keep' | 'delete', note = '') {
  busy.value = true
  try {
    await $fetch('/api/ledger/review', { method: 'POST', body: { ids, action, note } })
    success(action === 'keep' ? `${ids.length} line(s) kept` : `${ids.length} line(s) moved to the Recycle Bin`)
    sel.value = []; del.open = false
    await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not save the decision') } finally { busy.value = false }
}
const del = reactive({ open: false, ids: [] as number[], note: '' })
function askDelete(ids: number[]) { Object.assign(del, { open: true, ids, note: '' }) }
const confirmDelete = () => decide(del.ids, 'delete', del.note)
</script>

<style scoped>
.chip { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.05); color: #9ca3af; }
.chip:hover { color: #f3f4f6; }
.chip-on { background: rgba(var(--accent) / 0.2); color: var(--accent-ink, #f59e0b); }
.sev { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.sev-high { background: rgba(239,68,68,0.15); color: #f87171; }
.sev-medium { background: rgba(245,158,11,0.15); color: #fbbf24; }
.sev-review, .sev-info { background: rgba(148,163,184,0.15); color: #94a3b8; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
</style>

<template>
  <div class="space-y-6">
    <UiPageHeader title="General Journal" subtitle="All posted journal entries"
                  :breadcrumb="['Accounts', 'Journal']">
      <template #actions>
        <NuxtLink to="/accounts/journal/create" class="btn-gold text-xs">+ New Entry</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap gap-3">
      <input v-model.lazy="search" type="text" placeholder="Search description…" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" />
      <input v-model.lazy="dateFrom" type="date" class="input-glass w-auto text-xs py-1.5" />
      <span class="text-gray-600 self-center">→</span>
      <input v-model.lazy="dateTo" type="date" class="input-glass w-auto text-xs py-1.5" />
      <button @click="search='';dateFrom='';dateTo=''" class="btn-ghost text-xs py-1.5">Reset</button>
      <span class="ml-auto text-xs text-gray-500 self-center">{{ entries.length }} entries</span>
    </div>

    <!-- Entries list -->
    <div class="glass-card p-5">
      <div v-if="pending" class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading journal entries…</div>

      <div v-else class="space-y-2">
        <div v-for="entry in entries" :key="entry.id"
          class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
          @click="toggle(entry.id)">
          <!-- Entry header -->
          <div class="flex items-center justify-between p-4 bg-white/[0.02]">
            <div class="flex items-center gap-4">
              <div class="text-center">
                <p class="text-[10px] font-semibold text-gray-600 uppercase">{{ String(entry.date).slice(5, 7) }}/{{ String(entry.date).slice(0, 4) }}</p>
                <p class="text-lg font-bold text-gray-200">{{ String(entry.date).slice(8, 10) }}</p>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-200">{{ entry.description }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  JE-{{ entry.id }} · {{ entry.type ?? 'General' }} · {{ entry.posted_by ?? '—' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-right">
                <p class="text-xs text-gray-600">Total</p>
                <p class="font-mono font-bold text-gold-400">৳{{ Number(entry.total ?? 0).toLocaleString() }}</p>
              </div>
              <!-- Admin actions (non-reversed entries only) -->
              <div v-if="!entry.is_reversed" class="flex items-center gap-2 mr-3" @click.stop>
                <button @click="openReverse(entry)"
                  class="text-[11px] px-2.5 py-1 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all">
                  ↩ Reverse
                </button>
                <button @click="confirmDelete(entry)"
                  class="text-[11px] px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                  🗑 Delete
                </button>
              </div>
              <span v-if="entry.is_reversed" class="mr-3 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">REVERSED</span>
              <svg class="w-4 h-4 text-gray-600 transition-transform" :class="expanded.has(entry.id) ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <!-- Expanded lines -->
          <div v-if="expanded.has(entry.id)" class="border-t border-white/[0.06]">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.04]">
                  <th class="py-2 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th>
                  <th class="py-2 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th>
                  <th class="py-2 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.03]">
                <tr v-for="line in entry.lines" :key="line.account_name">
                  <td class="py-2 px-4 text-gray-300">
                    <span :class="Number(line.credit_amount) > 0 ? 'pl-4' : ''">
                      {{ line.account_name }} ({{ line.account_number ?? '—' }})
                    </span>
                  </td>
                  <td class="py-2 px-4 text-right font-mono text-red-400">{{ Number(line.debit_amount) > 0 ? `৳${Number(line.debit_amount).toLocaleString()}` : '' }}</td>
                  <td class="py-2 px-4 text-right font-mono text-emerald-400">{{ Number(line.credit_amount) > 0 ? `৳${Number(line.credit_amount).toLocaleString()}` : '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="!entries.length" class="text-center py-12 text-gray-600">
          No journal entries found.
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil(total / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--" class="btn-ghost text-xs py-1 px-3" :class="page<=1?'opacity-40':''">← Prev</button>
        <button :disabled="page >= Math.ceil(total/perPage)" @click="page++" class="btn-ghost text-xs py-1 px-3">Next →</button>
      </div>
    </div>
  </div>

  <!-- ── REVERSE MODAL ─────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="reverseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
           @click.self="reverseModal = false">
        <div class="w-full max-w-md glass-card p-6 space-y-4" @click.stop>
          <h3 class="section-title text-blue-400">Reverse Journal Entry</h3>
          <p class="text-sm text-gray-400">Creating a reversal for <strong class="text-gold-400">JE-{{ selectedEntry?.id }}</strong>:<br/>
            <span class="text-gray-500 text-xs">{{ selectedEntry?.description }}</span>
          </p>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason (optional)</label>
            <textarea v-model="reverseReason" rows="2" class="field-input w-full resize-none text-sm"
                      placeholder="Reason for reversal…" />
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="reverseModal = false" class="btn-ghost text-xs">Cancel</button>
            <button @click="doReverse" :disabled="acting"
                    class="px-4 py-2 rounded-xl text-xs font-semibold text-blue-400 border border-blue-500/25 hover:bg-blue-500/10 transition-all disabled:opacity-40">
              {{ acting ? '…' : '↩ Confirm Reversal' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── DELETE MODAL ──────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="deleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
           @click.self="deleteModal = false">
        <div class="w-full max-w-md glass-card p-6 space-y-4" @click.stop>
          <h3 class="section-title text-red-400">Delete Journal Entry</h3>
          <p class="text-sm text-gray-400">
            Permanently delete <strong class="text-gold-400">JE-{{ selectedEntry?.id }}</strong>?
            This cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal = false" class="btn-ghost text-xs">Cancel</button>
            <button @click="doDelete" :disabled="acting"
                    class="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 transition-all disabled:opacity-40">
              {{ acting ? '…' : 'Delete Permanently' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search   = ref('')
const dateFrom = ref('')
const dateTo   = ref('')
const page     = ref(1)
const perPage  = 20
const expanded = ref(new Set<number>())

function toggle(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

const { data, pending } = await useFetch('/api/accounts/journal', {
  query: computed(() => ({
    search:    search.value,
    date_from: dateFrom.value,
    date_to:   dateTo.value,
    page:      page.value,
  })),
})

const entries = computed(() => (data.value as any)?.entries ?? [])
const total   = computed(() => (data.value as any)?.total   ?? 0)

const { success, error: toastError } = useToast()
const acting = ref(false)
const reverseModal = ref(false)
const deleteModal  = ref(false)
const reverseReason = ref('')
const selectedEntry = ref<any>(null)

function openReverse(entry: any) {
  selectedEntry.value = entry
  reverseReason.value = ''
  reverseModal.value = true
}

function confirmDelete(entry: any) {
  selectedEntry.value = entry
  deleteModal.value = true
}

async function doReverse() {
  if (!selectedEntry.value) return
  acting.value = true
  try {
    await $fetch(`/api/accounts/journal/${selectedEntry.value.id}/reverse`, {
      method: 'POST',
      body: { reason: reverseReason.value || undefined },
    })
    success(`JE-${selectedEntry.value.id} reversed successfully`)
    reverseModal.value = false
    await refreshNuxtData()  // refresh the list
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to reverse entry')
  } finally {
    acting.value = false
  }
}

async function doDelete() {
  if (!selectedEntry.value) return
  acting.value = true
  try {
    await $fetch(`/api/accounts/journal/${selectedEntry.value.id}`, { method: 'DELETE' })
    success(`JE-${selectedEntry.value.id} deleted`)
    deleteModal.value = false
    await refreshNuxtData()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete entry')
  } finally {
    acting.value = false
  }
}
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.15s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>

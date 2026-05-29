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
</script>

<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">Salary Advances</h1>
          <p class="text-sm text-gray-400">{{ advances.length }} records</p>
        </div>
      </div>
      <button @click="showCreate = true" class="btn-primary flex items-center gap-2">
        <span>+</span> New Advance
      </button>
    </div>

    <!-- Status tabs -->
    <div class="flex gap-2">
      <button v-for="tab in ['', 'pending', 'approved', 'rejected', 'paid']" :key="tab"
        @click="filterStatus = tab; reload()"
        :class="['btn-xs', filterStatus === tab ? 'btn-primary' : 'btn-secondary']">
        {{ tab || 'All' }}
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Date</th>
              <th class="th">Month</th>
              <th class="th text-right">Amount</th>
              <th class="th">Reason</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="adv in advances" :key="adv.id" class="tr">
              <td class="td">
                <p class="font-medium text-gray-200">{{ adv.first_name }} {{ adv.last_name }}</p>
                <p class="text-xs text-gray-500">{{ adv.position_name || '—' }}</p>
              </td>
              <td class="td text-gray-400">{{ fmtDate(adv.advance_date) }}</td>
              <td class="td text-gray-400 text-xs">
                {{ adv.advance_month && adv.advance_year ? `${adv.advance_month}/${adv.advance_year}` : '—' }}
              </td>
              <td class="td text-right font-medium text-gray-200">৳{{ fmt(adv.amount) }}</td>
              <td class="td text-gray-500 text-xs max-w-[140px] truncate">{{ adv.reason || '—' }}</td>
              <td class="td text-center">
                <span :class="statusBadge(adv.status)" class="badge">{{ adv.status }}</span>
              </td>
              <td class="td text-right">
                <div v-if="adv.status === 'pending'" class="flex justify-end gap-1">
                  <button @click="updateStatus(adv.id, 'approved')" class="btn-xs badge-green text-xs px-2 py-0.5 rounded">✓</button>
                  <button @click="updateStatus(adv.id, 'rejected')" class="btn-xs badge-red text-xs px-2 py-0.5 rounded">✗</button>
                </div>
                <button v-else-if="adv.status === 'approved'" @click="updateStatus(adv.id, 'paid')"
                  class="btn-xs badge-blue text-xs px-2 py-0.5 rounded">Mark Paid</button>
                <span v-else class="text-gray-600 text-xs">—</span>
              </td>
            </tr>
            <tr v-if="!advances.length">
              <td colspan="7" class="td text-center text-gray-500 py-10">No salary advances found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-box w-full max-w-md">
          <h2 class="text-lg font-bold text-white mb-5">New Salary Advance</h2>
          <form @submit.prevent="createAdvance" class="space-y-4">
            <div>
              <label class="label">Employee *</label>
              <select v-model="cForm.employee_id" required class="input-field w-full">
                <option value="">Select employee</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.first_name }} {{ e.last_name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Amount (৳) *</label>
              <input v-model.number="cForm.amount" type="number" min="1" required class="input-field w-full" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Month (MM)</label>
                <input v-model="cForm.advance_month" type="text" maxlength="2" placeholder="07" class="input-field w-full" />
              </div>
              <div>
                <label class="label">Year (YYYY)</label>
                <input v-model="cForm.advance_year" type="text" maxlength="4" placeholder="2025" class="input-field w-full" />
              </div>
            </div>
            <div>
              <label class="label">Reason</label>
              <textarea v-model="cForm.reason" rows="2" class="input-field w-full resize-none" />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="cSaving" class="btn-primary">
                {{ cSaving ? 'Submitting…' : 'Submit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const filterStatus = ref('')
const { data, refresh } = await useFetch('/api/hr/advances', {
  query: computed(() => filterStatus.value ? { status: filterStatus.value } : {}),
})
const advances  = computed(() => (data.value as any)?.advances  ?? [])
const employees = computed(() => (data.value as any)?.employees ?? [])

async function reload() { await refresh() }
async function updateStatus(id: number, status: string) {
  await $fetch('/api/hr/advances', { method: 'POST', body: { action: 'update_status', id, status } })
  await refresh()
}

const showCreate = ref(false)
const cSaving    = ref(false)
const now = new Date()
const cForm = ref({
  employee_id: '', amount: 0,
  advance_month: String(now.getMonth() + 1).padStart(2, '0'),
  advance_year: String(now.getFullYear()),
  reason: '',
})

async function createAdvance() {
  cSaving.value = true
  try {
    await $fetch('/api/hr/advances', { method: 'POST', body: { action: 'create', ...cForm.value } })
    showCreate.value = false
    await refresh()
  } finally { cSaving.value = false }
}

const fmt = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const statusBadge = (s: string) => ({
  pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', paid: 'badge-blue',
})[s] || 'badge-gray'
</script>

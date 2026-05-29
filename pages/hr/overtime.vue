<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">Overtime</h1>
        <p class="text-sm text-gray-400">Record & approve overtime hours</p>
      </div>
      <button @click="openAdd" class="btn-primary">+ Add Overtime</button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <input v-model="search" placeholder="Search employee…" class="input-field w-44 text-sm" />
      <select v-model="filterStatus" class="input-field text-sm">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="paid">Paid</option>
        <option value="rejected">Rejected</option>
      </select>
      <input v-model="filterMonth" type="month" class="input-field text-sm" />
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Date</th>
              <th class="th text-right">Hours</th>
              <th class="th">Rate</th>
              <th class="th text-right">Amount</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id" class="tr">
              <td class="td text-gray-200 font-medium">{{ r.first_name }} {{ r.last_name }}</td>
              <td class="td text-gray-400">{{ fmtDate(r.ot_date) }}</td>
              <td class="td text-right text-gray-300">{{ r.ot_hours }}h</td>
              <td class="td text-gray-400">{{ r.rate_type }}</td>
              <td class="td text-right font-semibold text-amber-400">৳{{ fmt(r.amount) }}</td>
              <td class="td text-center">
                <span :class="statusBadge(r.status)" class="text-xs">{{ r.status }}</span>
              </td>
              <td class="td text-right">
                <div class="flex justify-end gap-1">
                  <button v-if="r.status === 'pending'"
                    @click="updateStatus(r.id, 'approved')" class="btn-xs badge-green text-xs px-2 py-0.5 rounded">✓</button>
                  <button v-if="r.status === 'pending'"
                    @click="updateStatus(r.id, 'rejected')" class="btn-xs badge-red text-xs px-2 py-0.5 rounded">✗</button>
                  <button @click="deleteRow(r.id)" class="btn-xs text-red-400">Del</button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="td text-center text-gray-500 py-10">No overtime records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Modal -->
    <Teleport to="body">
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
        <div class="modal-box w-full max-w-md">
          <h2 class="text-lg font-bold text-white mb-5">Record Overtime</h2>
          <form @submit.prevent="submit" class="space-y-4">
            <div>
              <label class="label">Employee *</label>
              <select v-model="form.employee_id" required class="input-field w-full">
                <option value="">Select employee</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  {{ e.first_name }} {{ e.last_name }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Date *</label>
                <input v-model="form.ot_date" type="date" required class="input-field w-full" />
              </div>
              <div>
                <label class="label">Hours *</label>
                <input v-model.number="form.ot_hours" type="number" min="0.5" max="24" step="0.5" required class="input-field w-full" />
              </div>
            </div>
            <div>
              <label class="label">Rate Type</label>
              <select v-model="form.rate_type" class="input-field w-full">
                <option value="1.5x">1.5× (Normal OT)</option>
                <option value="2x">2× (Holiday OT)</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label class="label">Reason</label>
              <input v-model="form.reason" type="text" class="input-field w-full" placeholder="Optional reason" />
            </div>
            <div v-if="err" class="text-red-400 text-sm rounded bg-red-500/10 p-2">{{ err }}</div>
            <div class="flex justify-end gap-3 pt-1">
              <button type="button" @click="showAdd = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Saving…' : 'Save' }}
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

const filterMonth  = ref(new Date().toISOString().slice(0, 7))
const filterStatus = ref('')
const search       = ref('')

const { data, refresh } = await useFetch('/api/hr/overtime', {
  query: computed(() => ({ month: filterMonth.value, status: filterStatus.value || undefined })),
})
const records   = computed(() => (data.value as any)?.records ?? [])
const employees = ref<any[]>([])

const { data: empData } = await useFetch('/api/hr/employees')
watch(empData, v => { employees.value = (v as any)?.employees ?? [] }, { immediate: true })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return records.value.filter((r: any) =>
    !q || `${r.first_name} ${r.last_name}`.toLowerCase().includes(q)
  )
})

// Add modal
const showAdd = ref(false)
const saving  = ref(false)
const err     = ref('')
const form    = ref({ employee_id: '', ot_date: new Date().toISOString().slice(0, 10), ot_hours: 2, rate_type: '1.5x', reason: '' })

function openAdd() { showAdd.value = true; err.value = '' }

async function submit() {
  saving.value = true; err.value = ''
  try {
    await $fetch('/api/hr/overtime', { method: 'POST', body: { action: 'create', ...form.value } })
    showAdd.value = false
    await refresh()
  } catch (e: any) { err.value = e?.data?.statusMessage || 'Failed' }
  finally { saving.value = false }
}

async function updateStatus(id: number, status: string) {
  await $fetch('/api/hr/overtime', { method: 'POST', body: { action: 'update_status', id, status } })
  await refresh()
}

async function deleteRow(id: number) {
  if (!confirm('Delete this overtime record?')) return
  await $fetch('/api/hr/overtime', { method: 'POST', body: { action: 'delete', id } })
  await refresh()
}

const fmt     = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const statusBadge = (s: string) => ({
  pending:  'badge-yellow',
  approved: 'badge-green',
  paid:     'badge-blue',
  rejected: 'badge-red',
} as Record<string, string>)[s] || 'badge-gray'
</script>

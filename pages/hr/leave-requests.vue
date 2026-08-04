<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">Leave Requests</h1>
          <p class="text-sm text-gray-400">{{ requests.length }} records</p>
        </div>
      </div>
      <button @click="showCreate = true" class="btn-primary flex items-center gap-2">
        <span>+</span> New Request
      </button>
    </div>

    <!-- Status tabs -->
    <div class="flex gap-2 flex-wrap">
      <button v-for="tab in ['', 'pending', 'approved', 'rejected']" :key="tab"
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
              <th class="th">Leave Type</th>
              <th class="th">From</th>
              <th class="th">To</th>
              <th class="th text-center">Days</th>
              <th class="th">Reason</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id" class="tr">
              <td class="td">
                <p class="text-gray-200 font-medium">{{ req.first_name }} {{ req.last_name }}</p>
                <p class="text-xs text-gray-500">{{ req.position_name || req.department_name }}</p>
              </td>
              <td class="td text-gray-300">{{ req.leave_type }}</td>
              <td class="td text-gray-400">{{ fmtDate(req.start_date) }}</td>
              <td class="td text-gray-400">{{ fmtDate(req.end_date) }}</td>
              <td class="td text-center text-gray-300">{{ daysBetween(req.start_date, req.end_date) }}</td>
              <td class="td text-gray-500 max-w-[180px] truncate text-xs">{{ req.reason || '—' }}</td>
              <td class="td text-center">
                <span :class="statusBadge(req.status)" class="badge">{{ req.status }}</span>
              </td>
              <td class="td text-right">
                <div v-if="req.status === 'pending'" class="flex justify-end gap-1">
                  <button @click="updateStatus(req.id, 'approved')" class="btn-xs badge-green text-xs px-2 py-1 rounded">
                    Approve
                  </button>
                  <button @click="updateStatus(req.id, 'rejected')" class="btn-xs badge-red text-xs px-2 py-1 rounded">
                    Reject
                  </button>
                </div>
                <span v-else class="text-gray-600 text-xs">—</span>
              </td>
            </tr>
            <tr v-if="!requests.length">
              <td colspan="8" class="td text-center text-gray-500 py-10">No leave requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-box w-full max-w-lg">
          <h2 class="text-lg font-bold text-white mb-5">New Leave Request</h2>
          <form @submit.prevent="createRequest" class="space-y-4">
            <div>
              <label class="label">Employee *</label>
              <select v-model="cForm.employee_id" required class="input-field w-full">
                <option value="">Select employee</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  {{ e.first_name }} {{ e.last_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Leave Type *</label>
              <select v-model="cForm.leave_type" required class="input-field w-full">
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Paternity">Paternity Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Start Date *</label>
                <input v-model="cForm.start_date" type="date" required class="input-field w-full" />
              </div>
              <div>
                <label class="label">End Date *</label>
                <input v-model="cForm.end_date" type="date" required class="input-field w-full" />
              </div>
            </div>
            <div>
              <label class="label">Reason</label>
              <textarea v-model="cForm.reason" rows="3" class="input-field w-full resize-none" />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="cSaving" class="btn-primary">
                {{ cSaving ? 'Submitting…' : 'Submit Request' }}
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
const { data, refresh } = await useFetch('/api/hr/leave-requests', {
  query: computed(() => filterStatus.value ? { status: filterStatus.value } : {}),
})
const requests = computed(() => (data.value as any)?.requests ?? [])

// Employee list for create modal
const { data: empData } = await useFetch('/api/hr/employees')
const employees = computed(() => (empData.value as any)?.employees?.filter((e: any) => e.status === 'active') ?? [])

async function reload() { await refresh() }

async function updateStatus(id: number, status: string) {
  await $fetch('/api/hr/leave-requests', { method: 'POST', body: { action: 'update_status', id, status } })
  await refresh()
}

// ── Create form ──
const showCreate = ref(false)
const cSaving    = ref(false)
const cForm = ref({ employee_id: '', leave_type: 'Annual', start_date: '', end_date: '', reason: '' })

async function createRequest() {
  cSaving.value = true
  try {
    await $fetch('/api/hr/leave-requests', { method: 'POST', body: { action: 'create', ...cForm.value } })
    showCreate.value = false
    cForm.value = { employee_id: '', leave_type: 'Annual', start_date: '', end_date: '', reason: '' }
    await refresh()
  } finally { cSaving.value = false }
}

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const daysBetween = (s: string, e: string) => {
  if (!s || !e) return '—'
  const diff = (new Date(e).getTime() - new Date(s).getTime()) / 86400000
  return `${Math.round(diff) + 1}d`
}
const statusBadge = (s: string) => ({ pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' })[s] || 'badge-gray'
</script>

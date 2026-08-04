<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">Attendance</h1>
          <p class="text-sm text-gray-400">{{ presCount }} present · {{ absentCount }} absent today</p>
        </div>
      </div>
      <button @click="showManual = true" class="btn-primary flex items-center gap-2">
        <span class="text-lg leading-none">+</span> Manual Entry
      </button>
    </div>

    <!-- Date picker + View toggle -->
    <div class="flex flex-wrap gap-3 items-center">
      <input v-model="selDate" type="date" class="input-field text-sm" @change="reload" />
      <select v-model="viewMode" class="input-field text-sm" @change="reload">
        <option value="daily">Daily View</option>
        <option value="monthly">Monthly View</option>
      </select>
      <input v-if="viewMode === 'monthly'" v-model="selMonth" type="month" class="input-field text-sm" @change="reload" />
    </div>

    <!-- Daily table: shows all active employees + their status -->
    <div v-if="viewMode === 'daily'" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th text-center">Status</th>
              <th class="th">Clock In</th>
              <th class="th">Clock Out</th>
              <th class="th text-center">Hours</th>
              <th class="th text-right">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in allEmployees" :key="emp.id" class="tr">
              <td class="td">
                <span class="text-gray-200 font-medium">{{ emp.first_name }} {{ emp.last_name }}</span>
              </td>
              <td class="td text-center">
                <span v-if="attFor(emp.id)" :class="statusBadge(attFor(emp.id).status)" class="badge">
                  {{ attFor(emp.id).status }}
                </span>
                <span v-else class="badge badge-red">absent</span>
              </td>
              <td class="td text-gray-400">{{ fmtTime(attFor(emp.id)?.clock_in) }}</td>
              <td class="td text-gray-400">{{ fmtTime(attFor(emp.id)?.clock_out) }}</td>
              <td class="td text-center text-gray-400">
                {{ calcHours(attFor(emp.id)?.clock_in, attFor(emp.id)?.clock_out) }}
              </td>
              <td class="td text-right text-gray-500 text-xs">{{ attFor(emp.id)?.note || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Monthly table -->
    <div v-if="viewMode === 'monthly'" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Date</th>
              <th class="th text-center">Status</th>
              <th class="th">Clock In</th>
              <th class="th">Clock Out</th>
              <th class="th text-center">Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in attendance" :key="row.id" class="tr">
              <td class="td text-gray-200">{{ row.first_name }} {{ row.last_name }}</td>
              <td class="td text-gray-400">{{ fmtDate(row.clock_in) }}</td>
              <td class="td text-center">
                <span :class="statusBadge(row.status)" class="badge">{{ row.status }}</span>
              </td>
              <td class="td text-gray-400">{{ fmtTime(row.clock_in) }}</td>
              <td class="td text-gray-400">{{ fmtTime(row.clock_out) }}</td>
              <td class="td text-center text-gray-400">{{ calcHours(row.clock_in, row.clock_out) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Manual Entry Modal -->
    <Teleport to="body">
      <div v-if="showManual" class="modal-overlay" @click.self="showManual = false">
        <div class="modal-box w-full max-w-lg">
          <h2 class="text-lg font-bold text-white mb-5">Manual Attendance Entry</h2>
          <form @submit.prevent="saveManual" class="space-y-4">
            <div>
              <label class="label">Employee *</label>
              <select v-model="mForm.employee_id" required class="input-field w-full">
                <option value="">Select employee</option>
                <option v-for="e in allEmployees" :key="e.id" :value="e.id">
                  {{ e.first_name }} {{ e.last_name }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Clock In *</label>
                <input v-model="mForm.clock_in" type="datetime-local" required class="input-field w-full" />
              </div>
              <div>
                <label class="label">Clock Out</label>
                <input v-model="mForm.clock_out" type="datetime-local" class="input-field w-full" />
              </div>
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="mForm.status" class="input-field w-full">
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div>
              <label class="label">Note</label>
              <input v-model="mForm.note" class="input-field w-full" />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showManual = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="mSaving" class="btn-primary">
                {{ mSaving ? 'Saving…' : 'Save Entry' }}
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

const selDate  = ref(new Date().toISOString().slice(0, 10))
const selMonth = ref(new Date().toISOString().slice(0, 7))
const viewMode = ref('daily')

const queryParams = computed(() => {
  if (viewMode.value === 'monthly') return { view: 'monthly', month: selMonth.value }
  return { view: 'daily', date: selDate.value }
})

const { data, refresh } = await useFetch('/api/hr/attendance', { query: queryParams })
const attendance   = computed(() => (data.value as any)?.attendance  ?? [])
const allEmployees = computed(() => (data.value as any)?.employees   ?? [])

async function reload() { await refresh() }

const attMap = computed(() => {
  const m: Record<number, any> = {}
  for (const a of attendance.value) m[a.employee_id] = a
  return m
})
const attFor = (id: number) => attMap.value[id]

const presCount   = computed(() => attendance.value.filter((a: any) => a.status === 'present').length)
const absentCount = computed(() => Math.max(0, allEmployees.value.length - attendance.value.length))

// ── Manual form ──
const showManual = ref(false)
const mSaving    = ref(false)
const mForm = ref({ employee_id: '', clock_in: '', clock_out: '', status: 'present', note: '' })

async function saveManual() {
  mSaving.value = true
  try {
    await $fetch('/api/hr/attendance', { method: 'POST', body: { action: 'manual', ...mForm.value } })
    showManual.value = false
    mForm.value = { employee_id: '', clock_in: '', clock_out: '', status: 'present', note: '' }
    await refresh()
  } finally { mSaving.value = false }
}

// ── Helpers ──
const fmtTime = (dt: string) => dt ? new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'
const fmtDate = (dt: string) => dt ? new Date(dt).toLocaleDateString('en-GB') : '—'
const calcHours = (ci: string, co: string) => {
  if (!ci || !co) return '—'
  const h = (new Date(co).getTime() - new Date(ci).getTime()) / 3600000
  return `${h.toFixed(1)}h`
}
const statusBadge = (s: string) => ({
  present: 'badge-green', late: 'badge-yellow', half_day: 'badge-yellow',
  absent: 'badge-red',
})[s] || 'badge-gray'
</script>

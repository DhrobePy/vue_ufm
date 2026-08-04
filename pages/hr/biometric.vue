<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">Biometric Devices</h1>
          <p class="text-sm text-gray-400">Hardware attendance terminals — ZKTeco, Hikvision, Dahua, eSSL, FingerTec & more</p>
        </div>
      </div>
      <button @click="openAdd" class="btn-primary">+ Add Device</button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-white/[0.07] pb-0">
      <button v-for="t in tabs" :key="t.key"
        @click="activeTab = t.key; t.onLoad?.()"
        :class="['px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          activeTab === t.key
            ? 'border-amber-400 text-amber-400'
            : 'border-transparent text-gray-400 hover:text-gray-200']">
        {{ t.label }}
        <span v-if="t.badge" class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
              :class="t.badge > 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.06] text-gray-500'">
          {{ t.badge }}
        </span>
      </button>
    </div>

    <!-- ── TAB: DEVICES ──────────────────────────────────────── -->
    <div v-if="activeTab === 'devices'">
      <div v-if="loading" class="card p-12 text-center text-gray-500">Loading devices…</div>

      <div v-else-if="!devices.length" class="card p-12 text-center">
        <div class="text-4xl mb-3">📡</div>
        <p class="text-gray-400 font-medium">No devices registered yet</p>
        <p class="text-gray-600 text-sm mt-1">Add a device manually or wait for auto-connect via ADMS</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="d in devices" :key="d.id"
             class="glass-card p-4 flex flex-col gap-3">
          <!-- Card Header -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 :class="d.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">
              <span class="text-lg">🔒</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-100 truncate">{{ d.device_name || d.serial_no }}</p>
              <p class="text-xs text-gray-500">{{ d.brand }} {{ d.model }}</p>
            </div>
            <span :class="statusPill(d.status)">
              <span class="w-1.5 h-1.5 rounded-full bg-current inline-block mr-1"></span>
              {{ d.status }}
            </span>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-1.5 text-xs text-gray-400">
            <div>🔢 {{ d.serial_no }}</div>
            <div>🏢 {{ d.branch_name || 'No branch' }}</div>
            <div>🌐 {{ d.ip_address || 'IP unknown' }}</div>
            <div>🕐 {{ d.last_seen ? relativeTime(d.last_seen) : 'Never' }}</div>
          </div>

          <!-- Stats Row -->
          <div class="flex divide-x divide-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden">
            <div class="flex-1 text-center py-2">
              <div class="text-lg font-bold text-white">{{ (d.total_records || 0).toLocaleString() }}</div>
              <div class="text-[10px] text-gray-500">Total Punches</div>
            </div>
            <div class="flex-1 text-center py-2">
              <div class="text-lg font-bold text-amber-400">{{ d.today_punches ?? 0 }}</div>
              <div class="text-[10px] text-gray-500">Today</div>
            </div>
            <div class="flex-1 text-center py-2">
              <div class="text-sm font-semibold text-gray-300">{{ d.firmware_version || '—' }}</div>
              <div class="text-[10px] text-gray-500">Firmware</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button @click="openEdit(d)" class="btn-secondary flex-1 text-xs py-1.5">Edit</button>
            <button @click="viewLog(d.serial_no)" class="btn-secondary flex-1 text-xs py-1.5">Log</button>
            <button @click="deleteDevice(d)" class="text-xs py-1.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 transition">Del</button>
          </div>
        </div>
      </div>

      <!-- ADMS endpoint banner -->
      <div class="card p-4 mt-4 flex items-center gap-4 flex-wrap">
        <span class="text-2xl shrink-0">🔗</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-100 text-sm">ADMS Server Endpoint</p>
          <p class="text-xs text-gray-500 mt-0.5">Configure this URL on your device's Cloud / Server settings</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <code class="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-amber-300 text-sm font-mono">
            {{ admsUrl }}
          </code>
          <button @click="copyUrl" class="btn-secondary text-xs py-1.5 px-3">
            {{ copied ? '✓ Copied!' : '📋 Copy' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── TAB: PUNCH LOG ────────────────────────────────────── -->
    <div v-if="activeTab === 'punchlog'" class="space-y-4">
      <!-- Filters -->
      <div class="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label class="label">From</label>
          <input v-model="logFilter.from" type="date" class="input-field text-sm" @change="loadLog" />
        </div>
        <div>
          <label class="label">To</label>
          <input v-model="logFilter.to" type="date" class="input-field text-sm" @change="loadLog" />
        </div>
        <div>
          <label class="label">Device</label>
          <select v-model="logFilter.serial" class="input-field text-sm" @change="loadLog">
            <option value="">All Devices</option>
            <option v-for="d in devices" :key="d.serial_no" :value="d.serial_no">
              {{ d.device_name || d.serial_no }}
            </option>
          </select>
        </div>
        <button @click="loadLog" class="btn-primary text-sm">🔍 Search</button>
      </div>

      <div class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center">
          <p class="text-sm font-semibold text-gray-200">Punch Records</p>
          <span class="text-xs text-gray-500">{{ logTotal.toLocaleString() }} total</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="th">Time</th>
                <th class="th">Employee</th>
                <th class="th">PIN</th>
                <th class="th">Device</th>
                <th class="th text-center">Type</th>
                <th class="th text-center">Verify</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="logLoading">
                <td colspan="6" class="td text-center text-gray-500 py-10">Loading…</td>
              </tr>
              <tr v-else-if="!punchLog.length">
                <td colspan="6" class="td text-center text-gray-500 py-10">No punch records found.</td>
              </tr>
              <tr v-for="l in punchLog" :key="l.id" class="tr">
                <td class="td text-gray-300 whitespace-nowrap">{{ l.punch_time }}</td>
                <td class="td">
                  <span v-if="l.employee_name" class="font-medium text-gray-200">{{ l.employee_name }}</span>
                  <span v-else class="badge-red text-xs">Unmatched</span>
                </td>
                <td class="td"><code class="text-xs text-amber-300">{{ l.pin }}</code></td>
                <td class="td text-gray-500 text-xs">{{ l.device_serial }}</td>
                <td class="td text-center">
                  <span :class="l.punch_type == 0 ? 'badge-green' : 'badge-blue'" class="text-xs">
                    {{ punchTypeLabel(l.punch_type) }}
                  </span>
                </td>
                <td class="td text-center">
                  <span class="badge-gray text-xs">{{ verifyLabel(l.verify_type) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="logTotal > 100" class="px-4 py-3 border-t border-white/[0.06] flex justify-end gap-2">
          <button :disabled="logOffset === 0" @click="logOffset -= 100; loadLog()" class="btn-secondary text-sm">← Prev</button>
          <span class="text-xs text-gray-500 self-center">{{ logOffset + 1 }}–{{ Math.min(logOffset + 100, logTotal) }}</span>
          <button :disabled="logOffset + 100 >= logTotal" @click="logOffset += 100; loadLog()" class="btn-secondary text-sm">Next →</button>
        </div>
      </div>
    </div>

    <!-- ── TAB: UNMATCHED ────────────────────────────────────── -->
    <div v-if="activeTab === 'unmatched'" class="space-y-4">
      <div class="card p-4 flex items-center gap-3 flex-wrap">
        <span class="text-amber-400 text-xl">⚠️</span>
        <div class="flex-1">
          <p class="text-sm font-semibold text-gray-100">Unmatched Punches</p>
          <p class="text-xs text-gray-500 mt-0.5">Device PINs that didn't match any employee. Assign PINs in profiles or use Reprocess.</p>
        </div>
        <button @click="reprocess" :disabled="reprocessing" class="btn-primary text-sm">
          {{ reprocessing ? '⟳ Processing…' : '⟳ Reprocess All' }}
        </button>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="th">PIN</th>
                <th class="th">Device</th>
                <th class="th">Punch Time</th>
                <th class="th">Raw Data</th>
                <th class="th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!unmatched.length">
                <td colspan="5" class="td text-center text-gray-500 py-10">🎉 No unmatched punches!</td>
              </tr>
              <tr v-for="u in unmatched" :key="u.id" class="tr">
                <td class="td"><code class="font-bold text-amber-300">{{ u.pin }}</code></td>
                <td class="td text-gray-500 text-xs">{{ u.device_serial }}</td>
                <td class="td text-gray-300 whitespace-nowrap text-xs">{{ u.punch_time }}</td>
                <td class="td text-gray-600 text-xs truncate max-w-[180px]">{{ u.raw_line }}</td>
                <td class="td text-right">
                  <button @click="openPinAssign(u.pin)" class="btn-xs">Assign PIN</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── TAB: FACE KIOSK ─────────────────────────────────── -->
    <div v-if="activeTab === 'facekiosk'" class="space-y-4">

      <!-- Launch banner -->
      <div class="card p-5 flex items-center gap-5 flex-wrap">
        <div class="text-4xl shrink-0">🤖</div>
        <div class="flex-1">
          <h2 class="font-bold text-gray-100">Standalone Face Recognition Kiosk</h2>
          <p class="text-sm text-gray-400 mt-1">
            Open this on a dedicated tablet or PC at the gate. Employees look into the camera — it automatically
            records their attendance. No PIN, no card needed.
          </p>
        </div>
        <div class="flex gap-3 flex-wrap">
          <a :href="`/kiosk`" target="_blank" class="btn-primary">🚀 Launch Kiosk</a>
          <button @click="copyKioskUrl" class="btn-secondary text-sm">
            {{ kioskCopied ? '✓ Copied!' : '📋 Copy URL' }}
          </button>
        </div>
      </div>

      <!-- Kiosk URL with branch param hint -->
      <div class="card p-4">
        <p class="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Kiosk URL</p>
        <code class="block bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-2.5 text-amber-300 font-mono text-sm break-all">
          {{ kioskUrl }}
        </code>
        <p class="text-xs text-gray-600 mt-2">
          Append <code class="text-amber-300">?branch=2</code> to skip branch selection and go straight to scanning.
        </p>
      </div>

      <!-- Enrolled employees -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <p class="font-semibold text-gray-200">👤 Face Enrolment</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ enrolledList.length }} employees have Face IDs</p>
          </div>
          <button @click="openFaceEnroll(null)" class="btn-primary text-sm">+ Enrol Employee</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="th">Employee</th>
                <th class="th text-center">Status</th>
                <th class="th">Enrolled At</th>
                <th class="th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="faceLoading">
                <td colspan="4" class="td text-center text-gray-500 py-8">Loading…</td>
              </tr>
              <tr v-else-if="!enrolledList.length">
                <td colspan="4" class="td text-center text-gray-500 py-8">
                  No employees enrolled yet. Click "+ Enrol Employee" to start.
                </td>
              </tr>
              <tr v-for="e in enrolledList" :key="e.employee_id" class="tr">
                <td class="td">
                  <span class="font-medium text-gray-200">#{{ e.employee_id }} {{ e.name }}</span>
                </td>
                <td class="td text-center">
                  <span :class="e.valid ? 'badge-green' : 'badge-red'" class="text-xs">
                    {{ e.valid ? '✓ Valid' : '✗ Corrupt' }}
                  </span>
                </td>
                <td class="td text-gray-500 text-xs">{{ e.saved_at }}</td>
                <td class="td text-right">
                  <button @click="openFaceEnroll(e.employee_id)" class="btn-xs mr-2">Re-enrol</button>
                  <button @click="deleteFaceId(e.employee_id)" class="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── TAB: SETUP GUIDE ──────────────────────────────────── -->
    <div v-if="activeTab === 'setup'" class="space-y-4">
      <!-- ADMS URL -->
      <div class="card p-5">
        <h2 class="font-bold text-gray-100 mb-3">🔗 Your ADMS Server URL</h2>
        <div class="flex items-center gap-3 flex-wrap">
          <code class="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-2.5 text-amber-300 font-mono text-sm break-all">
            {{ admsUrl }}
          </code>
          <button @click="copyUrl" class="btn-primary text-sm">{{ copied ? '✓ Copied!' : '📋 Copy URL' }}</button>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          Configure all supported devices to push data to this URL. New devices auto-register on first connection — no manual setup needed.
        </p>
      </div>

      <!-- Brand guides -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="b in brandGuides" :key="b.name" class="card p-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="text-2xl">{{ b.emoji }}</div>
            <div>
              <p class="font-bold text-gray-100">{{ b.name }}</p>
              <p class="text-xs text-gray-500">{{ b.models }}</p>
            </div>
          </div>
          <ol class="space-y-1.5 list-decimal list-inside">
            <li v-for="(step, i) in b.steps" :key="i" class="text-xs text-gray-300 leading-relaxed">{{ step }}</li>
          </ol>
          <div v-if="b.note" class="mt-3 p-2.5 bg-indigo-500/10 border-l-2 border-indigo-400 rounded text-xs text-indigo-300">
            {{ b.note }}
          </div>
        </div>
      </div>

      <!-- Employee PIN mapping -->
      <div class="card p-5">
        <h2 class="font-bold text-gray-100 mb-2">🆔 Employee PIN Mapping</h2>
        <p class="text-xs text-gray-500 mb-4">
          Each employee enrolled on a device has a PIN. Map it to their profile so punches are recognised correctly.
          If the device PIN equals the employee's System ID, no mapping is needed.
        </p>
        <div class="flex items-end gap-3 flex-wrap">
          <div>
            <label class="label">Employee</label>
            <select v-model="pinForm.employee_id" class="input-field" style="min-width:200px">
              <option value="">Select employee…</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                [{{ e.id }}] {{ e.first_name }} {{ e.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Device PIN</label>
            <input v-model="pinForm.device_pin" class="input-field w-32" placeholder="e.g. 4501" />
          </div>
          <button @click="savePin" :disabled="!pinForm.employee_id || !pinForm.device_pin" class="btn-primary">
            Save PIN
          </button>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit Device Modal ─────────────────────────── -->
    <Teleport to="body">
      <div v-if="showDeviceModal" class="modal-overlay" @click.self="showDeviceModal = false">
        <div class="modal-box w-full max-w-lg">
          <h2 class="text-lg font-bold text-white mb-5">{{ deviceForm.id ? 'Edit Device' : 'Add Device' }}</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Serial Number *</label>
                <input v-model="deviceForm.serial_no" class="input-field w-full" placeholder="e.g. CGXJ231200001" />
                <p class="text-xs text-gray-600 mt-1">Found on device sticker or menu</p>
              </div>
              <div>
                <label class="label">Device Name</label>
                <input v-model="deviceForm.device_name" class="input-field w-full" placeholder="e.g. Factory Gate A" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Brand</label>
                <select v-model="deviceForm.brand" class="input-field w-full">
                  <option value="ZKTeco">ZKTeco</option>
                  <option value="Hikvision">Hikvision</option>
                  <option value="Dahua">Dahua</option>
                  <option value="eSSL">eSSL / Realand</option>
                  <option value="FingerTec">FingerTec</option>
                  <option value="Anviz">Anviz</option>
                  <option value="Suprema">Suprema</option>
                  <option value="Unknown">Other</option>
                </select>
              </div>
              <div>
                <label class="label">Model</label>
                <input v-model="deviceForm.model" class="input-field w-full" placeholder="e.g. ZK4500" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Branch</label>
                <select v-model="deviceForm.branch_id" class="input-field w-full">
                  <option :value="null">No branch</option>
                  <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>
              <div>
                <label class="label">IP Address</label>
                <input v-model="deviceForm.ip_address" class="input-field w-full" placeholder="192.168.1.201" />
              </div>
            </div>
            <div>
              <label class="label">Notes</label>
              <input v-model="deviceForm.notes" class="input-field w-full" placeholder="Location, floor, etc." />
            </div>
            <div v-if="saveErr" class="text-red-400 text-sm rounded bg-red-500/10 p-2">{{ saveErr }}</div>
            <div class="flex justify-end gap-3 pt-1">
              <button @click="showDeviceModal = false" class="btn-secondary">Cancel</button>
              <button @click="saveDevice" :disabled="saving" class="btn-primary">
                {{ saving ? 'Saving…' : 'Save Device' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Face Enrol Modal ──────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showFaceModal" class="modal-overlay" @click.self="showFaceModal = false">
        <div class="modal-box w-full max-w-lg">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-white">Enrol Face ID</h2>
            <button @click="showFaceModal = false" class="text-gray-500 hover:text-gray-300 text-xl leading-none">✕</button>
          </div>

          <!-- Employee selector if no specific emp -->
          <div v-if="!faceEnrollEmpId" class="mb-4">
            <label class="label">Select Employee</label>
            <select class="input-field w-full" @change="faceEnrollEmpId = Number(($event.target as HTMLSelectElement).value) || null">
              <option value="">Choose employee…</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                [{{ e.id }}] {{ e.first_name }} {{ e.last_name }}
              </option>
            </select>
          </div>

          <div v-else class="mb-3 text-sm text-gray-400">
            Enrolling:
            <span class="text-gray-200 font-semibold">
              {{ employees.find(e => e.id === faceEnrollEmpId)?.first_name }}
              {{ employees.find(e => e.id === faceEnrollEmpId)?.last_name }}
              (#{{ faceEnrollEmpId }})
            </span>
            <button @click="faceEnrollEmpId = null" class="ml-2 text-xs text-amber-400 hover:text-amber-300">Change</button>
          </div>

          <ClientOnly>
            <HrFaceEnroll
              :employee-id="faceEnrollEmpId"
              @done="showFaceModal = false; loadEnrolled()"
            />
          </ClientOnly>
        </div>
      </div>
    </Teleport>

    <!-- ── Assign PIN Modal ────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showPinModal" class="modal-overlay" @click.self="showPinModal = false">
        <div class="modal-box w-full max-w-sm">
          <h2 class="text-lg font-bold text-white mb-5">Assign Device PIN</h2>
          <div class="space-y-4">
            <div>
              <label class="label">Device PIN</label>
              <input v-model="pinForm.device_pin" class="input-field w-full" placeholder="PIN from device" />
            </div>
            <div>
              <label class="label">Employee</label>
              <select v-model="pinForm.employee_id" class="input-field w-full">
                <option value="">Select employee…</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  [{{ e.id }}] {{ e.first_name }} {{ e.last_name }}
                </option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-1">
              <button @click="showPinModal = false" class="btn-secondary">Cancel</button>
              <button @click="savePin" :disabled="!pinForm.employee_id || !pinForm.device_pin" class="btn-primary">
                Save PIN
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const activeTab   = ref('devices')
const loading     = ref(true)
const logLoading  = ref(false)
const reprocessing = ref(false)
const saving      = ref(false)
const copied      = ref(false)
const saveErr     = ref('')

const devices  = ref<any[]>([])
const branches = ref<any[]>([])
const employees = ref<any[]>([])
const punchLog = ref<any[]>([])
const logTotal = ref(0)
const logOffset = ref(0)
const unmatched = ref<any[]>([])

// Load branches
const { data: branchData } = await useFetch('/api/branches')
watch(branchData, v => { branches.value = (v as any)?.branches ?? [] }, { immediate: true })

// Load employees
const { data: empData } = await useFetch('/api/hr/employees')
watch(empData, v => { employees.value = (v as any)?.employees ?? [] }, { immediate: true })

const admsUrl = computed(() => {
  if (typeof window === 'undefined') return '/api/device/adms'
  return `${window.location.origin}/api/device/adms`
})

const logFilter = reactive({
  from:   new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
  to:     new Date().toISOString().slice(0, 10),
  serial: '',
})

// Tab definitions
const tabs = computed(() => [
  { key: 'devices',   label: '🔒 Devices',      badge: null,                    onLoad: null },
  { key: 'punchlog',  label: '👆 Punch Log',    badge: null,                    onLoad: loadLog },
  { key: 'unmatched', label: '⚠️ Unmatched',    badge: unmatched.value.length,  onLoad: loadUnmatched },
  { key: 'facekiosk', label: '🤖 Face Kiosk',   badge: null,                    onLoad: loadEnrolled },
  { key: 'setup',     label: '⚙️ Setup Guide',  badge: null,                    onLoad: null },
])

async function loadDevices() {
  loading.value = true
  try {
    const res = await $fetch<any>('/api/hr/biometric')
    devices.value = res.devices ?? []
  } finally { loading.value = false }
}

async function loadLog() {
  logLoading.value = true
  try {
    const res = await $fetch<any>('/api/hr/biometric', {
      query: { view: 'punch_log', from: logFilter.from, to: logFilter.to, serial: logFilter.serial || undefined, limit: 100, offset: logOffset.value }
    })
    punchLog.value = res.logs ?? []
    logTotal.value = res.total ?? 0
  } finally { logLoading.value = false }
}

async function loadUnmatched() {
  const res = await $fetch<any>('/api/hr/biometric', { query: { view: 'unmatched' } })
  unmatched.value = res.unmatched ?? []
}

onMounted(() => { loadDevices(); loadUnmatched() })

// ── Device CRUD ────────────────────────────────────────────
const showDeviceModal = ref(false)
const deviceForm = reactive<any>({ id: null, serial_no: '', device_name: '', brand: 'ZKTeco', model: '', branch_id: null, ip_address: '', notes: '' })

function openAdd() {
  Object.assign(deviceForm, { id: null, serial_no: '', device_name: '', brand: 'ZKTeco', model: '', branch_id: null, ip_address: '', notes: '' })
  showDeviceModal.value = true
  saveErr.value = ''
}
function openEdit(d: any) {
  Object.assign(deviceForm, { ...d })
  showDeviceModal.value = true
  saveErr.value = ''
}
async function saveDevice() {
  if (!deviceForm.serial_no) return
  saving.value = true; saveErr.value = ''
  try {
    await $fetch('/api/hr/biometric', { method: 'POST', body: { action: 'save_device', ...deviceForm } })
    showDeviceModal.value = false
    await loadDevices()
  } catch (e: any) { saveErr.value = e?.data?.statusMessage || 'Save failed' }
  finally { saving.value = false }
}
async function deleteDevice(d: any) {
  if (!confirm(`Delete device "${d.device_name || d.serial_no}"? Punch log will be kept.`)) return
  await $fetch('/api/hr/biometric', { method: 'POST', body: { action: 'delete_device', id: d.id } })
  await loadDevices()
}
function viewLog(serial: string) {
  logFilter.serial = serial
  activeTab.value = 'punchlog'
  loadLog()
}

// ── PIN assignment ─────────────────────────────────────────
const showPinModal = ref(false)
const pinForm = reactive({ employee_id: '', device_pin: '' })

function openPinAssign(pin = '') {
  pinForm.device_pin = pin
  pinForm.employee_id = ''
  showPinModal.value = true
}
async function savePin() {
  await $fetch('/api/hr/biometric', { method: 'POST', body: { action: 'assign_pin', ...pinForm } })
  showPinModal.value = false
  await reprocess()
}

// ── Reprocess ──────────────────────────────────────────────
async function reprocess() {
  reprocessing.value = true
  try {
    const r = await $fetch<any>('/api/hr/biometric', { method: 'POST', body: { action: 'reprocess_unmatched' } })
    await loadUnmatched()
    if (r.updated > 0) alert(`✅ ${r.updated} records matched and synced to attendance.`)
  } finally { reprocessing.value = false }
}

function copyUrl() {
  navigator.clipboard.writeText(admsUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ── Face Kiosk ─────────────────────────────────────────────
const kioskCopied   = ref(false)
const faceLoading   = ref(false)
const enrolledList  = ref<any[]>([])
const showFaceModal = ref(false)
const faceEnrollEmpId = ref<number | null>(null)

const kioskUrl = computed(() => {
  if (typeof window === 'undefined') return '/kiosk'
  return `${window.location.origin}/kiosk`
})

async function loadEnrolled() {
  faceLoading.value = true
  try {
    const res = await $fetch<any>('/api/hr/biometric/face-list')
    enrolledList.value = res.employees ?? []
  } finally { faceLoading.value = false }
}

function openFaceEnroll(empId: number | null) {
  faceEnrollEmpId.value = empId
  showFaceModal.value   = true
}

async function deleteFaceId(empId: number) {
  if (!confirm('Delete Face ID for this employee?')) return
  await $fetch('/api/hr/biometric/face-list', { method: 'POST', body: { action: 'delete', employee_id: empId } })
  await loadEnrolled()
}

function copyKioskUrl() {
  navigator.clipboard.writeText(kioskUrl.value)
  kioskCopied.value = true
  setTimeout(() => { kioskCopied.value = false }, 2000)
}

// ── Helpers ────────────────────────────────────────────────
function statusPill(s: string) {
  return s === 'online'
    ? 'flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400'
    : s === 'pending'
    ? 'flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400'
    : 'flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400'
}
function punchTypeLabel(t: number) {
  return ({ 0: 'Clock In', 1: 'Clock Out', 4: 'Break Out', 5: 'Break In' } as any)[t] ?? `Type ${t}`
}
function verifyLabel(t: number) {
  return ({ 0: 'Password', 1: 'Fingerprint', 4: 'RFID Card', 15: 'Face' } as any)[t] ?? `Mode ${t}`
}
function relativeTime(dt: string) {
  const diff = (Date.now() - new Date(dt).getTime()) / 1000
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const brandGuides = [
  {
    name: 'ZKTeco', emoji: '🔵', models: 'ZK4500, SpeedFace V5L, K40, UFace, ZK9500…',
    steps: [
      'Press Menu → Comm → Cloud Service (or ADMS)',
      'Enable ADMS: ON',
      `Server Address: ${typeof window !== 'undefined' ? window.location.hostname : 'yourdomain.com'}`,
      'Server Port: 80',
      'URL Path: /api/device/adms',
      'Save → device reboots and connects automatically'
    ],
    note: 'Older ZKTeco firmware (v6.60) uses fixed path /iclock/cdata — add a Nuxt server route rewrite or proxy if needed.'
  },
  {
    name: 'Hikvision', emoji: '🔴', models: 'DS-K1T671, DS-K1T341, DS-K1T671TM…',
    steps: [
      'Open Device Web UI → Configuration → Network → Advanced Settings',
      'Enable iClock protocol',
      `Server Address: ${typeof window !== 'undefined' ? window.location.hostname : 'yourdomain.com'}`,
      'URL: /api/device/adms',
      'Port: 80',
      'Click Save — device registers on next heartbeat'
    ]
  },
  {
    name: 'Dahua', emoji: '🟠', models: 'ASI7213Y-T1, ASI3214H, DHI-ASI…',
    steps: [
      'Login to device Web UI → Setup → Network → ATDM',
      'Enable ATDM/iClock: ON',
      `Server IP/Domain: ${typeof window !== 'undefined' ? window.location.hostname : 'yourdomain.com'}`,
      'Server Port: 80',
      'Path: /api/device/adms',
      'Save configuration'
    ]
  },
  {
    name: 'eSSL / Realand', emoji: '🟢', models: 'X990, G3, X-628, eTime Track…',
    steps: [
      'Menu → Setup → Comm Settings → Cloud Service',
      `Server: ${typeof window !== 'undefined' ? window.location.hostname : 'yourdomain.com'}`,
      'Port: 80',
      'URL: /api/device/adms',
      'Enable push: ON → Save and reconnect'
    ],
    note: 'eSSL devices are ZKTeco OEMs — same protocol, identical setup.'
  },
  {
    name: 'FingerTec', emoji: '⚫', models: 'TA200 Plus, R2 Mark II, Kadex, Q2i…',
    steps: [
      'Login to TCMS V3 software or device web UI',
      'Device Settings → Connection → Cloud Server',
      `Server URL: http://${typeof window !== 'undefined' ? window.location.hostname : 'yourdomain.com'}/api/device/adms`,
      'Enable cloud sync: YES → Apply'
    ]
  },
  {
    name: 'Anviz', emoji: '🟣', models: 'CrossChex Cloud, EP300, M5, T5 Pro…',
    steps: [
      'Menu → System → Server Setting',
      'Connection type: TCP/IP → Cloud',
      `Server: ${typeof window !== 'undefined' ? window.location.hostname : 'yourdomain.com'}, Port: 80`,
      'URL: /api/device/adms'
    ],
    note: 'Anviz requires firmware v2.x+ for ADMS compatibility.'
  },
]
</script>

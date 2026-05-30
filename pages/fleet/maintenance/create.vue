<template>
  <div class="space-y-6 max-w-2xl mx-auto">
    <UiPageHeader title="Log Maintenance Request" :breadcrumb="['Fleet','Maintenance','Create']" />

    <form class="space-y-5" @submit.prevent="submit">
      <!-- Vehicle & Date -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Request Details</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Vehicle *</label>
            <select v-model="form.vehicle_id" class="form-input" required>
              <option value="">— Select vehicle —</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.registration_no }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Request Date *</label>
            <input v-model="form.request_date" type="date" class="form-input" required />
          </div>
          <div>
            <label class="form-label">Repair Type</label>
            <select v-model="form.repair_type" class="form-input">
              <option value="corrective">Corrective (breakdown repair)</option>
              <option value="preventive">Preventive (scheduled service)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Station / Workshop</label>
            <input v-model="form.station_supplier" class="form-input" placeholder="Workshop or supplier name" />
          </div>
          <div>
            <label class="form-label">Odometer Reading (km)</label>
            <input v-model="form.odometer_at_request" type="number" class="form-input" placeholder="Current km reading" />
          </div>
        </div>
        <div>
          <label class="form-label">Issue Description</label>
          <textarea v-model="form.issue_description" class="form-input" rows="3" placeholder="Describe the problem or service needed…" />
        </div>
      </div>

      <!-- Repair Tasks -->
      <div class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="section-title">Repair Tasks</h3>
          <button type="button" @click="addTask" class="btn-secondary text-xs">+ Add Task</button>
        </div>
        <div v-for="(task, i) in form.tasks" :key="i" class="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.03]">
          <div class="col-span-3">
            <label class="form-label">Description *</label>
            <input v-model="task.description" class="form-input" placeholder="e.g. Replace brake pads" required />
          </div>
          <div>
            <label class="form-label">Service Cost ৳</label>
            <input v-model="task.service_cost" type="number" step="0.01" class="form-input" placeholder="0" />
          </div>
          <div class="flex items-end">
            <button type="button" @click="form.tasks.splice(i, 1)" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button>
          </div>
        </div>
        <div v-if="!form.tasks.length" class="text-center py-3 text-gray-600 text-xs">No tasks added</div>
      </div>

      <!-- Materials Used -->
      <div class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="section-title">Materials Used</h3>
          <button type="button" @click="addMaterial" class="btn-secondary text-xs">+ Add Material</button>
        </div>
        <div v-for="(mat, i) in form.materials" :key="i" class="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.03]">
          <div class="col-span-2">
            <label class="form-label">Item Name *</label>
            <input v-model="mat.item_name" class="form-input" placeholder="e.g. Engine Oil 5W30" required />
          </div>
          <div>
            <label class="form-label">Qty</label>
            <input v-model="mat.quantity" type="number" step="0.001" class="form-input" placeholder="1" />
          </div>
          <div>
            <label class="form-label">Unit Rate ৳</label>
            <input v-model="mat.unit_rate" type="number" step="0.01" class="form-input" placeholder="0" @input="calcMat(mat)" />
          </div>
          <div class="flex items-end">
            <button type="button" @click="form.materials.splice(i, 1)" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button>
          </div>
        </div>
        <div v-if="!form.materials.length" class="text-center py-3 text-gray-600 text-xs">No materials added</div>

        <!-- Cost summary -->
        <div v-if="totalCost > 0" class="flex justify-end pt-2 border-t border-white/[0.06]">
          <p class="text-sm font-bold text-gray-200">Estimated Total: ৳{{ totalCost.toLocaleString() }}</p>
        </div>
      </div>

      <div>
        <label class="form-label">Notes</label>
        <textarea v-model="form.notes" class="form-input" rows="2" placeholder="Additional notes…" />
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <div class="flex gap-3">
        <button type="submit" class="btn-gold" :disabled="loading">{{ loading ? 'Saving…' : 'Create Request' }}</button>
        <NuxtLink to="/fleet/maintenance" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router  = useRouter()
const route   = useRoute()
const loading = ref(false)
const error   = ref('')

const { data: vData } = await useFetch('/api/fleet/vehicles')
const vehicles = computed(() => (vData.value as any)?.vehicles ?? [])

const form = reactive({
  vehicle_id:          route.query.vehicle_id || '',
  request_date:        new Date().toISOString().slice(0, 10),
  repair_type:         'corrective',
  station_supplier:    '',
  issue_description:   '',
  odometer_at_request: '',
  notes:               '',
  tasks:     [] as any[],
  materials: [] as any[],
})

function addTask()     { form.tasks.push({ description: '', service_cost: '' }) }
function addMaterial() { form.materials.push({ item_name: '', quantity: 1, unit_rate: '', amount: 0 }) }
function calcMat(mat: any) {
  mat.amount = (Number(mat.quantity) || 0) * (Number(mat.unit_rate) || 0)
}

const totalCost = computed(() => {
  const taskCost = form.tasks.reduce((s, t) => s + (Number(t.service_cost) || 0), 0)
  const matCost  = form.materials.reduce((s, m) => s + (Number(m.quantity) * Number(m.unit_rate) || 0), 0)
  return taskCost + matCost
})

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    const res = await $fetch('/api/fleet/maintenance', { method: 'POST', body: form }) as any
    router.push(`/fleet/maintenance/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to create maintenance request'
  } finally {
    loading.value = false
  }
}
</script>

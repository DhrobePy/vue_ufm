<template>
  <div class="space-y-6">
    <UiPageHeader title="Preventive Maintenance Rules" :breadcrumb="['Fleet','Maintenance','PM Rules']">
      <template #actions>
        <button @click="openCreate" class="btn-gold text-xs">+ Add Rule</button>
      </template>
    </UiPageHeader>

    <!-- Stats Bar -->
    <div class="grid grid-cols-3 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gold-400">{{ rules.length }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Rules</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ rules.filter(r => r.is_active).length }}</p>
        <p class="text-xs text-gray-500 mt-1">Active Rules</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gray-400">{{ rules.filter(r => !r.is_active).length }}</p>
        <p class="text-xs text-gray-500 mt-1">Inactive Rules</p>
      </div>
    </div>

    <!-- Rules Table -->
    <div class="glass-card p-5">
      <div v-if="!rules.length" class="text-center py-10 text-gray-600 text-sm">
        No preventive maintenance rules configured yet.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="pb-3 text-left text-gray-500 font-medium">Rule Name</th>
            <th class="pb-3 text-left text-gray-500 font-medium">Vehicle Type</th>
            <th class="pb-3 text-right text-gray-500 font-medium">Interval (km)</th>
            <th class="pb-3 text-right text-gray-500 font-medium">Interval (days)</th>
            <th class="pb-3 text-left text-gray-500 font-medium">Description</th>
            <th class="pb-3 text-center text-gray-500 font-medium">Status</th>
            <th class="pb-3 text-right text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in rules" :key="rule.id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
            <td class="py-3 font-medium text-gray-200">{{ rule.rule_name }}</td>
            <td class="py-3 text-gray-400">{{ rule.vehicle_type || 'All Types' }}</td>
            <td class="py-3 text-right text-gray-300">{{ rule.interval_km ? Number(rule.interval_km).toLocaleString() + ' km' : '—' }}</td>
            <td class="py-3 text-right text-gray-300">{{ rule.interval_days ? rule.interval_days + ' days' : '—' }}</td>
            <td class="py-3 text-gray-500 max-w-xs truncate">{{ rule.description || '—' }}</td>
            <td class="py-3 text-center">
              <button @click="toggleActive(rule)" class="badge text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
                :class="rule.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'">
                {{ rule.is_active ? 'Active' : 'Inactive' }}
              </button>
            </td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openEdit(rule)" class="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                <button @click="deleteRule(rule)" class="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="glass-card p-6 w-full max-w-lg mx-4 space-y-4">
          <h3 class="section-title">{{ editing ? 'Edit Rule' : 'Add Preventive Maintenance Rule' }}</h3>

          <form @submit.prevent="saveRule" class="space-y-4">
            <div>
              <label class="form-label">Rule Name *</label>
              <input v-model="form.rule_name" class="form-input" required placeholder="e.g. Engine Oil Change" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Vehicle Type</label>
                <select v-model="form.vehicle_type" class="form-input">
                  <option value="">All Types</option>
                  <option v-for="t in vehicleTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Status</label>
                <select v-model="form.is_active" class="form-input">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Interval (km)</label>
                <input v-model="form.interval_km" type="number" class="form-input" placeholder="5000" />
              </div>
              <div>
                <label class="form-label">Interval (days)</label>
                <input v-model="form.interval_days" type="number" class="form-input" placeholder="90" />
              </div>
            </div>

            <div>
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-input" rows="2" placeholder="Describe what this maintenance involves…" />
            </div>

            <div v-if="formError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ formError }}</div>

            <div class="flex gap-3 pt-1">
              <button type="submit" class="btn-gold" :disabled="saving">{{ saving ? 'Saving…' : (editing ? 'Update Rule' : 'Add Rule') }}</button>
              <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const vehicleTypes = ['TRUCK','PICKUP','VAN','MINI_TRUCK','AIRPORT_SHUTTLE','OTHER']

const { data, refresh } = await useFetch('/api/fleet/maintenance/rules')
const rules = computed(() => (data.value as any)?.rules ?? [])

const showModal = ref(false)
const editing   = ref<any>(null)
const saving    = ref(false)
const formError = ref('')

const form = reactive({
  rule_name:    '',
  vehicle_type: '',
  interval_km:  '' as any,
  interval_days: '' as any,
  description:  '',
  is_active:    true,
})

function resetForm() {
  form.rule_name = ''; form.vehicle_type = ''; form.interval_km = ''; form.interval_days = ''; form.description = ''; form.is_active = true
}

function openCreate() {
  editing.value = null
  resetForm()
  formError.value = ''
  showModal.value = true
}

function openEdit(rule: any) {
  editing.value = rule
  form.rule_name    = rule.rule_name    ?? ''
  form.vehicle_type = rule.vehicle_type ?? ''
  form.interval_km  = rule.interval_km  ?? ''
  form.interval_days = rule.interval_days ?? ''
  form.description  = rule.description  ?? ''
  form.is_active    = !!rule.is_active
  formError.value   = ''
  showModal.value   = true
}

function closeModal() {
  showModal.value = false
  editing.value   = null
}

async function saveRule() {
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await $fetch(`/api/fleet/maintenance/rules/${editing.value.id}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/fleet/maintenance/rules', { method: 'POST', body: form })
    }
    closeModal()
    refresh()
  } catch (e: any) {
    formError.value = e?.data?.message || e?.message || 'Failed to save rule'
  } finally {
    saving.value = false
  }
}

async function toggleActive(rule: any) {
  await $fetch(`/api/fleet/maintenance/rules/${rule.id}`, {
    method: 'PUT',
    body: { ...rule, is_active: !rule.is_active },
  })
  refresh()
}

async function deleteRule(rule: any) {
  if (!confirm(`Delete rule "${rule.rule_name}"? This cannot be undone.`)) return
  await $fetch(`/api/fleet/maintenance/rules/${rule.id}`, { method: 'DELETE' })
  refresh()
}
</script>

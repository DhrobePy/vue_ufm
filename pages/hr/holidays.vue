<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">Company Holidays</h1>
        <p class="text-sm text-gray-400">{{ holidays.length }} holidays</p>
      </div>
      <button @click="showCreate = true" class="btn-primary flex items-center gap-2">
        <span>+</span> Add Holiday
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Date</th>
              <th class="th">Holiday Name</th>
              <th class="th">Description</th>
              <th class="th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in holidays" :key="h.id" class="tr">
              <td class="td text-gray-200 font-medium">{{ fmtDate(h.holiday_date) }}</td>
              <td class="td text-gray-300">{{ h.holiday_name }}</td>
              <td class="td text-gray-500 text-xs">{{ h.description || '—' }}</td>
              <td class="td text-right">
                <button @click="deleteHoliday(h.id)" class="btn-xs badge-red text-xs px-2 py-0.5 rounded">Delete</button>
              </td>
            </tr>
            <tr v-if="!holidays.length">
              <td colspan="4" class="td text-center text-gray-500 py-10">No holidays configured.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-box w-full max-w-sm">
          <h2 class="text-lg font-bold text-white mb-5">Add Holiday</h2>
          <form @submit.prevent="createHoliday" class="space-y-4">
            <div>
              <label class="label">Date *</label>
              <input v-model="cForm.date" type="date" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Holiday Name *</label>
              <input v-model="cForm.name" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Description</label>
              <input v-model="cForm.description" class="input-field w-full" />
            </div>
            <div v-if="cErr" class="text-sm text-red-400">{{ cErr }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="cSaving" class="btn-primary">
                {{ cSaving ? 'Adding…' : 'Add' }}
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

const { data, refresh } = await useFetch('/api/hr/holidays')
const holidays = computed(() => (data.value as any)?.holidays ?? [])

async function deleteHoliday(id: number) {
  if (!confirm('Delete this holiday?')) return
  await $fetch('/api/hr/holidays', { method: 'POST', body: { action: 'delete', id } })
  await refresh()
}

const showCreate = ref(false)
const cSaving    = ref(false)
const cErr       = ref('')
const cForm = ref({ date: '', name: '', description: '' })

async function createHoliday() {
  cSaving.value = true; cErr.value = ''
  try {
    await $fetch('/api/hr/holidays', {
      method: 'POST',
      body: { action: 'create', holiday_date: cForm.value.date, holiday_name: cForm.value.name, description: cForm.value.description },
    })
    showCreate.value = false
    cForm.value = { date: '', name: '', description: '' }
    await refresh()
  } catch (e: any) {
    cErr.value = e?.data?.statusMessage || 'Failed to add holiday.'
  } finally { cSaving.value = false }
}

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '—'
</script>

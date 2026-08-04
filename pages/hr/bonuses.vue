<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">Bonus Management</h1>
          <p class="text-sm text-gray-400">Festival & performance bonuses</p>
        </div>
      </div>
      <button @click="showCreate = true" class="btn-primary">+ New Batch</button>
    </div>

    <!-- Batch list -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Batch Name</th>
              <th class="th">Type</th>
              <th class="th">Method</th>
              <th class="th text-right">Total Amount</th>
              <th class="th">Disburse Date</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in batches" :key="b.id" class="tr">
              <td class="td text-gray-200 font-medium">{{ b.name }}</td>
              <td class="td text-gray-400">{{ b.bonus_type }}</td>
              <td class="td text-gray-400">{{ b.calc_method }} {{ b.calc_value }}{{ b.calc_method === 'percent' ? '%' : '' }}</td>
              <td class="td text-right text-amber-400 font-semibold">৳{{ fmt(b.total_amount) }}</td>
              <td class="td text-gray-400">{{ b.disburse_date ? fmtDate(b.disburse_date) : '—' }}</td>
              <td class="td text-center">
                <span :class="statusBadge(b.status)" class="text-xs">{{ b.status }}</span>
              </td>
              <td class="td text-right">
                <div class="flex justify-end gap-1">
                  <button v-if="b.status === 'draft'" @click="generate(b.id)" class="btn-xs">Generate</button>
                  <button v-if="b.status === 'approved'" @click="payBatch(b.id)" class="btn-xs badge-green text-xs px-2 py-0.5 rounded">Pay All</button>
                  <NuxtLink :to="`/hr/bonuses/${b.id}`" class="btn-xs">Detail</NuxtLink>
                  <button v-if="b.status === 'draft'" @click="deleteBatch(b.id)" class="btn-xs text-red-400">Del</button>
                </div>
              </td>
            </tr>
            <tr v-if="!batches.length">
              <td colspan="7" class="td text-center text-gray-500 py-10">No bonus batches yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Batch Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-box w-full max-w-md">
          <h2 class="text-lg font-bold text-white mb-5">New Bonus Batch</h2>
          <form @submit.prevent="createBatch" class="space-y-4">
            <div>
              <label class="label">Batch Name *</label>
              <input v-model="bForm.name" type="text" required class="input-field w-full" placeholder="e.g. Eid Bonus 2025" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Bonus Type</label>
                <select v-model="bForm.bonus_type" class="input-field w-full">
                  <option value="festival">Festival</option>
                  <option value="performance">Performance</option>
                  <option value="annual">Annual</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label class="label">Calc Method</label>
                <select v-model="bForm.calc_method" class="input-field w-full">
                  <option value="flat">Flat Amount</option>
                  <option value="percent">% of Gross</option>
                </select>
              </div>
            </div>
            <div>
              <label class="label">{{ bForm.calc_method === 'percent' ? 'Percentage (%)' : 'Amount (৳)' }} *</label>
              <input v-model.number="bForm.calc_value" type="number" min="0" step="0.01" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Disburse Date</label>
              <input v-model="bForm.disburse_date" type="date" class="input-field w-full" />
            </div>
            <div>
              <label class="label">Notes</label>
              <textarea v-model="bForm.notes" rows="2" class="input-field w-full"></textarea>
            </div>
            <div v-if="err" class="text-red-400 text-sm rounded bg-red-500/10 p-2">{{ err }}</div>
            <div class="flex justify-end gap-3 pt-1">
              <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Creating…' : 'Create Batch' }}
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

const { data, refresh } = await useFetch('/api/hr/bonuses')
const batches = computed(() => (data.value as any)?.batches ?? [])

const showCreate = ref(false)
const saving     = ref(false)
const err        = ref('')
const bForm      = ref({ name: '', bonus_type: 'festival', calc_method: 'flat', calc_value: 0, disburse_date: '', notes: '' })

async function createBatch() {
  saving.value = true; err.value = ''
  try {
    await $fetch('/api/hr/bonuses', { method: 'POST', body: { action: 'create_batch', ...bForm.value } })
    showCreate.value = false
    await refresh()
  } catch (e: any) { err.value = e?.data?.statusMessage || 'Failed' }
  finally { saving.value = false }
}

async function generate(batchId: number) {
  if (!confirm('Generate employee bonuses from this batch?')) return
  await $fetch('/api/hr/bonuses', { method: 'POST', body: { action: 'generate', batch_id: batchId } })
  await refresh()
}

async function payBatch(batchId: number) {
  if (!confirm('Mark all bonuses in this batch as paid?')) return
  await $fetch('/api/hr/bonuses', { method: 'POST', body: { action: 'pay_batch', batch_id: batchId } })
  await refresh()
}

async function deleteBatch(id: number) {
  if (!confirm('Delete this bonus batch?')) return
  await $fetch('/api/hr/bonuses', { method: 'POST', body: { action: 'delete_batch', id } })
  await refresh()
}

const fmt     = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const statusBadge = (s: string) => ({
  draft:    'badge-yellow',
  approved: 'badge-blue',
  paid:     'badge-green',
} as Record<string, string>)[s] || 'badge-gray'
</script>

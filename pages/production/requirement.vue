<template>
  <div class="space-y-6">
    <UiPageHeader title="Today's Production Requirement" subtitle="What's needed vs what's in hand and produced"
                  :breadcrumb="['Production', 'Requirement']" />

    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <label class="text-xs text-gray-500">Date</label>
      <input v-model="date" type="date" class="input-glass w-auto text-xs" />
      <template v-if="branches.length">
        <label class="text-xs text-gray-500 ml-2">Branch</label>
        <select v-model="branchFilter" class="input-glass w-auto text-xs">
          <option value="">All Branches</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </template>
      <span v-if="lockedToBranch" class="text-xs text-gray-600 ml-2">Scoped to your branch</span>
      <button @click="refresh" class="btn-ghost text-xs ml-auto">↻ Refresh</button>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="glass-card p-5">
      <div v-if="!rows.length" class="text-xs text-gray-600 text-center py-8">No orders due on this date for the selected scope.</div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th v-if="!branchFilter && !lockedToBranch" class="pb-2 text-left text-gray-500">Branch</th>
            <th class="pb-2 text-left text-gray-500">Product</th>
            <th class="pb-2 text-right text-gray-500">Required</th>
            <th class="pb-2 text-right text-gray-500">In Hand</th>
            <th class="pb-2 text-right text-gray-500">Produced</th>
            <th class="pb-2 text-right text-gray-500">Still Needed</th>
            <th v-if="canEdit" class="pb-2 text-right text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="`${r.branch_id}-${r.variant_id}`"
              class="border-b border-white/[0.03]" :class="r.still_needed_bags > 0 ? 'bg-red-500/[0.03]' : ''">
            <td v-if="!branchFilter && !lockedToBranch" class="py-2 text-gray-400">{{ r.branch_name }}</td>
            <td class="py-2 text-gray-300">{{ r.product }}</td>
            <td class="py-2 text-right font-mono text-gray-300">
              {{ r.required_bags.toLocaleString() }}<span v-if="r.required_kg" class="text-gray-600"> ({{ r.required_kg.toLocaleString() }}kg)</span>
            </td>
            <td class="py-2 text-right font-mono text-gray-400">{{ r.in_hand_bags.toLocaleString() }}</td>
            <td class="py-2 text-right font-mono text-gray-400">{{ r.produced_bags.toLocaleString() }}</td>
            <td class="py-2 text-right font-mono font-semibold" :class="r.still_needed_bags > 0 ? 'text-red-400' : 'text-emerald-400'">
              {{ r.still_needed_bags.toLocaleString() }}<span v-if="r.still_needed_kg" class="text-gray-600"> ({{ r.still_needed_kg.toLocaleString() }}kg)</span>
            </td>
            <td v-if="canEdit" class="py-2 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <input v-model.number="inputs[rowKey(r)]" type="number" min="0" step="0.5" placeholder="qty"
                       class="input-glass w-16 text-xs py-1 px-1.5 text-right" />
                <button @click="submit(r, 'set_in_hand')" :disabled="saving === rowKey(r)"
                        class="btn-ghost text-[10px] py-1 px-1.5" title="Overwrite in-hand count">Set In-Hand</button>
                <button @click="submit(r, 'add_produced')" :disabled="saving === rowKey(r)"
                        class="btn-ghost text-[10px] py-1 px-1.5" title="Add to produced total">+ Produced</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()

const role = computed(() => (sessionUser.value?.role ?? '').toLowerCase())
const canEdit = computed(() =>
  ['admin', 'superadmin'].includes(role.value) || role.value.startsWith('production manager'))

const date = ref(new Date().toISOString().slice(0, 10))
const branchFilter = ref<number | ''>('')

const { data, pending, error, refresh } = await useFetch('/api/production/requirement', {
  query: computed(() => ({ date: date.value, branch_id: branchFilter.value || undefined })),
})

const rows            = computed(() => (data.value as any)?.rows ?? [])
const branches         = computed(() => (data.value as any)?.branches ?? [])
const lockedToBranch   = computed(() => (data.value as any)?.locked_to_branch ?? false)

const inputs = reactive<Record<string, number | null>>({})
const saving = ref<string | null>(null)
function rowKey(r: any) { return `${r.branch_id}-${r.variant_id}` }

async function submit(r: any, action: 'set_in_hand' | 'add_produced') {
  const key = rowKey(r)
  const qty = inputs[key]
  if (qty === null || qty === undefined || qty < 0) { toastError('Enter a quantity first'); return }
  saving.value = key
  try {
    await $fetch('/api/production/requirement', {
      method: 'POST',
      body: { date: date.value, branch_id: r.branch_id, variant_id: r.variant_id, action, qty },
    })
    inputs[key] = null
    success(action === 'set_in_hand' ? 'In-hand count updated' : 'Produced qty added')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage || 'Failed to save')
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Fleet Inventory" subtitle="Parts, supplies, and stock management" :breadcrumb="['Fleet','Items']">
      <template #actions>
        <button @click="showCreate = true" class="btn-gold text-xs">+ Add Item</button>
      </template>
    </UiPageHeader>

    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input v-model="search" type="text" placeholder="Search item name, code…" class="form-input pl-9" />
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="px-4 py-3 text-left text-gray-500">Code</th>
            <th class="px-4 py-3 text-left text-gray-500">Item Name</th>
            <th class="px-4 py-3 text-left text-gray-500">Category</th>
            <th class="px-4 py-3 text-left text-gray-500">Unit</th>
            <th class="px-4 py-3 text-right text-gray-500">Stock</th>
            <th class="px-4 py-3 text-right text-gray-500">Reorder Level</th>
            <th class="px-4 py-3 text-right text-gray-500">Unit Cost ৳</th>
            <th class="px-4 py-3 text-left text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
            <td class="px-4 py-3 font-mono text-gray-400">{{ item.item_code || '—' }}</td>
            <td class="px-4 py-3 font-medium text-gray-200">{{ item.item_name }}</td>
            <td class="px-4 py-3 text-gray-400">{{ item.category_name || '—' }}</td>
            <td class="px-4 py-3 text-gray-400">{{ item.unit }}</td>
            <td class="px-4 py-3 text-right font-medium" :class="Number(item.current_stock) <= Number(item.reorder_level) ? 'text-red-400' : 'text-gray-200'">
              {{ Number(item.current_stock).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-right text-gray-500">{{ Number(item.reorder_level).toFixed(2) }}</td>
            <td class="px-4 py-3 text-right text-gray-300">{{ item.unit_cost ? '৳' + Number(item.unit_cost).toFixed(2) : '—' }}</td>
            <td class="px-4 py-3">
              <span class="badge text-[10px]" :class="Number(item.current_stock) <= Number(item.reorder_level) ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'">
                {{ Number(item.current_stock) <= Number(item.reorder_level) ? 'Low Stock' : 'In Stock' }}
              </span>
            </td>
          </tr>
          <tr v-if="!filteredItems.length">
            <td colspan="8" class="px-4 py-12 text-center text-gray-600">No items found. Add your first fleet inventory item.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7)">
        <div class="glass-card p-6 w-full max-w-md space-y-4" style="background:rgba(18,18,20,0.98)">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-200">Add Fleet Item</h3>
            <button @click="showCreate = false" class="text-gray-500 hover:text-gray-300">✕</button>
          </div>
          <form @submit.prevent="createItem" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Item Code</label>
                <input v-model="newItem.item_code" class="form-input" placeholder="PART-001" />
              </div>
              <div>
                <label class="form-label">Unit</label>
                <select v-model="newItem.unit" class="form-input">
                  <option>pcs</option><option>litre</option><option>kg</option><option>set</option><option>pair</option><option>box</option><option>roll</option>
                </select>
              </div>
            </div>
            <div>
              <label class="form-label">Item Name *</label>
              <input v-model="newItem.item_name" class="form-input" required />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Reorder Level</label>
                <input v-model="newItem.reorder_level" type="number" step="0.001" class="form-input" placeholder="5" />
              </div>
              <div>
                <label class="form-label">Unit Cost ৳</label>
                <input v-model="newItem.unit_cost" type="number" step="0.01" class="form-input" placeholder="0" />
              </div>
            </div>
            <div v-if="createError" class="p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">{{ createError }}</div>
            <div class="flex gap-2 pt-1">
              <button type="submit" class="btn-gold text-xs" :disabled="creating">{{ creating ? 'Saving…' : 'Save Item' }}</button>
              <button type="button" @click="showCreate = false" class="btn-secondary text-xs">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search     = ref('')
const showCreate = ref(false)
const creating   = ref(false)
const createError = ref('')

const { data, refresh } = await useFetch('/api/fleet/items')
const items = computed(() => (data.value as any)?.items ?? [])

const filteredItems = computed(() => {
  const q = search.value.toLowerCase()
  return (items.value as any[]).filter((i: any) =>
    (i.item_name || '').toLowerCase().includes(q) || (i.item_code || '').toLowerCase().includes(q)
  )
})

const newItem = reactive({
  item_code: '', item_name: '', unit: 'pcs',
  reorder_level: '', unit_cost: '',
})

async function createItem() {
  creating.value = true; createError.value = ''
  try {
    await $fetch('/api/fleet/items', { method: 'POST', body: newItem })
    showCreate.value = false
    Object.assign(newItem, { item_code: '', item_name: '', unit: 'pcs', reorder_level: '', unit_cost: '' })
    refresh()
  } catch (e: any) {
    createError.value = e?.data?.message || 'Failed to save'
  } finally { creating.value = false }
}
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <UiPageHeader title="New Purchase Order" :breadcrumb="['Fleet','Purchases','New PO']">
      <template #actions>
        <NuxtLink to="/fleet/purchases" class="btn-secondary text-xs">← Back</NuxtLink>
      </template>
    </UiPageHeader>

    <form class="space-y-5" @submit.prevent="submit">
      <!-- Header Info -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Purchase Order Details</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Purchase Date *</label>
            <input v-model="form.purchase_date" type="date" class="form-input" required />
          </div>
          <div>
            <label class="form-label">Supplier Name</label>
            <input v-model="form.supplier_name" class="form-input" placeholder="Supplier / Vendor name" />
          </div>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea v-model="form.notes" class="form-input" rows="2" placeholder="Purchase notes or reference…" />
        </div>
      </div>

      <!-- Items -->
      <div class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="section-title">Items</h3>
          <button type="button" @click="addItem" class="btn-secondary text-xs">+ Add Item</button>
        </div>

        <div v-for="(item, i) in form.items" :key="i" class="grid grid-cols-12 gap-3 p-3 rounded-xl bg-white/[0.03]">
          <!-- Item selection -->
          <div class="col-span-4">
            <label class="form-label">Item</label>
            <select v-model="item.item_id" class="form-input" @change="onItemSelect(item)">
              <option value="">— Custom / Other —</option>
              <option v-for="it in fleetItems" :key="it.id" :value="it.id">{{ it.item_name }}</option>
            </select>
          </div>
          <!-- Custom name (if no item selected) -->
          <div class="col-span-4" v-if="!item.item_id">
            <label class="form-label">Item Name *</label>
            <input v-model="item.item_name" class="form-input" required placeholder="e.g. Engine Oil 5W-30" />
          </div>
          <div class="col-span-4" v-else>
            <label class="form-label">Item Name</label>
            <input :value="item.item_name" class="form-input bg-white/[0.02] cursor-not-allowed" disabled />
          </div>
          <!-- Qty -->
          <div class="col-span-2">
            <label class="form-label">Qty *</label>
            <input v-model="item.quantity" type="number" step="0.001" class="form-input" required @input="calcAmount(item)" />
          </div>
          <!-- Rate -->
          <div class="col-span-2">
            <label class="form-label">Rate ৳</label>
            <input v-model="item.unit_rate" type="number" step="0.01" class="form-input" @input="calcAmount(item)" />
          </div>
          <!-- Remove -->
          <div class="col-span-12 flex justify-between items-center">
            <span class="text-xs text-gray-500">
              Amount: <span class="text-gold-400 font-medium">৳{{ fmt(item.amount) }}</span>
            </span>
            <button type="button" @click="form.items.splice(i, 1)" class="text-xs text-red-400 hover:text-red-300">Remove</button>
          </div>
        </div>

        <div v-if="!form.items.length" class="text-center py-4 text-gray-600 text-xs">No items added yet. Click "+ Add Item" to begin.</div>

        <!-- Total -->
        <div v-if="form.items.length" class="flex justify-end border-t border-white/[0.06] pt-3">
          <div class="text-right">
            <p class="text-xs text-gray-500">Total Amount</p>
            <p class="text-xl font-bold text-gold-400">৳{{ fmt(totalAmount) }}</p>
          </div>
        </div>
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <div class="flex gap-3">
        <button type="submit" class="btn-gold" :disabled="loading || !form.items.length">
          {{ loading ? 'Creating…' : 'Create Purchase Order' }}
        </button>
        <NuxtLink to="/fleet/purchases" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router  = useRouter()
const loading = ref(false)
const error   = ref('')

const { data: itemsData } = await useFetch('/api/fleet/items')
const fleetItems = computed(() => (itemsData.value as any)?.items ?? [])

const form = reactive({
  purchase_date: new Date().toISOString().slice(0, 10),
  supplier_name: '',
  notes: '',
  items: [] as any[],
})

function addItem() {
  form.items.push({ item_id: '', item_name: '', quantity: '', unit_rate: '', amount: 0 })
}

function onItemSelect(item: any) {
  const found = (fleetItems.value as any[]).find((it: any) => it.id === Number(item.item_id))
  if (found) {
    item.item_name = found.item_name
    item.unit_rate = found.unit_cost || ''
    calcAmount(item)
  } else {
    item.item_name = ''
    item.unit_rate = ''
    item.amount = 0
  }
}

function calcAmount(item: any) {
  item.amount = (Number(item.quantity) || 0) * (Number(item.unit_rate) || 0)
}

const totalAmount = computed(() =>
  (form.items as any[]).reduce((s, i) => s + Number(i.amount || 0), 0)
)

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    const res = await $fetch('/api/fleet/purchases', { method: 'POST', body: form }) as any
    router.push(`/fleet/purchases/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to create purchase order'
  } finally {
    loading.value = false
  }
}
</script>

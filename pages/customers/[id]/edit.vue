<template>
  <div class="space-y-6">
    <UiPageHeader :title="`Edit Customer — ${customer?.name ?? '…'}`"
                  :breadcrumb="['Customers', customer?.name ?? '…', 'Edit']">
      <template #actions>
        <NuxtLink :to="`/customers/${route.params.id}`" class="btn-ghost text-xs">← Back to Profile</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">
        <!-- Basic info -->
        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">Basic Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer Name *</label>
              <input v-model="form.name" type="text" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business / Trade Name</label>
              <input v-model="form.business" type="text" class="input-glass" placeholder="e.g. Rahim Traders Ltd." />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone *</label>
              <input v-model="form.phone" type="tel" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
              <select v-model="form.status" class="input-glass">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Address</label>
            <textarea v-model="form.address" rows="3" class="input-glass resize-none" />
          </div>
        </div>

        <!-- Customer type -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Customer Type</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button @click="form.type = 'Credit'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.type === 'Credit'
                  ? 'bg-gold-500/10 border-gold-500/40'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20']">
              <p :class="['text-sm font-semibold', form.type === 'Credit' ? 'text-gold-300' : 'text-gray-300']">Credit Customer</p>
              <p class="text-xs text-gray-500 mt-1">Buys on credit with payment terms</p>
            </button>
            <button @click="form.type = 'POS'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.type === 'POS'
                  ? 'bg-blue-500/10 border-blue-500/40'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20']">
              <p :class="['text-sm font-semibold', form.type === 'POS' ? 'text-blue-300' : 'text-gray-300']">POS Customer</p>
              <p class="text-xs text-gray-500 mt-1">Walk-in counter sales</p>
            </button>
          </div>
        </div>

        <!-- Credit terms (only if Credit) -->
        <div v-if="form.type === 'Credit'" class="glass-card p-6 space-y-4">
          <h3 class="section-title">Credit Terms</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Limit (৳) *</label>
              <input v-model.number="form.creditLimit" type="number" class="input-glass font-mono" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Terms (days)</label>
              <input v-model.number="form.paymentTerms" type="number" min="7" max="90" class="input-glass font-mono" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue Limit (৳)</label>
              <input v-model.number="form.overdueLimit" type="number" class="input-glass font-mono" />
            </div>
          </div>
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.blockOnOverdue" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
            </label>
            <span class="text-sm text-gray-300">Block new orders when overdue</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
          <NuxtLink :to="`/customers/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="text-sm font-semibold text-gray-300">Current Summary</h3>
        <div class="space-y-2.5 text-xs">
          <div class="flex justify-between"><span class="text-gray-600">Type</span><UiStatusBadge :status="customer?.customer_type ?? '—'" /></div>
          <div class="flex justify-between"><span class="text-gray-600">Status</span><UiStatusBadge :status="customer?.status ?? 'active'" /></div>
          <div class="flex justify-between"><span class="text-gray-600">Outstanding</span><span class="font-bold text-red-400">৳{{ Number(customer?.current_balance ?? 0).toLocaleString() }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Credit Limit</span><span class="text-gray-300">৳{{ Number(customer?.credit_limit ?? 0).toLocaleString() }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Since</span><span class="text-gray-400">{{ customer?.created_at?.slice(0, 10) ?? '—' }}</span></div>
        </div>

        <div class="pt-3 border-t border-white/[0.06]">
          <h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</h4>
          <div class="space-y-2">
            <NuxtLink :to="`/customers/${route.params.id}`" class="btn-ghost text-xs w-full justify-center">View Profile</NuxtLink>
            <NuxtLink :to="`/customers/${route.params.id}/index#ledger`" class="btn-ghost text-xs w-full justify-center">View Ledger</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error } = useToast()

const customerId = Number(route.params.id)

// Load customer data
const { data } = await useFetch(`/api/customers/${customerId}`)
const customer  = computed(() => (data.value as any)?.customer ?? {})

const form = reactive({
  name:           '',
  business:       '',
  phone:          '',
  address:        '',
  status:         'active',
  type:           'Credit',
  creditLimit:    0,
  paymentTerms:   30,
  overdueLimit:   500000,
  blockOnOverdue: true,
})

// Populate form from loaded data
watch(customer, (c) => {
  if (c?.id) {
    form.name        = c.name           ?? ''
    form.business    = c.business_name  ?? ''
    form.phone       = c.phone_number   ?? ''
    form.address     = c.business_address ?? ''
    form.status      = c.status         ?? 'active'
    form.type        = c.customer_type  ?? 'Credit'
    form.creditLimit = Number(c.credit_limit ?? 0)
  }
}, { immediate: true })

const saving = ref(false)

const isValid = computed(() => form.name && form.phone && (form.type !== 'Credit' || form.creditLimit >= 0))

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      body: {
        name:             form.name.trim(),
        business_name:    form.business  || null,
        phone_number:     form.phone,
        business_address: form.address   || null,
        customer_type:    form.type,
        credit_limit:     form.creditLimit,
        status:           form.status,
      },
    })
    success(`Customer ${form.name} updated successfully`)
    navigateTo(`/customers/${customerId}`)
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to update customer')
  } finally {
    saving.value = false
  }
}
</script>

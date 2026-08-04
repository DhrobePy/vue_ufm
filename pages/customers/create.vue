<template>
  <div class="space-y-6 max-w-3xl">
    <UiPageHeader title="Add Customer" :breadcrumb="['Customers','Add Customer']">
      <template #actions>
        <NuxtLink to="/customers" class="btn-ghost text-xs">← Cancel</NuxtLink>
      </template>
    </UiPageHeader>

    <form @submit.prevent="submit" class="space-y-6">
      <!-- Type selection -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="section-title">Customer Type</h3>
        <div class="grid grid-cols-2 gap-3">
          <label v-for="t in customerTypes" :key="t.value"
            :class="['flex flex-col gap-1.5 p-4 rounded-xl border cursor-pointer transition-all duration-150',
              form.type === t.value
                ? 'border-gold-500/40 bg-gold-500/08'
                : 'border-white/[0.08] hover:border-white/[0.14]']">
            <input type="radio" v-model="form.type" :value="t.value" class="sr-only" />
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ t.icon }}</span>
              <span :class="['font-semibold text-sm', form.type === t.value ? 'text-gold-400' : 'text-gray-300']">
                {{ t.label }}
              </span>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed">{{ t.desc }}</p>
          </label>
        </div>
      </div>

      <!-- Identity -->
      <div class="glass-card p-6 space-y-5">
        <h3 class="section-title">Customer Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name *</label>
            <input v-model="form.name" class="input-glass" placeholder="Customer or business name" required />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Name</label>
            <input v-model="form.business" class="input-glass" placeholder="Trading / company name" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone *</label>
            <input v-model="form.phone" class="input-glass" placeholder="+880…" required />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secondary Phone</label>
            <input v-model="form.phone2" class="input-glass" placeholder="+880…" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <input v-model="form.email" type="email" class="input-glass" placeholder="email@example.com" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">NID / Trade Licence</label>
            <input v-model="form.nid" class="input-glass" placeholder="National ID or licence number" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
            <input v-model="form.city" class="input-glass" placeholder="e.g. Sirajgonj" />
          </div>
          <div class="md:col-span-2 space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Address *</label>
            <textarea v-model="form.address" rows="2" class="input-glass resize-none" placeholder="Full address…" required />
          </div>
        </div>
      </div>

      <!-- Credit terms (Credit customers only) -->
      <div v-if="form.type === 'Credit'" class="glass-card p-6 space-y-4">
        <h3 class="section-title">Credit Terms</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Limit (৳) *</label>
            <input v-model.number="form.creditLimit" type="number" min="0" step="10000"
              class="input-glass" placeholder="e.g. 500000" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Terms (days)</label>
            <select v-model="form.paymentTerms" class="input-glass">
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Balance (৳)</label>
            <input v-model.number="form.initialDue" type="number" min="0" class="input-glass" placeholder="0" />
            <p class="text-[11px] text-gray-600">Existing outstanding balance from before system entry</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area / Route</label>
            <input v-model="form.area" class="input-glass" placeholder="e.g. Sirajgonj Sadar" />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <NuxtLink to="/customers" class="btn-ghost">Cancel</NuxtLink>
        <button type="submit" class="btn-gold" :disabled="submitting">
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          {{ submitting ? 'Saving…' : 'Save Customer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Real PHP customer types: Credit or POS (never "Cash")
const customerTypes = [
  {
    value: 'Credit',
    label: 'Credit Customer',
    icon: '📋',
    desc: 'Receives goods on credit with a set limit and payment terms. Tracked via ledger.',
  },
  {
    value: 'POS',
    label: 'POS Customer',
    icon: '🖥️',
    desc: 'Walk-in / counter sale customer. Payment collected at point of sale.',
  },
]

const { success, error: toastError } = useToast()
const submitting = ref(false)
const form = reactive({
  type:         'Credit',
  name:         '',
  business:     '',
  phone:        '',
  phone2:       '',
  email:        '',
  nid:          '',
  address:      '',
  city:         '',
  creditLimit:  0,
  paymentTerms: '30',
  initialDue:   0,
  area:         '',
})

async function submit() {
  if (!form.name.trim()) return
  submitting.value = true
  try {
    await $fetch('/api/customers', {
      method: 'POST',
      body: {
        name:             form.name.trim(),
        business_name:    form.business     || undefined,
        phone_number:     form.phone        || undefined,
        email:            form.email        || undefined,
        business_address: form.address      || undefined,
        customer_type:    form.type === 'POS' ? 'POS' : 'Credit',
        credit_limit:     form.type === 'Credit' ? form.creditLimit : 0,
        opening_balance:  form.initialDue || 0,
      },
    })
    success('Customer created successfully ✓')
    await navigateTo('/customers')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to create customer')
  } finally {
    submitting.value = false
  }
}
</script>

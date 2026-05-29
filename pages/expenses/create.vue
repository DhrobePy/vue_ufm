<template>
  <div class="space-y-6 max-w-2xl">
    <UiPageHeader title="Create Expense" :breadcrumb="['Expenses','Create']" />
    <div class="glass-card p-6 space-y-5">
      <h3 class="section-title">Expense Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date *</label>
          <input v-model="form.date" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category *</label>
          <select v-model="form.categoryId" class="input-glass" @change="form.subcategoryId = ''">
            <option value="">Select category…</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div v-if="selectedCategory?.subcategories?.length" class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub-category</label>
          <select v-model="form.subcategoryId" class="input-glass">
            <option value="">None</option>
            <option v-for="s in selectedCategory.subcategories" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Quantity</label>
          <input v-model.number="form.qty" type="number" class="input-glass" placeholder="e.g. litres, units" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Per Unit Cost (৳)</label>
          <input v-model.number="form.unitCost" type="number" class="input-glass" placeholder="0.00" />
        </div>
        <div class="md:col-span-2 p-4 rounded-xl" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Total Amount</span>
            <span class="font-bold text-gold-400 text-lg">৳{{ totalAmount.toLocaleString() }}</span>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</label>
          <select v-model="form.method" class="input-glass">
            <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Handled By</label>
          <input v-model="form.handledBy" class="input-glass" placeholder="Employee / person name" />
        </div>
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks *</label>
          <textarea v-model="form.remarks" rows="3" class="input-glass resize-none" placeholder="Describe the expense clearly…" />
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <NuxtLink to="/expenses" class="btn-ghost">Cancel</NuxtLink>
        <button @click="submit" :disabled="submitting || !isValid" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
          {{ submitting ? 'Submitting…' : 'Submit for Approval' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const form = reactive({
  date: new Date().toISOString().split('T')[0],
  categoryId: '' as string | number,
  subcategoryId: '' as string | number,
  qty: 1, unitCost: 0,
  method: 'Cash', handledBy: '', remarks: '',
})

const submitting = ref(false)
const methods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking']

// Load real expense categories
const { data: catData } = await useFetch('/api/expenses/categories')
const categories = computed(() => (catData.value?.categories ?? []) as any[])
const selectedCategory = computed(() =>
  categories.value.find(c => c.id === form.categoryId) ?? null
)

const totalAmount = computed(() => (form.qty || 1) * (form.unitCost || 0))
const isValid = computed(() => form.date && form.categoryId && form.remarks.trim())

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  try {
    const result = await $fetch('/api/expenses', {
      method: 'POST',
      body: {
        expense_date:      form.date,
        category_id:       form.categoryId,
        subcategory_id:    form.subcategoryId || null,
        unit_quantity:     form.qty,
        per_unit_cost:     form.unitCost,
        total_amount:      totalAmount.value,
        payment_method:    form.method,
        handled_by_person: form.handledBy || null,
        remarks:           form.remarks,
      },
    }) as any
    success(`Expense ${result.voucher_number} submitted for approval`)
    navigateTo('/expenses')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to create expense')
  } finally {
    submitting.value = false
  }
}
</script>

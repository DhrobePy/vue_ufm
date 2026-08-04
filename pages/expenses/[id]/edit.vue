<template>
  <div class="space-y-6 max-w-3xl">
    <UiPageHeader :title="`Edit ${exp?.voucher_number ?? 'Expense'}`" :breadcrumb="['Expenses', exp?.voucher_number ?? '', 'Edit']" />

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="!exp" class="glass-card p-6 text-center text-red-400 text-sm">Expense not found.</div>
    <div v-else-if="exp.status !== 'pending'" class="glass-card p-6 text-center text-orange-400 text-sm">
      This voucher is "{{ exp.status }}" — only pending vouchers can be edited.
    </div>

    <div v-else class="glass-card p-6 space-y-6">
      <div>
        <h3 class="section-title mb-4">Expense Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="field-label">Date *</label>
            <input v-model="form.date" type="date" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Branch</label>
            <select v-model="form.branchId" class="input-glass">
              <option value="">— Select branch —</option>
              <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Category *</label>
            <select v-model="form.categoryId" class="input-glass" @change="onCategoryChange">
              <option value="">Select category…</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Sub-category *</label>
            <select v-model="form.subcategoryId" class="input-glass" :disabled="!selectedCategory?.subcategories?.length">
              <option value="">— Select sub-category —</option>
              <option v-for="s in selectedCategory?.subcategories ?? []" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Unit Quantity</label>
            <input v-model.number="form.qty" type="number" min="0" step="0.01" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Per Unit Cost (৳)</label>
            <input v-model.number="form.unitCost" type="number" min="0" step="0.01" class="input-glass" />
          </div>
          <div class="md:col-span-2 p-4 rounded-xl flex justify-between items-center"
               style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);">
            <span class="text-xs text-gray-500">Total Amount</span>
            <input v-model.number="form.totalOverride" type="number" min="0" step="0.01"
                   class="font-bold text-gold-400 text-2xl font-mono bg-transparent text-right w-40 outline-none" />
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Handled By (Employee)</label>
            <select v-model="form.employeeId" class="input-glass">
              <option value="">— Select employee —</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.first_name }} {{ e.last_name }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Handled By (Free text)</label>
            <input v-model="form.handledBy" class="input-glass" />
          </div>
          <div class="md:col-span-2 space-y-1.5">
            <label class="field-label">Remarks *</label>
            <textarea v-model="form.remarks" rows="3" class="input-glass resize-none" />
          </div>
        </div>
      </div>

      <div>
        <h3 class="section-title mb-4">Payment Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2 space-y-1.5">
            <label class="field-label">Payment Method *</label>
            <div class="flex gap-3">
              <button type="button" @click="form.method = 'cash'; form.bankAccountId = ''"
                :class="['flex-1 py-3 rounded-xl border text-sm font-semibold transition-all',
                  form.method === 'cash' ? 'bg-green-500/15 border-green-500/50 text-green-300' : 'border-white/10 text-gray-500 hover:border-white/20']">
                💵 Cash / Petty Cash
              </button>
              <button type="button" @click="form.method = 'bank'; form.cashAccountId = ''"
                :class="['flex-1 py-3 rounded-xl border text-sm font-semibold transition-all',
                  form.method === 'bank' ? 'bg-blue-500/15 border-blue-500/50 text-blue-300' : 'border-white/10 text-gray-500 hover:border-white/20']">
                🏦 Bank / Cheque
              </button>
            </div>
          </div>
          <template v-if="form.method === 'cash'">
            <div class="md:col-span-2 space-y-1.5">
              <label class="field-label">Petty Cash Account *</label>
              <select v-model="form.cashAccountId" class="input-glass">
                <option value="">— Select petty cash account —</option>
                <option v-for="a in pettyCashAccounts" :key="a.id" :value="a.id">{{ a.account_name }} (৳{{ Number(a.current_balance).toLocaleString() }})</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="field-label">Reference / Receipt No.</label>
              <input v-model="form.paymentReference" class="input-glass" />
            </div>
          </template>
          <template v-if="form.method === 'bank'">
            <div class="space-y-1.5">
              <label class="field-label">Bank Account *</label>
              <select v-model="form.bankAccountId" class="input-glass">
                <option value="">— Select bank account —</option>
                <option v-for="a in bankAccounts" :key="a.id" :value="a.id">{{ a.bank_name }} – {{ a.account_name }} ({{ a.account_number }})</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="field-label">Cheque / Transaction Ref.</label>
              <input v-model="form.paymentReference" class="input-glass" />
            </div>
          </template>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2 border-t border-white/5">
        <NuxtLink :to="`/expenses/${exp.id}`" class="btn-ghost">Cancel</NuxtLink>
        <button @click="submit" :disabled="submitting || !isValid" class="btn-gold disabled:opacity-50">
          {{ submitting ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const route = useRoute()
const expenseId = computed(() => Number(route.params.id))

const { data, pending } = await useFetch(() => `/api/expenses/${expenseId.value}`)
const exp = computed<any>(() => (data.value as any)?.expense ?? null)

const [
  { data: catData }, { data: branchData }, { data: bankData },
  { data: empData }, { data: pettyData },
] = await Promise.all([
  useFetch('/api/expenses/categories', { query: { spend: false } }),
  useFetch('/api/branches'),
  useFetch('/api/bank-accounts'),
  useFetch('/api/hr/employees'),
  useFetch('/api/expenses/petty-cash-accounts'),
])
const categories        = computed(() => (catData.value?.categories  ?? []) as any[])
const branches          = computed(() => (branchData.value?.branches ?? []) as any[])
const bankAccounts      = computed(() => (bankData.value?.accounts   ?? []) as any[])
const employees         = computed(() => (empData.value?.employees   ?? []) as any[])
const pettyCashAccounts = computed(() => (pettyData.value?.accounts  ?? []) as any[])

const selectedCategory = computed(() => categories.value.find((c: any) => c.id === form.categoryId) ?? null)

const form = reactive({
  date: '', categoryId: '' as string | number, subcategoryId: '' as string | number,
  qty: null as number | null, unitCost: null as number | null, totalOverride: 0,
  method: 'cash' as 'cash' | 'bank', bankAccountId: '' as string | number, cashAccountId: '' as string | number,
  paymentReference: '', employeeId: '' as string | number, handledBy: '', branchId: '' as string | number, remarks: '',
})

watch(exp, (e) => {
  if (!e) return
  Object.assign(form, {
    date: String(e.expense_date).slice(0, 10),
    categoryId: e.category_id ?? '', subcategoryId: e.subcategory_id ?? '',
    qty: e.unit_quantity != null ? Number(e.unit_quantity) : null,
    unitCost: e.per_unit_cost != null ? Number(e.per_unit_cost) : null,
    totalOverride: Number(e.total_amount),
    method: e.payment_method ?? 'cash',
    bankAccountId: e.bank_account_id ?? '', cashAccountId: e.cash_account_id ?? '',
    paymentReference: e.payment_reference ?? '', employeeId: e.employee_id ?? '',
    handledBy: e.handled_by_person ?? '', branchId: e.branch_id ?? '', remarks: e.remarks ?? '',
  })
}, { immediate: true })

const computedTotal = computed(() => {
  const qty = form.qty ?? 0, cost = form.unitCost ?? 0
  return qty && cost ? qty * cost : form.totalOverride
})
watch([() => form.qty, () => form.unitCost], () => {
  if (form.qty && form.unitCost) form.totalOverride = form.qty * form.unitCost
})

const isValid = computed(() => {
  if (!form.date || !form.categoryId || !form.subcategoryId || !form.remarks.trim()) return false
  if (form.method === 'bank' && !form.bankAccountId) return false
  if (form.method === 'cash' && !form.cashAccountId) return false
  if (computedTotal.value <= 0) return false
  return true
})

function onCategoryChange() { form.subcategoryId = '' }

const submitting = ref(false)
async function submit() {
  if (!isValid.value || !exp.value) return
  submitting.value = true
  try {
    await $fetch(`/api/expenses/${exp.value.id}`, {
      method: 'PATCH',
      body: {
        expense_date: form.date, category_id: form.categoryId, subcategory_id: form.subcategoryId,
        unit_quantity: form.qty || null, per_unit_cost: form.unitCost || null,
        total_amount: computedTotal.value,
        payment_method: form.method,
        bank_account_id: form.method === 'bank' ? form.bankAccountId : null,
        cash_account_id: form.method === 'cash' ? form.cashAccountId : null,
        payment_reference: form.paymentReference || null,
        employee_id: form.employeeId || null, handled_by_person: form.handledBy || null,
        branch_id: form.branchId || null, remarks: form.remarks,
      },
    })
    success('Expense updated ✓')
    navigateTo(`/expenses/${exp.value.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update expense')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.field-label { @apply text-xs font-semibold text-gray-500 uppercase tracking-wider; }
</style>

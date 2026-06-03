<template>
  <div class="space-y-6 max-w-3xl">
    <UiPageHeader title="Create Expense Voucher" :breadcrumb="['Expenses','Create']" />

    <div class="glass-card p-6 space-y-6">

      <!-- ── Section: Expense Details ─────────────────────── -->
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
            <select v-model="form.subcategoryId" class="input-glass"
                    :disabled="!selectedCategory?.subcategories?.length">
              <option value="">— Select sub-category —</option>
              <option v-for="s in selectedCategory?.subcategories ?? []" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
            <p v-if="form.categoryId && !selectedCategory?.subcategories?.length"
               class="text-xs text-yellow-500/70 mt-1">No sub-categories for this category</p>
          </div>

          <div class="space-y-1.5">
            <label class="field-label">
              Unit Quantity
              <span v-if="selectedUnit" class="ml-1 text-gold-400/70 normal-case font-normal">
                ({{ selectedUnit }})
              </span>
            </label>
            <input v-model.number="form.qty" type="number" min="0" step="0.01" class="input-glass"
                   placeholder="e.g. litres, kg, units" />
          </div>

          <div class="space-y-1.5">
            <label class="field-label">Per Unit Cost (৳)</label>
            <input v-model.number="form.unitCost" type="number" min="0" step="0.01" class="input-glass"
                   placeholder="0.00" />
          </div>

          <!-- Total hero -->
          <div class="md:col-span-2 p-4 rounded-xl flex justify-between items-center"
               style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);">
            <span class="text-xs text-gray-500">Total Amount</span>
            <span class="font-bold text-gold-400 text-2xl font-mono">৳{{ totalAmount.toLocaleString() }}</span>
          </div>

          <!-- Employee -->
          <div class="space-y-1.5">
            <label class="field-label">Handled By (Employee)</label>
            <select v-model="form.employeeId" class="input-glass" @change="onEmployeeChange">
              <option value="">— Select employee —</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.first_name }} {{ e.last_name }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="field-label">Handled By (Free text)</label>
            <input v-model="form.handledBy" class="input-glass" placeholder="Name if not in list" />
          </div>

          <div class="md:col-span-2 space-y-1.5">
            <label class="field-label">Remarks *</label>
            <textarea v-model="form.remarks" rows="3" class="input-glass resize-none"
                      placeholder="Describe the expense clearly…" />
          </div>

        </div>
      </div>

      <!-- ── Section: Payment Details ──────────────────────── -->
      <div>
        <h3 class="section-title mb-4">Payment Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Bank / Cash toggle -->
          <div class="md:col-span-2 space-y-1.5">
            <label class="field-label">Payment Method *</label>
            <div class="flex gap-3">
              <button type="button"
                @click="form.method = 'cash'; form.bankAccountId = ''"
                :class="['flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  form.method === 'cash'
                    ? 'bg-green-500/15 border-green-500/50 text-green-300'
                    : 'border-white/10 text-gray-500 hover:border-white/20']">
                💵 Cash / Petty Cash
              </button>
              <button type="button"
                @click="form.method = 'bank'; form.cashAccountId = ''"
                :class="['flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  form.method === 'bank'
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                    : 'border-white/10 text-gray-500 hover:border-white/20']">
                🏦 Bank / Cheque
              </button>
            </div>
          </div>

          <!-- CASH panel -->
          <template v-if="form.method === 'cash'">
            <div class="md:col-span-2 space-y-1.5">
              <label class="field-label">Petty Cash Account *</label>
              <select v-model="form.cashAccountId" class="input-glass">
                <option value="">— Select petty cash account —</option>
                <option v-for="a in pettyCashAccounts" :key="a.id" :value="a.id">
                  {{ a.account_name }}
                  <span v-if="a.current_balance !== undefined">
                    (Balance: ৳{{ Number(a.current_balance).toLocaleString() }})
                  </span>
                </option>
              </select>
              <p v-if="selectedPettyCash && Number(selectedPettyCash.current_balance) < totalAmount"
                 class="text-xs text-yellow-400 mt-1">
                ⚠ Petty cash balance (৳{{ Number(selectedPettyCash.current_balance).toLocaleString() }}) is less than this expense amount.
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="field-label">Reference / Receipt No.</label>
              <input v-model="form.paymentReference" class="input-glass" placeholder="e.g. receipt #, mobile TXN" />
            </div>
          </template>

          <!-- BANK panel -->
          <template v-if="form.method === 'bank'">
            <div class="space-y-1.5">
              <label class="field-label">Bank Account *</label>
              <select v-model="form.bankAccountId" class="input-glass">
                <option value="">— Select bank account —</option>
                <option v-for="a in bankAccounts" :key="a.id" :value="a.id">
                  {{ a.bank_name }} – {{ a.account_name }} ({{ a.account_number }})
                </option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="field-label">Cheque / Transaction Ref.</label>
              <input v-model="form.paymentReference" class="input-glass" placeholder="Cheque # or TXN ID" />
            </div>
          </template>

        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2 border-t border-white/5">
        <NuxtLink to="/expenses" class="btn-ghost">Cancel</NuxtLink>
        <button @click="submit" :disabled="submitting || !isValid"
          class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
          </svg>
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
  date:             new Date().toISOString().split('T')[0],
  categoryId:       '' as string | number,
  subcategoryId:    '' as string | number,
  qty:              null as number | null,
  unitCost:         null as number | null,
  method:           'cash' as 'cash' | 'bank',
  bankAccountId:    '' as string | number,
  cashAccountId:    '' as string | number,
  paymentReference: '',
  employeeId:       '' as string | number,
  handledBy:        '',
  branchId:         '' as string | number,
  remarks:          '',
})

const submitting = ref(false)

// ── Remote data ─────────────────────────────────────────────────────────────
const [
  { data: catData },
  { data: branchData },
  { data: bankData },
  { data: empData },
  { data: pettyData },
] = await Promise.all([
  useFetch('/api/expenses/categories', { query: { spend: false } }),
  useFetch('/api/branches'),
  useFetch('/api/bank-accounts'),
  useFetch('/api/hr/employees'),
  useFetch('/api/expenses/petty-cash-accounts'),
])

const categories       = computed(() => (catData.value?.categories        ?? []) as any[])
const branches         = computed(() => (branchData.value?.branches       ?? []) as any[])
const bankAccounts     = computed(() => (bankData.value?.accounts         ?? []) as any[])
const employees        = computed(() => (empData.value?.employees         ?? []) as any[])
const pettyCashAccounts = computed(() => (pettyData.value?.accounts       ?? []) as any[])

const selectedCategory = computed(() =>
  categories.value.find((c: any) => c.id === form.categoryId) ?? null
)
const selectedUnit = computed(() => {
  if (!form.subcategoryId) return ''
  const sub = selectedCategory.value?.subcategories?.find((s: any) => s.id === form.subcategoryId)
  return sub?.unit ?? ''
})
const selectedPettyCash = computed(() =>
  pettyCashAccounts.value.find((a: any) => a.id === form.cashAccountId) ?? null
)

const totalAmount = computed(() => {
  const qty  = form.qty  ?? 0
  const cost = form.unitCost ?? 0
  if (qty && cost) return qty * cost
  return 0
})

const isValid = computed(() => {
  if (!form.date || !form.categoryId || !form.subcategoryId || !form.remarks.trim()) return false
  if (form.method === 'bank'  && !form.bankAccountId)  return false
  if (form.method === 'cash'  && !form.cashAccountId)  return false
  if (totalAmount.value <= 0) return false
  return true
})

function onCategoryChange() {
  form.subcategoryId = ''
}

function onEmployeeChange() {
  const emp = employees.value.find((e: any) => e.id === form.employeeId)
  if (emp) form.handledBy = `${emp.first_name} ${emp.last_name}`.trim()
}

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  try {
    const result = await $fetch('/api/expenses', {
      method: 'POST',
      body: {
        expense_date:      form.date,
        category_id:       form.categoryId,
        subcategory_id:    form.subcategoryId,
        unit_quantity:     form.qty     || null,
        per_unit_cost:     form.unitCost || null,
        total_amount:      totalAmount.value,
        payment_method:    form.method,            // 'bank' or 'cash'
        bank_account_id:   form.method === 'bank' ? form.bankAccountId : null,
        cash_account_id:   form.method === 'cash' ? form.cashAccountId : null,
        payment_reference: form.paymentReference || null,
        employee_id:       form.employeeId   || null,
        handled_by_person: form.handledBy    || null,
        branch_id:         form.branchId     || null,
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

<style scoped>
.field-label {
  @apply text-xs font-semibold text-gray-500 uppercase tracking-wider;
}
</style>

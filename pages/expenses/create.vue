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

          <div v-if="selectedCategory?.subcategories?.length" class="space-y-1.5">
            <label class="field-label">Sub-category</label>
            <select v-model="form.subcategoryId" class="input-glass" @change="onSubcategoryChange">
              <option value="">None</option>
              <option v-for="s in selectedCategory.subcategories" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="field-label">Unit Quantity</label>
            <input v-model.number="form.qty" type="number" min="0" step="0.01" class="input-glass" placeholder="e.g. litres, kg, units" />
          </div>

          <div class="space-y-1.5">
            <label class="field-label">
              Per Unit Cost (৳)
              <span v-if="selectedUnit" class="ml-1 text-gold-400/70 normal-case font-normal">per {{ selectedUnit }}</span>
            </label>
            <input v-model.number="form.unitCost" type="number" min="0" step="0.01" class="input-glass" placeholder="0.00" />
          </div>

          <!-- Total hero -->
          <div class="md:col-span-2 p-4 rounded-xl flex justify-between items-center"
               style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);">
            <span class="text-xs text-gray-500">Total Amount</span>
            <span class="font-bold text-gold-400 text-2xl font-mono">৳{{ totalAmount.toLocaleString() }}</span>
          </div>

          <!-- Handled By / Employee -->
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
            <label class="field-label">Handled By (Name / Other)</label>
            <input v-model="form.handledBy" class="input-glass" placeholder="Free-form name if not in list" />
          </div>

          <div class="md:col-span-2 space-y-1.5">
            <label class="field-label">Remarks *</label>
            <textarea v-model="form.remarks" rows="3" class="input-glass resize-none" placeholder="Describe the expense clearly…" />
          </div>

        </div>
      </div>

      <!-- ── Section: Payment Details ──────────────────────── -->
      <div>
        <h3 class="section-title mb-4">Payment Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Payment method toggle -->
          <div class="md:col-span-2 space-y-1.5">
            <label class="field-label">Payment Method *</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="m in methods" :key="m.value"
                type="button"
                @click="form.method = m.value; form.bankAccountId = ''; form.paymentReference = ''"
                :class="['px-4 py-2 rounded-lg text-xs font-semibold border transition-all',
                  form.method === m.value
                    ? 'bg-gold-500/20 border-gold-500/60 text-gold-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300']">
                {{ m.label }}
              </button>
            </div>
          </div>

          <!-- Bank account panel (Bank Transfer / Cheque) -->
          <template v-if="needsBankAccount">
            <div class="space-y-1.5">
              <label class="field-label">Bank Account *</label>
              <select v-model="form.bankAccountId" class="input-glass">
                <option value="">— Select account —</option>
                <optgroup label="Bank Accounts">
                  <option v-for="a in bankAccounts.filter(a => a.account_type !== 'Cash')" :key="a.id" :value="a.id">
                    {{ a.bank_name }} – {{ a.account_name }} ({{ a.account_number }})
                  </option>
                </optgroup>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="field-label">
                {{ form.method === 'Cheque' ? 'Cheque Number' : 'Transaction / Reference No.' }}
              </label>
              <input v-model="form.paymentReference" class="input-glass"
                :placeholder="form.method === 'Cheque' ? 'Cheque #' : 'TXN-XXXXXXXX'" />
            </div>
          </template>

          <!-- Mobile Banking panel -->
          <template v-else-if="form.method === 'Mobile Banking'">
            <div class="space-y-1.5">
              <label class="field-label">Mobile TXN / Reference No.</label>
              <input v-model="form.paymentReference" class="input-glass" placeholder="e.g. bKash/Nagad TXN ID" />
            </div>
          </template>

          <!-- Cash info box -->
          <div v-if="form.method === 'Cash'" class="md:col-span-2 flex items-center gap-3 p-3 rounded-lg"
               style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.18);">
            <span class="text-green-400">💵</span>
            <span class="text-xs text-green-300/80">Cash payment — will be disbursed from branch petty cash on approval.</span>
          </div>

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
  qty:              1,
  unitCost:         0,
  method:           'Cash',
  bankAccountId:    '' as string | number,
  paymentReference: '',
  employeeId:       '' as string | number,
  handledBy:        '',
  branchId:         '' as string | number,
  remarks:          '',
})

const submitting = ref(false)

const methods = [
  { value: 'Cash',           label: '💵 Cash'           },
  { value: 'Bank Transfer',  label: '🏦 Bank Transfer'  },
  { value: 'Cheque',         label: '🧾 Cheque'         },
  { value: 'Mobile Banking', label: '📱 Mobile Banking' },
]

const needsBankAccount = computed(() =>
  form.method === 'Bank Transfer' || form.method === 'Cheque'
)

// ── Remote data ──────────────────────────────────────────────────
const [{ data: catData }, { data: branchData }, { data: bankData }, { data: empData }] = await Promise.all([
  useFetch('/api/expenses/categories', { query: { spend: false } }),
  useFetch('/api/branches'),
  useFetch('/api/bank-accounts'),
  useFetch('/api/hr/employees'),
])

const categories   = computed(() => (catData.value?.categories   ?? []) as any[])
const branches     = computed(() => (branchData.value?.branches  ?? []) as any[])
const bankAccounts = computed(() => (bankData.value?.accounts    ?? []) as any[])
const employees    = computed(() => (empData.value?.employees    ?? []) as any[])

const selectedCategory = computed(() =>
  categories.value.find((c: any) => c.id === form.categoryId) ?? null
)

const selectedUnit = computed(() => {
  if (!form.subcategoryId) return ''
  const sub = selectedCategory.value?.subcategories?.find((s: any) => s.id === form.subcategoryId)
  return sub?.unit ?? ''
})

const totalAmount = computed(() => (form.qty || 1) * (form.unitCost || 0))
const isValid = computed(() => {
  if (!form.date || !form.categoryId || !form.remarks.trim()) return false
  if (needsBankAccount.value && !form.bankAccountId) return false
  return true
})

function onCategoryChange() {
  form.subcategoryId = ''
}

function onSubcategoryChange() {
  // Auto-fill unit from subcategory if qty label needed
}

function onEmployeeChange() {
  if (!form.employeeId) return
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
        subcategory_id:    form.subcategoryId  || null,
        unit_quantity:     form.qty,
        per_unit_cost:     form.unitCost,
        total_amount:      totalAmount.value,
        payment_method:    form.method,
        bank_account_id:   form.bankAccountId  || null,
        payment_reference: form.paymentReference || null,
        employee_id:       form.employeeId     || null,
        handled_by_person: form.handledBy      || null,
        branch_id:         form.branchId       || null,
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

<template>
  <div class="space-y-6">
    <UiPageHeader title="Suppliers" subtitle="All registered wheat suppliers"
                  :breadcrumb="['Purchase','Suppliers']">
      <template #actions>
        <button @click="openAdd" class="btn-gold text-xs">+ Add Supplier</button>
      </template>
    </UiPageHeader>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search company, code, phone…" />
      <select v-model="typeFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()">
        <option value="">All Types</option>
        <option value="local">Local</option>
        <option value="international">International</option>
        <option value="both">Both</option>
      </select>
      <select v-model="statusFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="blocked">Blocked</option>
      </select>
      <button @click="search='';typeFilter='';statusFilter='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> suppliers
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <UiDataTable v-else :columns="cols" :rows="rows" :per-page="perPage" exportable search-placeholder=""
                 @row-click="r => navigateTo(`/purchase/suppliers/${r.id}/ledger`)">
      <template #cell-supplier_code="{ value }">
        <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
      </template>
      <template #cell-current_balance="{ value }">
        <span :class="['font-semibold font-mono text-xs', Number(value) > 0 ? 'text-red-400' : 'text-emerald-400']">
          ৳{{ Number(Math.abs(value)).toLocaleString() }}
        </span>
      </template>
      <template #cell-status="{ value }">
        <UiStatusBadge :status="value" />
      </template>
      <template #actions="{ row }">
        <div class="flex gap-1.5">
          <button @click.stop="openEdit(row)" class="btn-ghost text-xs py-1 px-2.5">Edit</button>
          <NuxtLink :to="`/purchase/suppliers/${row.id}/ledger`" class="btn-ghost text-xs py-1 px-2.5">Ledger</NuxtLink>
        </div>
      </template>
    </UiDataTable>

    <!-- Pagination -->
    <div v-if="(data?.total ?? 0) > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil((data?.total ?? 0) / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1 px-3" :class="page<=1 ? 'opacity-40':''">← Prev</button>
        <button :disabled="page >= Math.ceil((data?.total??0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1 px-3">Next →</button>
      </div>
    </div>

    <!-- Add / Edit Supplier Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4 my-8">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">{{ editingId ? 'Edit Supplier' : 'Add Supplier' }}</h3>
              <button @click="showModal = false" class="text-gray-500 hover:text-gray-200 text-xl leading-none">✕</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name *</label>
                <input v-model="form.company_name" class="input-glass" placeholder="e.g. Rahim Traders Ltd." />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Person</label>
                <input v-model="form.contact_person" class="input-glass" placeholder="Full name" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
                <input v-model="form.phone" class="input-glass" placeholder="+880…" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mobile</label>
                <input v-model="form.mobile" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                <input v-model="form.email" type="email" class="input-glass" />
              </div>
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</label>
                <input v-model="form.address" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">City</label>
                <input v-model="form.city" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</label>
                <input v-model="form.country" class="input-glass" placeholder="Bangladesh" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supplier Type</label>
                <select v-model="form.supplier_type" class="input-glass">
                  <option value="local">Local</option>
                  <option value="international">International</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Terms</label>
                <select v-model="form.payment_terms" class="input-glass">
                  <option value="advance">Advance</option>
                  <option value="credit-7">Credit 7 Days</option>
                  <option value="credit-15">Credit 15 Days</option>
                  <option value="credit-30">Credit 30 Days</option>
                  <option value="credit-60">Credit 60 Days</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Limit (৳)</label>
                <input v-model.number="form.credit_limit" type="number" min="0" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tax ID / BIN</label>
                <input v-model="form.tax_id" class="input-glass font-mono" />
              </div>
              <div v-if="!editingId" class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Opening Balance (৳)</label>
                <input v-model.number="form.opening_balance" type="number" class="input-glass font-mono" />
              </div>
              <div v-if="editingId" class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select v-model="form.status" class="input-glass">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
                <textarea v-model="form.notes" rows="2" class="input-glass resize-none" />
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button @click="save" :disabled="!form.company_name.trim() || saving" class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Supplier' }}
              </button>
              <button @click="showModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

const search       = ref('')
const typeFilter   = ref('')
const statusFilter = ref('')
const page         = ref(1)
const perPage      = 25

const { data, pending, error: fetchError, refresh } = await useFetch('/api/suppliers', {
  query: computed(() => ({
    search: search.value,
    type:   typeFilter.value,
    status: statusFilter.value,
    page:   page.value,
    per:    perPage,
  })),
})

const rows = computed(() => (data.value?.suppliers ?? []) as any[])

const cols = [
  { key: 'supplier_code',   label: 'Code',        sortable: true },
  { key: 'company_name',    label: 'Company',     sortable: true },
  { key: 'contact_person',  label: 'Contact' },
  { key: 'phone',           label: 'Phone' },
  { key: 'city',            label: 'City' },
  { key: 'supplier_type',   label: 'Type' },
  { key: 'total_pos',       label: 'POs' },
  { key: 'current_balance', label: 'Balance (৳)', sortable: true },
  { key: 'status',          label: 'Status' },
]

// Add / Edit modal
const showModal  = ref(false)
const saving     = ref(false)
const editingId  = ref<number | null>(null)

const emptyForm = () => ({
  company_name:   '',
  contact_person: '',
  phone:          '',
  mobile:         '',
  email:          '',
  address:        '',
  city:           '',
  country:        'Bangladesh',
  supplier_type:  'local',
  payment_terms:  'advance',
  credit_limit:   0,
  tax_id:         '',
  opening_balance: 0,
  status:         'active',
  notes:          '',
})

const form = reactive(emptyForm())

function openAdd() {
  editingId.value = null
  Object.assign(form, emptyForm())
  showModal.value = true
}

function openEdit(s: any) {
  editingId.value = s.id
  Object.assign(form, {
    company_name:   s.company_name   ?? '',
    contact_person: s.contact_person ?? '',
    phone:          s.phone          ?? '',
    mobile:         s.mobile         ?? '',
    email:          s.email          ?? '',
    address:        s.address        ?? '',
    city:           s.city           ?? '',
    country:        s.country        ?? 'Bangladesh',
    supplier_type:  s.supplier_type  ?? 'local',
    payment_terms:  s.payment_terms  ?? 'advance',
    credit_limit:   Number(s.credit_limit ?? 0),
    tax_id:         s.tax_id         ?? '',
    opening_balance: Number(s.opening_balance ?? 0),
    status:         s.status         ?? 'active',
    notes:          s.notes          ?? '',
  })
  showModal.value = true
}

async function save() {
  if (!form.company_name.trim()) return
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/purchase/suppliers/${editingId.value}`, {
        method: 'PATCH',
        body: { ...form },
      })
      success('Supplier updated')
    } else {
      await $fetch('/api/purchase/suppliers', {
        method: 'POST',
        body: { ...form },
      })
      success(`Supplier "${form.company_name}" created`)
    }
    showModal.value = false
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

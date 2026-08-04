<template>
  <div class="space-y-6">
    <UiPageHeader title="Expense Categories" subtitle="Manage expense categories and budget allocations"
                  :breadcrumb="['Expenses', 'Categories']">
      <template #actions>
        <button @click="openAdd" class="btn-gold text-xs">+ New Category</button>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Category list -->
      <div class="lg:col-span-2 glass-card p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="section-title">All Categories</h3>
          <span class="text-xs text-gray-500">{{ categories.length }} categories</span>
        </div>
        <div class="space-y-2">
          <div v-for="cat in categories" :key="cat.id"
            class="rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/20 transition-all">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                     :style="`background: ${cat.color}20; border: 1px solid ${cat.color}40`">
                  {{ cat.icon }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-200">{{ cat.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                  <p class="text-[10px] mt-0.5" :class="cat.glAccountName ? 'text-emerald-400' : 'text-red-400'">
                    {{ cat.glAccountName ? `GL: ${cat.glAccountName}` : '⚠ No GL account mapped — approvals will be blocked' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4 text-right">
                <div>
                  <p class="text-xs text-gray-500">This month</p>
                  <p class="text-sm font-bold text-gray-200">৳{{ cat.monthlySpend.toLocaleString() }}</p>
                </div>
                <div v-if="cat.budget">
                  <p class="text-xs text-gray-500">Budget</p>
                  <p class="text-xs font-semibold" :class="cat.monthlySpend > cat.budget ? 'text-red-400' : 'text-emerald-400'">
                    ৳{{ cat.budget.toLocaleString() }}
                  </p>
                </div>
                <div class="flex gap-1.5">
                  <button @click="toggleSubcats(cat)" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Subcategories">
                    <svg class="w-3.5 h-3.5" :class="expandedCat === cat.id ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button @click="editCat(cat)" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gold-400 hover:bg-gold-500/10 transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Subcategories: GL account override per subcategory -->
            <div v-if="expandedCat === cat.id" class="px-4 pb-4 pt-1 space-y-2 border-t border-white/[0.06]">
              <div v-if="!cat.subcategories.length" class="text-[11px] text-gray-600 pt-2">No subcategories.</div>
              <div v-for="sub in cat.subcategories" :key="sub.id"
                   class="flex items-center justify-between gap-2 pt-2">
                <span class="text-xs text-gray-300 truncate">{{ sub.name }}</span>
                <UiSearchSelect
                  :model-value="subGlSelection[sub.id] ?? sub.chartOfAccountId"
                  @update:model-value="(v: any) => saveSubGl(sub, v)"
                  :options="glOptions" placeholder="Inherit category GL"
                  class="text-[11px] w-52 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit form -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-4">
          <h3 class="section-title">{{ editingId ? 'Edit Category' : 'New Category' }}</h3>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name *</label>
            <input v-model="form.name" type="text" class="input-glass" placeholder="e.g. Fuel & Vehicle" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
            <input v-model="form.description" type="text" class="input-glass" placeholder="What this covers…" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Icon (emoji)</label>
              <input v-model="form.icon" type="text" class="input-glass text-center text-xl" placeholder="🏷️" maxlength="2" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colour</label>
              <input v-model="form.color" type="color" class="w-full h-10 rounded-xl border border-white/10 bg-white/[0.05] cursor-pointer" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Budget (৳)</label>
            <input v-model.number="form.budget" type="number" class="input-glass font-mono" placeholder="0 = no limit" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">GL Account *</label>
            <UiSearchSelect v-model="form.chartOfAccountId" :options="glOptions" placeholder="Search chart of accounts…" />
            <p class="text-[10px] text-gray-600">Required before any expense in this category can be approved.</p>
          </div>
          <div class="flex gap-2">
            <button @click="saveCategory" :disabled="!form.name || saving" class="btn-gold text-xs flex-1 disabled:opacity-50">
              {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create Category' }}
            </button>
            <button v-if="editingId" @click="cancelEdit" class="btn-ghost text-xs">Cancel</button>
          </div>
        </div>

        <!-- Spending summary -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">May 2026 Summary</h3>
          <div v-for="cat in categoriesWithBudget" :key="cat.id" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">{{ cat.name }}</span>
              <span :class="cat.monthlySpend > cat.budget ? 'text-red-400' : 'text-gray-300'" class="font-mono">
                ৳{{ cat.monthlySpend.toLocaleString() }} / ৳{{ cat.budget.toLocaleString() }}
              </span>
            </div>
            <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all"
                   :class="cat.monthlySpend > cat.budget ? 'bg-red-500' : 'bg-emerald-500'"
                   :style="`width:${Math.min(100, Math.round(cat.monthlySpend/cat.budget*100))}%`" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

// Fetch real categories with monthly spend
const { data, refresh } = await useFetch('/api/expenses/categories')
const categories = computed(() => (data.value as any)?.categories ?? [])
const categoriesWithBudget = computed(() => categories.value.filter((c: any) => c.budget > 0))

// GL accounts for the picker (expense-type accounts, plus a fallback of all accounts)
const { data: coaData } = await useFetch('/api/accounts/coa')
const glOptions = computed(() =>
  ((coaData.value as any)?.accounts ?? []).map((a: any) => ({
    value: a.id, label: `${a.account_number ? a.account_number + ' — ' : ''}${a.name}`,
  })),
)

const form      = reactive({ name: '', description: '', icon: '', color: '#f59e0b', budget: 0, chartOfAccountId: null as number | null })
const editingId = ref<number | null>(null)
const saving    = ref(false)

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', icon: '', color: '#f59e0b', budget: 0, chartOfAccountId: null })
}

function editCat(cat: any) {
  editingId.value = cat.id
  Object.assign(form, {
    name: cat.name, description: cat.description,
    icon: cat.icon, color: cat.color, budget: cat.budget,
    chartOfAccountId: cat.chartOfAccountId ?? null,
  })
}

function cancelEdit() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', icon: '', color: '#f59e0b', budget: 0, chartOfAccountId: null })
}

async function saveCategory() {
  if (!form.name) return
  saving.value = true
  try {
    const body = { name: form.name, description: form.description, chart_of_account_id: form.chartOfAccountId || null }
    if (editingId.value) {
      await $fetch(`/api/expenses/categories/${editingId.value}`, { method: 'PATCH', body })
      success(`Category "${form.name}" updated`)
    } else {
      await $fetch('/api/expenses/categories', { method: 'POST', body })
      success(`Category "${form.name}" created`)
    }
    await refresh()
    cancelEdit()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to save category')
  } finally {
    saving.value = false
  }
}

// ── Subcategory GL-account overrides ────────────────────────
const expandedCat    = ref<number | null>(null)
const subGlSelection = reactive<Record<number, number | ''>>({})

function toggleSubcats(cat: any) {
  expandedCat.value = expandedCat.value === cat.id ? null : cat.id
}

async function saveSubGl(sub: any, value: number | '') {
  subGlSelection[sub.id] = value
  try {
    await $fetch(`/api/expenses/subcategories/${sub.id}`, {
      method: 'PATCH',
      body: { chart_of_account_id: value || null },
    })
    success(`GL account updated for "${sub.name}"`)
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to update GL account')
  }
}
</script>

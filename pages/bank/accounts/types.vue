<template>
  <div class="space-y-6">
    <UiPageHeader title="Transaction Types" subtitle="Manage income / expense / transfer categories for bank transactions"
                  :breadcrumb="['Bank', 'Accounts', 'Transaction Types']">
      <template #actions>
        <button @click="openAdd" class="btn-gold text-xs">+ Add Type</button>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 4" :key="i" class="glass-card p-5 h-36 animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in types" :key="t.id" class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                 :style="`background: ${natureColor(t.nature)}20; border: 1px solid ${natureColor(t.nature)}40; color: ${natureColor(t.nature)}`">
              {{ natureIcon(t.nature) }}
            </div>
            <p class="text-sm font-semibold text-gray-200">{{ t.name }}</p>
          </div>
          <button @click="toggleActive(t)"
                  :class="['text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors',
                    t.is_active ? 'bg-emerald-500/15 text-emerald-400 hover:bg-red-500/15 hover:text-red-400'
                               : 'bg-red-500/15 text-red-400 hover:bg-emerald-500/15 hover:text-emerald-400']">
            {{ t.is_active ? 'Active' : 'Inactive' }}
          </button>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed">{{ t.description || '—' }}</p>
        <div class="flex justify-between items-center text-xs">
          <span class="capitalize px-2 py-0.5 rounded-full text-[10px] font-medium"
                :style="`background: ${natureColor(t.nature)}15; color: ${natureColor(t.nature)}`">
            {{ t.nature }}
          </span>
        </div>
        <div class="flex gap-2 pt-1">
          <button @click="openEdit(t)" class="btn-ghost text-xs flex-1 justify-center py-1.5">Edit</button>
        </div>
      </div>
    </div>

    <!-- Add / Edit modal (shared) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">{{ editingId ? 'Edit Transaction Type' : 'Add Transaction Type' }}</h3>
              <button @click="showModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type Name *</label>
                <input v-model="form.name" class="input-glass" placeholder="e.g. Customer Receipt" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nature</label>
                <select v-model="form.nature" class="input-glass">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="form.description" rows="2" class="input-glass resize-none" placeholder="Optional description…" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="save" :disabled="!form.name.trim() || saving" class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Type' }}
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

const showModal = ref(false)
const saving    = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({ name: '', nature: 'income' as string, description: '' })

const { data, pending, refresh } = await useFetch('/api/bank/transaction-types')
const types = computed(() => (data.value as any)?.types ?? [])

const NATURE_COLORS: Record<string, string> = {
  income:   '#10b981',
  expense:  '#ef4444',
  transfer: '#3b82f6',
  other:    '#6b7280',
}
const NATURE_ICONS: Record<string, string> = {
  income:   '↑',
  expense:  '↓',
  transfer: '⇄',
  other:    '○',
}
function natureColor(n: string) { return NATURE_COLORS[n] ?? NATURE_COLORS.other }
function natureIcon(n: string)  { return NATURE_ICONS[n] ?? NATURE_ICONS.other }

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', nature: 'income', description: '' })
  showModal.value = true
}

function openEdit(t: any) {
  editingId.value = t.id
  Object.assign(form, { name: t.name, nature: t.nature ?? 'other', description: t.description ?? '' })
  showModal.value = true
}

async function save() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/bank/transaction-types/${editingId.value}`, {
        method: 'PATCH',
        body: { name: form.name.trim(), nature: form.nature, description: form.description },
      })
      success('Type updated')
    } else {
      await $fetch('/api/bank/transaction-types', {
        method: 'POST',
        body: { name: form.name.trim(), nature: form.nature, description: form.description },
      })
      success(`Type "${form.name}" added`)
    }
    showModal.value = false
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed')
  } finally {
    saving.value = false
  }
}

async function toggleActive(t: any) {
  try {
    await $fetch(`/api/bank/transaction-types/${t.id}`, {
      method: 'PATCH',
      body: { action: 'toggle' },
    })
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to toggle')
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Account Types" subtitle="Configure and manage bank account types"
                  :breadcrumb="['Bank', 'Accounts', 'Types']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ Add Type</button>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in accountTypes" :key="t.id"
        class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                 :style="`background: ${t.color}20; border: 1px solid ${t.color}40; color: ${t.color}`">
              {{ t.icon }}
            </div>
            <p class="text-sm font-semibold text-gray-200">{{ t.name }}</p>
          </div>
          <UiStatusBadge :status="t.status" />
        </div>
        <p class="text-xs text-gray-500 leading-relaxed">{{ t.description }}</p>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600">Accounts</span>
          <span class="font-semibold text-gray-300">{{ t.count }}</span>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost text-xs flex-1 justify-center py-1.5">Edit</button>
        </div>
      </div>
    </div>

    <!-- Add modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Add Account Type</h3>
              <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type Name *</label>
                <input v-model="newType.name" type="text" class="input-glass" placeholder="e.g. Foreign Currency" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="newType.description" rows="2" class="input-glass resize-none" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addType" :disabled="!newType.name" class="btn-gold text-xs flex-1 disabled:opacity-50">Add</button>
              <button @click="showAddModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success } = useToast()

const showAddModal = ref(false)

// Fetch real account type counts from bank_accounts
const { data } = await useFetch('/api/bank/account-types')
const dbTypes = computed(() => (data.value as any)?.types ?? [])

// Merge DB types with any locally-added types
const localTypes = reactive<any[]>([])
const accountTypes = computed(() => [...dbTypes.value, ...localTypes])

const newType = reactive({ name: '', description: '' })

function addType() {
  if (!newType.name) return
  localTypes.push({
    id:          `local-${Date.now()}`,
    name:        newType.name,
    icon:        '🏛',
    color:       '#6b7280',
    description: newType.description,
    count:       0,
    status:      'active',
  })
  success(`Account type "${newType.name}" added`)
  showAddModal.value = false
  Object.assign(newType, { name: '', description: '' })
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

<template>
  <div class="space-y-5">

    <UiPageHeader :title="variant ? `Pricing — ${variant.weight_variant} ${variant.grade ? `Grade ${variant.grade}` : ''}` : 'Pricing'"
                  :subtitle="variant?.product_name ?? ''"
                  :breadcrumb="['Products', variant?.product_name ?? '…', variant?.weight_variant ?? '…', 'Pricing']">
      <template #actions>
        <NuxtLink :to="`/products/${productId}/variants`" class="btn-ghost text-xs">← Variants</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Loading / Error -->
    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading pricing data…</p>
    </div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <template v-else-if="data">

      <!-- Variant info strip -->
      <div class="glass-card px-5 py-3.5 flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-3 flex-wrap flex-1">
          <span v-if="variant?.grade"
                class="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg border shrink-0"
                :class="gradeBadge(variant.grade)">
            {{ variant.grade }}
          </span>
          <div>
            <p class="font-bold text-gray-200 text-sm">{{ variant?.product_name }}</p>
            <p class="text-[11px] text-gray-500">
              {{ variant?.weight_variant }}
              <span v-if="variant?.sku" class="font-mono text-gold-400/80 ml-2">{{ variant.sku }}</span>
              <span class="ml-2 text-gray-600">{{ variant?.unit_of_measure }}</span>
            </p>
          </div>
        </div>
        <div class="text-[11px] text-gray-500">
          {{ branches.length }} branch{{ branches.length !== 1 ? 'es' : '' }}
        </div>
      </div>

      <!-- Flash -->
      <Transition name="fade">
        <div v-if="flash.msg"
             class="px-4 py-3 text-sm border rounded-xl flex items-center gap-2"
             :class="flash.ok
               ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
               : 'bg-red-500/10 border-red-500/20 text-red-300'">
          <span>{{ flash.ok ? '✓' : '✗' }}</span>
          <span>{{ flash.msg }}</span>
        </div>
      </Transition>

      <!-- ── Price per Branch ──────────────────────────────────────────────── -->
      <div class="glass-card p-0 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06]">
          <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Branch Prices
          </h2>
        </div>
        <div class="divide-y divide-white/[0.04]">
          <div v-for="b in branches" :key="b.id"
               class="px-5 py-4 flex items-center gap-4 flex-wrap">
            <!-- Branch info -->
            <div class="w-28 shrink-0">
              <p class="font-semibold text-gray-200 text-xs">{{ b.name }}</p>
              <p class="text-[10px] text-gray-600 font-mono">{{ b.code }}</p>
            </div>

            <!-- Current active price -->
            <div class="flex-1 min-w-[120px]">
              <p class="text-[10px] text-gray-600 mb-0.5">Current price</p>
              <p class="font-bold text-base" :class="activePrices[b.id] ? 'text-gold-400' : 'text-gray-700'">
                {{ activePrices[b.id] ? '৳' + Number(activePrices[b.id].unit_price).toLocaleString() : '— Not set —' }}
              </p>
              <p v-if="activePrices[b.id]?.effective_date" class="text-[10px] text-gray-600 mt-0.5">
                Since {{ String(activePrices[b.id].effective_date).slice(0, 10) }}
              </p>
            </div>

            <!-- Set / Update form -->
            <div v-if="isAccounts" class="flex items-end gap-2 flex-wrap">
              <div>
                <label class="block text-[10px] text-gray-500 mb-1">New Price (৳)</label>
                <input v-model.number="newPrices[b.id]" type="number" step="1" min="0"
                       class="input-glass py-1.5 text-xs font-mono text-center w-28" placeholder="0" />
              </div>
              <div>
                <label class="block text-[10px] text-gray-500 mb-1">Effective Date</label>
                <input v-model="newDates[b.id]" type="date"
                       class="input-glass py-1.5 text-xs w-36" />
              </div>
              <button @click="setPrice(b.id)" :disabled="!newPrices[b.id] || savingBranch === b.id"
                      class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gold-500/15 text-gold-400 border border-gold-500/20 hover:bg-gold-500/25 disabled:opacity-40 transition-colors">
                {{ savingBranch === b.id ? '…' : (activePrices[b.id] ? 'Update' : 'Set Price') }}
              </button>
              <button v-if="activePrices[b.id]" @click="archivePrice(b.id)"
                      :disabled="savingBranch === b.id"
                      class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/20 disabled:opacity-40 transition-colors">
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Price Change Log ──────────────────────────────────────────────── -->
      <div class="glass-card p-0 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Price Change Log
          </h2>
          <span class="text-[11px] text-gray-600">{{ changeLogs.length }} entries</span>
        </div>

        <div v-if="!changeLogs.length" class="py-10 text-center text-gray-600 text-xs italic">
          No price changes recorded yet
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.04] text-[10px] text-gray-600 uppercase tracking-wider">
                <th class="px-4 py-2.5 text-left font-semibold">Date / Time</th>
                <th class="px-3 py-2.5 text-left font-semibold">Branch</th>
                <th class="px-3 py-2.5 text-center font-semibold">Type</th>
                <th class="px-3 py-2.5 text-center font-semibold">Old Price</th>
                <th class="px-3 py-2.5 text-center font-semibold">New Price</th>
                <th class="px-3 py-2.5 text-center font-semibold">Δ</th>
                <th class="px-3 py-2.5 text-left font-semibold">By</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.03]">
              <tr v-for="log in changeLogs" :key="log.id"
                  class="hover:bg-white/[0.02]">
                <td class="px-4 py-2.5 text-gray-500 text-[11px] font-mono whitespace-nowrap">
                  {{ formatDate(log.changed_at) }}
                </td>
                <td class="px-3 py-2.5 text-gray-400">{{ log.branch_name }}</td>
                <td class="px-3 py-2.5 text-center">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        :class="changeTypeBadge(log.change_type)">
                    {{ log.change_type }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-center font-mono text-gray-500">
                  {{ log.old_price != null ? '৳' + Number(log.old_price).toLocaleString() : '—' }}
                </td>
                <td class="px-3 py-2.5 text-center font-mono font-bold text-gray-200">
                  {{ log.new_price != null ? '৳' + Number(log.new_price).toLocaleString() : '—' }}
                </td>
                <td class="px-3 py-2.5 text-center font-mono">
                  <template v-if="log.old_price != null && log.new_price != null">
                    <span :class="(log.new_price - log.old_price) > 0.005 ? 'text-emerald-400' : (log.new_price - log.old_price) < -0.005 ? 'text-red-400' : 'text-gray-600'">
                      {{ (log.new_price - log.old_price) > 0.005 ? '+' : '' }}৳{{ Math.abs(log.new_price - log.old_price).toLocaleString() }}
                    </span>
                  </template>
                  <span v-else class="text-gray-700">—</span>
                </td>
                <td class="px-3 py-2.5 text-gray-500">{{ log.changed_by ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route     = useRoute()
const productId = Number(route.params.productId)
const variantId = Number(route.params.variantId)
const { user }  = useUserSession()
const { success, error: toastError } = useToast()

const isAccounts = computed(() => {
  const r = (user.value?.role ?? '').toLowerCase()
  return ['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra'].includes(r)
})

// ── Data ──────────────────────────────────────────────────────────────────────
const { data, pending, error: fetchError, refresh } = await useFetch(
  `/api/products/pricing/${variantId}`,
)

const variant     = computed(() => data.value?.variant ?? null)
const branches    = computed(() => (data.value?.branches ?? []) as any[])
const activePrices = computed(() => (data.value?.activePrices ?? {}) as Record<number, any>)
const changeLogs  = computed(() => (data.value?.changeLogs ?? []) as any[])

// ── Price form state (per branch) ─────────────────────────────────────────────
const newPrices    = reactive<Record<number, number>>({})
const newDates     = reactive<Record<number, string>>({})
const savingBranch = ref<number | null>(null)
const flash        = reactive({ msg: '', ok: true })

// Pre-fill dates with today
watch(branches, (bs) => {
  const today = new Date().toISOString().slice(0, 10)
  for (const b of bs) {
    if (!newDates[b.id]) newDates[b.id] = today
  }
}, { immediate: true })

async function setPrice(branchId: number) {
  const price = Number(newPrices[branchId])
  if (!price || price <= 0) return
  savingBranch.value = branchId
  try {
    await $fetch(`/api/products/pricing/${variantId}`, {
      method: 'POST',
      body: {
        branch_id:      branchId,
        unit_price:     price,
        effective_date: newDates[branchId] || new Date().toISOString().slice(0, 10),
        status:         'active',
      },
    })
    flash.ok = true
    flash.msg = `Price updated for ${branches.value.find((b: any) => b.id === branchId)?.name ?? 'branch'} ✓`
    setTimeout(() => { flash.msg = '' }, 4000)
    delete newPrices[branchId]
    await refresh()
  } catch (e: any) {
    flash.ok = false
    flash.msg = e?.data?.statusMessage ?? 'Failed to set price'
  } finally {
    savingBranch.value = null
  }
}

async function archivePrice(branchId: number) {
  if (!confirm(`Archive the active price for ${branches.value.find((b: any) => b.id === branchId)?.name ?? 'this branch'}?`)) return
  savingBranch.value = branchId
  try {
    await $fetch(`/api/products/pricing/${variantId}/archive`, {
      method: 'POST',
      body: { branch_id: branchId },
    })
    flash.ok = true
    flash.msg = 'Price archived ✓'
    setTimeout(() => { flash.msg = '' }, 3000)
    await refresh()
  } catch (e: any) {
    flash.ok = false
    flash.msg = e?.data?.statusMessage ?? 'Failed to archive'
  } finally {
    savingBranch.value = null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dt: string | null) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function gradeBadge(g: string) {
  const m: Record<string, string> = {
    A: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    B: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    C: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    R: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }
  return m[g] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

function changeTypeBadge(t: string) {
  const m: Record<string, string> = {
    set:     'bg-blue-500/15 text-blue-400',
    update:  'bg-emerald-500/15 text-emerald-400',
    archive: 'bg-gray-500/15 text-gray-400',
  }
  return m[t] ?? 'bg-white/10 text-gray-400'
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.fade-enter-active, .fade-leave-active   { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to         { opacity: 0; }
</style>

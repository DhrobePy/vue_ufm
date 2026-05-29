<template>
  <div class="space-y-6">
    <UiPageHeader title="Smart Pricing Engine" subtitle="Set one base price per grade — all variants and branches update automatically"
                  :breadcrumb="['Products', 'Pricing Engine']">
      <template #actions>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          🔒 Admin Only
        </span>
        <a href="/products/pricing" class="text-xs text-gray-500 hover:text-gray-300 underline">← Manual pricing</a>
      </template>
    </UiPageHeader>

    <!-- Flash -->
    <div v-if="flash.msg" :class="flash.ok ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'"
         class="glass-card px-4 py-3 text-sm border flex items-start gap-2">
      <span>{{ flash.ok ? '✓' : '✗' }}</span>
      <span>{{ flash.msg }}</span>
    </div>

    <!-- ══ SECTION 1: Formula & Surcharges ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
          <span class="text-gray-500">⚙</span> Pricing Rules Configuration
        </h2>
        <button @click="saveConfig" :disabled="savingConfig"
                class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50">
          {{ savingConfig ? 'Saving…' : 'Save Config' }}
        </button>
      </div>

      <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Formula -->
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">74 kg Auto-Price Formula</p>
          <div class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 font-mono text-xs text-blue-300 mb-4">
            price_74 = (price_50 ÷ <strong>{{ cfg.formula.bag_50 }}</strong>)
            × <strong>{{ cfg.formula.bag_74 }}</strong>
            + <strong>{{ cfg.formula.packaging_fee }}</strong>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] text-gray-500 mb-1">Bag size 50 kg</label>
              <input v-model.number="cfg.formula.bag_50" type="number" min="1" step="1"
                     class="input-glass w-full text-xs py-1.5 text-center font-mono" @input="recalcPreview" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-500 mb-1">Bag size 74 kg</label>
              <input v-model.number="cfg.formula.bag_74" type="number" min="1" step="1"
                     class="input-glass w-full text-xs py-1.5 text-center font-mono" @input="recalcPreview" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-500 mb-1">Packaging fee (৳)</label>
              <input v-model.number="cfg.formula.packaging_fee" type="number" step="0.01"
                     class="input-glass w-full text-xs py-1.5 text-center font-mono" @input="recalcPreview" />
            </div>
          </div>
          <p class="mt-2 text-[11px] text-gray-600">
            Example (Grade A, base ৳2,500): (2500÷{{ cfg.formula.bag_50 }})×{{ cfg.formula.bag_74 }}+{{ cfg.formula.packaging_fee }}
            = <strong class="text-gray-400">৳{{ exampleCalc74 }}</strong>
          </p>
        </div>

        <!-- Branch surcharges -->
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Branch Surcharges (৳ added to base)</p>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-600 border-b border-white/[0.04]">
                <th class="pb-2 text-left font-medium">Branch</th>
                <th class="pb-2 text-center font-medium">+ 50 kg</th>
                <th class="pb-2 text-center font-medium">+ 74 kg</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.03]">
              <tr v-for="b in branches" :key="b.id">
                <td class="py-1.5 text-gray-300 font-medium">{{ b.name }}
                  <span class="text-gray-600 text-[10px] ml-1">({{ b.code }})</span>
                </td>
                <td class="py-1.5 px-2">
                  <input v-model.number="cfg.branch_surcharges[b.id].surcharge_50" type="number" step="0.01"
                         class="input-glass w-full text-xs py-1 text-center font-mono" @input="recalcPreview" />
                </td>
                <td class="py-1.5 px-2">
                  <input v-model.number="cfg.branch_surcharges[b.id].surcharge_74" type="number" step="0.01"
                         class="input-glass w-full text-xs py-1 text-center font-mono" @input="recalcPreview" />
                </td>
              </tr>
            </tbody>
          </table>
          <p class="mt-2 text-[11px] text-gray-600">Surcharges apply to 50/74 kg products only. Custom-weight products use a flat price.</p>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 2: Grade-based prices ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06]">
        <h2 class="text-sm font-bold text-gray-200">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">1</span>
          Set Base 50 kg Price per Grade
        </h2>
        <p class="text-xs text-gray-500 mt-0.5">All products of a grade share the same grade price. 74 kg is auto-calculated.</p>
      </div>

      <div class="p-5 space-y-4">
        <div v-for="grade in grades" :key="grade"
             class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] transition-colors">
          <!-- Grade header -->
          <div class="flex items-center gap-3 px-4 py-3 bg-white/[0.025] border-b border-white/[0.06]">
            <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-500/20 text-gold-300 font-bold text-lg">
              {{ grade }}
            </span>
            <div>
              <p class="font-semibold text-gray-200 text-sm">Grade {{ grade }}</p>
              <p class="text-[11px] text-gray-600">
                {{ (gradeData[grade]?.['50'] ?? []).length }} × 50 kg ·
                {{ (gradeData[grade]?.['74'] ?? []).length }} × 74 kg
              </p>
            </div>
          </div>

          <div class="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <!-- Price input -->
            <div class="flex flex-col justify-center">
              <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Base 50 kg Price (৳)</label>
              <input v-model.number="base50[grade]" type="number" step="0.01" min="0"
                     placeholder="Enter price…"
                     class="input-glass w-full py-3 text-center font-bold text-xl text-gold-300"
                     @input="recalcPreview" />
              <div class="mt-2 text-center text-xs text-gray-500">
                74 kg auto → <span class="font-bold text-purple-400">{{ calc74For(grade) }}</span>
              </div>
            </div>

            <!-- 50 kg products list -->
            <div>
              <p class="text-[11px] font-semibold text-blue-400 uppercase tracking-wide mb-2">50 kg Products</p>
              <div v-if="!(gradeData[grade]?.['50']?.length)" class="text-xs text-gray-600 italic">None</div>
              <div v-else class="space-y-1 max-h-36 overflow-y-auto pr-1">
                <div v-for="v in gradeData[grade]['50']" :key="v.variant_id"
                     class="flex items-start gap-2 bg-blue-500/10 rounded-lg px-2.5 py-1.5">
                  <span class="text-blue-400 text-[10px] mt-0.5 shrink-0">📦</span>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-300 truncate">{{ v.product_name }}</p>
                    <p class="text-[10px] text-gray-600 truncate">
                      {{ v.sku }}
                      <span v-if="v.current_price !== null"> · Current: ৳{{ fmt(v.current_price) }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 74 kg products list -->
            <div>
              <p class="text-[11px] font-semibold text-purple-400 uppercase tracking-wide mb-2">74 kg Products (auto)</p>
              <div v-if="!(gradeData[grade]?.['74']?.length)" class="text-xs text-gray-600 italic">None</div>
              <div v-else class="space-y-1 max-h-36 overflow-y-auto pr-1">
                <div v-for="v in gradeData[grade]['74']" :key="v.variant_id"
                     class="flex items-start gap-2 bg-purple-500/10 rounded-lg px-2.5 py-1.5">
                  <span class="text-purple-400 text-[10px] mt-0.5 shrink-0">📦</span>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-300 truncate">{{ v.product_name }}</p>
                    <p class="text-[10px] text-gray-600 truncate">
                      {{ v.sku }}
                      <span v-if="v.current_price !== null"> · Current: ৳{{ fmt(v.current_price) }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 3: Custom-weight products ══ -->
    <div v-if="customAll.length" class="glass-card p-0 overflow-hidden border border-amber-500/20">
      <div class="px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
        <h2 class="text-sm font-bold text-amber-300">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold mr-2">2</span>
          Custom-Weight Products — Manual Price
        </h2>
        <p class="text-xs text-amber-500/80 mt-0.5">Non-standard bag weights. Formula does not apply — enter price directly. Leave blank to keep unchanged.</p>
      </div>
      <div class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in customAll" :key="item.variant_id"
               class="border border-white/[0.06] rounded-xl p-4 hover:border-amber-500/30 transition-colors">
            <p class="text-xs font-semibold text-gray-300 truncate">{{ item.product_name }}</p>
            <div class="flex items-center gap-2 mt-1 mb-3">
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">
                {{ item.weight_variant }} {{ item.uom }}
              </span>
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500">
                Grade {{ item.grade }}
              </span>
            </div>
            <label class="block text-[11px] text-gray-500 mb-1">Price per bag (৳)</label>
            <input v-model.number="customPrices[item.variant_id]" type="number" step="0.01" min="0"
                   placeholder="Enter price…"
                   class="input-glass w-full text-xs py-2 text-center font-mono font-bold" />
            <p v-if="item.current_price !== null" class="mt-1 text-[10px] text-gray-600 text-center">
              Current: ৳{{ fmt(item.current_price) }} (all branches)
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 4: Live Preview Table ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-200">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">
            {{ customAll.length ? '3' : '2' }}
          </span>
          Live Price Preview
          <span class="text-xs font-normal text-gray-600 ml-1">— updates as you type</span>
        </h2>
        <div class="flex items-center gap-3 text-[11px] text-gray-600">
          <span><span class="inline-block w-2 h-2 bg-blue-400 rounded-sm mr-1" />50 kg</span>
          <span><span class="inline-block w-2 h-2 bg-purple-400 rounded-sm mr-1" />74 kg</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="border-b border-white/[0.06]">
            <tr>
              <th class="px-4 py-2.5 text-left text-gray-600 font-semibold uppercase tracking-wider sticky left-0 bg-[#0f1117] min-w-[90px]">Grade</th>
              <th class="px-3 py-2.5 text-center text-blue-400 font-semibold uppercase bg-blue-500/5 min-w-[90px]">Base 50</th>
              <th class="px-3 py-2.5 text-center text-purple-400 font-semibold uppercase bg-purple-500/5 min-w-[90px]">Base 74</th>
              <template v-for="b in branches" :key="b.id">
                <th class="px-3 py-2.5 text-center text-blue-400/70 font-semibold bg-blue-500/5 min-w-[90px]">
                  {{ b.code }}<br /><span class="text-[10px] font-normal text-gray-600">50 kg</span>
                </th>
                <th class="px-3 py-2.5 text-center text-purple-400/70 font-semibold bg-purple-500/5 min-w-[90px]">
                  {{ b.code }}<br /><span class="text-[10px] font-normal text-gray-600">74 kg</span>
                </th>
              </template>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.03]">
            <tr v-for="grade in grades" :key="grade" class="hover:bg-white/[0.02]">
              <td class="px-4 py-2.5 font-bold text-gray-300 sticky left-0 bg-[#0f1117]">Grade {{ grade }}</td>
              <td class="px-3 py-2.5 text-center bg-blue-500/5 font-semibold text-blue-300">
                {{ preview[grade]?.base50 ?? '—' }}
              </td>
              <td class="px-3 py-2.5 text-center bg-purple-500/5 font-semibold text-purple-300">
                {{ preview[grade]?.base74 ?? '—' }}
              </td>
              <template v-for="b in branches" :key="b.id">
                <td class="px-3 py-2.5 text-center bg-blue-500/5 text-blue-300/80">
                  {{ preview[grade]?.branches[b.id]?.p50 ?? '—' }}
                </td>
                <td class="px-3 py-2.5 text-center bg-purple-500/5 text-purple-300/80">
                  {{ preview[grade]?.branches[b.id]?.p74 ?? '—' }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-2.5 border-t border-white/[0.04] text-[11px] text-gray-600 flex flex-wrap gap-4">
        <span>74 kg = (50 kg ÷ {{ cfg.formula.bag_50 }}) × {{ cfg.formula.bag_74 }} + {{ cfg.formula.packaging_fee }}</span>
        <span>Branch price = base + surcharge</span>
        <span>All products in the same grade share the same grade price</span>
      </div>
    </div>

    <!-- ══ SECTION 5: Review & Apply ══ -->
    <div class="glass-card p-5 flex items-center justify-between">
      <div>
        <p class="font-semibold text-gray-200 text-sm">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">
            {{ customAll.length ? '4' : '3' }}
          </span>
          Review &amp; Apply
        </p>
        <p class="text-xs text-gray-500 mt-0.5">Click <strong class="text-gray-400">Review Changes</strong> to see a full before/after comparison.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="resetPrices" class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors">
          ↺ Reset
        </button>
        <button @click="openReview" class="btn-gold text-xs px-5 py-2">
          🔍 Review Changes
        </button>
      </div>
    </div>

    <!-- ══ REVIEW MODAL ══ -->
    <Teleport to="body">
      <div v-if="reviewOpen"
           class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8"
           @click.self="reviewOpen = false">
        <div class="relative bg-[#0f1117] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col"
             style="max-height: 90vh">

          <!-- Header -->
          <div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-base font-bold text-gray-100">Review Price Changes</h3>
              <p class="text-xs text-gray-500 mt-0.5">Confirm all changes before they are written to the database.</p>
            </div>
            <button @click="reviewOpen = false" class="text-gray-600 hover:text-gray-300 text-lg">✕</button>
          </div>

          <!-- Stats bar -->
          <div class="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.02] flex flex-wrap gap-5 text-xs shrink-0">
            <span><strong class="text-gray-200">{{ reviewRows.length }}</strong> <span class="text-gray-500">rows</span></span>
            <span><strong class="text-emerald-400">{{ reviewStats.increases }}</strong> <span class="text-gray-500">increases</span></span>
            <span><strong class="text-red-400">{{ reviewStats.decreases }}</strong> <span class="text-gray-500">decreases</span></span>
            <span><strong class="text-gray-400">{{ reviewStats.unchanged }}</strong> <span class="text-gray-500">unchanged</span></span>
            <span><strong class="text-blue-400">{{ reviewStats.isNew }}</strong> <span class="text-gray-500">new (no prior price)</span></span>
          </div>

          <!-- Table -->
          <div class="overflow-y-auto flex-1 min-h-0">
            <table class="w-full text-xs">
              <thead class="sticky top-0 z-10 bg-[#0f1117] border-b border-white/[0.06]">
                <tr class="text-gray-600 uppercase tracking-wide">
                  <th class="px-4 py-2.5 text-left font-semibold">Grade / Product</th>
                  <th class="px-4 py-2.5 text-left font-semibold">Branch</th>
                  <th class="px-4 py-2.5 text-center font-semibold">Weight</th>
                  <th class="px-4 py-2.5 text-center font-semibold">Current</th>
                  <th class="px-4 py-2.5 text-center font-semibold">New Price</th>
                  <th class="px-4 py-2.5 text-center font-semibold">Δ Change</th>
                  <th class="px-4 py-2.5 text-center font-semibold">%</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.03]">
                <tr v-for="(r, i) in reviewRows" :key="i"
                    :class="{
                      'bg-blue-500/5':    r.delta === null,
                      'bg-emerald-500/5': r.delta !== null && r.delta > 0.005,
                      'bg-red-500/5':     r.delta !== null && r.delta < -0.005,
                    }">
                  <td class="px-4 py-2 font-semibold text-gray-300">{{ r.label }}</td>
                  <td class="px-4 py-2 text-gray-400">{{ r.branch }}</td>
                  <td class="px-4 py-2 text-center">
                    <span :class="r.weight.startsWith('50') ? 'bg-blue-500/20 text-blue-300' : r.weight.includes('custom') ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'"
                          class="px-1.5 py-0.5 rounded text-[10px] font-medium">{{ r.weight }}</span>
                  </td>
                  <td class="px-4 py-2 text-center">
                    <span v-if="r.curr !== null" class="text-gray-400 font-mono">৳{{ fmt(r.curr) }}</span>
                    <span v-else class="text-blue-400 text-[10px] font-medium">New</span>
                  </td>
                  <td class="px-4 py-2 text-center font-bold font-mono text-gray-200">৳{{ fmt(r.newP) }}</td>
                  <td class="px-4 py-2 text-center font-mono">
                    <span v-if="r.delta === null" class="text-blue-400 text-[10px]">No prior</span>
                    <span v-else-if="r.delta > 0.005" class="text-emerald-400">+৳{{ fmt(r.delta) }}</span>
                    <span v-else-if="r.delta < -0.005" class="text-red-400">(৳{{ fmt(Math.abs(r.delta)) }})</span>
                    <span v-else class="text-gray-600">—</span>
                  </td>
                  <td class="px-4 py-2 text-center font-mono">
                    <span v-if="r.pct !== null && Math.abs(r.delta ?? 0) > 0.005"
                          :class="(r.delta ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'">
                      {{ (r.delta ?? 0) > 0 ? '+' : '' }}{{ r.pct.toFixed(1) }}%
                    </span>
                    <span v-else class="text-gray-600">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 rounded-b-2xl">
            <div class="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg">
              ⚠ Existing prices will be <strong>archived</strong> and replaced with the prices shown above.
            </div>
            <div class="flex items-center gap-3">
              <button @click="reviewOpen = false"
                      class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors">
                ← Go Back
              </button>
              <button @click="applyPrices" :disabled="applying"
                      class="btn-gold text-xs px-6 py-2 disabled:opacity-50">
                <svg v-if="applying" class="w-3 h-3 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ applying ? 'Applying…' : '✓ Confirm & Apply' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// ── Data from API ─────────────────────────────────────────────────────────────
const { data, refresh } = await useFetch('/api/products/pricing-engine')

const raw          = computed(() => data.value as any)
const grades       = computed<string[]>(() => raw.value?.grades ?? [])
const gradeData    = computed<Record<string, Record<string, any[]>>>(() => raw.value?.gradeData ?? {})
const branches     = computed<any[]>(() => raw.value?.branches ?? [])
const currentPrices = computed<any>(() => raw.value?.currentPrices ?? {})
const customCurrentPrices = computed<any>(() => raw.value?.customCurrent ?? {})

// ── Config (reactive local copy) ─────────────────────────────────────────────
const cfg = reactive({
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
  branch_surcharges: {} as Record<number, { surcharge_50: number; surcharge_74: number }>,
})

watch(data, () => {
  const c = (data.value as any)?.config
  if (!c) return
  cfg.formula.bag_50        = c.formula?.bag_50        ?? 50
  cfg.formula.bag_74        = c.formula?.bag_74        ?? 74
  cfg.formula.packaging_fee = c.formula?.packaging_fee ?? 150
  for (const b of ((data.value as any)?.branches ?? [])) {
    cfg.branch_surcharges[b.id] = {
      surcharge_50: c.branch_surcharges?.[b.id]?.surcharge_50 ?? 0,
      surcharge_74: c.branch_surcharges?.[b.id]?.surcharge_74 ?? 0,
    }
  }
}, { immediate: true })

// ── Base 50 kg inputs per grade ───────────────────────────────────────────────
const base50 = reactive<Record<string, number | null>>({})
watch(data, () => {
  for (const g of (raw.value?.grades ?? [])) {
    if (base50[g] === undefined)
      base50[g] = raw.value?.current50?.[g] ?? null
  }
}, { immediate: true })

// ── Custom-weight price inputs ────────────────────────────────────────────────
const customPrices = reactive<Record<number, number | null>>({})

const customAll = computed(() => {
  const list: any[] = []
  for (const [, wcs] of Object.entries(gradeData.value)) {
    for (const item of ((wcs as any)['custom'] ?? [])) {
      list.push(item)
      if (customPrices[item.variant_id] === undefined)
        customPrices[item.variant_id] = item.current_price ?? null
    }
  }
  return list
})

// ── Computed helpers ──────────────────────────────────────────────────────────
function calc74(base50Val: number): number {
  return Math.round(((base50Val / cfg.formula.bag_50) * cfg.formula.bag_74 + cfg.formula.packaging_fee) * 100) / 100
}

const exampleCalc74 = computed(() => fmt(calc74(2500)))

function calc74For(grade: string): string {
  const v = base50[grade]
  if (!v || v <= 0) return '—'
  return '৳' + fmt(calc74(v))
}

function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Live preview table ────────────────────────────────────────────────────────
type PreviewRow = { base50: string; base74: string; branches: Record<number, { p50: string; p74: string }> }
const preview = reactive<Record<string, PreviewRow>>({})

function recalcPreview() {
  for (const grade of grades.value) {
    const b50 = Number(base50[grade])
    if (!b50 || b50 <= 0) {
      preview[grade] = { base50: '—', base74: '—', branches: {} }
      continue
    }
    const b74 = calc74(b50)
    const brs: Record<number, { p50: string; p74: string }> = {}
    for (const b of branches.value) {
      const sc = cfg.branch_surcharges[b.id] ?? { surcharge_50: 0, surcharge_74: 0 }
      brs[b.id] = {
        p50: '৳' + fmt(b50 + Number(sc.surcharge_50 ?? 0)),
        p74: '৳' + fmt(b74 + Number(sc.surcharge_74 ?? 0)),
      }
    }
    preview[grade] = { base50: '৳' + fmt(b50), base74: '৳' + fmt(b74), branches: brs }
  }
}

watch([base50, cfg], recalcPreview, { deep: true, immediate: true })

function resetPrices() {
  if (!confirm('Reset all grade inputs to current DB values?')) return
  for (const g of grades.value)
    base50[g] = raw.value?.current50?.[g] ?? null
  for (const item of customAll.value)
    customPrices[item.variant_id] = item.current_price ?? null
}

// ── Save config ───────────────────────────────────────────────────────────────
const savingConfig = ref(false)
const flash = reactive({ msg: '', ok: true })

async function saveConfig() {
  savingConfig.value = true
  try {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'save_config', ...cfg.formula, branch_surcharges: cfg.branch_surcharges },
    })
    flash.ok = true; flash.msg = 'Formula config saved.'
    setTimeout(() => flash.msg = '', 4000)
  } catch (e: any) {
    flash.ok = false; flash.msg = e?.data?.statusMessage ?? 'Failed to save config'
  } finally {
    savingConfig.value = false
  }
}

// ── Review modal ──────────────────────────────────────────────────────────────
const reviewOpen = ref(false)

interface ReviewRow {
  label: string; branch: string; weight: string
  curr: number | null; newP: number; delta: number | null; pct: number | null
}
const reviewRows = ref<ReviewRow[]>([])

const reviewStats = computed(() => {
  let increases = 0, decreases = 0, unchanged = 0, isNew = 0
  for (const r of reviewRows.value) {
    if (r.delta === null) isNew++
    else if (r.delta > 0.005) increases++
    else if (r.delta < -0.005) decreases++
    else unchanged++
  }
  return { increases, decreases, unchanged, isNew }
})

function openReview() {
  const rows: ReviewRow[] = []

  // Grade-based rows
  for (const grade of grades.value) {
    const b50 = Number(base50[grade])
    if (!b50 || b50 <= 0) continue
    const b74 = calc74(b50)

    for (const branch of branches.value) {
      const sc = cfg.branch_surcharges[branch.id] ?? { surcharge_50: 0, surcharge_74: 0 }
      for (const [wc, baseP] of [['50', b50], ['74', b74]] as [string, number][]) {
        const surcharge = wc === '50' ? Number(sc.surcharge_50 ?? 0) : Number(sc.surcharge_74 ?? 0)
        const newP  = Math.round((baseP + surcharge) * 100) / 100
        const currP = currentPrices.value?.[grade]?.[String(branch.id)]?.[wc] ?? null
        const delta = currP !== null ? newP - currP : null
        const pct   = (currP && delta !== null) ? (delta / currP) * 100 : null
        rows.push({ label: `Grade ${grade}`, branch: branch.name, weight: `${wc} kg`, curr: currP, newP, delta, pct })
      }
    }
  }

  // Custom-weight rows
  for (const item of customAll.value) {
    const newP = Number(customPrices[item.variant_id])
    if (!newP || newP <= 0) continue
    for (const branch of branches.value) {
      const currP = customCurrentPrices.value?.[String(item.variant_id)]?.[String(branch.id)] ?? null
      const delta = currP !== null ? newP - currP : null
      const pct   = (currP && delta !== null) ? (delta / currP) * 100 : null
      rows.push({ label: item.product_name, branch: branch.name, weight: `${item.weight_variant} kg (custom)`, curr: currP, newP, delta, pct })
    }
  }

  if (!rows.length) {
    toastError('Enter at least one price before reviewing.')
    return
  }
  reviewRows.value = rows
  reviewOpen.value = true
}

// ── Apply prices ──────────────────────────────────────────────────────────────
const applying = ref(false)

async function applyPrices() {
  applying.value = true
  try {
    const base50ByGrade: Record<string, number> = {}
    for (const g of grades.value) {
      const v = Number(base50[g])
      if (v > 0) base50ByGrade[g] = v
    }
    const cPrices: Record<string, number> = {}
    for (const item of customAll.value) {
      const v = Number(customPrices[item.variant_id])
      if (v > 0) cPrices[String(item.variant_id)] = v
    }
    const res: any = await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'apply_prices', base50ByGrade, customPrices: cPrices, config: cfg },
    })
    reviewOpen.value = false
    flash.ok = true; flash.msg = res.message ?? `Applied — ${res.totalUpdated} price records updated.`
    setTimeout(() => flash.msg = '', 6000)
    success(flash.msg)
    await refresh()
    recalcPreview()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to apply prices')
  } finally {
    applying.value = false
  }
}
</script>

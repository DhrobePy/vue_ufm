<template>
  <div class="space-y-6">
    <UiPageHeader title="Smart Pricing Engine" subtitle="Factory base prices flow to every sales region — freight & charges added automatically"
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

    <!-- Unassigned regions warning -->
    <div v-if="unassignedRegions.length"
         class="glass-card px-4 py-3 text-sm border bg-amber-500/10 border-amber-500/25 text-amber-300 flex items-start gap-2">
      <span>⚠</span>
      <span>
        <strong>{{ unassignedRegions.map(r => r.name).join(', ') }}</strong>
        {{ unassignedRegions.length === 1 ? 'has' : 'have' }} no source factory assigned —
        the engine will skip {{ unassignedRegions.length === 1 ? 'it' : 'them' }}.
        Assign one in <strong>Branch Network</strong> below.
      </span>
    </div>

    <!-- ══ SECTION 1: Formula constants ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
          <span class="text-gray-500">⚙</span> Formula Constants
        </h2>
        <button @click="saveConfig" :disabled="savingConfig"
                class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50">
          {{ savingConfig ? 'Saving…' : 'Save Constants' }}
        </button>
      </div>
      <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">74 kg Auto-Price Formula</p>
          <div class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 font-mono text-xs text-blue-300 mb-4">
            price_74 = ⌊((price_50 ÷ <strong>{{ cfg.formula.bag_50 }}</strong>)
            × <strong>{{ cfg.formula.bag_74 }}</strong>
            + <strong>{{ cfg.formula.packaging_fee }}</strong>) ⌋₅
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] text-gray-500 mb-1">Bag size 50 kg</label>
              <input v-model.number="cfg.formula.bag_50" type="number" min="1" step="1"
                     class="input-glass w-full text-xs py-1.5 text-center font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-500 mb-1">Bag size 74 kg</label>
              <input v-model.number="cfg.formula.bag_74" type="number" min="1" step="1"
                     class="input-glass w-full text-xs py-1.5 text-center font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-500 mb-1">Packaging fee (৳)</label>
              <input v-model.number="cfg.formula.packaging_fee" type="number" step="0.01"
                     class="input-glass w-full text-xs py-1.5 text-center font-mono" />
            </div>
          </div>
          <p class="mt-2 text-[11px] text-gray-600">
            Example (base ৳2,500): ⌊(2500÷{{ cfg.formula.bag_50 }})×{{ cfg.formula.bag_74 }}+{{ cfg.formula.packaging_fee }}⌋₅
            = <strong class="text-gray-400">৳{{ fmt(calc74(2500)) }}</strong>
            &nbsp;·&nbsp; ⌊…⌋₅ = rounded down to nearest ৳5
          </p>
        </div>
        <div class="text-xs text-gray-500 space-y-2 self-center">
          <p class="font-semibold text-gray-400 uppercase tracking-wide">How pricing flows</p>
          <p>1️⃣ Each <strong class="text-gray-300">factory</strong> gets a base 50 kg price per grade → its 74 kg price is auto-computed.</p>
          <p>2️⃣ Each <strong class="text-gray-300">sales region</strong> takes its source factory's price and adds its own charges (freight, handling…).</p>
          <p>3️⃣ <strong class="text-gray-300">Mini-truck</strong> charges are never baked into the price list — they're added per bag at order time.</p>
          <p>Every stored price lands on a ৳5 boundary.</p>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 2: Branch Network ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
          <span class="text-gray-500">🏭</span> Branch Network
          <span class="text-xs font-normal text-gray-600 ml-1">— which branch produces, which sells</span>
        </h2>
        <button v-if="isAdmin" @click="saveBranchSetup" :disabled="savingSetup"
                class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50">
          {{ savingSetup ? 'Saving…' : 'Save Network' }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="border-b border-white/[0.04]">
            <tr class="text-gray-600 uppercase tracking-wide text-[10px]">
              <th class="px-5 py-2.5 text-left font-semibold">Branch</th>
              <th class="px-3 py-2.5 text-left font-semibold">Type</th>
              <th class="px-3 py-2.5 text-left font-semibold">Source Factory</th>
              <th class="px-3 py-2.5 text-left font-semibold">Priced by Engine</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.03]">
            <tr v-for="b in branchSetup" :key="b.id" class="hover:bg-white/[0.02]">
              <td class="px-5 py-2.5">
                <span class="font-semibold text-gray-300">{{ b.name }}</span>
                <span class="text-gray-600 font-mono text-[10px] ml-1.5">{{ b.code }}</span>
              </td>
              <td class="px-3 py-2">
                <select v-model="b.branch_type" :disabled="!isAdmin"
                        class="input-glass text-xs py-1 w-36 disabled:opacity-60">
                  <option value="factory">🏭 Factory</option>
                  <option value="sales_region">📍 Sales Region</option>
                  <option value="office">🏢 Office</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <select v-if="b.branch_type === 'sales_region'" v-model="b.source_branch_id" :disabled="!isAdmin"
                        class="input-glass text-xs py-1 w-40 disabled:opacity-60"
                        :class="!b.source_branch_id ? 'border-amber-500/40' : ''">
                  <option :value="null">— Not assigned —</option>
                  <option v-for="f in setupFactories" :key="f.id" :value="f.id">{{ f.name }}</option>
                </select>
                <span v-else class="text-gray-700">—</span>
              </td>
              <td class="px-3 py-2">
                <span v-if="b.branch_type === 'factory'" class="text-emerald-400">✓ Ex-factory price</span>
                <span v-else-if="b.branch_type === 'sales_region' && b.source_branch_id" class="text-sky-400">✓ Via {{ factoryName(b.source_branch_id) }}</span>
                <span v-else-if="b.branch_type === 'sales_region'" class="text-amber-400">⚠ Needs source factory</span>
                <span v-else class="text-gray-700">Not priced</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ SECTION 3: Regional charges ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06]">
        <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
          <span class="text-gray-500">🚚</span> Branch Charges
          <span class="text-xs font-normal text-gray-600 ml-1">— freight &amp; extras added on top of the factory price</span>
        </h2>
      </div>
      <div class="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="b in chargeableBranches" :key="b.id"
             class="border border-white/[0.06] rounded-xl overflow-hidden">
          <div class="px-4 py-2.5 bg-white/[0.025] border-b border-white/[0.05] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs">{{ b.branch_type === 'factory' ? '🏭' : '📍' }}</span>
              <span class="font-semibold text-gray-200 text-xs">{{ b.name }}</span>
              <span v-if="b.branch_type === 'sales_region' && b.source_branch_id"
                    class="text-[10px] text-gray-600">via {{ factoryName(b.source_branch_id) }}</span>
            </div>
            <button @click="saveComponents(b.id)" :disabled="savingComps === b.id"
                    class="text-[11px] px-3 py-1 rounded-lg bg-gold-500/15 text-gold-400 border border-gold-500/20 hover:bg-gold-500/25 disabled:opacity-40 transition-colors">
              {{ savingComps === b.id ? '…' : 'Save' }}
            </button>
          </div>
          <div class="p-3 space-y-2">
            <div v-if="!(comps[b.id]?.length)" class="text-[11px] text-gray-700 italic px-1">
              No charges — {{ b.branch_type === 'factory' ? 'price = base price' : 'price = factory price' }}
            </div>
            <div v-for="(c, i) in comps[b.id]" :key="i" class="flex items-center gap-1.5">
              <input v-model="c.name" type="text" placeholder="Charge name…"
                     class="input-glass text-xs py-1 flex-1 min-w-0" />
              <select v-model="c.weight_class" class="input-glass text-xs py-1 w-16 shrink-0">
                <option value="all">All</option>
                <option value="50">50kg</option>
                <option value="74">74kg</option>
              </select>
              <select v-model="c.charge_type" class="input-glass text-xs py-1 w-28 shrink-0"
                      :title="c.charge_type === 'base' ? 'Included in the stored price' : 'Added per bag at order time only'">
                <option value="base">In price</option>
                <option value="mini_truck">Mini-truck</option>
              </select>
              <div class="flex items-center gap-0.5 shrink-0">
                <span class="text-[10px] text-gray-600">৳</span>
                <input v-model.number="c.amount" type="number" step="1"
                       class="input-glass text-xs py-1 w-16 text-right font-mono" />
              </div>
              <button @click="comps[b.id].splice(i, 1)"
                      class="text-gray-700 hover:text-red-400 text-sm leading-none shrink-0 px-0.5">✕</button>
            </div>
            <button @click="addComponent(b.id)"
                    class="text-[11px] text-gray-600 hover:text-gold-400 transition-colors">
              + Add charge
            </button>
            <div v-if="baseChargeTotal(b.id, '50') || baseChargeTotal(b.id, '74') || miniTruckTotal(b.id)"
                 class="pt-1.5 border-t border-white/[0.04] flex flex-wrap gap-3 text-[10px] text-gray-600">
              <span>In price: <strong class="text-gray-400">+৳{{ baseChargeTotal(b.id, '50') }}</strong> (50kg) · <strong class="text-gray-400">+৳{{ baseChargeTotal(b.id, '74') }}</strong> (74kg)</span>
              <span v-if="miniTruckTotal(b.id)">Mini-truck at order: <strong class="text-amber-400">+৳{{ miniTruckTotal(b.id) }}</strong>/bag</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 4: Base prices per grade, per factory ══ -->
    <div class="glass-card p-0 overflow-hidden">
      <div class="px-5 py-3 border-b border-white/[0.06]">
        <h2 class="text-sm font-bold text-gray-200">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">1</span>
          Set Ex-Factory 50 kg Price per Grade
        </h2>
        <p class="text-xs text-gray-500 mt-0.5">One base price per grade per factory. 74 kg and all region prices are computed automatically.</p>
      </div>

      <div class="p-5 space-y-4">
        <div v-for="grade in grades" :key="grade"
             class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] transition-colors">
          <div class="flex items-center gap-3 px-4 py-3 bg-white/[0.025] border-b border-white/[0.06]">
            <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-500/20 text-gold-300 font-bold text-lg">
              {{ grade }}
            </span>
            <div>
              <p class="font-semibold text-gray-200 text-sm">Grade {{ grade }}</p>
              <p class="text-[11px] text-gray-600">
                {{ (gradeData[grade]?.['50'] ?? []).length }} × 50 kg ·
                {{ (gradeData[grade]?.['74'] ?? []).length }} × 74 kg
                <span class="ml-2 text-gray-700">{{ gradeProductNames(grade) }}</span>
              </p>
            </div>
          </div>

          <div class="p-4 grid gap-4" :class="factories.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'">
            <div v-for="f in factories" :key="f.id"
                 class="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3.5">
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">🏭 {{ f.name }}</p>
              <input v-model.number="base50[f.id][grade]" type="number" step="1" min="0"
                     placeholder="Base 50 kg price…"
                     class="input-glass w-full py-2.5 text-center font-bold text-lg text-gold-300" />
              <div class="mt-2 flex items-center justify-between text-[11px] text-gray-600">
                <span>74 kg auto → <strong class="text-purple-400">{{ calc74Label(f.id, grade) }}</strong></span>
                <span v-if="current50ByFactory[String(f.id)]?.[grade] !== undefined" class="text-gray-700">
                  Now ৳{{ fmt(current50ByFactory[String(f.id)][grade]) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 5: Custom-weight products ══ -->
    <div v-if="customAll.length" class="glass-card p-0 overflow-hidden border border-amber-500/20">
      <div class="px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
        <h2 class="text-sm font-bold text-amber-300">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold mr-2">2</span>
          Custom-Weight Products — Manual Ex-Factory Price
        </h2>
        <p class="text-xs text-amber-500/80 mt-0.5">Non-standard bag weights. Regions add their "All"-class charges on top. Leave blank to keep unchanged.</p>
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
            <label class="block text-[11px] text-gray-500 mb-1">Ex-factory price per bag (৳)</label>
            <input v-model.number="customPrices[item.variant_id]" type="number" step="1" min="0"
                   placeholder="Enter price…"
                   class="input-glass w-full text-xs py-2 text-center font-mono font-bold" />
            <p v-if="item.current_price !== null" class="mt-1 text-[10px] text-gray-600 text-center">
              Current lowest: ৳{{ fmt(item.current_price) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION 6: Live Preview ══ -->
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
              <template v-for="b in pricedBranches" :key="b.id">
                <th class="px-3 py-2.5 text-center text-blue-400/70 font-semibold bg-blue-500/5 min-w-[90px]">
                  {{ b.code }}<br />
                  <span class="text-[10px] font-normal text-gray-600">50 kg{{ b.branch_type === 'sales_region' ? ' · via ' + factoryCode(b.source_branch_id) : '' }}</span>
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
              <template v-for="b in pricedBranches" :key="b.id">
                <td class="px-3 py-2.5 text-center bg-blue-500/5 text-blue-300/80 font-mono">
                  {{ previewPrice(b, grade, '50') }}
                </td>
                <td class="px-3 py-2.5 text-center bg-purple-500/5 text-purple-300/80 font-mono">
                  {{ previewPrice(b, grade, '74') }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-2.5 border-t border-white/[0.04] text-[11px] text-gray-600 flex flex-wrap gap-4">
        <span>Region price = ⌊factory price + region charges⌋₅</span>
        <span>Mini-truck charges are applied at order time, not shown here</span>
        <span>All prices floor to ৳5</span>
      </div>
    </div>

    <!-- ══ SECTION 7: Review & Apply ══ -->
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

          <div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-base font-bold text-gray-100">Review Price Changes</h3>
              <p class="text-xs text-gray-500 mt-0.5">Confirm all changes before they are written to the database.</p>
            </div>
            <button @click="reviewOpen = false" class="text-gray-600 hover:text-gray-300 text-lg">✕</button>
          </div>

          <div class="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.02] flex flex-wrap gap-5 text-xs shrink-0">
            <span><strong class="text-gray-200">{{ reviewRows.length }}</strong> <span class="text-gray-500">rows</span></span>
            <span><strong class="text-emerald-400">{{ reviewStats.increases }}</strong> <span class="text-gray-500">increases</span></span>
            <span><strong class="text-red-400">{{ reviewStats.decreases }}</strong> <span class="text-gray-500">decreases</span></span>
            <span><strong class="text-gray-400">{{ reviewStats.unchanged }}</strong> <span class="text-gray-500">unchanged</span></span>
            <span><strong class="text-blue-400">{{ reviewStats.isNew }}</strong> <span class="text-gray-500">new (no prior price)</span></span>
          </div>

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
const { user } = useUserSession()

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()),
)

// ── Data from API ─────────────────────────────────────────────────────────────
const { data, refresh } = await useFetch('/api/products/pricing-engine')

const raw           = computed(() => data.value as any)
const grades        = computed<string[]>(() => raw.value?.grades ?? [])
const gradeData     = computed<Record<string, Record<string, any[]>>>(() => raw.value?.gradeData ?? {})
const allBranches   = computed<any[]>(() => raw.value?.branches ?? [])
const currentPrices = computed<any>(() => raw.value?.currentPrices ?? {})
const customCurrentPrices = computed<any>(() => raw.value?.customCurrent ?? {})
const current50ByFactory  = computed<Record<string, Record<string, number>>>(() => raw.value?.current50ByFactory ?? {})

// ── Rounding: floor to nearest ৳5 — must match server ────────────────────────
function roundDown5(v: number): number {
  return Math.floor(v / 5) * 5
}

// ── Branch setup (editable local copy) ───────────────────────────────────────
const branchSetup = ref<any[]>([])
watch(data, () => {
  branchSetup.value = (raw.value?.branches ?? []).map((b: any) => ({
    ...b,
    branch_type:      b.branch_type ?? 'sales_region',
    source_branch_id: b.source_branch_id ?? null,
  }))
}, { immediate: true })

const setupFactories    = computed(() => branchSetup.value.filter(b => b.branch_type === 'factory'))
const factories         = computed(() => branchSetup.value.filter(b => b.branch_type === 'factory'))
const regions           = computed(() => branchSetup.value.filter(b => b.branch_type === 'sales_region'))
const unassignedRegions = computed(() => regions.value.filter(r => !r.source_branch_id))
const pricedBranches    = computed(() => [
  ...factories.value,
  ...regions.value.filter(r => r.source_branch_id),
])
const chargeableBranches = computed(() => branchSetup.value.filter(b => b.branch_type !== 'office'))

function factoryName(id: number | null): string {
  return factories.value.find(f => f.id === id)?.name ?? '?'
}
function factoryCode(id: number | null): string {
  return factories.value.find(f => f.id === id)?.code ?? '?'
}

// ── Config ────────────────────────────────────────────────────────────────────
const cfg = reactive({ formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 } })
watch(data, () => {
  const c = raw.value?.config
  if (!c) return
  cfg.formula.bag_50        = c.formula?.bag_50        ?? 50
  cfg.formula.bag_74        = c.formula?.bag_74        ?? 74
  cfg.formula.packaging_fee = c.formula?.packaging_fee ?? 150
}, { immediate: true })

// ── Charge components (editable local copy per branch) ───────────────────────
interface Comp { name: string; weight_class: string; charge_type: string; amount: number; is_active: number }
const comps = reactive<Record<number, Comp[]>>({})
watch(data, () => {
  const byBranch = raw.value?.componentsByBranch ?? {}
  for (const b of (raw.value?.branches ?? [])) {
    comps[b.id] = (byBranch[String(b.id)] ?? []).map((c: any) => ({
      name: c.name, weight_class: c.weight_class, charge_type: c.charge_type,
      amount: Number(c.amount), is_active: c.is_active,
    }))
  }
}, { immediate: true })

function addComponent(branchId: number) {
  if (!comps[branchId]) comps[branchId] = []
  comps[branchId].push({ name: '', weight_class: 'all', charge_type: 'base', amount: 0, is_active: 1 })
}

/** Sum of active in-price charges for a branch + weight class ('all' always counts). */
function sumBaseCharges(branchId: number, wc: string): number {
  return (comps[branchId] ?? [])
    .filter(c => c.is_active && c.charge_type === 'base' && (c.weight_class === wc || c.weight_class === 'all'))
    .reduce((s, c) => s + (Number(c.amount) || 0), 0)
}
function baseChargeTotal(branchId: number, wc: string): number { return sumBaseCharges(branchId, wc) }
function miniTruckTotal(branchId: number): number {
  return (comps[branchId] ?? [])
    .filter(c => c.is_active && c.charge_type === 'mini_truck')
    .reduce((s, c) => s + (Number(c.amount) || 0), 0)
}

// ── Base 50 kg inputs: per factory → per grade ────────────────────────────────
const base50 = reactive<Record<number, Record<string, number | null>>>({})
watch([data, factories], () => {
  for (const f of factories.value) {
    if (!base50[f.id]) base50[f.id] = {}
    for (const g of grades.value) {
      if (base50[f.id][g] === undefined)
        base50[f.id][g] = current50ByFactory.value?.[String(f.id)]?.[g] ?? null
    }
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

// ── Price math (mirrors server exactly) ───────────────────────────────────────
function calc74(base50Val: number): number {
  return roundDown5((base50Val / cfg.formula.bag_50) * cfg.formula.bag_74 + cfg.formula.packaging_fee)
}

function calc74Label(factoryId: number, grade: string): string {
  const v = Number(base50[factoryId]?.[grade])
  if (!v || v <= 0) return '—'
  return '৳' + fmt(calc74(v))
}

/** Computed engine price for a branch/grade/weight-class, or null if no base set. */
function enginePrice(b: any, grade: string, wc: '50' | '74'): number | null {
  const factoryId = b.branch_type === 'factory' ? b.id : b.source_branch_id
  if (!factoryId) return null
  const b50 = Number(base50[factoryId]?.[grade])
  if (!b50 || b50 <= 0) return null
  const base = wc === '50' ? b50 : calc74(b50)
  const factoryPrice = roundDown5(base + sumBaseCharges(factoryId, wc))
  if (b.branch_type === 'factory') return factoryPrice
  return roundDown5(factoryPrice + sumBaseCharges(b.id, wc))
}

function previewPrice(b: any, grade: string, wc: '50' | '74'): string {
  const p = enginePrice(b, grade, wc)
  return p === null ? '—' : '৳' + fmt(p)
}

function gradeProductNames(grade: string): string {
  const names = new Set<string>()
  for (const wc of ['50', '74']) {
    for (const v of (gradeData.value[grade]?.[wc] ?? [])) names.add(v.product_name)
  }
  return [...names].slice(0, 3).join(', ') + (names.size > 3 ? '…' : '')
}

function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString('en-BD', { maximumFractionDigits: 2 })
}

function resetPrices() {
  if (!confirm('Reset all inputs to current DB values?')) return
  for (const f of factories.value) {
    for (const g of grades.value)
      base50[f.id][g] = current50ByFactory.value?.[String(f.id)]?.[g] ?? null
  }
  for (const item of customAll.value)
    customPrices[item.variant_id] = item.current_price ?? null
}

// ── Save actions ──────────────────────────────────────────────────────────────
const savingConfig = ref(false)
const savingSetup  = ref(false)
const savingComps  = ref<number | null>(null)
const flash = reactive({ msg: '', ok: true })

function flashMsg(msg: string, ok = true, ms = 4000) {
  flash.ok = ok; flash.msg = msg
  setTimeout(() => { if (flash.msg === msg) flash.msg = '' }, ms)
}

async function saveConfig() {
  savingConfig.value = true
  try {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'save_config', ...cfg.formula },
    })
    flashMsg('Formula constants saved.')
  } catch (e: any) {
    flashMsg(e?.data?.statusMessage ?? 'Failed to save config', false)
  } finally {
    savingConfig.value = false
  }
}

async function saveBranchSetup() {
  savingSetup.value = true
  try {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: {
        action: 'save_branch_setup',
        branches: branchSetup.value.map(b => ({
          id: b.id, branch_type: b.branch_type, source_branch_id: b.source_branch_id,
        })),
      },
    })
    flashMsg('Branch network saved.')
    await refresh()
  } catch (e: any) {
    flashMsg(e?.data?.statusMessage ?? 'Failed to save branch setup', false)
  } finally {
    savingSetup.value = false
  }
}

async function saveComponents(branchId: number) {
  savingComps.value = branchId
  try {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'save_components', branch_id: branchId, components: comps[branchId] ?? [] },
    })
    flashMsg('Charges saved.')
  } catch (e: any) {
    flashMsg(e?.data?.statusMessage ?? 'Failed to save charges', false)
  } finally {
    savingComps.value = null
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

  // Grade-based rows — exact same chain the server will run
  for (const grade of grades.value) {
    for (const b of pricedBranches.value) {
      for (const wc of ['50', '74'] as const) {
        const newP = enginePrice(b, grade, wc)
        if (newP === null) continue
        const currP = currentPrices.value?.[grade]?.[String(b.id)]?.[wc] ?? null
        const delta = currP !== null ? newP - currP : null
        const pct   = (currP && delta !== null) ? (delta / currP) * 100 : null
        rows.push({
          label: `Grade ${grade}`,
          branch: b.name + (b.branch_type === 'sales_region' ? ` (via ${factoryCode(b.source_branch_id)})` : ''),
          weight: `${wc} kg`, curr: currP, newP, delta, pct,
        })
      }
    }
  }

  // Custom-weight rows
  for (const item of customAll.value) {
    const exFactory = roundDown5(Number(customPrices[item.variant_id]))
    if (!exFactory || exFactory <= 0) continue
    for (const b of pricedBranches.value) {
      const newP = b.branch_type === 'factory'
        ? exFactory
        : roundDown5(exFactory + sumBaseCharges(b.id, 'custom'))
      const currP = customCurrentPrices.value?.[String(item.variant_id)]?.[String(b.id)] ?? null
      const delta = currP !== null ? newP - currP : null
      const pct   = (currP && delta !== null) ? (delta / currP) * 100 : null
      rows.push({ label: item.product_name, branch: b.name, weight: `${item.weight_variant} kg (custom)`, curr: currP, newP, delta, pct })
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
    const base50ByFactory: Record<string, Record<string, number>> = {}
    for (const f of factories.value) {
      for (const g of grades.value) {
        const v = Number(base50[f.id]?.[g])
        if (v > 0) {
          if (!base50ByFactory[String(f.id)]) base50ByFactory[String(f.id)] = {}
          base50ByFactory[String(f.id)][g] = v
        }
      }
    }
    const cPrices: Record<string, number> = {}
    for (const item of customAll.value) {
      const v = Number(customPrices[item.variant_id])
      if (v > 0) cPrices[String(item.variant_id)] = v
    }
    const res: any = await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'apply_prices', base50ByFactory, customPrices: cPrices },
    })
    reviewOpen.value = false
    flashMsg(res.message ?? `Applied — ${res.totalUpdated} price records updated.`, true, 8000)
    success(res.message ?? 'Prices applied')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to apply prices')
  } finally {
    applying.value = false
  }
}
</script>

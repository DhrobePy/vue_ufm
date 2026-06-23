<template>
  <div class="space-y-5">

    <!-- ══ HEADER ══════════════════════════════════════════════════════════════ -->
    <UiPageHeader title="Products" subtitle="Base products · grades · variants · pricing · inventory"
                  :breadcrumb="['Products']">
      <template #actions>
        <div class="flex items-center gap-2">
          <a href="/api/products/export/csv" download
             class="btn-ghost text-xs flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export CSV
          </a>
          <button @click="showAddProduct = true"
                  class="btn-gold text-xs flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            New Product
          </button>
        </div>
      </template>
    </UiPageHeader>

    <!-- ══ KPI STRIP ═══════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="k in kpis" :key="k.label"
           class="glass-card p-4 flex items-center gap-3 overflow-hidden relative group hover:ring-1 hover:ring-white/[0.06] transition-all duration-200">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
             :style="`background:${k.bg};border:1px solid ${k.border}`">
          <span class="text-xl leading-none">{{ k.icon }}</span>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{{ k.label }}</p>
          <p class="text-2xl font-black tabular-nums" :class="k.color">{{ k.val }}</p>
          <p class="text-[10px] text-gray-600">{{ k.sub }}</p>
        </div>
      </div>
    </div>

    <!-- ══ TAB BAR ══════════════════════════════════════════════════════════════ -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
        <button @click="setTab('catalog')"
                class="px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2"
                :class="tab === 'catalog'
                  ? 'bg-white/[0.09] text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          Catalog
        </button>
        <button v-if="isAdmin" @click="setTab('pricing')"
                class="px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2"
                :class="tab === 'pricing'
                  ? 'bg-white/[0.09] text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Pricing Engine
          <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">ADMIN</span>
        </button>
      </div>

      <!-- Search (catalog only) -->
      <Transition name="fade-quick">
        <div v-if="tab === 'catalog'">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input v-model="search" placeholder="Search product, SKU, pack…"
                   class="input-glass pl-9 pr-3 py-1.5 text-xs w-56" />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Loading / error -->
    <div v-if="pending" class="glass-card p-12 text-center space-y-3">
      <div class="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" />
      <p class="text-xs text-gray-500">Loading…</p>
    </div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <!-- ══ TAB CONTENT ══════════════════════════════════════════════════════════ -->
    <template v-else>
      <Transition name="tab-slide" mode="out-in">

        <!-- ─── CATALOG ──────────────────────────────────────────────────────── -->
        <div v-if="tab === 'catalog'" key="catalog" class="space-y-5">

          <!-- Grade tabs -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button v-for="g in ['All', ...catalogGrades]" :key="g"
                    @click="gradeTab = g"
                    class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"
                    :class="gradeTab === g
                      ? gradePillActive(g)
                      : 'bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]'">
              <span v-if="g !== 'All'"
                    class="inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-black border"
                    :class="gradeTab === g ? gradeBadge(g) : 'bg-white/[0.06] border-white/[0.10] text-gray-500'">{{ g }}</span>
              {{ g === 'All' ? 'All Grades' : `Grade ${g}` }}
              <span class="text-[10px] opacity-50 tabular-nums">{{ g === 'All' ? allCatalogVariants.length : (variantsByGrade[g]?.length ?? 0) }}</span>
            </button>
            <div v-if="ungradedFiltered.length" class="h-4 w-px bg-white/[0.08] mx-1"/>
            <button v-if="ungradedFiltered.length"
                    @click="gradeTab = '?'"
                    class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"
                    :class="gradeTab === '?'
                      ? 'bg-white/[0.08] border-white/[0.14] text-gray-300'
                      : 'bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400'">
              Ungraded
              <span class="text-[10px] opacity-50">{{ ungradedFiltered.length }}</span>
            </button>
          </div>

          <!-- Graded sections -->
          <template v-for="grade in displayedGradeKeys" :key="grade">

            <!-- Section header (only in All view) -->
            <div v-if="gradeTab === 'All'" class="flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border shrink-0"
                    :class="gradeBadge(grade)">{{ grade }}</span>
              <div>
                <h3 class="font-semibold text-gray-300 text-sm">Grade {{ grade }}</h3>
                <p class="text-[11px] text-gray-600">
                  {{ filteredByGrade(grade).length }} variant{{ filteredByGrade(grade).length !== 1 ? 's' : '' }}
                  · {{ productCountForGrade(grade) }} product{{ productCountForGrade(grade) !== 1 ? 's' : '' }}
                </p>
              </div>
              <div class="flex-1 h-px bg-white/[0.05]"/>
            </div>

            <!-- Cards grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div v-for="v in filteredByGrade(grade)" :key="v.id"
                   class="group rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden flex flex-col hover:border-white/[0.10] hover:bg-white/[0.035] transition-all duration-200">

                <!-- Card header -->
                <div class="px-4 pt-3.5 pb-3 border-b border-white/[0.05]">
                  <div class="flex items-start justify-between gap-1.5 mb-2.5">
                    <p class="font-bold text-gray-200 text-sm leading-tight flex-1 min-w-0">{{ v.product_name }}</p>
                    <div class="flex items-center gap-0.5 shrink-0">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="categoryPill(v.category)">{{ v.category }}</span>
                      <button @click.stop="openEditProductById(v.product_id)" title="Edit product"
                              class="p-1 rounded text-gray-700 hover:text-gray-300 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                      </button>
                      <button v-if="isAdmin" @click.stop="confirmDeleteProductById(v.product_id, v.product_name)" title="Delete product"
                              class="p-1 rounded text-gray-700 hover:text-red-400 hover:bg-red-500/[0.06] transition-all opacity-0 group-hover:opacity-100">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-black"
                          :class="packBadge(v.weight_variant)">{{ v.weight_variant }}</span>
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black border"
                          :class="gradeBadge(grade)">{{ grade }}</span>
                    <span v-if="v.sku" class="font-mono text-[10px] text-gray-600 truncate">{{ v.sku }}</span>
                  </div>
                </div>

                <!-- Branch prices -->
                <div class="px-4 py-3 flex-1 space-y-1.5">
                  <div v-for="b in branches" :key="b.id"
                       class="flex items-center gap-2 group/pr">
                    <span class="text-[10px] font-semibold text-gray-600 w-10 shrink-0 uppercase tracking-wide">{{ b.code }}</span>
                    <div class="flex-1 h-px bg-white/[0.04]"/>
                    <!-- Editing -->
                    <div v-if="editingCell === `${v.id}:${b.id}`" class="flex items-center gap-1">
                      <span class="text-gold-500/80 text-[10px]">৳</span>
                      <input v-autofocus v-model.number="editingValue" type="number" min="0" step="1"
                             class="w-20 bg-transparent border-b border-gold-500 text-right text-xs font-mono font-bold text-gold-300 outline-none appearance-none"
                             @keyup.enter="commitEdit(v.id, b.id)" @keyup.escape="cancelEdit()" />
                      <button @click="commitEdit(v.id, b.id)" :disabled="savingCell"
                              class="text-emerald-400 text-xs leading-none disabled:opacity-40">✓</button>
                      <button @click="cancelEdit()" class="text-gray-600 text-xs leading-none hover:text-gray-400">✕</button>
                    </div>
                    <!-- Display -->
                    <button v-else @click="startEdit(v.id, b.id, v.prices[b.id]?.unit_price ?? null)"
                            class="transition-all duration-100">
                      <span v-if="v.prices[b.id]?.unit_price"
                            class="font-mono font-bold text-xs text-gold-400 group-hover/pr:text-gold-300 tabular-nums">
                        ৳{{ Number(v.prices[b.id].unit_price).toLocaleString() }}
                      </span>
                      <span v-else
                            class="text-[10px] text-gray-700 border border-dashed border-gray-700/50 group-hover/pr:border-gold-500/40 group-hover/pr:text-gold-500/60 rounded px-1.5 py-0.5 transition-all">
                        + Set
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Footer: stock + actions -->
                <div class="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2.5">
                  <div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         :class="stockBarColor(v)" :style="`width:${stockPct(v)}%`" />
                  </div>
                  <span class="text-[10px] font-mono tabular-nums shrink-0"
                        :class="availColor(v)">
                    {{ Number(v.stock_qty || 0).toLocaleString() }}
                  </span>
                  <NuxtLink :to="`/products/${v.product_id}/${v.id}/pricing`"
                            class="text-gray-700 hover:text-gold-400 transition-colors shrink-0" title="Open pricing">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </template>

          <!-- Ungraded section -->
          <template v-if="(gradeTab === 'All' || gradeTab === '?') && ungradedFiltered.length">
            <div v-if="gradeTab === 'All'" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">?</div>
              <div>
                <h3 class="font-semibold text-gray-500 text-sm">Ungraded</h3>
                <p class="text-[11px] text-gray-600">{{ ungradedFiltered.length }} variant{{ ungradedFiltered.length !== 1 ? 's' : '' }}</p>
              </div>
              <div class="flex-1 h-px bg-white/[0.05]"/>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div v-for="v in ungradedFiltered" :key="v.id"
                   class="group rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden flex flex-col hover:border-white/[0.10] hover:bg-white/[0.035] transition-all duration-200">
                <div class="px-4 pt-3.5 pb-3 border-b border-white/[0.05]">
                  <div class="flex items-start justify-between gap-1.5 mb-2.5">
                    <p class="font-bold text-gray-200 text-sm leading-tight flex-1 min-w-0">{{ v.product_name }}</p>
                    <div class="flex items-center gap-0.5 shrink-0">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="categoryPill(v.category)">{{ v.category }}</span>
                      <button @click.stop="openEditProductById(v.product_id)" title="Edit product"
                              class="p-1 rounded text-gray-700 hover:text-gray-300 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                      </button>
                      <button v-if="isAdmin" @click.stop="confirmDeleteProductById(v.product_id, v.product_name)" title="Delete product"
                              class="p-1 rounded text-gray-700 hover:text-red-400 hover:bg-red-500/[0.06] transition-all opacity-0 group-hover:opacity-100">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-black" :class="packBadge(v.weight_variant)">{{ v.weight_variant }}</span>
                    <span v-if="v.sku" class="font-mono text-[10px] text-gray-600">{{ v.sku }}</span>
                  </div>
                </div>
                <div class="px-4 py-3 flex-1 space-y-1.5">
                  <div v-for="b in branches" :key="b.id" class="flex items-center gap-2 group/pr">
                    <span class="text-[10px] font-semibold text-gray-600 w-10 shrink-0 uppercase tracking-wide">{{ b.code }}</span>
                    <div class="flex-1 h-px bg-white/[0.04]"/>
                    <div v-if="editingCell === `${v.id}:${b.id}`" class="flex items-center gap-1">
                      <span class="text-gold-500/80 text-[10px]">৳</span>
                      <input v-autofocus v-model.number="editingValue" type="number" min="0" step="1"
                             class="w-20 bg-transparent border-b border-gold-500 text-right text-xs font-mono font-bold text-gold-300 outline-none appearance-none"
                             @keyup.enter="commitEdit(v.id, b.id)" @keyup.escape="cancelEdit()" />
                      <button @click="commitEdit(v.id, b.id)" :disabled="savingCell" class="text-emerald-400 text-xs disabled:opacity-40">✓</button>
                      <button @click="cancelEdit()" class="text-gray-600 text-xs hover:text-gray-400">✕</button>
                    </div>
                    <button v-else @click="startEdit(v.id, b.id, v.prices[b.id]?.unit_price ?? null)" class="transition-all duration-100">
                      <span v-if="v.prices[b.id]?.unit_price" class="font-mono font-bold text-xs text-gold-400 group-hover/pr:text-gold-300 tabular-nums">৳{{ Number(v.prices[b.id].unit_price).toLocaleString() }}</span>
                      <span v-else class="text-[10px] text-gray-700 border border-dashed border-gray-700/50 group-hover/pr:border-gold-500/40 group-hover/pr:text-gold-500/60 rounded px-1.5 py-0.5 transition-all">+ Set</span>
                    </button>
                  </div>
                </div>
                <div class="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2.5">
                  <div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" :class="stockBarColor(v)" :style="`width:${stockPct(v)}%`" />
                  </div>
                  <span class="text-[10px] font-mono tabular-nums shrink-0" :class="availColor(v)">{{ Number(v.stock_qty || 0).toLocaleString() }}</span>
                  <NuxtLink :to="`/products/${v.product_id}/${v.id}/pricing`" class="text-gray-700 hover:text-gold-400 transition-colors shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <div v-if="displayedVariants.length === 0"
               class="glass-card p-14 text-center space-y-3">
            <div class="text-5xl">📦</div>
            <p class="text-gray-400 font-semibold">No variants found</p>
            <p class="text-xs text-gray-600">Try adjusting your search or grade filter</p>
          </div>
        </div>

        <!-- ─── PRICING ENGINE ────────────────────────────────────────────────── -->
        <div v-else-if="tab === 'pricing'" key="pricing" class="space-y-5">

          <!-- Flash -->
          <Transition name="fade-quick">
            <div v-if="peFlash.msg"
                 class="px-4 py-3 text-sm border rounded-xl flex items-start gap-2"
                 :class="peFlash.ok
                   ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                   : 'bg-red-500/10 border-red-500/20 text-red-300'">
              <span>{{ peFlash.ok ? '✓' : '✗' }}</span>
              <span>{{ peFlash.msg }}</span>
            </div>
          </Transition>

          <!-- ── Section 1: Formula Config ────────────────────────────────── -->
          <div class="glass-card p-0 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Formula & Branch Surcharges
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
                    <input v-model.number="cfg.formula.bag_50" type="number" min="1"
                           class="input-glass w-full text-xs py-1.5 text-center font-mono" @input="recalcPreview" />
                  </div>
                  <div>
                    <label class="block text-[11px] text-gray-500 mb-1">Bag size 74 kg</label>
                    <input v-model.number="cfg.formula.bag_74" type="number" min="1"
                           class="input-glass w-full text-xs py-1.5 text-center font-mono" @input="recalcPreview" />
                  </div>
                  <div>
                    <label class="block text-[11px] text-gray-500 mb-1">Packaging (৳)</label>
                    <input v-model.number="cfg.formula.packaging_fee" type="number" step="0.01"
                           class="input-glass w-full text-xs py-1.5 text-center font-mono" @input="recalcPreview" />
                  </div>
                </div>
              </div>
              <!-- Branch surcharges -->
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Branch Surcharges (৳)</p>
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-gray-600 border-b border-white/[0.04] text-[11px]">
                      <th class="pb-2 text-left font-medium">Branch</th>
                      <th class="pb-2 text-center font-medium">50 kg</th>
                      <th class="pb-2 text-center font-medium">74 kg</th>
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
              </div>
            </div>
          </div>

          <!-- ── Section 2: Grade-based prices ───────────────────────────── -->
          <div class="glass-card p-0 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-white/[0.06]">
              <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-black">1</span>
                Set Base 50 kg Price per Grade
              </h2>
              <p class="text-xs text-gray-500 mt-0.5">74 kg is auto-calculated from the formula above.</p>
            </div>
            <div class="p-5 space-y-4">
              <div v-for="grade in peGrades" :key="grade"
                   class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] transition-colors">
                <div class="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                  <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg border"
                        :class="gradeBadge(grade)">{{ grade }}</span>
                  <div>
                    <p class="font-bold text-gray-200 text-sm">Grade {{ grade }}</p>
                    <p class="text-[11px] text-gray-600">
                      {{ (peGradeData[grade]?.['50'] ?? []).length }} × 50 kg ·
                      {{ (peGradeData[grade]?.['74'] ?? []).length }} × 74 kg
                    </p>
                  </div>
                </div>
                <div class="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div class="flex flex-col justify-center">
                    <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Base 50 kg Price (৳)</label>
                    <input v-model.number="base50[grade]" type="number" step="0.01" min="0"
                           placeholder="Enter price…"
                           class="input-glass w-full py-3 text-center font-black text-xl text-gold-300"
                           @input="recalcPreview" />
                    <div class="mt-2 text-center text-xs text-gray-500">
                      74 kg auto →
                      <span class="font-bold text-purple-400">{{ calc74For(grade) }}</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold text-blue-400 uppercase tracking-wide mb-2">50 kg Products</p>
                    <div v-if="!(peGradeData[grade]?.['50']?.length)" class="text-xs text-gray-600 italic">None</div>
                    <div v-else class="space-y-1 max-h-32 overflow-y-auto pr-1">
                      <div v-for="v in peGradeData[grade]['50']" :key="v.variant_id"
                           class="flex items-start gap-2 bg-blue-500/10 rounded-lg px-2.5 py-1.5">
                        <span class="text-blue-400/80 text-[10px] mt-0.5 shrink-0">📦</span>
                        <div class="min-w-0">
                          <p class="text-xs font-medium text-gray-300 truncate">{{ v.product_name }}</p>
                          <p class="text-[10px] text-gray-600">
                            {{ v.sku }}
                            <span v-if="v.current_price !== null"> · ৳{{ fmt(v.current_price) }}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold text-purple-400 uppercase tracking-wide mb-2">74 kg (auto)</p>
                    <div v-if="!(peGradeData[grade]?.['74']?.length)" class="text-xs text-gray-600 italic">None</div>
                    <div v-else class="space-y-1 max-h-32 overflow-y-auto pr-1">
                      <div v-for="v in peGradeData[grade]['74']" :key="v.variant_id"
                           class="flex items-start gap-2 bg-purple-500/10 rounded-lg px-2.5 py-1.5">
                        <span class="text-purple-400/80 text-[10px] mt-0.5 shrink-0">📦</span>
                        <div class="min-w-0">
                          <p class="text-xs font-medium text-gray-300 truncate">{{ v.product_name }}</p>
                          <p class="text-[10px] text-gray-600">
                            {{ v.sku }}
                            <span v-if="v.current_price !== null"> · ৳{{ fmt(v.current_price) }}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Section 3: Custom-weight ──────────────────────────────────── -->
          <div v-if="peCustomAll.length" class="glass-card p-0 overflow-hidden border border-amber-500/20">
            <div class="px-5 py-3.5 border-b border-amber-500/20 bg-amber-500/5">
              <h2 class="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black">2</span>
                Custom-Weight Products — Manual Price
              </h2>
              <p class="text-xs text-amber-500/70 mt-0.5">Formula doesn't apply. Enter flat price per bag.</p>
            </div>
            <div class="p-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="item in peCustomAll" :key="item.variant_id"
                     class="border border-white/[0.06] rounded-xl p-4 hover:border-amber-500/30 transition-colors">
                  <p class="text-xs font-semibold text-gray-300 truncate">{{ item.product_name }}</p>
                  <div class="flex items-center gap-2 mt-1 mb-3">
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">{{ item.weight_variant }} {{ item.uom }}</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500">Grade {{ item.grade }}</span>
                  </div>
                  <label class="block text-[11px] text-gray-500 mb-1">Price per bag (৳)</label>
                  <input v-model.number="peCustomPrices[item.variant_id]" type="number" step="0.01" min="0"
                         placeholder="Enter price…"
                         class="input-glass w-full text-xs py-2 text-center font-mono font-bold" />
                  <p v-if="item.current_price !== null" class="mt-1 text-[10px] text-gray-600 text-center">
                    Current: ৳{{ fmt(item.current_price) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Section 4: Live Preview ────────────────────────────────────── -->
          <div class="glass-card p-0 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 class="text-sm font-bold text-gray-200 flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-black">
                  {{ peCustomAll.length ? '3' : '2' }}
                </span>
                Live Price Preview
                <span class="text-xs font-normal text-gray-600 ml-1">— updates as you type</span>
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead class="border-b border-white/[0.06]">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-gray-600 font-semibold uppercase tracking-wider sticky left-0 bg-[#0f1117] min-w-[90px]">Grade</th>
                    <th class="px-3 py-2.5 text-center text-blue-400 font-semibold bg-blue-500/5 min-w-[90px]">Base 50</th>
                    <th class="px-3 py-2.5 text-center text-purple-400 font-semibold bg-purple-500/5 min-w-[90px]">Base 74</th>
                    <template v-for="b in branches" :key="b.id">
                      <th class="px-3 py-2.5 text-center text-blue-400/70 font-semibold bg-blue-500/5 min-w-[90px]">
                        {{ b.code }}<br/><span class="text-[10px] font-normal text-gray-600">50 kg</span>
                      </th>
                      <th class="px-3 py-2.5 text-center text-purple-400/70 font-semibold bg-purple-500/5 min-w-[90px]">
                        {{ b.code }}<br/><span class="text-[10px] font-normal text-gray-600">74 kg</span>
                      </th>
                    </template>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.03]">
                  <tr v-for="grade in peGrades" :key="grade" class="hover:bg-white/[0.02]">
                    <td class="px-4 py-2.5 font-bold text-gray-300 sticky left-0 bg-[#0f1117]">Grade {{ grade }}</td>
                    <td class="px-3 py-2.5 text-center bg-blue-500/5 font-semibold text-blue-300">{{ pePreview[grade]?.base50 ?? '—' }}</td>
                    <td class="px-3 py-2.5 text-center bg-purple-500/5 font-semibold text-purple-300">{{ pePreview[grade]?.base74 ?? '—' }}</td>
                    <template v-for="b in branches" :key="b.id">
                      <td class="px-3 py-2.5 text-center bg-blue-500/5 text-blue-300/80">{{ pePreview[grade]?.branches[b.id]?.p50 ?? '—' }}</td>
                      <td class="px-3 py-2.5 text-center bg-purple-500/5 text-purple-300/80">{{ pePreview[grade]?.branches[b.id]?.p74 ?? '—' }}</td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ── Section 5: Apply ───────────────────────────────────────────── -->
          <div class="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p class="font-bold text-gray-200 text-sm flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-black">
                  {{ peCustomAll.length ? '4' : '3' }}
                </span>
                Review &amp; Apply All Prices
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Review the full before/after comparison before writing to DB.</p>
            </div>
            <div class="flex items-center gap-3">
              <button @click="peResetPrices"
                      class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors">
                ↺ Reset
              </button>
              <button @click="peOpenReview" class="btn-gold text-xs px-5 py-2">
                🔍 Review Changes
              </button>
            </div>
          </div>
        </div>

      </Transition>
    </template>

    <!-- ══ MODALS ════════════════════════════════════════════════════════════ -->

    <!-- Add Product -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddProduct"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="showAddProduct = false">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">New Base Product</h3>
              <button @click="showAddProduct = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name *</label>
                <input v-model="newProduct.name" type="text" class="input-glass" placeholder="e.g. 2Hati Moida" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base SKU</label>
                <input v-model="newProduct.base_sku" type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label>
                <select v-model="newProduct.category" class="input-glass">
                  <option value="Flour">Flour (Moida)</option>
                  <option value="Atta">Atta</option>
                  <option value="Bran">Bran (Vushi)</option>
                  <option value="Semolina">Semolina (Sooji)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="newProduct.description" rows="2" class="input-glass resize-none" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addProduct" :disabled="!newProduct.name || addingProduct"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ addingProduct ? 'Adding…' : 'Add Product' }}
              </button>
              <button @click="showAddProduct = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Product -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditProduct"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="showEditProduct = false">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Edit Product</h3>
              <button @click="showEditProduct = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name *</label>
                <input v-model="editProductForm.name" type="text" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base SKU</label>
                <input v-model="editProductForm.base_sku" type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label>
                <select v-model="editProductForm.category" class="input-glass">
                  <option value="Flour">Flour (Moida)</option>
                  <option value="Atta">Atta</option>
                  <option value="Bran">Bran (Vushi)</option>
                  <option value="Semolina">Semolina (Sooji)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="editProductForm.description" rows="2" class="input-glass resize-none" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select v-model="editProductForm.status" class="input-glass">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="saveEditProduct" :disabled="!editProductForm.name || editingProduct"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ editingProduct ? 'Saving…' : 'Save Changes' }}
              </button>
              <button @click="showEditProduct = false" class="btn-ghost text-xs">Cancel</button>
            </div>
            <div v-if="isAdmin" class="pt-2 border-t border-white/[0.06]">
              <button @click="confirmDeleteProductById(editProductForm.id, editProductForm.name)"
                      class="w-full text-xs text-red-500/60 hover:text-red-400 py-1.5 rounded-lg hover:bg-red-500/[0.06] transition-all">
                Delete this product
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Product Confirm -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteProductTarget"
             class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="deleteProductTarget = null">
          <div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-red-500/20 p-6 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-bold text-gray-100">Delete Product?</h3>
                <p class="text-sm text-gray-400 mt-1">
                  <span class="font-semibold text-gray-200">{{ deleteProductTarget.name }}</span> and all its variants will be archived.
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="doDeleteProduct" :disabled="deletingProduct"
                      class="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 disabled:opacity-50 transition-all">
                {{ deletingProduct ? 'Deleting…' : 'Yes, Delete' }}
              </button>
              <button @click="deleteProductTarget = null" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add Variant -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddVariant"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="showAddVariant = false">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">New Variant</h3>
              <button @click="showAddVariant = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pack Weight *</label>
                <select v-model="newVariant.packWeight" class="field-input">
                  <option value="37kg">37 kg</option>
                  <option value="50kg">50 kg</option>
                  <option value="55kg">55 kg</option>
                  <option value="74kg">74 kg</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Grade</label>
                <select v-model="newVariant.grade" class="field-input">
                  <option value="">— None —</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="R">Grade R</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">UOM</label>
                <select v-model="newVariant.uom" class="field-input">
                  <option value="bag">bag</option>
                  <option value="kg">kg</option>
                  <option value="gm">gm</option>
                  <option value="litre">litre</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div class="col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Barcode</label>
                <input v-model="newVariant.barcode" type="text" class="field-input font-mono" placeholder="EAN-13 or custom" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addVariant" :disabled="addingVariant"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ addingVariant ? 'Adding…' : 'Add Variant' }}
              </button>
              <button @click="showAddVariant = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Pricing Engine Review Modal -->
    <Teleport to="body">
      <div v-if="peReviewOpen"
           class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8"
           @click.self="peReviewOpen = false">
        <div class="relative bg-[#0f1117] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col"
             style="max-height:90vh">
          <div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-base font-bold text-gray-100">Review Price Changes</h3>
              <p class="text-xs text-gray-500 mt-0.5">Confirm all changes before writing to the database.</p>
            </div>
            <button @click="peReviewOpen = false" class="text-gray-600 hover:text-gray-300 text-lg">✕</button>
          </div>
          <div class="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.02] flex flex-wrap gap-5 text-xs shrink-0">
            <span><strong class="text-gray-200">{{ peReviewRows.length }}</strong> <span class="text-gray-500">rows</span></span>
            <span><strong class="text-emerald-400">{{ peReviewStats.increases }}</strong> <span class="text-gray-500">increases</span></span>
            <span><strong class="text-red-400">{{ peReviewStats.decreases }}</strong> <span class="text-gray-500">decreases</span></span>
            <span><strong class="text-gray-400">{{ peReviewStats.unchanged }}</strong> <span class="text-gray-500">unchanged</span></span>
            <span><strong class="text-blue-400">{{ peReviewStats.isNew }}</strong> <span class="text-gray-500">new</span></span>
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
                  <th class="px-4 py-2.5 text-center font-semibold">Δ</th>
                  <th class="px-4 py-2.5 text-center font-semibold">%</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.03]">
                <tr v-for="(r, i) in peReviewRows" :key="i"
                    :class="{
                      'bg-blue-500/5':    r.delta === null,
                      'bg-emerald-500/5': r.delta !== null && r.delta > 0.005,
                      'bg-red-500/5':     r.delta !== null && r.delta < -0.005,
                    }">
                  <td class="px-4 py-2 font-semibold text-gray-300">{{ r.label }}</td>
                  <td class="px-4 py-2 text-gray-400">{{ r.branch }}</td>
                  <td class="px-4 py-2 text-center">
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          :class="r.weight.startsWith('50') ? 'bg-blue-500/20 text-blue-300'
                                : r.weight.includes('custom') ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-purple-500/20 text-purple-300'">
                      {{ r.weight }}
                    </span>
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
              ⚠ Existing prices will be <strong class="ml-1">archived</strong> and replaced.
            </div>
            <div class="flex items-center gap-3">
              <button @click="peReviewOpen = false"
                      class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors">
                ← Back
              </button>
              <button @click="applyPrices" :disabled="applying"
                      class="btn-gold text-xs px-6 py-2 disabled:opacity-50">
                <svg v-if="applying" class="w-3 h-3 animate-spin inline mr-1.5" fill="none" viewBox="0 0 24 24">
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

const { user }  = useUserSession()
const { success, error: toastError } = useToast()
const isAdmin   = computed(() =>
  ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()),
)

// ── Data ─────────────────────────────────────────────────────────────────────
const { data, refresh, pending, error } = await useFetch('/api/products/hub')

const allProducts = computed(() => (data.value?.products ?? []) as any[])
const branches    = computed(() => (data.value?.branches  ?? []) as any[])
const engineData  = computed(() => data.value?.engine ?? null)

// ── KPIs ──────────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const totalV = allProducts.value.reduce((s: number, p: any) => s + (p.variants?.length ?? 0), 0)
  let priced = 0
  let totalStock = 0
  for (const p of allProducts.value) {
    for (const v of (p.variants ?? []) as any[]) {
      if (Object.keys(v.prices ?? {}).length > 0) priced++
      totalStock += Number(v.stock_qty ?? 0)
    }
  }
  return [
    { label: 'Base Products', val: allProducts.value.length,  icon: '📦', color: 'text-violet-400',  bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.20)', sub: 'Active product families' },
    { label: 'Variants',      val: totalV,                    icon: '🗂',  color: 'text-sky-400',     bg: 'rgba(56,189,248,0.10)',  border: 'rgba(56,189,248,0.20)',  sub: 'All active SKUs' },
    { label: 'Total Stock',   val: totalStock.toLocaleString(), icon: '📊', color: 'text-emerald-400', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.20)',  sub: 'Bags in warehouse' },
    { label: 'Priced',        val: `${priced}/${totalV}`,     icon: '💰', color: 'text-amber-400',   bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)', sub: 'Variants with price' },
  ]
})

// ── Tabs ──────────────────────────────────────────────────────────────────────
const tab = ref<'catalog' | 'pricing'>('catalog')
function setTab(t: 'catalog' | 'pricing') { tab.value = t }

// ── Catalog: search + grade tabs ──────────────────────────────────────────────
const search   = ref('')
const gradeTab = ref('All')

const allCatalogVariants = computed(() => {
  const result: any[] = []
  for (const p of allProducts.value as any[]) {
    for (const v of (p.variants ?? []) as any[]) {
      result.push({ ...v, product_name: p.base_name, category: p.category, product_id: p.id })
    }
  }
  return result
})

const filteredCatalogVariants = computed(() => {
  let list = allCatalogVariants.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((v: any) =>
      v.product_name.toLowerCase().includes(q) ||
      (v.sku ?? '').toLowerCase().includes(q) ||
      (v.weight_variant ?? '').toLowerCase().includes(q),
    )
  }
  return list
})

const catalogGrades = computed(() => {
  const gs = new Set<string>()
  for (const v of allCatalogVariants.value) { if (v.grade) gs.add(v.grade) }
  return [...gs].sort()
})

const variantsByGrade = computed(() => {
  const map: Record<string, any[]> = {}
  for (const v of filteredCatalogVariants.value) {
    const g = v.grade || '?'
    if (!map[g]) map[g] = []
    map[g].push(v)
  }
  return map
})

const displayedGradeKeys = computed(() => {
  if (gradeTab.value !== 'All') return gradeTab.value === '?' ? [] : [gradeTab.value]
  return catalogGrades.value
})

const ungradedFiltered = computed(() =>
  filteredCatalogVariants.value.filter((v: any) => !v.grade),
)

const displayedVariants = computed(() => {
  if (gradeTab.value === 'All') return filteredCatalogVariants.value
  return filteredCatalogVariants.value.filter((v: any) =>
    gradeTab.value === '?' ? !v.grade : v.grade === gradeTab.value,
  )
})

function filteredByGrade(grade: string): any[] {
  return filteredCatalogVariants.value.filter((v: any) => v.grade === grade)
}

function productCountForGrade(grade: string): number {
  return new Set(filteredByGrade(grade).map((v: any) => v.product_id)).size
}

function gradePillActive(g: string) {
  if (g === 'All') return 'bg-white/[0.08] border-white/[0.14] text-gray-100 shadow-sm'
  const m: Record<string, string> = {
    A: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    B: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    C: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    R: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }
  return m[g] ?? 'bg-gold-500/15 text-gold-300 border-gold-500/30'
}

// ── Inline price editing ──────────────────────────────────────────────────────
const editingCell  = ref<string | null>(null) // "variantId:branchId"
const editingValue = ref(0)
const savingCell   = ref(false)
// v-autofocus: focuses + selects the element on mount (safe inside v-for)
const vAutofocus = {
  mounted(el: HTMLInputElement) { el.focus(); el.select() },
}

function startEdit(variantId: number, branchId: number, currentPrice: number | null) {
  editingCell.value  = `${variantId}:${branchId}`
  editingValue.value = currentPrice ?? 0
}

function cancelEdit() {
  editingCell.value  = null
  editingValue.value = 0
}

async function commitEdit(variantId: number, branchId: number) {
  const price = Number(editingValue.value)
  if (!price || price <= 0) { cancelEdit(); return }
  savingCell.value = true
  try {
    await $fetch('/api/products/pricing', {
      method: 'POST',
      body: {
        action: 'set_price',
        variantId,
        branchId,
        unitPrice:     price,
        effectiveDate: new Date().toISOString().slice(0, 10),
        status:        'active',
      },
    })
    success('Price updated ✓')
    cancelEdit()
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save price')
  } finally {
    savingCell.value = false
  }
}

// ── Add Product ───────────────────────────────────────────────────────────────
const showAddProduct = ref(false)
const addingProduct  = ref(false)
const newProduct     = reactive({ name: '', base_sku: '', category: 'Flour', description: '' })

async function addProduct() {
  if (!newProduct.name) return
  addingProduct.value = true
  try {
    await $fetch('/api/products/base', {
      method: 'POST',
      body: { base_name: newProduct.name, base_sku: newProduct.base_sku || null, category: newProduct.category, description: newProduct.description },
    })
    success(`"${newProduct.name}" added`)
    showAddProduct.value = false
    Object.assign(newProduct, { name: '', base_sku: '', category: 'Flour', description: '' })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add')
  } finally {
    addingProduct.value = false
  }
}

// ── Edit Product ──────────────────────────────────────────────────────────────
const showEditProduct  = ref(false)
const editingProduct   = ref(false)
const editProductForm  = reactive({ id: 0, name: '', base_sku: '', category: 'Flour', description: '', status: 'active' })

function openEditProduct(p: any) {
  Object.assign(editProductForm, {
    id:          p.id,
    name:        p.base_name,
    base_sku:    p.base_sku ?? '',
    category:    p.category,
    description: p.description ?? '',
    status:      p.status,
  })
  showEditProduct.value = true
}

async function saveEditProduct() {
  editingProduct.value = true
  try {
    await $fetch(`/api/products/base/${editProductForm.id}`, {
      method: 'PUT',
      body: {
        base_name:   editProductForm.name,
        base_sku:    editProductForm.base_sku || null,
        category:    editProductForm.category,
        description: editProductForm.description || null,
        status:      editProductForm.status,
      },
    })
    success('Product updated ✓')
    showEditProduct.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed')
  } finally {
    editingProduct.value = false
  }
}

// ── Delete Product ────────────────────────────────────────────────────────────
const deleteProductTarget = ref<{ id: number; name: string } | null>(null)
const deletingProduct     = ref(false)

function getProduct(productId: number) {
  return (allProducts.value as any[]).find((p: any) => p.id === productId) ?? null
}

function openEditProductById(productId: number) {
  const p = getProduct(productId)
  if (p) openEditProduct(p)
}

function confirmDeleteProductById(productId: number, productName: string) {
  showEditProduct.value     = false
  deleteProductTarget.value = { id: productId, name: productName }
}

async function doDeleteProduct() {
  if (!deleteProductTarget.value) return
  deletingProduct.value = true
  try {
    await $fetch(`/api/products/base/${deleteProductTarget.value.id}`, { method: 'DELETE' })
    success(`"${deleteProductTarget.value.name}" deleted`)
    deleteProductTarget.value = null
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete')
  } finally {
    deletingProduct.value = false
  }
}

// ── Add Variant ───────────────────────────────────────────────────────────────
const showAddVariant     = ref(false)
const addingVariant      = ref(false)
const addVariantForId    = ref<number | null>(null)
const newVariant         = reactive({ packWeight: '50kg', grade: '', uom: 'bag', barcode: '' })

function openAddVariant(productId: number) {
  addVariantForId.value  = productId
  showAddVariant.value   = true
}

async function addVariant() {
  if (!addVariantForId.value) return
  addingVariant.value = true
  try {
    await $fetch('/api/products/variants', {
      method: 'POST',
      body: {
        product_id:      addVariantForId.value,
        weight_variant:  newVariant.packWeight,
        grade:           newVariant.grade          || undefined,
        unit_of_measure: newVariant.uom,
        barcode:         newVariant.barcode        || undefined,
      },
    })
    success('Variant added ✓')
    showAddVariant.value = false
    Object.assign(newVariant, { packWeight: '50kg', grade: '', uom: 'bag', barcode: '' })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed')
  } finally {
    addingVariant.value = false
  }
}

// ══ PRICING ENGINE ════════════════════════════════════════════════════════════

const peGrades       = computed<string[]>(() => engineData.value?.grades ?? [])
const peGradeData    = computed<Record<string, Record<string, any[]>>>(() => engineData.value?.gradeData ?? {})
const peCurrentPrices = computed<any>(() => engineData.value?.currentPrices ?? {})
const peCustomCurrentPrices = computed<any>(() => engineData.value?.customCurrent ?? {})
const peCustomAll    = computed<any[]>(() => {
  const list: any[] = []
  for (const [, wcs] of Object.entries(peGradeData.value)) {
    for (const item of ((wcs as any)['custom'] ?? [])) {
      list.push(item)
      if (peCustomPrices[item.variant_id] === undefined)
        peCustomPrices[item.variant_id] = item.current_price ?? null
    }
  }
  return list
})

const cfg = reactive({
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
  branch_surcharges: {} as Record<number, { surcharge_50: number; surcharge_74: number }>,
})

const base50        = reactive<Record<string, number | null>>({})
const peCustomPrices = reactive<Record<number, number | null>>({})
const savingConfig  = ref(false)
const peFlash       = reactive({ msg: '', ok: true })

watch(() => engineData.value, (ed) => {
  if (!ed) return
  const c = ed.config
  cfg.formula.bag_50        = c.formula?.bag_50        ?? 50
  cfg.formula.bag_74        = c.formula?.bag_74        ?? 74
  cfg.formula.packaging_fee = c.formula?.packaging_fee ?? 150
  for (const b of (data.value?.branches ?? [])) {
    cfg.branch_surcharges[b.id] = {
      surcharge_50: c.branch_surcharges?.[b.id]?.surcharge_50 ?? 0,
      surcharge_74: c.branch_surcharges?.[b.id]?.surcharge_74 ?? 0,
    }
  }
  for (const g of (ed.grades ?? [])) {
    if (base50[g] === undefined) base50[g] = ed.current50?.[g] ?? null
  }
}, { immediate: true })

// Pricing engine: helpers
function calc74(b50: number) {
  return Math.round(((b50 / cfg.formula.bag_50) * cfg.formula.bag_74 + cfg.formula.packaging_fee) * 100) / 100
}
function calc74For(grade: string) {
  const v = Number(base50[grade])
  if (!v || v <= 0) return '—'
  return '৳' + fmt(calc74(v))
}
function fmt(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Live preview
type PrevRow = { base50: string; base74: string; branches: Record<number, { p50: string; p74: string }> }
const pePreview = reactive<Record<string, PrevRow>>({})

function recalcPreview() {
  for (const grade of peGrades.value) {
    const b50 = Number(base50[grade])
    if (!b50 || b50 <= 0) { pePreview[grade] = { base50: '—', base74: '—', branches: {} }; continue }
    const b74 = calc74(b50)
    const brs: Record<number, { p50: string; p74: string }> = {}
    for (const b of branches.value) {
      const sc = cfg.branch_surcharges[b.id] ?? { surcharge_50: 0, surcharge_74: 0 }
      brs[b.id] = {
        p50: '৳' + fmt(b50 + Number(sc.surcharge_50 ?? 0)),
        p74: '৳' + fmt(b74 + Number(sc.surcharge_74 ?? 0)),
      }
    }
    pePreview[grade] = { base50: '৳' + fmt(b50), base74: '৳' + fmt(b74), branches: brs }
  }
}
watch([base50, cfg], recalcPreview, { deep: true, immediate: true })

async function saveConfig() {
  savingConfig.value = true
  try {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'save_config', ...cfg.formula, branch_surcharges: cfg.branch_surcharges },
    })
    peFlash.ok = true; peFlash.msg = 'Formula config saved.'
    setTimeout(() => { peFlash.msg = '' }, 4000)
  } catch (e: any) {
    peFlash.ok = false; peFlash.msg = e?.data?.statusMessage ?? 'Failed to save config'
  } finally {
    savingConfig.value = false
  }
}

function peResetPrices() {
  if (!confirm('Reset all inputs to current DB values?')) return
  for (const g of peGrades.value) base50[g] = engineData.value?.current50?.[g] ?? null
  for (const item of peCustomAll.value)
    peCustomPrices[item.variant_id] = item.current_price ?? null
}

// Review modal
interface ReviewRow { label: string; branch: string; weight: string; curr: number | null; newP: number; delta: number | null; pct: number | null }
const peReviewOpen  = ref(false)
const peReviewRows  = ref<ReviewRow[]>([])
const applying      = ref(false)

const peReviewStats = computed(() => {
  let increases = 0, decreases = 0, unchanged = 0, isNew = 0
  for (const r of peReviewRows.value) {
    if (r.delta === null) isNew++
    else if (r.delta > 0.005) increases++
    else if (r.delta < -0.005) decreases++
    else unchanged++
  }
  return { increases, decreases, unchanged, isNew }
})

function peOpenReview() {
  const rows: ReviewRow[] = []
  for (const grade of peGrades.value) {
    const b50 = Number(base50[grade])
    if (!b50 || b50 <= 0) continue
    const b74 = calc74(b50)
    for (const branch of branches.value) {
      const sc = cfg.branch_surcharges[branch.id] ?? { surcharge_50: 0, surcharge_74: 0 }
      for (const [wc, baseP] of [['50', b50], ['74', b74]] as [string, number][]) {
        const surcharge = wc === '50' ? Number(sc.surcharge_50 ?? 0) : Number(sc.surcharge_74 ?? 0)
        const newP  = Math.round((baseP + surcharge) * 100) / 100
        const currP = peCurrentPrices.value?.[grade]?.[String(branch.id)]?.[wc] ?? null
        const delta = currP !== null ? newP - currP : null
        const pct   = (currP && delta !== null) ? (delta / currP) * 100 : null
        rows.push({ label: `Grade ${grade}`, branch: branch.name, weight: `${wc} kg`, curr: currP, newP, delta, pct })
      }
    }
  }
  for (const item of peCustomAll.value) {
    const newP = Number(peCustomPrices[item.variant_id])
    if (!newP || newP <= 0) continue
    for (const branch of branches.value) {
      const currP = peCustomCurrentPrices.value?.[String(item.variant_id)]?.[String(branch.id)] ?? null
      const delta = currP !== null ? newP - currP : null
      const pct   = (currP && delta !== null) ? (delta / currP) * 100 : null
      rows.push({ label: item.product_name, branch: branch.name, weight: `${item.weight_variant} (custom)`, curr: currP, newP, delta, pct })
    }
  }
  if (!rows.length) { toastError('Enter at least one price before reviewing.'); return }
  peReviewRows.value = rows
  peReviewOpen.value = true
}

async function applyPrices() {
  applying.value = true
  try {
    const base50ByGrade: Record<string, number> = {}
    for (const g of peGrades.value) { const v = Number(base50[g]); if (v > 0) base50ByGrade[g] = v }
    const cPrices: Record<string, number> = {}
    for (const item of peCustomAll.value) { const v = Number(peCustomPrices[item.variant_id]); if (v > 0) cPrices[String(item.variant_id)] = v }
    const res: any = await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: { action: 'apply_prices', base50ByGrade, customPrices: cPrices, config: cfg },
    })
    peReviewOpen.value = false
    peFlash.ok = true; peFlash.msg = res.message ?? `Applied — ${res.totalUpdated} price records updated.`
    setTimeout(() => { peFlash.msg = '' }, 6000)
    success(peFlash.msg)
    await refresh()
    recalcPreview()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to apply prices')
  } finally {
    applying.value = false
  }
}

// ── Design helpers ────────────────────────────────────────────────────────────
function categoryIcon(cat: string) {
  const m: Record<string, string> = { Flour: '🌾', Atta: '🫓', Bran: '🌿', Semolina: '✨' }
  return m[cat] ?? '📦'
}

function categoryBg(cat: string) {
  const m: Record<string, string> = {
    Flour:    'bg-amber-500/10',
    Atta:     'bg-orange-500/10',
    Bran:     'bg-green-500/10',
    Semolina: 'bg-sky-500/10',
  }
  return m[cat] ?? 'bg-gray-500/10'
}

function categoryPill(cat: string) {
  const m: Record<string, string> = {
    Flour:    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Atta:     'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    Bran:     'bg-green-500/15 text-green-400 border border-green-500/20',
    Semolina: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',
  }
  return m[cat] ?? 'bg-gray-500/15 text-gray-400 border border-gray-500/20'
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

function packBadge(w: string) {
  const n = parseInt(w)
  if (n === 50) return 'bg-blue-500/15 text-blue-300'
  if (n === 74) return 'bg-purple-500/15 text-purple-300'
  if (n === 37) return 'bg-rose-500/15 text-rose-300'
  return 'bg-amber-500/15 text-amber-300'
}

function stockPct(v: any) {
  const available = Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty))
  const reorder   = Number(v.reorder_level) || 1
  return Math.min(100, Math.round((available / Math.max(reorder * 3, 1)) * 100))
}

function stockBarColor(v: any) {
  const available = Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty))
  const reorder   = Number(v.reorder_level) || 0
  if (Number(v.stock_qty) === 0) return 'bg-gray-600'
  if (available <= reorder)      return 'bg-red-500'
  if (available <= reorder * 2)  return 'bg-amber-500'
  return 'bg-emerald-500'
}

function availColor(v: any) {
  const available = Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty))
  const reorder   = Number(v.reorder_level) || 0
  if (Number(v.stock_qty) === 0) return 'text-gray-600'
  if (available <= reorder)      return 'text-red-400'
  if (available <= reorder * 2)  return 'text-amber-400'
  return 'text-emerald-400'
}

function priceRange(p: any) {
  const prices = (p.variants ?? []).flatMap((v: any) =>
    Object.values(v.prices ?? {}).map((pr: any) => Number(pr.unit_price)),
  ).filter((x: number) => x > 0)
  if (!prices.length) {
    // fallback: base_price
    const bps = (p.variants ?? []).map((v: any) => Number(v.base_price)).filter((x: number) => x > 0)
    if (!bps.length) return ''
    const mn = Math.min(...bps); const mx = Math.max(...bps)
    return mn === mx ? `৳${mn.toLocaleString()}` : `৳${mn.toLocaleString()}–${mx.toLocaleString()}`
  }
  const mn = Math.min(...prices); const mx = Math.max(...prices)
  return mn === mx ? `৳${mn.toLocaleString()}` : `৳${mn.toLocaleString()}–${mx.toLocaleString()}`
}
</script>

<style scoped>
/* Tab slide */
.tab-slide-enter-active,
.tab-slide-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.tab-slide-enter-from   { opacity: 0; transform: translateY(10px); }
.tab-slide-leave-to     { opacity: 0; transform: translateY(-6px); }

/* Accordion expand */
.expand-enter-active,
.expand-leave-active { transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease; overflow: hidden; }
.expand-enter-from,
.expand-leave-to     { max-height: 0; opacity: 0; }
.expand-enter-to,
.expand-leave-from   { max-height: 1200px; opacity: 1; }

/* Modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }

/* Quick fade */
.fade-quick-enter-active, .fade-quick-leave-active { transition: opacity 0.15s ease; }
.fade-quick-enter-from, .fade-quick-leave-to       { opacity: 0; }
</style>

import { defineComponent, computed, withAsyncContext, ref, watch, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PricingEnginePanel",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user } = useUserSession();
    const isAdmin = computed(
      () => {
        var _a, _b;
        return ["admin", "superadmin"].includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
      }
    );
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/pricing-engine",
      "$uR_qCQh1_z"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const raw = computed(() => data.value);
    const grades = computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.grades) != null ? _b : [];
    });
    const gradeData = computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.gradeData) != null ? _b : {};
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.currentPrices) != null ? _b : {};
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.customCurrent) != null ? _b : {};
    });
    const current50ByFactory = computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.current50ByFactory) != null ? _b : {};
    });
    function roundDown5(v) {
      return Math.floor(v / 5) * 5;
    }
    const branchSetup = ref([]);
    watch(data, () => {
      var _a, _b;
      branchSetup.value = ((_b = (_a = raw.value) == null ? void 0 : _a.branches) != null ? _b : []).map((b) => {
        var _a2, _b2;
        return {
          ...b,
          branch_type: (_a2 = b.branch_type) != null ? _a2 : "sales_region",
          source_branch_id: (_b2 = b.source_branch_id) != null ? _b2 : null
        };
      });
    }, { immediate: true });
    const setupFactories = computed(() => branchSetup.value.filter((b) => b.branch_type === "factory"));
    const factories = computed(() => branchSetup.value.filter((b) => b.branch_type === "factory"));
    const regions = computed(() => branchSetup.value.filter((b) => b.branch_type === "sales_region"));
    const unassignedRegions = computed(() => regions.value.filter((r) => !r.source_branch_id));
    const pricedBranches = computed(() => [
      ...factories.value,
      ...regions.value.filter((r) => r.source_branch_id)
    ]);
    const chargeableBranches = computed(() => branchSetup.value.filter((b) => b.branch_type !== "office"));
    function factoryName(id) {
      var _a, _b;
      return (_b = (_a = factories.value.find((f) => f.id === id)) == null ? void 0 : _a.name) != null ? _b : "?";
    }
    function factoryCode(id) {
      var _a, _b;
      return (_b = (_a = factories.value.find((f) => f.id === id)) == null ? void 0 : _a.code) != null ? _b : "?";
    }
    const cfg = reactive({ formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 } });
    watch(data, () => {
      var _a, _b, _c, _d, _e, _f, _g;
      const c = (_a = raw.value) == null ? void 0 : _a.config;
      if (!c) return;
      cfg.formula.bag_50 = (_c = (_b = c.formula) == null ? void 0 : _b.bag_50) != null ? _c : 50;
      cfg.formula.bag_74 = (_e = (_d = c.formula) == null ? void 0 : _d.bag_74) != null ? _e : 74;
      cfg.formula.packaging_fee = (_g = (_f = c.formula) == null ? void 0 : _f.packaging_fee) != null ? _g : 150;
    }, { immediate: true });
    const comps = reactive({});
    watch(data, () => {
      var _a, _b, _c, _d, _e;
      const byBranch = (_b = (_a = raw.value) == null ? void 0 : _a.componentsByBranch) != null ? _b : {};
      for (const b of (_d = (_c = raw.value) == null ? void 0 : _c.branches) != null ? _d : []) {
        comps[b.id] = ((_e = byBranch[String(b.id)]) != null ? _e : []).map((c) => ({
          name: c.name,
          weight_class: c.weight_class,
          charge_type: c.charge_type,
          amount: Number(c.amount),
          is_active: c.is_active
        }));
      }
    }, { immediate: true });
    function sumBaseCharges(branchId, wc) {
      var _a;
      return ((_a = comps[branchId]) != null ? _a : []).filter((c) => c.is_active && c.charge_type === "base" && (c.weight_class === wc || c.weight_class === "all")).reduce((s, c) => s + (Number(c.amount) || 0), 0);
    }
    function baseChargeTotal(branchId, wc) {
      return sumBaseCharges(branchId, wc);
    }
    function miniTruckTotal(branchId) {
      var _a;
      return ((_a = comps[branchId]) != null ? _a : []).filter((c) => c.is_active && c.charge_type === "mini_truck").reduce((s, c) => s + (Number(c.amount) || 0), 0);
    }
    const base50 = reactive({});
    watch([data, factories], () => {
      var _a, _b, _c;
      for (const f of factories.value) {
        if (!base50[f.id]) base50[f.id] = {};
        for (const g of grades.value) {
          if (base50[f.id][g] === void 0)
            base50[f.id][g] = (_c = (_b = (_a = current50ByFactory.value) == null ? void 0 : _a[String(f.id)]) == null ? void 0 : _b[g]) != null ? _c : null;
        }
      }
    }, { immediate: true });
    const customPrices = reactive({});
    const customAll = computed(() => {
      var _a, _b;
      const list = [];
      for (const [, wcs] of Object.entries(gradeData.value)) {
        for (const item of (_a = wcs["custom"]) != null ? _a : []) {
          list.push(item);
          if (customPrices[item.variant_id] === void 0)
            customPrices[item.variant_id] = (_b = item.current_price) != null ? _b : null;
        }
      }
      return list;
    });
    function calc74(base50Val) {
      return roundDown5(base50Val / cfg.formula.bag_50 * cfg.formula.bag_74 + cfg.formula.packaging_fee);
    }
    function calc74Label(factoryId, grade) {
      var _a;
      const v = Number((_a = base50[factoryId]) == null ? void 0 : _a[grade]);
      if (!v || v <= 0) return "\u2014";
      return "\u09F3" + fmt(calc74(v));
    }
    function enginePrice(b, grade, wc) {
      var _a;
      const factoryId = b.branch_type === "factory" ? b.id : b.source_branch_id;
      if (!factoryId) return null;
      const b50 = Number((_a = base50[factoryId]) == null ? void 0 : _a[grade]);
      if (!b50 || b50 <= 0) return null;
      const base = wc === "50" ? b50 : calc74(b50);
      const factoryPrice = roundDown5(base + sumBaseCharges(factoryId, wc));
      if (b.branch_type === "factory") return factoryPrice;
      return roundDown5(factoryPrice + sumBaseCharges(b.id, wc));
    }
    function previewPrice(b, grade, wc) {
      const p = enginePrice(b, grade, wc);
      return p === null ? "\u2014" : "\u09F3" + fmt(p);
    }
    function gradeProductNames(grade) {
      var _a, _b;
      const names = /* @__PURE__ */ new Set();
      for (const wc of ["50", "74"]) {
        for (const v of (_b = (_a = gradeData.value[grade]) == null ? void 0 : _a[wc]) != null ? _b : []) names.add(v.product_name);
      }
      return [...names].slice(0, 3).join(", ") + (names.size > 3 ? "\u2026" : "");
    }
    function fmt(n) {
      if (n == null || isNaN(n)) return "\u2014";
      return Number(n).toLocaleString("en-BD", { maximumFractionDigits: 2 });
    }
    const savingConfig = ref(false);
    const savingSetup = ref(false);
    const savingComps = ref(null);
    const flash = reactive({ msg: "", ok: true });
    const reviewOpen = ref(false);
    const reviewRows = ref([]);
    const reviewStats = computed(() => {
      let increases = 0, decreases = 0, unchanged = 0, isNew = 0;
      for (const r of reviewRows.value) {
        if (r.delta === null) isNew++;
        else if (r.delta > 5e-3) increases++;
        else if (r.delta < -5e-3) decreases++;
        else unchanged++;
      }
      return { increases, decreases, unchanged, isNew };
    });
    const applying = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(flash).msg) {
        _push(`<div class="${ssrRenderClass([unref(flash).ok ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-red-500/15 border-red-500/30 text-red-300", "glass-card px-4 py-3 text-sm border flex items-start gap-2"])}"><span>${ssrInterpolate(unref(flash).ok ? "\u2713" : "\u2717")}</span><span>${ssrInterpolate(unref(flash).msg)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(unassignedRegions).length) {
        _push(`<div class="glass-card px-4 py-3 text-sm border bg-amber-500/10 border-amber-500/25 text-amber-300 flex items-start gap-2"><span>\u26A0</span><span><strong>${ssrInterpolate(unref(unassignedRegions).map((r) => r.name).join(", "))}</strong> ${ssrInterpolate(unref(unassignedRegions).length === 1 ? "has" : "have")} no source factory assigned \u2014 the engine will skip ${ssrInterpolate(unref(unassignedRegions).length === 1 ? "it" : "them")}. Assign one in <strong>Branch Network</strong> below. </span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2"><span class="text-gray-500">\u2699</span> Formula Constants </h2><button${ssrIncludeBooleanAttr(unref(savingConfig)) ? " disabled" : ""} class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50">${ssrInterpolate(unref(savingConfig) ? "Saving\u2026" : "Save Constants")}</button></div><div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-8"><div><p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">74 kg Auto-Price Formula</p><div class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 font-mono text-xs text-blue-300 mb-4"> price_74 = \u230A((price_50 \xF7 <strong>${ssrInterpolate(unref(cfg).formula.bag_50)}</strong>) \xD7 <strong>${ssrInterpolate(unref(cfg).formula.bag_74)}</strong> + <strong>${ssrInterpolate(unref(cfg).formula.packaging_fee)}</strong>) \u230B\u2085 </div><div class="grid grid-cols-3 gap-3"><div><label class="block text-[11px] text-gray-500 mb-1">Bag size 50 kg</label><input${ssrRenderAttr("value", unref(cfg).formula.bag_50)} type="number" min="1" step="1" class="input-glass w-full text-xs py-1.5 text-center font-mono"></div><div><label class="block text-[11px] text-gray-500 mb-1">Bag size 74 kg</label><input${ssrRenderAttr("value", unref(cfg).formula.bag_74)} type="number" min="1" step="1" class="input-glass w-full text-xs py-1.5 text-center font-mono"></div><div><label class="block text-[11px] text-gray-500 mb-1">Packaging fee (\u09F3)</label><input${ssrRenderAttr("value", unref(cfg).formula.packaging_fee)} type="number" step="0.01" class="input-glass w-full text-xs py-1.5 text-center font-mono"></div></div><p class="mt-2 text-[11px] text-gray-600"> Example (base \u09F32,500): \u230A(2500\xF7${ssrInterpolate(unref(cfg).formula.bag_50)})\xD7${ssrInterpolate(unref(cfg).formula.bag_74)}+${ssrInterpolate(unref(cfg).formula.packaging_fee)}\u230B\u2085 = <strong class="text-gray-400">\u09F3${ssrInterpolate(fmt(calc74(2500)))}</strong> \xA0\xB7\xA0 \u230A\u2026\u230B\u2085 = rounded down to nearest \u09F35 </p></div><div class="text-xs text-gray-500 space-y-2 self-center"><p class="font-semibold text-gray-400 uppercase tracking-wide">How pricing flows</p><p>1\uFE0F\u20E3 Each <strong class="text-gray-300">factory</strong> gets a base 50 kg price per grade \u2192 its 74 kg price is auto-computed.</p><p>2\uFE0F\u20E3 Each <strong class="text-gray-300">sales region</strong> takes its source factory&#39;s price and adds its own charges (freight, handling\u2026).</p><p>3\uFE0F\u20E3 <strong class="text-gray-300">Mini-truck</strong> charges are never baked into the price list \u2014 they&#39;re added per bag at order time.</p><p>Every stored price lands on a \u09F35 boundary.</p></div></div></div><div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2"><span class="text-gray-500">\u{1F3ED}</span> Branch Network <span class="text-xs font-normal text-gray-600 ml-1">\u2014 which branch produces, which sells</span></h2>`);
      if (unref(isAdmin)) {
        _push(`<button${ssrIncludeBooleanAttr(unref(savingSetup)) ? " disabled" : ""} class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50">${ssrInterpolate(unref(savingSetup) ? "Saving\u2026" : "Save Network")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-white/[0.04]"><tr class="text-gray-600 uppercase tracking-wide text-[10px]"><th class="px-5 py-2.5 text-left font-semibold">Branch</th><th class="px-3 py-2.5 text-left font-semibold">Type</th><th class="px-3 py-2.5 text-left font-semibold">Source Factory</th><th class="px-3 py-2.5 text-left font-semibold">Priced by Engine</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
      ssrRenderList(unref(branchSetup), (b) => {
        _push(`<tr class="hover:bg-white/[0.02]"><td class="px-5 py-2.5"><span class="font-semibold text-gray-300">${ssrInterpolate(b.name)}</span><span class="text-gray-600 font-mono text-[10px] ml-1.5">${ssrInterpolate(b.code)}</span></td><td class="px-3 py-2"><select${ssrIncludeBooleanAttr(!unref(isAdmin)) ? " disabled" : ""} class="input-glass text-xs py-1 w-36 disabled:opacity-60"><option value="factory"${ssrIncludeBooleanAttr(Array.isArray(b.branch_type) ? ssrLooseContain(b.branch_type, "factory") : ssrLooseEqual(b.branch_type, "factory")) ? " selected" : ""}>\u{1F3ED} Factory</option><option value="sales_region"${ssrIncludeBooleanAttr(Array.isArray(b.branch_type) ? ssrLooseContain(b.branch_type, "sales_region") : ssrLooseEqual(b.branch_type, "sales_region")) ? " selected" : ""}>\u{1F4CD} Sales Region</option><option value="office"${ssrIncludeBooleanAttr(Array.isArray(b.branch_type) ? ssrLooseContain(b.branch_type, "office") : ssrLooseEqual(b.branch_type, "office")) ? " selected" : ""}>\u{1F3E2} Office</option></select></td><td class="px-3 py-2">`);
        if (b.branch_type === "sales_region") {
          _push(`<select${ssrIncludeBooleanAttr(!unref(isAdmin)) ? " disabled" : ""} class="${ssrRenderClass([!b.source_branch_id ? "border-amber-500/40" : "", "input-glass text-xs py-1 w-40 disabled:opacity-60"])}"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(b.source_branch_id) ? ssrLooseContain(b.source_branch_id, null) : ssrLooseEqual(b.source_branch_id, null)) ? " selected" : ""}>\u2014 Not assigned \u2014</option><!--[-->`);
          ssrRenderList(unref(setupFactories), (f) => {
            _push(`<option${ssrRenderAttr("value", f.id)}${ssrIncludeBooleanAttr(Array.isArray(b.source_branch_id) ? ssrLooseContain(b.source_branch_id, f.id) : ssrLooseEqual(b.source_branch_id, f.id)) ? " selected" : ""}>${ssrInterpolate(f.name)}</option>`);
          });
          _push(`<!--]--></select>`);
        } else {
          _push(`<span class="text-gray-700">\u2014</span>`);
        }
        _push(`</td><td class="px-3 py-2">`);
        if (b.branch_type === "factory") {
          _push(`<span class="text-emerald-400">\u2713 Ex-factory price</span>`);
        } else if (b.branch_type === "sales_region" && b.source_branch_id) {
          _push(`<span class="text-sky-400">\u2713 Via ${ssrInterpolate(factoryName(b.source_branch_id))}</span>`);
        } else if (b.branch_type === "sales_region") {
          _push(`<span class="text-amber-400">\u26A0 Needs source factory</span>`);
        } else {
          _push(`<span class="text-gray-700">Not priced</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div><div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06]"><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2"><span class="text-gray-500">\u{1F69A}</span> Branch Charges <span class="text-xs font-normal text-gray-600 ml-1">\u2014 freight &amp; extras added on top of the factory price</span></h2></div><div class="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4"><!--[-->`);
      ssrRenderList(unref(chargeableBranches), (b) => {
        var _a;
        _push(`<div class="border border-white/[0.06] rounded-xl overflow-hidden"><div class="px-4 py-2.5 bg-white/[0.025] border-b border-white/[0.05] flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-xs">${ssrInterpolate(b.branch_type === "factory" ? "\u{1F3ED}" : "\u{1F4CD}")}</span><span class="font-semibold text-gray-200 text-xs">${ssrInterpolate(b.name)}</span>`);
        if (b.branch_type === "sales_region" && b.source_branch_id) {
          _push(`<span class="text-[10px] text-gray-600">via ${ssrInterpolate(factoryName(b.source_branch_id))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button${ssrIncludeBooleanAttr(unref(savingComps) === b.id) ? " disabled" : ""} class="text-[11px] px-3 py-1 rounded-lg bg-gold-500/15 text-gold-400 border border-gold-500/20 hover:bg-gold-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(savingComps) === b.id ? "\u2026" : "Save")}</button></div><div class="p-3 space-y-2">`);
        if (!((_a = unref(comps)[b.id]) == null ? void 0 : _a.length)) {
          _push(`<div class="text-[11px] text-gray-700 italic px-1"> No charges \u2014 ${ssrInterpolate(b.branch_type === "factory" ? "price = base price" : "price = factory price")}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(comps)[b.id], (c, i) => {
          _push(`<div class="flex items-center gap-1.5"><input${ssrRenderAttr("value", c.name)} type="text" placeholder="Charge name\u2026" class="input-glass text-xs py-1 flex-1 min-w-0"><select class="input-glass text-xs py-1 w-16 shrink-0"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(c.weight_class) ? ssrLooseContain(c.weight_class, "all") : ssrLooseEqual(c.weight_class, "all")) ? " selected" : ""}>All</option><option value="50"${ssrIncludeBooleanAttr(Array.isArray(c.weight_class) ? ssrLooseContain(c.weight_class, "50") : ssrLooseEqual(c.weight_class, "50")) ? " selected" : ""}>50kg</option><option value="74"${ssrIncludeBooleanAttr(Array.isArray(c.weight_class) ? ssrLooseContain(c.weight_class, "74") : ssrLooseEqual(c.weight_class, "74")) ? " selected" : ""}>74kg</option></select><select class="input-glass text-xs py-1 w-28 shrink-0"${ssrRenderAttr("title", c.charge_type === "base" ? "Included in the stored price" : "Added per bag at order time only")}><option value="base"${ssrIncludeBooleanAttr(Array.isArray(c.charge_type) ? ssrLooseContain(c.charge_type, "base") : ssrLooseEqual(c.charge_type, "base")) ? " selected" : ""}>In price</option><option value="mini_truck"${ssrIncludeBooleanAttr(Array.isArray(c.charge_type) ? ssrLooseContain(c.charge_type, "mini_truck") : ssrLooseEqual(c.charge_type, "mini_truck")) ? " selected" : ""}>Mini-truck</option></select><div class="flex items-center gap-0.5 shrink-0"><span class="text-[10px] text-gray-600">\u09F3</span><input${ssrRenderAttr("value", c.amount)} type="number" step="1" class="input-glass text-xs py-1 w-16 text-right font-mono"></div><button class="text-gray-700 hover:text-red-400 text-sm leading-none shrink-0 px-0.5">\u2715</button></div>`);
        });
        _push(`<!--]--><button class="text-[11px] text-gray-600 hover:text-gold-400 transition-colors"> + Add charge </button>`);
        if (baseChargeTotal(b.id, "50") || baseChargeTotal(b.id, "74") || miniTruckTotal(b.id)) {
          _push(`<div class="pt-1.5 border-t border-white/[0.04] flex flex-wrap gap-3 text-[10px] text-gray-600"><span>In price: <strong class="text-gray-400">+\u09F3${ssrInterpolate(baseChargeTotal(b.id, "50"))}</strong> (50kg) \xB7 <strong class="text-gray-400">+\u09F3${ssrInterpolate(baseChargeTotal(b.id, "74"))}</strong> (74kg)</span>`);
          if (miniTruckTotal(b.id)) {
            _push(`<span>Mini-truck at order: <strong class="text-amber-400">+\u09F3${ssrInterpolate(miniTruckTotal(b.id))}</strong>/bag</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06]"><h2 class="text-sm font-bold text-gray-200"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">1</span> Set Ex-Factory 50 kg Price per Grade </h2><p class="text-xs text-gray-500 mt-0.5">One base price per grade per factory. 74 kg and all region prices are computed automatically.</p></div><div class="p-5 space-y-4"><!--[-->`);
      ssrRenderList(unref(grades), (grade) => {
        var _a, _b, _c, _d;
        _push(`<div class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] transition-colors"><div class="flex items-center gap-3 px-4 py-3 bg-white/[0.025] border-b border-white/[0.06]"><span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-500/20 text-gold-300 font-bold text-lg">${ssrInterpolate(grade)}</span><div><p class="font-semibold text-gray-200 text-sm">Grade ${ssrInterpolate(grade)}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(((_b = (_a = unref(gradeData)[grade]) == null ? void 0 : _a["50"]) != null ? _b : []).length)} \xD7 50 kg \xB7 ${ssrInterpolate(((_d = (_c = unref(gradeData)[grade]) == null ? void 0 : _c["74"]) != null ? _d : []).length)} \xD7 74 kg <span class="ml-2 text-gray-700">${ssrInterpolate(gradeProductNames(grade))}</span></p></div></div><div class="${ssrRenderClass([unref(factories).length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1", "p-4 grid gap-4"])}"><!--[-->`);
        ssrRenderList(unref(factories), (f) => {
          var _a2;
          _push(`<div class="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3.5"><p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">\u{1F3ED} ${ssrInterpolate(f.name)}</p><input${ssrRenderAttr("value", unref(base50)[f.id][grade])} type="number" step="1" min="0" placeholder="Base 50 kg price\u2026" class="input-glass w-full py-2.5 text-center font-bold text-lg text-gold-300"><div class="mt-2 flex items-center justify-between text-[11px] text-gray-600"><span>74 kg auto \u2192 <strong class="text-purple-400">${ssrInterpolate(calc74Label(f.id, grade))}</strong></span>`);
          if (((_a2 = unref(current50ByFactory)[String(f.id)]) == null ? void 0 : _a2[grade]) !== void 0) {
            _push(`<span class="text-gray-700"> Now \u09F3${ssrInterpolate(fmt(unref(current50ByFactory)[String(f.id)][grade]))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--></div></div>`);
      if (unref(customAll).length) {
        _push(`<div class="glass-card p-0 overflow-hidden border border-amber-500/20"><div class="px-5 py-3 border-b border-amber-500/20 bg-amber-500/5"><h2 class="text-sm font-bold text-amber-300"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold mr-2">2</span> Custom-Weight Products \u2014 Manual Ex-Factory Price </h2><p class="text-xs text-amber-500/80 mt-0.5">Non-standard bag weights. Regions add their &quot;All&quot;-class charges on top. Leave blank to keep unchanged.</p></div><div class="p-5"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(unref(customAll), (item) => {
          _push(`<div class="border border-white/[0.06] rounded-xl p-4 hover:border-amber-500/30 transition-colors"><p class="text-xs font-semibold text-gray-300 truncate">${ssrInterpolate(item.product_name)}</p><div class="flex items-center gap-2 mt-1 mb-3"><span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">${ssrInterpolate(item.weight_variant)} ${ssrInterpolate(item.uom)}</span><span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500"> Grade ${ssrInterpolate(item.grade)}</span></div><label class="block text-[11px] text-gray-500 mb-1">Ex-factory price per bag (\u09F3)</label><input${ssrRenderAttr("value", unref(customPrices)[item.variant_id])} type="number" step="1" min="0" placeholder="Enter price\u2026" class="input-glass w-full text-xs py-2 text-center font-mono font-bold">`);
          if (item.current_price !== null) {
            _push(`<p class="mt-1 text-[10px] text-gray-600 text-center"> Current lowest: \u09F3${ssrInterpolate(fmt(item.current_price))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-bold text-gray-200"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">${ssrInterpolate(unref(customAll).length ? "3" : "2")}</span> Live Price Preview <span class="text-xs font-normal text-gray-600 ml-1">\u2014 updates as you type</span></h2><div class="flex items-center gap-3 text-[11px] text-gray-600"><span><span class="inline-block w-2 h-2 bg-blue-400 rounded-sm mr-1"></span>50 kg</span><span><span class="inline-block w-2 h-2 bg-purple-400 rounded-sm mr-1"></span>74 kg</span></div></div><div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-white/[0.06]"><tr><th class="px-4 py-2.5 text-left text-gray-600 font-semibold uppercase tracking-wider sticky left-0 bg-[#0f1117] min-w-[90px]">Grade</th><!--[-->`);
      ssrRenderList(unref(pricedBranches), (b) => {
        _push(`<!--[--><th class="px-3 py-2.5 text-center text-blue-400/70 font-semibold bg-blue-500/5 min-w-[90px]">${ssrInterpolate(b.code)}<br><span class="text-[10px] font-normal text-gray-600">50 kg${ssrInterpolate(b.branch_type === "sales_region" ? " \xB7 via " + factoryCode(b.source_branch_id) : "")}</span></th><th class="px-3 py-2.5 text-center text-purple-400/70 font-semibold bg-purple-500/5 min-w-[90px]">${ssrInterpolate(b.code)}<br><span class="text-[10px] font-normal text-gray-600">74 kg</span></th><!--]-->`);
      });
      _push(`<!--]--></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
      ssrRenderList(unref(grades), (grade) => {
        _push(`<tr class="hover:bg-white/[0.02]"><td class="px-4 py-2.5 font-bold text-gray-300 sticky left-0 bg-[#0f1117]">Grade ${ssrInterpolate(grade)}</td><!--[-->`);
        ssrRenderList(unref(pricedBranches), (b) => {
          _push(`<!--[--><td class="px-3 py-2.5 text-center bg-blue-500/5 text-blue-300/80 font-mono">${ssrInterpolate(previewPrice(b, grade, "50"))}</td><td class="px-3 py-2.5 text-center bg-purple-500/5 text-purple-300/80 font-mono">${ssrInterpolate(previewPrice(b, grade, "74"))}</td><!--]-->`);
        });
        _push(`<!--]--></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="px-5 py-2.5 border-t border-white/[0.04] text-[11px] text-gray-600 flex flex-wrap gap-4"><span>Region price = \u230Afactory price + region charges\u230B\u2085</span><span>Mini-truck charges are applied at order time, not shown here</span><span>All prices floor to \u09F35</span></div></div><div class="glass-card p-5 flex items-center justify-between"><div><p class="font-semibold text-gray-200 text-sm"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">${ssrInterpolate(unref(customAll).length ? "4" : "3")}</span> Review &amp; Apply </p><p class="text-xs text-gray-500 mt-0.5">Click <strong class="text-gray-400">Review Changes</strong> to see a full before/after comparison.</p></div><div class="flex items-center gap-3"><button class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"> \u21BA Reset </button><button class="btn-gold text-xs px-5 py-2"> \u{1F50D} Review Changes </button></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(reviewOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8"><div class="relative bg-[#0f1117] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style="${ssrRenderStyle({ "max-height": "90vh" })}"><div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0"><div><h3 class="text-base font-bold text-gray-100">Review Price Changes</h3><p class="text-xs text-gray-500 mt-0.5">Confirm all changes before they are written to the database.</p></div><button class="text-gray-600 hover:text-gray-300 text-lg">\u2715</button></div><div class="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.02] flex flex-wrap gap-5 text-xs shrink-0"><span><strong class="text-gray-200">${ssrInterpolate(unref(reviewRows).length)}</strong> <span class="text-gray-500">rows</span></span><span><strong class="text-emerald-400">${ssrInterpolate(unref(reviewStats).increases)}</strong> <span class="text-gray-500">increases</span></span><span><strong class="text-red-400">${ssrInterpolate(unref(reviewStats).decreases)}</strong> <span class="text-gray-500">decreases</span></span><span><strong class="text-gray-400">${ssrInterpolate(unref(reviewStats).unchanged)}</strong> <span class="text-gray-500">unchanged</span></span><span><strong class="text-blue-400">${ssrInterpolate(unref(reviewStats).isNew)}</strong> <span class="text-gray-500">new (no prior price)</span></span></div><div class="overflow-y-auto flex-1 min-h-0"><table class="w-full text-xs"><thead class="sticky top-0 z-10 bg-[#0f1117] border-b border-white/[0.06]"><tr class="text-gray-600 uppercase tracking-wide"><th class="px-4 py-2.5 text-left font-semibold">Grade / Product</th><th class="px-4 py-2.5 text-left font-semibold">Branch</th><th class="px-4 py-2.5 text-center font-semibold">Weight</th><th class="px-4 py-2.5 text-center font-semibold">Current</th><th class="px-4 py-2.5 text-center font-semibold">New Price</th><th class="px-4 py-2.5 text-center font-semibold">\u0394 Change</th><th class="px-4 py-2.5 text-center font-semibold">%</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
          ssrRenderList(unref(reviewRows), (r, i) => {
            var _a, _b, _c;
            _push2(`<tr class="${ssrRenderClass({
              "bg-blue-500/5": r.delta === null,
              "bg-emerald-500/5": r.delta !== null && r.delta > 5e-3,
              "bg-red-500/5": r.delta !== null && r.delta < -5e-3
            })}"><td class="px-4 py-2 font-semibold text-gray-300">${ssrInterpolate(r.label)}</td><td class="px-4 py-2 text-gray-400">${ssrInterpolate(r.branch)}</td><td class="px-4 py-2 text-center"><span class="${ssrRenderClass([r.weight.startsWith("50") ? "bg-blue-500/20 text-blue-300" : r.weight.includes("custom") ? "bg-amber-500/20 text-amber-300" : "bg-purple-500/20 text-purple-300", "px-1.5 py-0.5 rounded text-[10px] font-medium"])}">${ssrInterpolate(r.weight)}</span></td><td class="px-4 py-2 text-center">`);
            if (r.curr !== null) {
              _push2(`<span class="text-gray-400 font-mono">\u09F3${ssrInterpolate(fmt(r.curr))}</span>`);
            } else {
              _push2(`<span class="text-blue-400 text-[10px] font-medium">New</span>`);
            }
            _push2(`</td><td class="px-4 py-2 text-center font-bold font-mono text-gray-200">\u09F3${ssrInterpolate(fmt(r.newP))}</td><td class="px-4 py-2 text-center font-mono">`);
            if (r.delta === null) {
              _push2(`<span class="text-blue-400 text-[10px]">No prior</span>`);
            } else if (r.delta > 5e-3) {
              _push2(`<span class="text-emerald-400">+\u09F3${ssrInterpolate(fmt(r.delta))}</span>`);
            } else if (r.delta < -5e-3) {
              _push2(`<span class="text-red-400">(\u09F3${ssrInterpolate(fmt(Math.abs(r.delta)))})</span>`);
            } else {
              _push2(`<span class="text-gray-600">\u2014</span>`);
            }
            _push2(`</td><td class="px-4 py-2 text-center font-mono">`);
            if (r.pct !== null && Math.abs((_a = r.delta) != null ? _a : 0) > 5e-3) {
              _push2(`<span class="${ssrRenderClass(((_b = r.delta) != null ? _b : 0) > 0 ? "text-emerald-400" : "text-red-400")}">${ssrInterpolate(((_c = r.delta) != null ? _c : 0) > 0 ? "+" : "")}${ssrInterpolate(r.pct.toFixed(1))}% </span>`);
            } else {
              _push2(`<span class="text-gray-600">\u2014</span>`);
            }
            _push2(`</td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 rounded-b-2xl"><div class="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg"> \u26A0 Existing prices will be <strong>archived</strong> and replaced with the prices shown above. </div><div class="flex items-center gap-3"><button class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"> \u2190 Go Back </button><button${ssrIncludeBooleanAttr(unref(applying)) ? " disabled" : ""} class="btn-gold text-xs px-6 py-2 disabled:opacity-50">`);
          if (unref(applying)) {
            _push2(`<svg class="w-3 h-3 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate(unref(applying) ? "Applying\u2026" : "\u2713 Confirm & Apply")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PricingEnginePanel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=PricingEnginePanel-3psyBiWJ.mjs.map

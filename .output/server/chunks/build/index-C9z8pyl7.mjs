import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, computed, reactive, ref, withAsyncContext, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user: sessionUser } = useUserSession();
    const isSuperadmin = computed(() => {
      var _a, _b;
      return ((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() === "superadmin";
    });
    const filters = reactive({
      date_from: "",
      date_to: "",
      supplier_id: "",
      wheat_origin: "",
      grn_status: "",
      unload_point: "",
      truck_number: "",
      search: ""
    });
    const page = ref(1);
    const perPage = ref(50);
    const jumpPage = ref(1);
    const applied = reactive({ ...filters });
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/grn",
      {
        query: computed(() => ({
          ...applied,
          page: page.value,
          per: perPage.value
        }))
      },
      "$O17hc_JA6O"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    function fmtDate(val) {
      if (!val) return "\u2014";
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.grns) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const dropdowns = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        suppliers: (_b = (_a = data.value) == null ? void 0 : _a.suppliers) != null ? _b : [],
        origins: (_d = (_c = data.value) == null ? void 0 : _c.origins) != null ? _d : [],
        unloadPoints: (_f = (_e = data.value) == null ? void 0 : _e.unloadPoints) != null ? _f : []
      };
    });
    const supplierOptions = computed(() => dropdowns.value.suppliers.map((s) => ({
      value: s.id,
      label: s.company_name
    })));
    const totalPages = computed(() => {
      var _a, _b;
      return Math.ceil(((_b = (_a = data.value) == null ? void 0 : _a.total) != null ? _b : 0) / perPage.value);
    });
    const pageRange = computed(() => {
      const start = Math.max(1, page.value - 2);
      const end = Math.min(totalPages.value, page.value + 2);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });
    function varianceKg(g) {
      return Math.abs(Number(g.quantity_received_kg) - Number(g.expected_quantity));
    }
    function variancePct(g) {
      const exp = Number(g.expected_quantity);
      if (!exp) return 0;
      return (Number(g.quantity_received_kg) - exp) / exp * 100;
    }
    function varianceSign(g) {
      return Number(g.quantity_received_kg) >= Number(g.expected_quantity) ? "+" : "-";
    }
    function varianceColor(g) {
      const pct = Math.abs(variancePct(g));
      if (pct > 1) return "text-red-400";
      if (pct > 0.5) return "text-yellow-400";
      return "text-emerald-400";
    }
    function fmtCompact(v) {
      const n = Number(v != null ? v : 0);
      if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
      if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
      return n.toLocaleString();
    }
    const deleteModal = reactive({
      show: false,
      grn: null,
      reason: "",
      loading: false
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Goods Received Notes",
        subtitle: "Complete list of all GRN records",
        breadcrumb: ["Purchase", "GRNs"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/grn/variance",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F4CA} Variance`);
                } else {
                  return [
                    createTextVNode("\u{1F4CA} Variance")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/grn/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Record GRN`);
                } else {
                  return [
                    createTextVNode("+ Record GRN")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/grn/variance",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F4CA} Variance")
                ]),
                _: 1
              }),
              createVNode(_component_NuxtLink, {
                to: "/purchase/grn/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Record GRN")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 border-l-2 border-blue-500/40"><p class="text-xs text-gray-500 mb-1">Total GRNs</p><p class="text-2xl font-bold text-gray-200">${ssrInterpolate((_a = unref(stats).total_grns) != null ? _a : 0)}</p><p class="text-[10px] text-gray-600 mt-1"><span class="text-emerald-400">${ssrInterpolate((_b = unref(stats).posted_count) != null ? _b : 0)} Posted</span> \xB7 <span class="text-yellow-400">${ssrInterpolate((_c = unref(stats).verified_count) != null ? _c : 0)} Verified</span> \xB7 <span class="text-gray-500">${ssrInterpolate((_d = unref(stats).draft_count) != null ? _d : 0)} Draft</span></p></div><div class="glass-card p-4 border-l-2 border-purple-500/40"><p class="text-xs text-gray-500 mb-1">Expected Qty</p><p class="text-2xl font-bold text-purple-400">${ssrInterpolate(Number((_e = unref(stats).total_expected_qty) != null ? _e : 0).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-1">KG</p></div><div class="glass-card p-4 border-l-2 border-emerald-500/40"><p class="text-xs text-gray-500 mb-1">Received Qty</p><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate(Number((_f = unref(stats).total_received_qty) != null ? _f : 0).toLocaleString())}</p><p class="${ssrRenderClass([Number((_g = unref(stats).total_variance_qty) != null ? _g : 0) < 0 ? "text-red-400" : "text-emerald-400", "text-[10px] mt-1"])}"> Variance: ${ssrInterpolate(Number((_h = unref(stats).total_variance_qty) != null ? _h : 0) > 0 ? "+" : "")}${ssrInterpolate(Number((_i = unref(stats).total_variance_qty) != null ? _i : 0).toLocaleString())} KG </p></div><div class="glass-card p-4 border-l-2 border-orange-500/40"><p class="text-xs text-gray-500 mb-1">Total Value</p><p class="text-2xl font-bold text-orange-400">\u09F3${ssrInterpolate(fmtCompact((_j = unref(stats).total_value) != null ? _j : 0))}</p><p class="text-[10px] text-gray-600 mt-1">All filtered GRNs</p></div></div><div class="glass-card p-4 space-y-3"><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2"><label class="text-[10px] text-gray-500 uppercase">From</label><input${ssrRenderAttr("value", unref(filters).date_from)} type="date" class="field-input text-xs py-1.5 w-36"></div><div class="flex items-center gap-2"><label class="text-[10px] text-gray-500 uppercase">To</label><input${ssrRenderAttr("value", unref(filters).date_to)} type="date" class="field-input text-xs py-1.5 w-36"></div>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(filters).supplier_id,
        "onUpdate:modelValue": ($event) => unref(filters).supplier_id = $event,
        options: unref(supplierOptions),
        placeholder: "All Suppliers",
        class: "text-xs w-44"
      }, null, _parent));
      _push(`<select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).wheat_origin) ? ssrLooseContain(unref(filters).wheat_origin, "") : ssrLooseEqual(unref(filters).wheat_origin, "")) ? " selected" : ""}>All Origins</option><!--[-->`);
      ssrRenderList(unref(dropdowns).origins, (o) => {
        _push(`<option${ssrRenderAttr("value", o.wheat_origin)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).wheat_origin) ? ssrLooseContain(unref(filters).wheat_origin, o.wheat_origin) : ssrLooseEqual(unref(filters).wheat_origin, o.wheat_origin)) ? " selected" : ""}>${ssrInterpolate(o.wheat_origin)}</option>`);
      });
      _push(`<!--]--></select><select class="field-input text-xs py-1.5 w-32"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).grn_status) ? ssrLooseContain(unref(filters).grn_status, "") : ssrLooseEqual(unref(filters).grn_status, "")) ? " selected" : ""}>All Statuses</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).grn_status) ? ssrLooseContain(unref(filters).grn_status, "draft") : ssrLooseEqual(unref(filters).grn_status, "draft")) ? " selected" : ""}>Draft</option><option value="verified"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).grn_status) ? ssrLooseContain(unref(filters).grn_status, "verified") : ssrLooseEqual(unref(filters).grn_status, "verified")) ? " selected" : ""}>Verified</option><option value="posted"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).grn_status) ? ssrLooseContain(unref(filters).grn_status, "posted") : ssrLooseEqual(unref(filters).grn_status, "posted")) ? " selected" : ""}>Posted</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).grn_status) ? ssrLooseContain(unref(filters).grn_status, "cancelled") : ssrLooseEqual(unref(filters).grn_status, "cancelled")) ? " selected" : ""}>Cancelled</option></select><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).unload_point) ? ssrLooseContain(unref(filters).unload_point, "") : ssrLooseEqual(unref(filters).unload_point, "")) ? " selected" : ""}>All Locations</option><!--[-->`);
      ssrRenderList(unref(dropdowns).unloadPoints, (u) => {
        _push(`<option${ssrRenderAttr("value", u.unload_point_name)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).unload_point) ? ssrLooseContain(unref(filters).unload_point, u.unload_point_name) : ssrLooseEqual(unref(filters).unload_point, u.unload_point_name)) ? " selected" : ""}>${ssrInterpolate(u.unload_point_name)}</option>`);
      });
      _push(`<!--]--></select><input${ssrRenderAttr("value", unref(filters).truck_number)} type="text" class="field-input text-xs py-1.5 w-32" placeholder="Truck #\u2026"><input${ssrRenderAttr("value", unref(filters).search)} type="text" class="field-input text-xs py-1.5 w-44" placeholder="GRN#, PO#, Truck#\u2026"></div><div class="flex items-center gap-3"><button class="btn-gold text-xs py-1.5 px-4">Apply Filters</button><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto flex items-center gap-2 text-xs text-gray-500"> Show <select class="field-input text-xs py-1 w-16"><option${ssrRenderAttr("value", 25)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 25) : ssrLooseEqual(unref(perPage), 25)) ? " selected" : ""}>25</option><option${ssrRenderAttr("value", 50)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 50) : ssrLooseEqual(unref(perPage), 50)) ? " selected" : ""}>50</option><option${ssrRenderAttr("value", 100)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 100) : ssrLooseEqual(unref(perPage), 100)) ? " selected" : ""}>100</option><option${ssrRenderAttr("value", 200)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 200) : ssrLooseEqual(unref(perPage), 200)) ? " selected" : ""}>200</option><option${ssrRenderAttr("value", 500)}${ssrIncludeBooleanAttr(Array.isArray(unref(perPage)) ? ssrLooseContain(unref(perPage), 500) : ssrLooseEqual(unref(perPage), 500)) ? " selected" : ""}>500</option></select> per page \xA0\xB7\xA0 <span class="font-medium text-gray-300">${ssrInterpolate((_l = (_k = unref(data)) == null ? void 0 : _k.total) != null ? _l : 0)}</span> records </div></div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(pending) && !unref(error)) {
        _push(`<div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.08]"><th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">GRN #</th><th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Date</th><th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">PO #</th><th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Supplier</th><th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Origin</th><th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Truck</th><th class="px-3 py-3 text-right text-[10px] font-semibold text-purple-400 uppercase">Expected</th><th class="px-3 py-3 text-right text-[10px] font-semibold text-emerald-400 uppercase">Received</th><th class="px-3 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Variance</th><th class="px-3 py-3 text-right text-[10px] font-semibold text-orange-400 uppercase">Value</th><th class="px-3 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th><th class="px-3 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Actions</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
        if (!unref(rows).length) {
          _push(`<tr><td colspan="12" class="px-4 py-10 text-center text-gray-600">No GRNs found.</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(rows), (g) => {
          var _a2;
          _push(`<tr class="hover:bg-white/[0.02] transition-colors"><td class="px-3 py-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/grn/${g.id}`,
            class: "font-mono text-gold-400/80 font-semibold hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(g.grn_number)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(g.grn_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-3 py-3 text-gray-400 whitespace-nowrap">${ssrInterpolate(fmtDate(g.grn_date))}</td><td class="px-3 py-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/orders/${g.purchase_order_id}`,
            class: "font-mono text-indigo-400/80 hover:underline text-[11px]"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(g.po_number)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(g.po_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-3 py-3 text-gray-300 max-w-[140px] truncate">${ssrInterpolate(g.supplier_name)}</td><td class="px-3 py-3">`);
          if (g.wheat_origin) {
            _push(`<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">${ssrInterpolate(g.wheat_origin)}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="px-3 py-3 text-gray-400 font-mono">${ssrInterpolate(g.truck_number || "\u2014")}</td><td class="px-3 py-3 text-right font-mono text-purple-400">${ssrInterpolate(Number((_a2 = g.expected_quantity) != null ? _a2 : 0).toLocaleString())}</td><td class="px-3 py-3 text-right font-mono text-emerald-400 font-semibold">${ssrInterpolate(Number(g.quantity_received_kg).toLocaleString())}</td><td class="px-3 py-3 text-right font-mono">`);
          if (Number(g.expected_quantity) > 0) {
            _push(`<!--[--><span class="${ssrRenderClass(varianceColor(g))}">${ssrInterpolate(varianceSign(g))}${ssrInterpolate(varianceKg(g).toLocaleString())}</span><br><span class="${ssrRenderClass([varianceColor(g), "text-[10px]"])}">(${ssrInterpolate(varianceSign(g))}${ssrInterpolate(Math.abs(variancePct(g)).toFixed(1))}%)</span><!--]-->`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="px-3 py-3 text-right font-mono font-semibold text-gray-200">\u09F3${ssrInterpolate(Number(g.total_value).toLocaleString())}</td><td class="px-3 py-3 text-center">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: g.grn_status
          }, null, _parent));
          _push(`</td><td class="px-3 py-3 text-center"><div class="flex items-center justify-center gap-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/grn/${g.id}`,
            class: "text-blue-400 hover:text-blue-300 text-xs",
            title: "View"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F441}`);
              } else {
                return [
                  createTextVNode("\u{1F441}")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/grn/${g.id}/print`,
            target: "_blank",
            class: "text-gray-400 hover:text-gray-300 text-xs",
            title: "Print"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F5A8}`);
              } else {
                return [
                  createTextVNode("\u{1F5A8}")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (g.grn_status !== "cancelled") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/purchase/grn/${g.id}/edit`,
              class: "text-orange-400 hover:text-orange-300 text-xs",
              title: "Edit"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u270F`);
                } else {
                  return [
                    createTextVNode("\u270F")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (g.grn_status !== "cancelled" && unref(isSuperadmin)) {
            _push(`<button class="text-red-500 hover:text-red-400 text-xs" title="Delete (Superadmin only)">\u{1F5D1}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]--></tbody>`);
        if (unref(rows).length) {
          _push(`<tfoot class="border-t-2 border-white/[0.12] bg-white/[0.02] font-bold"><tr><td colspan="6" class="px-3 py-3 text-xs text-gray-500 uppercase tracking-wider"> Filtered Totals (${ssrInterpolate((_m = unref(stats).total_grns) != null ? _m : 0)} GRNs, all pages) </td><td class="px-3 py-3 text-right font-mono text-purple-400">${ssrInterpolate(Number((_n = unref(stats).total_expected_qty) != null ? _n : 0).toLocaleString())}</td><td class="px-3 py-3 text-right font-mono text-emerald-400">${ssrInterpolate(Number((_o = unref(stats).total_received_qty) != null ? _o : 0).toLocaleString())}</td><td class="${ssrRenderClass([Number((_p = unref(stats).total_variance_qty) != null ? _p : 0) < 0 ? "text-red-400" : "text-emerald-400", "px-3 py-3 text-right font-mono"])}">${ssrInterpolate(Number((_q = unref(stats).total_variance_qty) != null ? _q : 0) > 0 ? "+" : "")}${ssrInterpolate(Number((_r = unref(stats).total_variance_qty) != null ? _r : 0).toLocaleString())}</td><td class="px-3 py-3 text-right font-mono text-orange-400">\u09F3${ssrInterpolate(Number((_s = unref(stats).total_value) != null ? _s : 0).toLocaleString())}</td><td colspan="2"></td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(totalPages) > 1) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Showing ${ssrInterpolate((unref(page) - 1) * unref(perPage) + 1)}\u2013${ssrInterpolate(Math.min(unref(page) * unref(perPage), (_u = (_t = unref(data)) == null ? void 0 : _t.total) != null ? _u : 0))} of ${ssrInterpolate((_w = (_v = unref(data)) == null ? void 0 : _v.total) != null ? _w : 0)}</span><div class="flex items-center gap-1"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">\xAB</button><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">\u2039 Prev</button><!--[-->`);
        ssrRenderList(unref(pageRange), (p) => {
          _push(`<button class="${ssrRenderClass([p === unref(page) ? "bg-gold-500/20 text-gold-400 border-gold-500/30" : "", "btn-ghost text-xs py-1 px-2.5"])}">${ssrInterpolate(p)}</button>`);
        });
        _push(`<!--]--><button${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">Next \u203A</button><button${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">\xBB</button></div><div class="flex items-center gap-2"> Go to: <input${ssrRenderAttr("value", unref(jumpPage))} type="number"${ssrRenderAttr("min", 1)}${ssrRenderAttr("max", unref(totalPages))} class="field-input text-xs py-1 w-14 text-center"><span>of ${ssrInterpolate(unref(totalPages))}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(deleteModal).show) {
        _push(`<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div class="glass-card p-6 max-w-md w-full mx-4 space-y-4"><h3 class="text-base font-bold text-gray-200 flex items-center gap-2"> \u26A0 Delete GRN <span class="text-red-400 font-mono">${ssrInterpolate((_x = unref(deleteModal).grn) == null ? void 0 : _x.grn_number)}</span></h3><p class="text-xs text-gray-400">This will cancel the GRN and recalculate PO totals. This action cannot be undone.</p><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase">Reason <span class="text-red-500">*</span></label><textarea rows="3" class="field-input text-xs resize-none w-full" placeholder="Please provide a reason for deleting this GRN\u2026">${ssrInterpolate(unref(deleteModal).reason)}</textarea></div><div class="flex justify-end gap-3"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(!unref(deleteModal).reason.trim() || unref(deleteModal).loading) ? " disabled" : ""} class="px-4 py-2 rounded-xl bg-red-600/80 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50">${ssrInterpolate(unref(deleteModal).loading ? "Deleting\u2026" : "\u{1F5D1} Delete GRN")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C9z8pyl7.mjs.map

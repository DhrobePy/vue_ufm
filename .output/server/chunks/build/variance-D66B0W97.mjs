import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, ref, withAsyncContext, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
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
  __name: "variance",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { user: sessionUser } = useUserSession();
    computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const search = ref("");
    const typeFilter = ref("");
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/grn/variance",
      "$bLH8SgO8sK"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variances = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.variances) != null ? _b : [];
    });
    const filtered = computed(() => {
      let list = variances.value;
      if (typeFilter.value) list = list.filter((r) => r.variance_type === typeFilter.value);
      if (search.value) {
        const s = search.value.toLowerCase();
        list = list.filter(
          (r) => {
            var _a, _b, _c, _d;
            return ((_a = r.grn_number) != null ? _a : "").toLowerCase().includes(s) || ((_b = r.po_number) != null ? _b : "").toLowerCase().includes(s) || ((_c = r.supplier_name) != null ? _c : "").toLowerCase().includes(s) || ((_d = r.truck_number) != null ? _d : "").toLowerCase().includes(s);
          }
        );
      }
      return list;
    });
    const lossCount = computed(() => filtered.value.filter((r) => r.variance_type === "loss").length);
    const gainCount = computed(() => filtered.value.filter((r) => r.variance_type === "gain").length);
    const lossValue = computed(() => filtered.value.filter((r) => r.variance_type === "loss").reduce((s, r) => s + Math.abs(Number(r.variance_value)), 0));
    const gainValue = computed(() => filtered.value.filter((r) => r.variance_type === "gain").reduce((s, r) => s + Number(r.variance_value), 0));
    const netVariance = computed(() => gainValue.value - lossValue.value);
    function exportCsv() {
      const headers = ["GRN Date", "GRN #", "PO #", "Supplier", "Truck", "Ordered (kg)", "Received (kg)", "Variance (kg)", "Variance %", "Value Impact", "Type"];
      const rows = filtered.value.map((r) => {
        var _a;
        return [
          r.grn_date,
          r.grn_number,
          r.po_number,
          r.supplier_name,
          (_a = r.truck_number) != null ? _a : "",
          r.ordered_quantity,
          r.received_quantity,
          r.variance,
          Number(r.variance_percentage).toFixed(2),
          r.variance_value,
          r.variance_type
        ];
      });
      const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v != null ? v : "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = Object.assign((void 0).createElement("a"), { href: url, download: `variance-report-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    }
    function printReport() {
      (void 0).print();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Weight Variance Report",
        subtitle: "GRN vs ordered quantity analysis",
        breadcrumb: ["Purchase", "GRNs", "Variance Report"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u2193 Export CSV</button><button class="btn-ghost text-xs"${_scopeId}>\u{1F5A8} Print</button>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/grn",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All GRNs`);
                } else {
                  return [
                    createTextVNode("\u2190 All GRNs")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-ghost text-xs"
              }, "\u2193 Export CSV"),
              createVNode("button", {
                onClick: printReport,
                class: "btn-ghost text-xs"
              }, "\u{1F5A8} Print"),
              createVNode(_component_NuxtLink, {
                to: "/purchase/grn",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All GRNs")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-gray-200">${ssrInterpolate(unref(variances).length)}</p><p class="text-xs text-gray-500">Total Variances</p></div><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-red-400">${ssrInterpolate(unref(lossCount))}</p><p class="text-xs text-gray-500">Losses</p><p class="text-[11px] text-red-400/70">\u09F3${ssrInterpolate(unref(lossValue).toLocaleString())}</p></div><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate(unref(gainCount))}</p><p class="text-xs text-gray-500">Gains</p><p class="text-[11px] text-emerald-400/70">\u09F3${ssrInterpolate(unref(gainValue).toLocaleString())}</p></div><div class="glass-card p-5 text-center space-y-1"><p class="${ssrRenderClass([unref(netVariance) >= 0 ? "text-emerald-400" : "text-red-400", "text-2xl font-bold"])}">${ssrInterpolate(unref(netVariance) >= 0 ? "+" : "")}\u09F3${ssrInterpolate(Math.abs(unref(netVariance)).toLocaleString())}</p><p class="text-xs text-gray-500">Net Variance</p><p class="${ssrRenderClass([unref(netVariance) >= 0 ? "text-emerald-400/70" : "text-red-400/70", "text-[11px]"])}">${ssrInterpolate(unref(netVariance) >= 0 ? "Gain" : "Loss")}</p></div></div><div class="glass-card p-4 flex flex-wrap gap-3 items-center"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search PO #, supplier, GRN\u2026"><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "") : ssrLooseEqual(unref(typeFilter), "")) ? " selected" : ""}>All Types</option><option value="loss"${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "loss") : ssrLooseEqual(unref(typeFilter), "loss")) ? " selected" : ""}>Loss</option><option value="gain"${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "gain") : ssrLooseEqual(unref(typeFilter), "gain")) ? " selected" : ""}>Gain</option><option value="normal"${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "normal") : ssrLooseEqual(unref(typeFilter), "normal")) ? " selected" : ""}>Normal</option></select><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto text-xs text-gray-500">${ssrInterpolate(unref(filtered).length)} records</div></div><div class="glass-card overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full divide-y divide-white/[0.06] text-xs"><thead><tr class="text-gray-500 uppercase text-[10px] tracking-wider"><th class="px-4 py-3 text-left">GRN Date</th><th class="px-4 py-3 text-left">GRN #</th><th class="px-4 py-3 text-left">PO #</th><th class="px-4 py-3 text-left">Supplier</th><th class="px-4 py-3 text-left">Truck</th><th class="px-4 py-3 text-right">Ordered (kg)</th><th class="px-4 py-3 text-right">Received (kg)</th><th class="px-4 py-3 text-right">Variance (kg)</th><th class="px-4 py-3 text-center">Variance %</th><th class="px-4 py-3 text-right">Value Impact</th><th class="px-4 py-3 text-center">Type</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
        if (!unref(filtered).length) {
          _push(`<tr><td colspan="11" class="px-4 py-8 text-center text-gray-500">No variances found</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filtered), (row) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="px-4 py-3 text-gray-400">${ssrInterpolate(row.grn_date)}</td><td class="px-4 py-3 font-mono text-gold-400/80">${ssrInterpolate(row.grn_number)}</td><td class="px-4 py-3 text-gray-300">${ssrInterpolate(row.po_number)}</td><td class="px-4 py-3 text-gray-300">${ssrInterpolate(row.supplier_name)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(row.truck_number || "\u2014")}</td><td class="px-4 py-3 text-right font-mono text-gray-300">${ssrInterpolate(Number(row.ordered_quantity).toLocaleString())}</td><td class="px-4 py-3 text-right font-mono text-gray-300">${ssrInterpolate(Number(row.received_quantity).toLocaleString())}</td><td class="${ssrRenderClass([Number(row.variance) >= 0 ? "text-emerald-400" : "text-red-400", "px-4 py-3 text-right font-mono"])}">${ssrInterpolate(Number(row.variance) > 0 ? "+" : "")}${ssrInterpolate(Number(row.variance).toLocaleString())}</td><td class="px-4 py-3 text-center"><span class="${ssrRenderClass([Math.abs(Number(row.variance_percentage)) > 1 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400", "px-2 py-0.5 rounded text-[10px] font-medium"])}">${ssrInterpolate(Number(row.variance_percentage) > 0 ? "+" : "")}${ssrInterpolate(Number(row.variance_percentage).toFixed(2))}% </span></td><td class="${ssrRenderClass([Number(row.variance_value) >= 0 ? "text-emerald-400" : "text-red-400", "px-4 py-3 text-right font-mono"])}">${ssrInterpolate(Number(row.variance_value) >= 0 ? "+" : "")}\u09F3${ssrInterpolate(Math.abs(Number(row.variance_value)).toLocaleString())}</td><td class="px-4 py-3 text-center"><span class="${ssrRenderClass([{
            "bg-red-500/20 text-red-400": row.variance_type === "loss",
            "bg-emerald-500/20 text-emerald-400": row.variance_type === "gain",
            "bg-gray-500/20 text-gray-400": row.variance_type === "normal"
          }, "px-2 py-0.5 rounded text-[10px] font-semibold"])}">${ssrInterpolate(row.variance_type.charAt(0).toUpperCase() + row.variance_type.slice(1))}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/variance.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=variance-D66B0W97.mjs.map

import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './server.mjs';
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
  __name: "customer-reconciliation",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/customer-reconciliation",
      "$srrG4lMaVg"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n2 = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const busy = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Customer Balance Reconciliation",
        subtitle: "Stored customer balances that differ from what their ledger adds up to",
        breadcrumb: ["Admin", "Reconciliation"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="glass-card p-4 text-xs text-gray-400"> Checked ${ssrInterpolate(unref(data).checked)} customers \xB7 <strong class="${ssrRenderClass(unref(data).mismatches.length ? "text-amber-400" : "text-emerald-400")}">${ssrInterpolate(unref(data).mismatches.length ? unref(data).mismatches.length + " out of step" : "all balances match their ledgers")}</strong>. The ledger is the truth; \u201CReconcile\u201D sets the stored balance to the ledger total and keeps a history you can undo. </div>`);
        if (unref(data).mismatches.length) {
          _push(`<div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-right">Stored \u09F3</th><th class="px-3 py-2 text-right">Ledger \u09F3</th><th class="px-3 py-2 text-right">Difference \u09F3</th><th class="px-3 py-2 text-right">Ledger lines</th><th class="px-3 py-2"></th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(data).mismatches, (m) => {
            _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/customers/${m.id}`,
              class: "text-gold-400 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(m.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(m.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            if (m.business_name) {
              _push(`<span class="text-gray-600"> \xB7 ${ssrInterpolate(m.business_name)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n2(m.stored))}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n2(m.ledger))}</td><td class="${ssrRenderClass([m.diff > 0 ? "text-red-400" : "text-amber-400", "px-3 py-2 text-right font-mono"])}">${ssrInterpolate(n2(m.diff))}</td><td class="px-3 py-2 text-right text-gray-500">${ssrInterpolate(m.line_count)}</td><td class="px-3 py-2 text-right"><button class="btn-gold text-[11px] px-3 py-1"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}>Reconcile</button></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card overflow-x-auto"><h3 class="section-title px-4 pt-4">History</h3><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">When</th><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-right">Was \u09F3</th><th class="px-3 py-2 text-right">Now \u09F3</th><th class="px-3 py-2 text-left">By</th><th class="px-3 py-2 text-left">Status</th><th class="px-3 py-2"></th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).history, (h) => {
          var _a;
          _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2 text-gray-500">${ssrInterpolate(String(h.reconciled_at).slice(0, 16))}</td><td class="px-3 py-2">${ssrInterpolate(h.customer)}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n2(h.old_balance))}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n2(h.new_balance))}</td><td class="px-3 py-2 text-gray-500">${ssrInterpolate((_a = h.reconciled_by) != null ? _a : "\u2014")}</td><td class="px-3 py-2"><span class="${ssrRenderClass(h.status === "active" ? "text-emerald-400" : "text-gray-500")}">${ssrInterpolate(h.status === "active" ? "applied" : "undone")}</span></td><td class="px-3 py-2 text-right">`);
          if (h.status === "active") {
            _push(`<button class="btn-ghost text-[11px] px-3 py-1"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}>Undo</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(data).history.length) {
          _push(`<tr><td colspan="7" class="px-3 py-6 text-center text-gray-600">No reconciliations yet</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/customer-reconciliation.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=customer-reconciliation-DS8aqlU8.mjs.map

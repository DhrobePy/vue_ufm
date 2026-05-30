import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, ref, unref, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = Number(route.params.id);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/fleet/purchases/${id}`,
      "$vultLbBTjq"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const po = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.purchase) != null ? _b : null;
    });
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const outstanding = computed(
      () => {
        var _a, _b;
        return Number(((_a = po.value) == null ? void 0 : _a.total_amount) || 0) - Number(((_b = po.value) == null ? void 0 : _b.paid_amount) || 0);
      }
    );
    const paymentAmt = ref("");
    const payLoading = ref(false);
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      if (unref(po)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(po).po_number,
          subtitle: `${unref(po).supplier_name || "No supplier"} \xB7 ${unref(po).purchase_date}`,
          breadcrumb: ["Fleet", "Purchases", unref(po).po_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, {
                status: unref(po).status
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, {
                  status: unref(po).status
                }, null, 8, ["status"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex gap-2 flex-wrap">`);
        if (unref(po).status === "pending") {
          _push(`<button class="btn-gold text-xs">\u2713 Approve</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(po).status === "approved") {
          _push(`<button class="btn-secondary text-xs border-emerald-500/30 text-emerald-400">\u{1F4E6} Mark Received</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(po).status !== "cancelled" && unref(po).status !== "received") {
          _push(`<button class="btn-secondary text-xs border-red-500/30 text-red-400">\u2715 Cancel</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-5"><h3 class="section-title mb-4">Purchase Items</h3><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">#</th><th class="pb-2 text-left text-gray-500">Item</th><th class="pb-2 text-right text-gray-500">Qty</th><th class="pb-2 text-right text-gray-500">Rate \u09F3</th><th class="pb-2 text-right text-gray-500">Amount \u09F3</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(items), (item, i) => {
          _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-600">${ssrInterpolate(i + 1)}</td><td class="py-2"><p class="text-gray-200 font-medium">${ssrInterpolate(item.item_name)}</p>`);
          if (item.item_code) {
            _push(`<p class="text-gray-600 font-mono text-[10px]">${ssrInterpolate(item.item_code)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-2 text-right text-gray-300">${ssrInterpolate(Number(item.quantity).toFixed(2))}</td><td class="py-2 text-right text-gray-400">\u09F3${ssrInterpolate(Number(item.unit_rate || 0).toFixed(2))}</td><td class="py-2 text-right font-medium text-gray-200">\u09F3${ssrInterpolate(Number(item.amount || 0).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.07]"><td colspan="4" class="pt-3 text-right text-gray-500 font-medium">Total</td><td class="pt-3 text-right font-bold text-gold-400">\u09F3${ssrInterpolate(fmt(unref(po).total_amount))}</td></tr></tfoot></table></div>`);
        if (unref(po).notes) {
          _push(`<div class="glass-card p-5"><h3 class="section-title mb-2">Notes</h3><p class="text-sm text-gray-400">${ssrInterpolate(unref(po).notes)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-4"><div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Summary</h4><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Total Amount</span><span class="font-medium text-gray-200">\u09F3${ssrInterpolate(fmt(unref(po).total_amount))}</span></div><div class="flex justify-between"><span class="text-gray-500">Paid</span><span class="text-emerald-400 font-medium">\u09F3${ssrInterpolate(fmt(unref(po).paid_amount))}</span></div><div class="flex justify-between border-t border-white/[0.06] pt-2"><span class="font-semibold text-gray-300">Outstanding</span><span class="${ssrRenderClass([unref(outstanding) > 0 ? "text-red-400" : "text-emerald-400", "font-bold"])}"> \u09F3${ssrInterpolate(fmt(unref(outstanding)))}</span></div></div></div>`);
        if (unref(po).status !== "cancelled") {
          _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Record Payment</h4><form class="space-y-3"><div><label class="form-label">Amount Paid \u09F3</label><input${ssrRenderAttr("value", unref(paymentAmt))} type="number" step="0.01" class="form-input" placeholder="0.00" required></div><button type="submit" class="btn-gold text-xs w-full"${ssrIncludeBooleanAttr(unref(payLoading)) ? " disabled" : ""}>${ssrInterpolate(unref(payLoading) ? "Saving\u2026" : "Record Payment")}</button></form></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supplier</h4><p class="text-sm text-gray-200">${ssrInterpolate(unref(po).supplier_name || "\u2014")}</p></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/purchases/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DNkFyrIB.mjs.map

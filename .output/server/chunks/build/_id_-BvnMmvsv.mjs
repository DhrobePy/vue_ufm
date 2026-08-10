import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
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
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const orderId = computed(() => Number(route.params.id));
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/pos/${orderId.value}`,
      "$oMSHqKOjRW"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.order) != null ? _b : null;
    });
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const jeLines = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.je_lines) != null ? _b : [];
    });
    const detailRows = computed(() => {
      var _a, _b;
      return order.value ? [
        ["Customer", (_a = order.value.customer_name) != null ? _a : "Walk-in"],
        ["Branch", (_b = order.value.branch_name) != null ? _b : "\u2014"],
        ["Date", String(order.value.order_date).slice(0, 16).replace("T", " ")],
        ["Subtotal", `\u09F3${Number(order.value.subtotal).toLocaleString()}`],
        ["Discount", `\u09F3${Number(order.value.discount_amount).toLocaleString()}`],
        ["Total", `\u09F3${Number(order.value.total_amount).toLocaleString()}`],
        ["Paid Now", `\u09F3${Number(order.value.cash_amount).toLocaleString()} (${order.value.payment_method})`],
        ["On Credit", `\u09F3${Number(order.value.credit_amount).toLocaleString()}`],
        ["Status", order.value.payment_status],
        ["Exit", order.value.exit_status === "cleared" ? `Cleared${order.value.cleared_by_name ? ` (${order.value.cleared_by_name})` : ""}` : "Pending Approval"]
      ] : [];
    });
    const showEdit = ref(false);
    const editing = ref(false);
    const editItems = ref([]);
    const editCash = ref(0);
    const editReason = ref("");
    watch([order, items], ([o, its]) => {
      if (!o || !its.length) return;
      editItems.value = its.map((it) => ({ item_id: it.id, quantity: Number(it.quantity), unit_price: Number(it.unit_price) }));
      editCash.value = Number(o.cash_amount);
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: (_b = (_a = unref(order)) == null ? void 0 : _a.order_number) != null ? _b : "POS Sale",
        subtitle: unref(order) ? `${(_c = unref(order).customer_name) != null ? _c : "Walk-in"} \xB7 ${unref(order).branch_name}` : "",
        breadcrumb: ["POS", "Sales", (_e = (_d = unref(order)) == null ? void 0 : _d.order_number) != null ? _e : "\u2026"]
      }, null, _parent));
      if (unref(order)) {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="glass-card p-5 space-y-2 text-xs"><h3 class="section-title mb-2">Details</h3><!--[-->`);
        ssrRenderList(unref(detailRows), (row) => {
          _push(`<div class="flex justify-between py-1 border-b border-white/[0.03]"><span class="text-gray-500">${ssrInterpolate(row[0])}</span><span class="text-gray-200 font-medium">${ssrInterpolate(row[1])}</span></div>`);
        });
        _push(`<!--]--><div class="flex gap-2 pt-3">`);
        if (unref(isAdminUser)) {
          _push(`<button class="btn-ghost text-xs">\u270F\uFE0F Correct</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isAdminUser)) {
          _push(`<button class="btn-ghost text-xs text-red-400">\u{1F5D1} Delete</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).credit_amount > 0) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pos/exit/${unref(order).id}`,
            class: "btn-ghost text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F6AA} Exit Status`);
              } else {
                return [
                  createTextVNode("\u{1F6AA} Exit Status")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="glass-card p-5 space-y-2 text-xs"><h3 class="section-title mb-2">Items</h3><!--[-->`);
        ssrRenderList(unref(items), (it) => {
          _push(`<div class="flex justify-between py-1 border-b border-white/[0.03]"><span class="text-gray-300">${ssrInterpolate(it.base_name)} ${ssrInterpolate(it.weight_variant)} \xD7 ${ssrInterpolate(it.quantity)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(it.total_amount).toLocaleString())}</span></div>`);
        });
        _push(`<!--]-->`);
        if (unref(jeLines).length) {
          _push(`<div class="pt-2"><p class="text-[10px] text-gray-600 uppercase font-semibold mb-1">Journal Entry</p><!--[-->`);
          ssrRenderList(unref(jeLines), (l, i) => {
            _push(`<div class="flex justify-between py-0.5 font-mono text-[11px]"><span class="text-gray-400">${ssrInterpolate(l.account_name)}</span><span class="text-gray-300">${ssrInterpolate(Number(l.debit_amount) > 0 ? `Dr \u09F3${Number(l.debit_amount).toLocaleString()}` : `Cr \u09F3${Number(l.credit_amount).toLocaleString()}`)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showEdit) && unref(order)) {
        _push(`<div class="glass-card p-5 space-y-3 border border-amber-500/20"><h3 class="section-title">Correct This Sale</h3><p class="text-[11px] text-gray-600">Quantity/price only \u2014 to change products, delete and re-ring the sale.</p><!--[-->`);
        ssrRenderList(unref(editItems), (it, i) => {
          var _a2, _b2;
          _push(`<div class="grid grid-cols-3 gap-2 items-end"><span class="text-xs text-gray-400 col-span-1">${ssrInterpolate((_a2 = unref(items)[i]) == null ? void 0 : _a2.base_name)} ${ssrInterpolate((_b2 = unref(items)[i]) == null ? void 0 : _b2.weight_variant)}</span><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Qty</label><input${ssrRenderAttr("value", it.quantity)} type="number" min="1" class="input-glass text-xs font-mono"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Unit Price</label><input${ssrRenderAttr("value", it.unit_price)} type="number" min="0" step="any" class="input-glass text-xs font-mono"></div></div>`);
        });
        _push(`<!--]--><div class="grid grid-cols-2 gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Cash Paid</label><input${ssrRenderAttr("value", unref(editCash))} type="number" min="0" step="any" class="input-glass text-xs font-mono"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Reason *</label><input${ssrRenderAttr("value", unref(editReason))} class="input-glass text-xs" placeholder="Why is this correction needed\u2026"></div></div><div class="flex justify-end gap-2"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(!unref(editReason).trim() || unref(editing)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(editing) ? "Applying\u2026" : "Save Correction")}</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BvnMmvsv.mjs.map

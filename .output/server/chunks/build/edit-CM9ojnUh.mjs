import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, reactive, watch, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
import 'googleapis';
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
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const customerId = Number(route.params.id);
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/customers/${customerId}`,
      "$Ar5eUK1wUj"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const customer = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.customer) != null ? _b : {};
    });
    const form = reactive({
      name: "",
      business: "",
      phone: "",
      address: "",
      status: "active",
      type: "Credit",
      creditLimit: 0,
      paymentTerms: 30,
      overdueLimit: 5e5,
      blockOnOverdue: true
    });
    watch(customer, (c) => {
      var _a, _b, _c, _d, _e, _f, _g;
      if (c == null ? void 0 : c.id) {
        form.name = (_a = c.name) != null ? _a : "";
        form.business = (_b = c.business_name) != null ? _b : "";
        form.phone = (_c = c.phone_number) != null ? _c : "";
        form.address = (_d = c.business_address) != null ? _d : "";
        form.status = (_e = c.status) != null ? _e : "active";
        form.type = (_f = c.customer_type) != null ? _f : "Credit";
        form.creditLimit = Number((_g = c.credit_limit) != null ? _g : 0);
      }
    }, { immediate: true });
    const saving = ref(false);
    const isValid = computed(() => form.name && form.phone && (form.type !== "Credit" || form.creditLimit >= 0));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit Customer \u2014 ${(_b = (_a = unref(customer)) == null ? void 0 : _a.name) != null ? _b : "\u2026"}`,
        breadcrumb: ["Customers", (_d = (_c = unref(customer)) == null ? void 0 : _c.name) != null ? _d : "\u2026", "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/customers/${unref(route).params.id}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back to Profile`);
                } else {
                  return [
                    createTextVNode("\u2190 Back to Profile")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/customers/${unref(route).params.id}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back to Profile")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Basic Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer Name *</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business / Trade Name</label><input${ssrRenderAttr("value", unref(form).business)} type="text" class="input-glass" placeholder="e.g. Rahim Traders Ltd."></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone *</label><input${ssrRenderAttr("value", unref(form).phone)} type="tel" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label><select class="input-glass"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option><option value="blacklisted"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "blacklisted") : ssrLooseEqual(unref(form).status, "blacklisted")) ? " selected" : ""}>Blacklisted</option></select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Address</label><textarea rows="3" class="input-glass resize-none">${ssrInterpolate(unref(form).address)}</textarea></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Customer Type</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><button class="${ssrRenderClass([
        "rounded-xl border p-4 text-left transition-all",
        unref(form).type === "Credit" ? "bg-gold-500/10 border-gold-500/40" : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
      ])}"><p class="${ssrRenderClass(["text-sm font-semibold", unref(form).type === "Credit" ? "text-gold-300" : "text-gray-300"])}">Credit Customer</p><p class="text-xs text-gray-500 mt-1">Buys on credit with payment terms</p></button><button class="${ssrRenderClass([
        "rounded-xl border p-4 text-left transition-all",
        unref(form).type === "POS" ? "bg-blue-500/10 border-blue-500/40" : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
      ])}"><p class="${ssrRenderClass(["text-sm font-semibold", unref(form).type === "POS" ? "text-blue-300" : "text-gray-300"])}">POS Customer</p><p class="text-xs text-gray-500 mt-1">Walk-in counter sales</p></button></div></div>`);
      if (unref(form).type === "Credit") {
        _push(`<div class="glass-card p-6 space-y-4"><h3 class="section-title">Credit Terms</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Limit (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).creditLimit)} type="number" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Terms (days)</label><input${ssrRenderAttr("value", unref(form).paymentTerms)} type="number" min="7" max="90" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue Limit (\u09F3)</label><input${ssrRenderAttr("value", unref(form).overdueLimit)} type="number" class="input-glass font-mono"></div></div><div class="flex items-center gap-3"><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).blockOnOverdue) ? ssrLooseContain(unref(form).blockOnOverdue, null) : unref(form).blockOnOverdue) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label><span class="text-sm text-gray-300">Block new orders when overdue</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/customers/${unref(route).params.id}`,
        class: "btn-ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Current Summary</h3><div class="space-y-2.5 text-xs"><div class="flex justify-between"><span class="text-gray-600">Type</span>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, {
        status: (_f = (_e = unref(customer)) == null ? void 0 : _e.customer_type) != null ? _f : "\u2014"
      }, null, _parent));
      _push(`</div><div class="flex justify-between"><span class="text-gray-600">Status</span>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, {
        status: (_h = (_g = unref(customer)) == null ? void 0 : _g.status) != null ? _h : "active"
      }, null, _parent));
      _push(`</div><div class="flex justify-between"><span class="text-gray-600">Outstanding</span><span class="font-bold text-red-400">\u09F3${ssrInterpolate(Number((_j = (_i = unref(customer)) == null ? void 0 : _i.current_balance) != null ? _j : 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Credit Limit</span><span class="text-gray-300">\u09F3${ssrInterpolate(Number((_l = (_k = unref(customer)) == null ? void 0 : _k.credit_limit) != null ? _l : 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Since</span><span class="text-gray-400">${ssrInterpolate((_o = (_n = (_m = unref(customer)) == null ? void 0 : _m.created_at) == null ? void 0 : _n.slice(0, 10)) != null ? _o : "\u2014")}</span></div></div><div class="pt-3 border-t border-white/[0.06]"><h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</h4><div class="space-y-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/customers/${unref(route).params.id}`,
        class: "btn-ghost text-xs w-full justify-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View Profile`);
          } else {
            return [
              createTextVNode("View Profile")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/customers/${unref(route).params.id}/index#ledger`,
        class: "btn-ghost text-xs w-full justify-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View Ledger`);
          } else {
            return [
              createTextVNode("View Ledger")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/customers/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-CM9ojnUh.mjs.map

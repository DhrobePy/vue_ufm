import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderAttr, ssrInterpolate, ssrLooseContain } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  setup(__props) {
    const customerTypes = [
      {
        value: "Credit",
        label: "Credit Customer",
        icon: "\u{1F4CB}",
        desc: "Receives goods on credit with a set limit and payment terms. Tracked via ledger."
      },
      {
        value: "POS",
        label: "POS Customer",
        icon: "\u{1F5A5}\uFE0F",
        desc: "Walk-in / counter sale customer. Payment collected at point of sale."
      }
    ];
    useToast();
    const submitting = ref(false);
    const form = reactive({
      type: "Credit",
      name: "",
      business: "",
      phone: "",
      phone2: "",
      email: "",
      nid: "",
      address: "",
      city: "",
      creditLimit: 0,
      paymentTerms: "30",
      initialDue: 0,
      area: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Add Customer",
        breadcrumb: ["Customers", "Add Customer"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/customers",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Cancel`);
                } else {
                  return [
                    createTextVNode("\u2190 Cancel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/customers",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Cancel")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="space-y-6"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Customer Type</h3><div class="grid grid-cols-2 gap-3"><!--[-->`);
      ssrRenderList(customerTypes, (t) => {
        _push(`<label class="${ssrRenderClass([
          "flex flex-col gap-1.5 p-4 rounded-xl border cursor-pointer transition-all duration-150",
          unref(form).type === t.value ? "border-gold-500/40 bg-gold-500/08" : "border-white/[0.08] hover:border-white/[0.14]"
        ])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(form).type, t.value)) ? " checked" : ""}${ssrRenderAttr("value", t.value)} class="sr-only"><div class="flex items-center gap-2"><span class="text-lg">${ssrInterpolate(t.icon)}</span><span class="${ssrRenderClass(["font-semibold text-sm", unref(form).type === t.value ? "text-gold-400" : "text-gray-300"])}">${ssrInterpolate(t.label)}</span></div><p class="text-xs text-gray-600 leading-relaxed">${ssrInterpolate(t.desc)}</p></label>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-6 space-y-5"><h3 class="section-title">Customer Information</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name *</label><input${ssrRenderAttr("value", unref(form).name)} class="input-glass" placeholder="Customer or business name" required></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Name</label><input${ssrRenderAttr("value", unref(form).business)} class="input-glass" placeholder="Trading / company name"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone *</label><input${ssrRenderAttr("value", unref(form).phone)} class="input-glass" placeholder="+880\u2026" required></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secondary Phone</label><input${ssrRenderAttr("value", unref(form).phone2)} class="input-glass" placeholder="+880\u2026"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="input-glass" placeholder="email@example.com"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">NID / Trade Licence</label><input${ssrRenderAttr("value", unref(form).nid)} class="input-glass" placeholder="National ID or licence number"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label><input${ssrRenderAttr("value", unref(form).city)} class="input-glass" placeholder="e.g. Sirajgonj"></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Address *</label><textarea rows="2" class="input-glass resize-none" placeholder="Full address\u2026" required>${ssrInterpolate(unref(form).address)}</textarea></div></div></div>`);
      if (unref(form).type === "Credit") {
        _push(`<div class="glass-card p-6 space-y-4"><h3 class="section-title">Credit Terms</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Limit (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).creditLimit)} type="number" min="0" step="10000" class="input-glass" placeholder="e.g. 500000"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Terms (days)</label><select class="input-glass"><option value="7"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "7") : ssrLooseEqual(unref(form).paymentTerms, "7")) ? " selected" : ""}>7 days</option><option value="15"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "15") : ssrLooseEqual(unref(form).paymentTerms, "15")) ? " selected" : ""}>15 days</option><option value="30"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "30") : ssrLooseEqual(unref(form).paymentTerms, "30")) ? " selected" : ""}>30 days</option><option value="45"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "45") : ssrLooseEqual(unref(form).paymentTerms, "45")) ? " selected" : ""}>45 days</option><option value="60"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "60") : ssrLooseEqual(unref(form).paymentTerms, "60")) ? " selected" : ""}>60 days</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Balance (\u09F3)</label><input${ssrRenderAttr("value", unref(form).initialDue)} type="number" min="0" class="input-glass" placeholder="0"><p class="text-[11px] text-gray-600">Existing outstanding balance from before system entry</p></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area / Route</label><input${ssrRenderAttr("value", unref(form).area)} class="input-glass" placeholder="e.g. Sirajgonj Sadar"></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex justify-end gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/customers",
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
      _push(`<button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""}>`);
      if (unref(submitting)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(submitting) ? "Saving\u2026" : "Save Customer")}</button></div></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/customers/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-C6Mhp1tg.mjs.map

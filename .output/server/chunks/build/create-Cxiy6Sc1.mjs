import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderAttr, ssrInterpolate, ssrLooseContain, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { k as useRoute } from './server.mjs';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { error: toastError } = useToast();
    const route = useRoute();
    const editId = route.query.edit ? Number(route.query.edit) : null;
    const editMode = !!editId;
    const editTx = ref(null);
    const loadingEdit = ref(editMode);
    const { data: acctData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/dashboard",
      "$dl3DJfBj0h"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = acctData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const { data: typeData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/transaction-types",
      "$4k6Mt0HSEa"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const types = computed(() => {
      var _a, _b;
      return ((_b = (_a = typeData.value) == null ? void 0 : _a.types) != null ? _b : []).filter((t) => t.is_active);
    });
    const form = reactive({
      type: "credit",
      accountId: "",
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      amount: null,
      transactionTypeId: "",
      reference: "",
      cheque_number: "",
      payee_payer_name: "",
      description: "",
      notes: ""
    });
    if (editMode) {
      try {
        const res = ([__temp, __restore] = withAsyncContext(() => $fetch(`/api/bank/transactions/${editId}`)), __temp = await __temp, __restore(), __temp);
        editTx.value = res.transaction;
        const t = res.transaction;
        Object.assign(form, {
          type: t.entry_type,
          accountId: t.bank_tx_account_id,
          date: String(t.transaction_date).slice(0, 10),
          amount: Number(t.amount),
          transactionTypeId: t.transaction_type_id || "",
          reference: t.reference_number || "",
          cheque_number: t.cheque_number || "",
          payee_payer_name: t.payee_payer_name || "",
          description: t.description || "",
          notes: t.special_note || ""
        });
      } catch (e) {
        toastError("Failed to load transaction");
      } finally {
        loadingEdit.value = false;
      }
    }
    const saving = ref(false);
    const isValid = computed(
      () => form.accountId && form.date && form.amount && Number(form.amount) > 0 && form.description.trim() && form.transactionTypeId
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: editMode ? "Edit Transaction" : "New Bank Transaction",
        subtitle: editMode ? `Editing: ${(_a = unref(editTx)) == null ? void 0 : _a.transaction_number}` : "Transaction will be submitted for maker-checker approval",
        breadcrumb: ["Bank", editMode ? "Edit Transaction" : "New Transaction"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/bank",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back`);
                } else {
                  return [
                    createTextVNode("\u2190 Back")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/bank",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loadingEdit)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else {
        _push(`<div class="glass-card p-6 space-y-5">`);
        if (!editMode) {
          _push(`<div class="flex gap-3"><!--[-->`);
          ssrRenderList(["credit", "debit"], (t) => {
            _push(`<label class="${ssrRenderClass([
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all duration-150 text-sm font-semibold capitalize",
              unref(form).type === t ? "border-gold-500/40 bg-gold-500/10 text-gold-400" : "border-white/[0.08] text-gray-500 hover:border-white/[0.14]"
            ])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(form).type, t)) ? " checked" : ""}${ssrRenderAttr("value", t)} class="sr-only"><span class="${ssrRenderClass(["w-2 h-2 rounded-full", t === "credit" ? "bg-emerald-400" : "bg-red-400"])}"></span> ${ssrInterpolate(t === "credit" ? "Deposit (Credit)" : "Withdrawal (Debit)")}</label>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"><span class="${ssrRenderClass(["w-2.5 h-2.5 rounded-full", unref(form).type === "credit" ? "bg-emerald-400" : "bg-red-400"])}"></span><span class="text-sm font-semibold text-gray-300 capitalize">${ssrInterpolate(unref(form).type === "credit" ? "Deposit (Credit)" : "Withdrawal (Debit)")}</span></div>`);
        }
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account *</label><select class="field-input"${ssrIncludeBooleanAttr(editMode) ? " disabled" : ""}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).accountId) ? ssrLooseContain(unref(form).accountId, "") : ssrLooseEqual(unref(form).accountId, "")) ? " selected" : ""}>Select account\u2026</option><!--[-->`);
        ssrRenderList(unref(accounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).accountId) ? ssrLooseContain(unref(form).accountId, a.id) : ssrLooseEqual(unref(form).accountId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="field-input"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="1" class="field-input text-lg font-bold" placeholder="0.00"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Type *</label><select class="field-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).transactionTypeId) ? ssrLooseContain(unref(form).transactionTypeId, "") : ssrLooseEqual(unref(form).transactionTypeId, "")) ? " selected" : ""}>Select type\u2026</option><!--[-->`);
        ssrRenderList(unref(types), (t) => {
          _push(`<option${ssrRenderAttr("value", t.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).transactionTypeId) ? ssrLooseContain(unref(form).transactionTypeId, t.id) : ssrLooseEqual(unref(form).transactionTypeId, t.id)) ? " selected" : ""}>${ssrInterpolate(t.name)}</option>`);
        });
        _push(`<!--]--></select><p class="text-[11px] text-gray-600"> Determines which GL account this posts against when approved. `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/bank/accounts/types",
          class: "text-gold-500 hover:text-gold-400"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Manage types \u2192`);
            } else {
              return [
                createTextVNode("Manage types \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</p></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference No.</label><input${ssrRenderAttr("value", unref(form).reference)} class="field-input font-mono" placeholder="BEFTN / bKash TrxID"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cheque No.</label><input${ssrRenderAttr("value", unref(form).cheque_number)} class="field-input font-mono" placeholder="Leave blank if not a cheque"></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payee / Payer Name</label><input${ssrRenderAttr("value", unref(form).payee_payer_name)} class="field-input" placeholder="Who sent / received the funds"></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description *</label><textarea rows="2" class="field-input resize-none" placeholder="e.g. Customer payment \u2014 Rahim Traders">${ssrInterpolate(unref(form).description)}</textarea></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Note</label><textarea rows="2" class="field-input resize-none" placeholder="Internal remarks\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div>`);
        if (!editMode) {
          _push(`<div class="rounded-xl p-3.5" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.05)", "border": "1px solid rgba(245,158,11,0.12)" })}"><p class="text-xs text-gray-500">\u26A0 This transaction will be submitted for maker-checker approval before posting to the account balance.</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/bank",
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
        _push(`<button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : editMode ? "Save Changes" : "Submit Transaction")}</button></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/transaction/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-Cxiy6Sc1.mjs.map

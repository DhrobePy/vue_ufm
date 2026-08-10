import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, ref, withAsyncContext, reactive, mergeProps, unref, isRef, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import { c as _export_sfc, p as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
import './permRoutes-Ddy1yO1t.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ledger",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const { user } = useUserSession();
    useToast();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const selectedCustomerId = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const appliedCustomerId = ref("");
    const appliedFrom = ref("");
    const appliedTo = ref("");
    const queryParams = computed(() => ({
      customer_id: appliedCustomerId.value || void 0,
      date_from: appliedFrom.value || void 0,
      date_to: appliedTo.value || void 0
    }));
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/ledger",
      {
        query: queryParams
      },
      "$fKZE0Rs3Z4"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const ledger2 = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.ledger) != null ? _b : [];
    });
    const customerList = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.customers) != null ? _b : [];
    });
    const customerOptions = computed(() => customerList.value.map((c) => ({ value: String(c.id), label: c.name })));
    const totalDebit = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totalDebit) != null ? _b : 0;
    });
    const totalCredit = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totalCredit) != null ? _b : 0;
    });
    const balance = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.balance) != null ? _b : 0;
    });
    function fmtDate(v) {
      if (!v) return "\u2014";
      const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return String(v);
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    const selectedCustomerName = computed(() => {
      var _a, _b;
      return (_b = (_a = customerList.value.find((c) => String(c.id) === String(selectedCustomerId.value))) == null ? void 0 : _a.name) != null ? _b : "";
    });
    const adjustModal = ref(false);
    const adjusting = ref(false);
    const adjustForm = reactive({ direction: "debit", amount: null, reason: "" });
    const canSubmitAdjustment = computed(() => Number(adjustForm.amount) > 0 && adjustForm.reason.trim().length > 0);
    const cols = [
      { key: "date", label: "Date", sortable: true },
      { key: "type", label: "Type", sortable: true },
      { key: "ref", label: "Reference" },
      { key: "description", label: "Description" },
      { key: "debit", label: "Debit (\u09F3)" },
      { key: "credit", label: "Credit (\u09F3)" },
      { key: "balance", label: "Balance (\u09F3)", sortable: true },
      { key: "link", label: "View" }
    ];
    function linkFor(row) {
      switch (row.reference_type) {
        case "credit_order":
          return { href: `/credit-sales/${row.reference_id}`, label: "View Order" };
        case "customer_payment":
          return { href: `/credit-sales/receipt/${row.reference_id}`, label: "View Receipt" };
        case "payment_reversal":
          return { href: `/credit-sales/receipt/${row.reference_id}`, label: "View Original" };
        case "credit_order_return":
          return row.linked_order_id ? { href: `/credit-sales/${row.linked_order_id}`, label: "View Order" } : null;
        case "order_amendment":
          return row.linked_order_id ? { href: `/credit-sales/${row.linked_order_id}/amend`, label: "View Amendment" } : null;
        default:
          return null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-0a542eca>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Customer Ledger",
        subtitle: "Running debit \xB7 credit \xB7 balance per customer",
        breadcrumb: ["Credit Sales", "Customer Ledger"]
      }, null, _parent));
      _push(`<div class="flex gap-3 flex-wrap" data-v-0a542eca>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(selectedCustomerId),
        "onUpdate:modelValue": ($event) => isRef(selectedCustomerId) ? selectedCustomerId.value = $event : null,
        options: unref(customerOptions),
        placeholder: "All Customers",
        class: "w-64"
      }, null, _parent));
      _push(`<input type="date"${ssrRenderAttr("value", unref(dateFrom))} class="input-glass w-40" data-v-0a542eca><input type="date"${ssrRenderAttr("value", unref(dateTo))} class="input-glass w-40" data-v-0a542eca><button class="btn-ghost text-xs" data-v-0a542eca>Filter</button>`);
      if (unref(perms).canDo("credit_sales", "ledger", "export")) {
        _push(`<button class="btn-gold text-xs" data-v-0a542eca>Export</button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(isAdmin) && unref(selectedCustomerId)) {
        _push(`<button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors ml-auto" data-v-0a542eca> \u{1F4DD} Post Adjustment </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-0a542eca>Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-0a542eca>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-3 gap-4" data-v-0a542eca><div class="glass-card p-4 text-center" data-v-0a542eca><p class="text-xs text-gray-500 mb-1" data-v-0a542eca>Total Debit</p><p class="text-xl font-bold text-red-400" data-v-0a542eca>\u09F3${ssrInterpolate(Number(unref(totalDebit)).toLocaleString())}</p></div><div class="glass-card p-4 text-center" data-v-0a542eca><p class="text-xs text-gray-500 mb-1" data-v-0a542eca>Total Credit</p><p class="text-xl font-bold text-emerald-400" data-v-0a542eca>\u09F3${ssrInterpolate(Number(unref(totalCredit)).toLocaleString())}</p></div><div class="glass-card p-4 text-center" data-v-0a542eca><p class="text-xs text-gray-500 mb-1" data-v-0a542eca>Balance (Due)</p><p class="text-xl font-bold text-gold-400" data-v-0a542eca>\u09F3${ssrInterpolate(Number(unref(balance)).toLocaleString())}</p></div></div>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(ledger2),
          "per-page": 15,
          exportable: "",
          "search-placeholder": "Search transactions\u2026"
        }, {
          "cell-date": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-gray-300 text-xs whitespace-nowrap" data-v-0a542eca${_scopeId}>${ssrInterpolate(fmtDate(value))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-gray-300 text-xs whitespace-nowrap" }, toDisplayString(fmtDate(value)), 1)
              ];
            }
          }),
          "cell-debit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-red-400 font-mono text-xs" data-v-0a542eca${_scopeId}>${ssrInterpolate(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-red-400 font-mono text-xs" }, toDisplayString(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-credit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-emerald-400 font-mono text-xs" data-v-0a542eca${_scopeId}>${ssrInterpolate(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-emerald-400 font-mono text-xs" }, toDisplayString(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-balance": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-bold text-gold-400 font-mono text-xs" data-v-0a542eca${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-bold text-gold-400 font-mono text-xs" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-link": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (linkFor(row)) {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: linkFor(row).href,
                  class: "inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(linkFor(row).label)} <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-0a542eca${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" data-v-0a542eca${_scopeId2}></path></svg>`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(linkFor(row).label) + " ", 1),
                        (openBlock(), createBlock("svg", {
                          class: "w-3 h-3",
                          fill: "none",
                          stroke: "currentColor",
                          "stroke-width": "2",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            d: "M9 5l7 7-7 7"
                          })
                        ]))
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<span class="text-gray-700 text-xs" data-v-0a542eca${_scopeId}>\u2014</span>`);
              }
            } else {
              return [
                linkFor(row) ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 0,
                  to: linkFor(row).href,
                  class: "inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(linkFor(row).label) + " ", 1),
                    (openBlock(), createBlock("svg", {
                      class: "w-3 h-3",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        d: "M9 5l7 7-7 7"
                      })
                    ]))
                  ]),
                  _: 2
                }, 1032, ["to"])) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-gray-700 text-xs"
                }, "\u2014"))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(adjustModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-0a542eca><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-violet-500/20 p-6 space-y-4" data-v-0a542eca><div class="flex items-center justify-between" data-v-0a542eca><h3 class="text-lg font-bold text-gray-100" data-v-0a542eca>\u{1F4DD} Manual Ledger Adjustment</h3><button class="text-gray-500 hover:text-gray-200" data-v-0a542eca>\u2715</button></div><p class="text-xs text-gray-500" data-v-0a542eca> For <strong class="text-gray-300" data-v-0a542eca>${ssrInterpolate(unref(selectedCustomerName))}</strong>. Memo-level only \u2014 posts a ledger row and syncs the customer balance, but does <strong class="text-amber-400" data-v-0a542eca>not</strong> create a journal entry. Use for reconciliation, not routine transactions. </p><div class="grid grid-cols-2 gap-3" data-v-0a542eca><div class="space-y-1.5" data-v-0a542eca><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0a542eca>Direction</label><select class="input-glass" data-v-0a542eca><option value="debit" data-v-0a542eca${ssrIncludeBooleanAttr(Array.isArray(unref(adjustForm).direction) ? ssrLooseContain(unref(adjustForm).direction, "debit") : ssrLooseEqual(unref(adjustForm).direction, "debit")) ? " selected" : ""}>Debit (increases due)</option><option value="credit" data-v-0a542eca${ssrIncludeBooleanAttr(Array.isArray(unref(adjustForm).direction) ? ssrLooseContain(unref(adjustForm).direction, "credit") : ssrLooseEqual(unref(adjustForm).direction, "credit")) ? " selected" : ""}>Credit (reduces due)</option></select></div><div class="space-y-1.5" data-v-0a542eca><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0a542eca>Amount (\u09F3)</label><input${ssrRenderAttr("value", unref(adjustForm).amount)} type="number" min="0" step="1" class="input-glass font-mono" data-v-0a542eca></div></div><div class="space-y-1.5" data-v-0a542eca><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0a542eca>Reason *</label><textarea rows="2" class="input-glass resize-none" placeholder="Required \u2014 why is this adjustment needed?" data-v-0a542eca>${ssrInterpolate(unref(adjustForm).reason)}</textarea></div><div class="flex gap-3 pt-2" data-v-0a542eca><button${ssrIncludeBooleanAttr(!unref(canSubmitAdjustment) || unref(adjusting)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-0a542eca>${ssrInterpolate(unref(adjusting) ? "Posting\u2026" : "Post Adjustment")}</button><button class="btn-ghost text-xs" data-v-0a542eca>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/ledger.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ledger = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0a542eca"]]);

export { ledger as default };
//# sourceMappingURL=ledger-DhxWLVfF.mjs.map

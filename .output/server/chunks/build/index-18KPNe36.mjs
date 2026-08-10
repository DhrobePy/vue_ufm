import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, computed, withAsyncContext, watch, reactive, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession, n as navigateTo } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
    const route = useRoute();
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const saleId = computed(() => Number(route.params.id));
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/trading/sales/${saleId.value}`,
      "$pMYhIeMOPL"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(data, (d) => {
      if (d == null ? void 0 : d.superseded_by) navigateTo(`/trading/sales/${d.superseded_by}`, { replace: true });
    }, { immediate: true });
    const sale = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.sale) != null ? _b : null;
    });
    const jeLines = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.je_lines) != null ? _b : [];
    });
    const payments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payments) != null ? _b : [];
    });
    const dispatch = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.dispatch) != null ? _b : null;
    });
    const editChain = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.edit_chain) != null ? _b : [];
    });
    const pendingEdit = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.pending_edit) != null ? _b : null;
    });
    const canModify = computed(() => sale.value && Number(sale.value.amount_paid) <= 0.01 && !pendingEdit.value);
    const detailRows = computed(() => {
      var _a, _b, _c;
      return sale.value ? [
        ["Customer", sale.value.customer_name],
        ["Commodity", `${sale.value.commodity_name}${sale.value.origin ? ` (${sale.value.origin})` : ""}`],
        ["Quantity", `${Number(sale.value.quantity).toLocaleString()} ${sale.value.unit}`],
        ["Sale Date", String(sale.value.sale_date).slice(0, 10)],
        ["Branch", (_a = sale.value.branch_name) != null ? _a : "\u2014"],
        ["Source PO", (_b = sale.value.source_po_number) != null ? _b : "\u2014"],
        ["Recorded by", (_c = sale.value.created_by) != null ? _c : "\u2014"],
        ["Status", sale.value.status]
      ] : [];
    });
    const finTiles = computed(() => sale.value ? [
      { label: "Revenue", value: `\u09F3${Number(sale.value.total_amount).toLocaleString()}`, color: "text-gold-400" },
      { label: "COGS", value: `\u09F3${Number(sale.value.cogs_amount).toLocaleString()}`, color: "text-gray-300" },
      { label: "Margin", value: `\u09F3${(Number(sale.value.total_amount) - Number(sale.value.cogs_amount)).toLocaleString()}`, color: "text-emerald-400" },
      { label: "Paid / Due", value: `\u09F3${Number(sale.value.amount_paid).toLocaleString()} / \u09F3${Number(sale.value.balance_due).toLocaleString()}`, color: Number(sale.value.balance_due) > 0 ? "text-orange-400" : "text-emerald-400" }
    ] : []);
    function formatDiff(json) {
      try {
        const d = JSON.parse(json);
        return Object.entries(d).map(([k, v]) => `${k}: ${v.from} \u2192 ${v.to}`).join(" \xB7 ");
      } catch {
        return "";
      }
    }
    const [{ data: bankData }, { data: pettyData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/lookup/bank-accounts",
        "$h5X3IMNK_J"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$KlKDnjzd2i"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const bankAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
        value: a.id,
        label: `${a.bank_name} \u2014 AC: ${a.account_number}`,
        sub: a.branch_name || ""
      }));
    });
    const cashAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
        value: a.id,
        label: a.account_name,
        sub: a.branch_name || "Head Office"
      }));
    });
    const pay = reactive({ amount: 0, method: "Cash", bankAccountId: "", cashAccountId: "", reference: "" });
    const collecting = ref(false);
    const showEdit = ref(false);
    const editing = ref(false);
    const edit = reactive({ quantity: 0, unit_price: 0, sale_date: "", origin: "", reason: "" });
    watch(sale, (s) => {
      var _a;
      if (!s) return;
      edit.quantity = Number(s.quantity);
      edit.unit_price = Number(s.unit_price);
      edit.sale_date = String(s.sale_date).slice(0, 10);
      edit.origin = (_a = s.origin) != null ? _a : "";
    }, { immediate: true });
    const gateForm = reactive({ driver_name: "", vehicle_number: "", received_by: "" });
    const dispatching = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-4xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: (_b = (_a = unref(sale)) == null ? void 0 : _a.sale_number) != null ? _b : "Commodity Sale",
        subtitle: unref(sale) ? `${unref(sale).customer_name} \xB7 ${unref(sale).commodity_name}` : "",
        breadcrumb: ["Trading", "Sales", (_d = (_c = unref(sale)) == null ? void 0 : _c.sale_number) != null ? _d : "\u2026"]
      }, null, _parent));
      if (unref(pendingEdit)) {
        _push(`<div class="rounded-xl p-3 text-xs text-amber-300" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.25)" })}"> \u23F3 A correction by ${ssrInterpolate(unref(pendingEdit).requested_by)} is pending approval \u2014 Edit/Delete are locked until it&#39;s decided on `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/approval-requests",
          class: "underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Approval Requests`);
            } else {
              return [
                createTextVNode("Approval Requests")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`. </div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sale)) {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="glass-card p-5 space-y-2 text-xs"><h3 class="section-title mb-2">Details</h3><!--[-->`);
        ssrRenderList(unref(detailRows), (row) => {
          _push(`<div class="flex justify-between py-1 border-b border-white/[0.03]"><span class="text-gray-500">${ssrInterpolate(row[0])}</span><span class="text-gray-200 font-medium">${ssrInterpolate(row[1])}</span></div>`);
        });
        _push(`<!--]--><div class="flex gap-2 pt-3">`);
        if (unref(canModify)) {
          _push(`<button class="btn-ghost text-xs">\u270F\uFE0F Correct</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(canModify)) {
          _push(`<button class="btn-ghost text-xs text-red-400">\u{1F5D1} Delete</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/trading/sales/${unref(sale).id}/gate-pass`,
          class: "btn-ghost text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F5A8} Gate Pass`);
            } else {
              return [
                createTextVNode("\u{1F5A8} Gate Pass")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/trading/sales/${unref(sale).id}/invoice`,
          class: "btn-ghost text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F9FE} Invoice`);
            } else {
              return [
                createTextVNode("\u{1F9FE} Invoice")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (!unref(canModify) && Number(unref(sale).amount_paid) > 0) {
          _push(`<p class="text-[10px] text-gray-600 pt-1"> Corrections/deletion locked \u2014 payments exist. Reverse them first from Payment History. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5 space-y-2 text-xs"><h3 class="section-title mb-2">Financials</h3><div class="grid grid-cols-2 gap-2"><!--[-->`);
        ssrRenderList(unref(finTiles), (f) => {
          _push(`<div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">${ssrInterpolate(f.label)}</p><p class="${ssrRenderClass(["font-bold font-mono", f.color])}">${ssrInterpolate(f.value)}</p></div>`);
        });
        _push(`<!--]--></div>`);
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
      if (unref(showEdit) && unref(sale)) {
        _push(`<div class="glass-card p-5 space-y-3 max-w-4xl border border-amber-500/20"><h3 class="section-title">Correct This Sale</h3><p class="text-[11px] text-gray-600">Saving reverses this sale and posts a fresh, traceable replacement \u2014 the old version stays restorable from the Recycle Bin.</p><div class="grid grid-cols-2 md:grid-cols-4 gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Quantity</label><input${ssrRenderAttr("value", unref(edit).quantity)} type="number" step="any" class="input-glass text-xs font-mono"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Unit Price</label><input${ssrRenderAttr("value", unref(edit).unit_price)} type="number" step="any" class="input-glass text-xs font-mono"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Sale Date</label><input${ssrRenderAttr("value", unref(edit).sale_date)} type="date" class="input-glass text-xs"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Origin</label><input${ssrRenderAttr("value", unref(edit).origin)} class="input-glass text-xs"></div><div class="col-span-2 md:col-span-4 space-y-1"><label class="text-[10px] text-gray-600 uppercase">Reason *</label><input${ssrRenderAttr("value", unref(edit).reason)} class="input-glass text-xs" placeholder="Why is this correction needed\u2026"></div></div><div class="flex justify-end gap-2"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(!unref(edit).reason.trim() || unref(editing)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(editing) ? "Applying\u2026" : "Save Correction")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sale)) {
        _push(`<div class="glass-card p-5 space-y-3"><h3 class="section-title">Dispatch</h3><div class="text-xs text-gray-400">`);
        if ((_e = unref(dispatch)) == null ? void 0 : _e.confirmed_at) {
          _push(`<p>\u2705 Delivered ${ssrInterpolate(unref(dispatch).confirmed_at)} \u2014 confirmed by ${ssrInterpolate(unref(dispatch).confirmed_by_name)}`);
          if (unref(dispatch).received_by) {
            _push(`<span> \xB7 received by ${ssrInterpolate(unref(dispatch).received_by)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p>`);
        } else if ((_f = unref(dispatch)) == null ? void 0 : _f.gate_out_at) {
          _push(`<p>\u{1F69A} Gated out ${ssrInterpolate(unref(dispatch).gate_out_at)} by ${ssrInterpolate(unref(dispatch).gate_out_by_name)} \xB7 ${ssrInterpolate((_g = unref(dispatch).driver_name) != null ? _g : "\u2014")} / ${ssrInterpolate((_h = unref(dispatch).vehicle_number) != null ? _h : "\u2014")}</p>`);
        } else {
          _push(`<p>Not dispatched yet.</p>`);
        }
        _push(`</div>`);
        if (!((_i = unref(dispatch)) == null ? void 0 : _i.confirmed_at)) {
          _push(`<div class="flex flex-wrap items-end gap-2">`);
          if (!((_j = unref(dispatch)) == null ? void 0 : _j.gate_out_at)) {
            _push(`<!--[--><input${ssrRenderAttr("value", unref(gateForm).driver_name)} class="input-glass text-xs py-1.5 w-40" placeholder="Driver name"><input${ssrRenderAttr("value", unref(gateForm).vehicle_number)} class="input-glass text-xs py-1.5 w-36" placeholder="Vehicle #"><button${ssrIncludeBooleanAttr(unref(dispatching)) ? " disabled" : ""} class="btn-gold text-xs py-2">\u{1F69A} Gate Out</button><!--]-->`);
          } else {
            _push(`<!--[--><input${ssrRenderAttr("value", unref(gateForm).received_by)} class="input-glass text-xs py-1.5 w-44" placeholder="Received by (customer side)"><button${ssrIncludeBooleanAttr(unref(dispatching)) ? " disabled" : ""} class="btn-gold text-xs py-2">\u{1F4E6} Confirm Delivery</button><!--]-->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sale) && Number(unref(sale).balance_due) > 0 && unref(sale).status === "posted") {
        _push(`<div class="glass-card p-5 space-y-3"><h3 class="section-title">Collect Payment <span class="text-gray-500 font-normal text-xs">\u2014 due \u09F3${ssrInterpolate(Number(unref(sale).balance_due).toLocaleString())}</span></h3><div class="flex flex-wrap items-end gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount</label><input${ssrRenderAttr("value", unref(pay).amount)} type="number" step="any" class="input-glass text-xs font-mono w-32"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Method</label><select class="input-glass text-xs w-36"><!--[-->`);
        ssrRenderList(["Cash", "Bank Transfer", "Cheque", "Mobile Banking", "Card"], (m) => {
          _push(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(pay).method) ? ssrLooseContain(unref(pay).method, m) : ssrLooseEqual(unref(pay).method, m)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
        });
        _push(`<!--]--></select></div>`);
        if (unref(pay).method === "Cash") {
          _push(`<div class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Petty Cash Account</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(pay).cashAccountId,
            "onUpdate:modelValue": ($event) => unref(pay).cashAccountId = $event,
            options: unref(cashAccountOptions),
            placeholder: "Cash box\u2026"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Bank Account</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(pay).bankAccountId,
            "onUpdate:modelValue": ($event) => unref(pay).bankAccountId = $event,
            options: unref(bankAccountOptions),
            placeholder: "Bank account\u2026"
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`<div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Reference</label><input${ssrRenderAttr("value", unref(pay).reference)} class="input-glass text-xs w-32" placeholder="Optional"></div><button${ssrIncludeBooleanAttr(!(unref(pay).amount > 0) || unref(collecting)) ? " disabled" : ""} class="btn-gold text-xs py-2 disabled:opacity-50">${ssrInterpolate(unref(collecting) ? "Posting\u2026" : "Collect")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(payments).length) {
        _push(`<div class="glass-card p-5"><h3 class="section-title mb-3">Payment History</h3><!--[-->`);
        ssrRenderList(unref(payments), (p) => {
          _push(`<div class="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.03]"><span class="font-mono text-gold-400">${ssrInterpolate(p.payment_number)}</span><span class="text-gray-400">${ssrInterpolate(String(p.payment_date).slice(0, 10))}</span><span class="text-gray-400">${ssrInterpolate(p.payment_method)}</span><span class="flex-1"></span><span class="font-mono text-emerald-400">\u09F3${ssrInterpolate(Number(p.amount).toLocaleString())}</span>`);
          if (unref(isAdminUser)) {
            _push(`<button class="btn-ghost text-[10px] py-0.5 text-red-400">Reverse</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sale)) {
        _push(`<div class="glass-card p-5"><h3 class="section-title mb-3">Timeline</h3><div class="space-y-2 text-xs"><!--[-->`);
        ssrRenderList(unref(editChain), (e, i) => {
          var _a2;
          _push(`<div class="flex gap-3 py-1.5 border-b border-white/[0.03]"><span class="text-amber-400">\u270F\uFE0F</span><div class="flex-1"><p class="text-gray-300">Corrected: <span class="font-mono">${ssrInterpolate(e.old_sale_number)}</span> \u2192 <span class="font-mono">${ssrInterpolate(e.new_sale_number)}</span><span class="text-gray-600"> \xB7 ${ssrInterpolate(e.requested_by)}${ssrInterpolate(e.decided_by && e.decided_by !== e.requested_by ? ` \xB7 approved by ${e.decided_by}` : "")}</span></p><p class="text-gray-500">${ssrInterpolate(e.reason)}</p>`);
          if (e.change_summary) {
            _push(`<p class="text-[10px] text-gray-600 font-mono">${ssrInterpolate(formatDiff(e.change_summary))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><span class="text-gray-600">${ssrInterpolate(String((_a2 = e.decided_at) != null ? _a2 : e.created_at).slice(0, 16).replace("T", " "))}</span></div>`);
        });
        _push(`<!--]--><div class="flex gap-3 py-1.5"><span class="text-emerald-400">\u25CF</span><p class="flex-1 text-gray-300">Created by ${ssrInterpolate((_k = unref(sale).created_by) != null ? _k : "\u2014")}</p><span class="text-gray-600">${ssrInterpolate(String(unref(sale).created_at).slice(0, 16).replace("T", " "))}</span></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/sales/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-18KPNe36.mjs.map

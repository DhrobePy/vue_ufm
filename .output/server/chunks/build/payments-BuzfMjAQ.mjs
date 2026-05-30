import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import { c as _export_sfc } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

const PER_PAGE = 15;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "payments",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { info } = useToast();
    const page = ref(1);
    const selected = ref(null);
    const filters = reactive({
      search: "",
      method: "",
      status: ""
    });
    const { data, pending: loading, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/payments",
      {
        query: computed(() => ({
          search: filters.search,
          status: filters.status,
          page: page.value,
          per: PER_PAGE
        }))
      },
      "$f8rYC7nrqG"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const payments2 = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.payments) != null ? _b : []).map((p) => {
          var _a2, _b2, _c, _d, _e, _f, _g, _h;
          return {
            id: p.id,
            receiptNo: (_a2 = p.reference_number) != null ? _a2 : `PAY-${p.id}`,
            date: p.payment_date,
            customer: (_b2 = p.customer_name) != null ? _b2 : "\u2014",
            orderId: null,
            orderRef: "\u2014",
            amount: Number((_c = p.amount) != null ? _c : 0),
            method: (_d = p.payment_method) != null ? _d : "\u2014",
            reference: (_e = p.reference_number) != null ? _e : "",
            collectedBy: "\u2014",
            branch: "\u2014",
            status: (_g = (_f = p.allocation_status) != null ? _f : p.status) != null ? _g : "cleared",
            notes: (_h = p.notes) != null ? _h : ""
          };
        });
      }
    );
    const totalPages = computed(() => {
      var _a, _b;
      return Math.ceil(((_b = (_a = data.value) == null ? void 0 : _a.total) != null ? _b : 0) / PER_PAGE);
    });
    const filtered = computed(() => {
      const s = filters.search.toLowerCase();
      const m = filters.method;
      return payments2.value.filter((p) => {
        if (s && !p.customer.toLowerCase().includes(s) && !p.receiptNo.toLowerCase().includes(s)) return false;
        if (m && p.method !== m) return false;
        return true;
      });
    });
    const paginated = computed(() => filtered.value);
    const monthTotal = computed(() => payments2.value.reduce((s, p) => s + p.amount, 0));
    const cashTotal = computed(() => payments2.value.filter((p) => p.method === "cash").reduce((s, p) => s + p.amount, 0));
    const mobileTotal = computed(() => payments2.value.filter((p) => ["bkash", "nagad"].includes(p.method)).reduce((s, p) => s + p.amount, 0));
    const bankTotal = computed(() => payments2.value.filter((p) => ["bank_transfer", "cheque"].includes(p.method)).reduce((s, p) => s + p.amount, 0));
    const pendingCount = computed(() => payments2.value.filter((p) => p.status === "pending").length);
    const pendingTotal = computed(() => payments2.value.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0));
    const filteredTotal = computed(() => filtered.value.reduce((s, p) => s + p.amount, 0));
    const monthPayments = computed(() => payments2.value);
    watch(filters, () => {
      page.value = 1;
    });
    function methodLabel(m) {
      return {
        cash: "Cash",
        bkash: "bKash",
        nagad: "Nagad",
        bank: "Bank Transfer",
        bank_transfer: "Bank Transfer",
        cheque: "Cheque"
      }[m] || m;
    }
    function methodClass(m) {
      return {
        cash: "bg-amber-500/15 text-amber-400",
        bkash: "bg-pink-500/15 text-pink-400",
        nagad: "bg-orange-500/15 text-orange-400",
        bank: "bg-blue-500/15 text-blue-400",
        bank_transfer: "bg-blue-500/15 text-blue-400",
        cheque: "bg-purple-500/15 text-purple-400"
      }[m] || "bg-gray-500/15 text-gray-400";
    }
    function statusClass(s) {
      return {
        cleared: "bg-emerald-500/15 text-emerald-400",
        pending: "bg-amber-500/15 text-amber-400",
        bounced: "bg-red-500/15 text-red-400",
        allocated: "bg-sky-500/15 text-sky-400",
        unallocated: "bg-gray-500/15 text-gray-400"
      }[s] || "bg-gray-500/15 text-gray-400";
    }
    function exportCSV() {
      info("Export started \u2014 CSV downloading\u2026");
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-c7744b7b>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Payment Collections",
        subtitle: "All incoming payments received against credit sales",
        breadcrumb: ["Credit Sales", "Payments"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs" data-v-c7744b7b${_scopeId}>\u2B07 Export</button>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/credit-sales",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Orders`);
                } else {
                  return [
                    createTextVNode("\u2190 Orders")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("button", {
                onClick: exportCSV,
                class: "btn-ghost text-xs"
              }, "\u2B07 Export"),
              createVNode(_component_NuxtLink, {
                to: "/credit-sales",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Orders")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-c7744b7b><div class="glass-card p-4" data-v-c7744b7b><p class="text-xs text-gray-500 mb-1" data-v-c7744b7b>Collected This Month</p><p class="text-2xl font-bold text-emerald-400" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(monthTotal).toLocaleString())}</p><p class="text-xs text-gray-600 mt-1" data-v-c7744b7b>${ssrInterpolate(unref(monthPayments).length)} transactions</p></div><div class="glass-card p-4" data-v-c7744b7b><p class="text-xs text-gray-500 mb-1" data-v-c7744b7b>Cash / MFS</p><p class="text-2xl font-bold text-gray-100" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(cashTotal).toLocaleString())}</p><p class="text-xs text-gray-600 mt-1" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(mobileTotal).toLocaleString())} mobile</p></div><div class="glass-card p-4" data-v-c7744b7b><p class="text-xs text-gray-500 mb-1" data-v-c7744b7b>Bank Transfer</p><p class="text-2xl font-bold text-blue-400" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(bankTotal).toLocaleString())}</p><p class="text-xs text-gray-600 mt-1" data-v-c7744b7b>BEFTN / cheque</p></div><div class="glass-card p-4" data-v-c7744b7b><p class="text-xs text-gray-500 mb-1" data-v-c7744b7b>Pending Clearance</p><p class="text-2xl font-bold text-amber-400" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(pendingTotal).toLocaleString())}</p><p class="text-xs text-gray-600 mt-1" data-v-c7744b7b>${ssrInterpolate(unref(pendingCount))} cheques</p></div></div>`);
      if (unref(pendingCount) > 0) {
        _push(`<div class="rounded-2xl p-4 flex items-center gap-4 cursor-pointer" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.07)", "border": "1px solid rgba(245,158,11,0.2)" })}" data-v-c7744b7b><div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.15)" })}" data-v-c7744b7b><span class="text-lg" data-v-c7744b7b>\u23F3</span></div><div class="flex-1" data-v-c7744b7b><p class="text-sm font-bold text-amber-400" data-v-c7744b7b>${ssrInterpolate(unref(pendingCount))} payment${ssrInterpolate(unref(pendingCount) > 1 ? "s" : "")} pending clearance verification</p><p class="text-xs text-gray-500 mt-0.5" data-v-c7744b7b>Total \u09F3${ssrInterpolate(unref(pendingTotal).toLocaleString())} \u2014 click to filter and verify each one</p></div><span class="text-xs text-amber-400 font-semibold" data-v-c7744b7b>Review \u2192</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-c7744b7b>Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-c7744b7b>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3" data-v-c7744b7b><input${ssrRenderAttr("value", unref(filters).search)} type="text" class="field-input w-48 text-xs py-1.5" placeholder="Search customer / receipt\u2026" data-v-c7744b7b><select class="field-input w-auto text-xs py-1.5" data-v-c7744b7b><option value="" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).method) ? ssrLooseContain(unref(filters).method, "") : ssrLooseEqual(unref(filters).method, "")) ? " selected" : ""}>All Methods</option><option value="cash" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).method) ? ssrLooseContain(unref(filters).method, "cash") : ssrLooseEqual(unref(filters).method, "cash")) ? " selected" : ""}>Cash</option><option value="bkash" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).method) ? ssrLooseContain(unref(filters).method, "bkash") : ssrLooseEqual(unref(filters).method, "bkash")) ? " selected" : ""}>bKash</option><option value="nagad" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).method) ? ssrLooseContain(unref(filters).method, "nagad") : ssrLooseEqual(unref(filters).method, "nagad")) ? " selected" : ""}>Nagad</option><option value="bank_transfer" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).method) ? ssrLooseContain(unref(filters).method, "bank_transfer") : ssrLooseEqual(unref(filters).method, "bank_transfer")) ? " selected" : ""}>Bank Transfer</option><option value="cheque" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).method) ? ssrLooseContain(unref(filters).method, "cheque") : ssrLooseEqual(unref(filters).method, "cheque")) ? " selected" : ""}>Cheque</option></select><select class="field-input w-auto text-xs py-1.5" data-v-c7744b7b><option value="" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "") : ssrLooseEqual(unref(filters).status, "")) ? " selected" : ""}>All Status</option><option value="allocated" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "allocated") : ssrLooseEqual(unref(filters).status, "allocated")) ? " selected" : ""}>Allocated</option><option value="unallocated" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "unallocated") : ssrLooseEqual(unref(filters).status, "unallocated")) ? " selected" : ""}>Unallocated</option><option value="pending" data-v-c7744b7b${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "pending") : ssrLooseEqual(unref(filters).status, "pending")) ? " selected" : ""}>Pending</option></select><button class="btn-ghost text-xs py-1.5" data-v-c7744b7b>Reset</button><span class="ml-auto self-center text-xs text-gray-500" data-v-c7744b7b><span class="font-medium text-gray-300" data-v-c7744b7b>${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)}</span> records </span></div><div class="glass-card p-5" data-v-c7744b7b><table class="w-full text-xs" data-v-c7744b7b><thead data-v-c7744b7b><tr class="border-b border-white/[0.06]" data-v-c7744b7b><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Receipt No</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Date</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Customer</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Order Ref</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Amount</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Method</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Reference</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Collected By</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Branch</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider" data-v-c7744b7b>Status</th><th class="pb-2 px-3" data-v-c7744b7b></th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-c7744b7b>`);
      if (unref(filtered).length === 0) {
        _push(`<tr data-v-c7744b7b><td colspan="11" class="py-10 text-center text-gray-500" data-v-c7744b7b>No payments found for the selected filters.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(paginated), (p) => {
        _push(`<tr class="${ssrRenderClass(["transition-colors", p.status === "pending" ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.07]" : "hover:bg-white/[0.02]"])}" data-v-c7744b7b><td class="py-2.5 px-3 font-mono text-gold-400 font-semibold" data-v-c7744b7b>${ssrInterpolate(p.receiptNo)}</td><td class="py-2.5 px-3 font-mono text-gray-500" data-v-c7744b7b>${ssrInterpolate(p.date)}</td><td class="py-2.5 px-3" data-v-c7744b7b><p class="text-gray-200 font-semibold" data-v-c7744b7b>${ssrInterpolate(p.customer)}</p><p class="text-gray-500 text-[11px]" data-v-c7744b7b>${ssrInterpolate(p.branch === "srg" ? "Sirajgonj" : "Demra")}</p></td><td class="py-2.5 px-3" data-v-c7744b7b>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/credit-sales/${p.orderId}`,
          class: "font-mono text-blue-400 hover:text-blue-300 transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(p.orderRef)}`);
            } else {
              return [
                createTextVNode(toDisplayString(p.orderRef), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td><td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-400" data-v-c7744b7b>\u09F3${ssrInterpolate(p.amount.toLocaleString())}</td><td class="py-2.5 px-3" data-v-c7744b7b><span class="${ssrRenderClass([methodClass(p.method), "px-2 py-0.5 rounded-full text-[11px] font-semibold"])}" data-v-c7744b7b>${ssrInterpolate(methodLabel(p.method))}</span></td><td class="py-2.5 px-3 font-mono text-gray-500 text-[11px]" data-v-c7744b7b>${ssrInterpolate(p.reference || "\u2014")}</td><td class="py-2.5 px-3 text-gray-400" data-v-c7744b7b>${ssrInterpolate(p.collectedBy)}</td><td class="py-2.5 px-3 text-gray-500 capitalize" data-v-c7744b7b>${ssrInterpolate(p.branch === "srg" ? "SRG" : "DMR")}</td><td class="py-2.5 px-3 text-center" data-v-c7744b7b><span class="${ssrRenderClass([statusClass(p.status), "px-2 py-0.5 rounded-full text-[11px] font-semibold"])}" data-v-c7744b7b>${ssrInterpolate(p.status.charAt(0).toUpperCase() + p.status.slice(1))}</span></td><td class="py-2.5 px-3 text-right" data-v-c7744b7b><div class="flex items-center justify-end gap-2" data-v-c7744b7b>`);
        if (p.status === "pending") {
          _push(`<button class="text-[11px] px-2 py-0.5 rounded-lg text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/10 transition-colors" data-v-c7744b7b> \u2713 Clear </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="text-xs text-gray-600 hover:text-gold-400 transition-colors" data-v-c7744b7b>View</button></div></td></tr>`);
      });
      _push(`<!--]--></tbody>`);
      if (unref(filtered).length > 0) {
        _push(`<tfoot class="border-t-2 border-white/10" data-v-c7744b7b><tr data-v-c7744b7b><td colspan="4" class="pt-3 px-3 font-bold text-gray-400 text-xs" data-v-c7744b7b>Total (${ssrInterpolate(unref(filtered).length)} records)</td><td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400 text-sm" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(filteredTotal).toLocaleString())}</td><td colspan="6" data-v-c7744b7b></td></tr></tfoot>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</table>`);
      if (((_d = (_c = unref(data)) == null ? void 0 : _c.total) != null ? _d : 0) > PER_PAGE) {
        _push(`<div class="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]" data-v-c7744b7b><p class="text-xs text-gray-500" data-v-c7744b7b>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(unref(totalPages))}</p><div class="flex gap-2" data-v-c7744b7b><button${ssrIncludeBooleanAttr(unref(page) === 1) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3 disabled:opacity-30" data-v-c7744b7b>\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3 disabled:opacity-30" data-v-c7744b7b>Next \u2192</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(selected)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-c7744b7b><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-c7744b7b><div class="flex items-center justify-between" data-v-c7744b7b><h3 class="text-lg font-bold text-gray-100" data-v-c7744b7b>${ssrInterpolate(unref(selected).receiptNo)}</h3><button class="text-gray-500 hover:text-gray-200" data-v-c7744b7b>\u2715</button></div><div class="space-y-3 text-xs" data-v-c7744b7b><div class="grid grid-cols-2 gap-3" data-v-c7744b7b><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Customer</p><p class="text-gray-200 font-semibold" data-v-c7744b7b>${ssrInterpolate(unref(selected).customer)}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Date</p><p class="text-gray-200 font-mono" data-v-c7744b7b>${ssrInterpolate(unref(selected).date)}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Amount</p><p class="text-emerald-400 font-bold font-mono text-base" data-v-c7744b7b>\u09F3${ssrInterpolate(unref(selected).amount.toLocaleString())}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Method</p><p class="text-gray-200 capitalize" data-v-c7744b7b>${ssrInterpolate(methodLabel(unref(selected).method))}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Order Reference</p><p class="text-blue-400 font-mono" data-v-c7744b7b>${ssrInterpolate(unref(selected).orderRef)}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Bank Reference</p><p class="text-gray-300 font-mono" data-v-c7744b7b>${ssrInterpolate(unref(selected).reference || "\u2014")}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Collected By</p><p class="text-gray-200" data-v-c7744b7b>${ssrInterpolate(unref(selected).collectedBy)}</p></div><div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Status</p><span class="${ssrRenderClass([statusClass(unref(selected).status), "px-2 py-0.5 rounded-full text-[11px] font-semibold"])}" data-v-c7744b7b>${ssrInterpolate(unref(selected).status.charAt(0).toUpperCase() + unref(selected).status.slice(1))}</span></div></div>`);
          if (unref(selected).notes) {
            _push2(`<div class="glass-card p-3 space-y-0.5" data-v-c7744b7b><p class="text-gray-500" data-v-c7744b7b>Notes</p><p class="text-gray-300" data-v-c7744b7b>${ssrInterpolate(unref(selected).notes)}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
          if (unref(selected).status === "pending") {
            _push2(`<div class="rounded-xl p-3 space-y-2" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-c7744b7b><p class="text-[11px] text-amber-400 font-semibold" data-v-c7744b7b>\u23F3 Awaiting clearance verification</p><p class="text-[10px] text-gray-500" data-v-c7744b7b>Confirm the payment has cleared the bank before marking.</p><div class="flex gap-2" data-v-c7744b7b><button class="btn-gold text-xs flex-1 justify-center py-2" data-v-c7744b7b>\u2713 Mark as Cleared</button><button class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 transition-all" data-v-c7744b7b> \u2717 Mark as Bounced </button></div></div>`);
          } else if (unref(selected).status === "bounced") {
            _push2(`<div class="rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.06)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-c7744b7b><p class="text-[11px] text-red-400 font-semibold" data-v-c7744b7b>\u26A0 Payment bounced</p><p class="text-[10px] text-gray-500 mt-1" data-v-c7744b7b>${ssrInterpolate(unref(selected).notes)}</p><button class="btn-ghost text-xs mt-2 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10" data-v-c7744b7b>\u21BA Re-verify as Cleared</button></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex gap-3 pt-1" data-v-c7744b7b>`);
          _push2(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${unref(selected).orderId}`,
            class: "btn-ghost text-xs flex-1 text-center"
          }, {
            default: withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(`View Order`);
              } else {
                return [
                  createTextVNode("View Order")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`<button class="btn-ghost text-xs" data-v-c7744b7b>Close</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/payments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const payments = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c7744b7b"]]);

export { payments as default };
//# sourceMappingURL=payments-BuzfMjAQ.mjs.map

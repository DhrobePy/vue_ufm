import { defineComponent, ref, watch, computed, unref, reactive, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderAttr, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc } from './server.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdvanceAllot",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    customerId: {},
    orderId: {}
  },
  emits: ["close", "done"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { error: toastError } = useToast();
    const money = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
    const loading = ref(false), saving = ref(false);
    const strategy = ref("orders_first");
    const data = ref(null);
    const rows = ref([]);
    async function load() {
      var _a, _b;
      if (!props.customerId) return;
      loading.value = true;
      try {
        const d = await $fetch(`/api/customers/${props.customerId}/advance-credit`, { query: { strategy: strategy.value, order_id: props.orderId || void 0 } });
        data.value = d;
        const pays = new Map(d.payments.map((p) => [p.id, p]));
        const ords = new Map(d.openOrders.map((o) => [o.id, o]));
        rows.value = d.suggestion.map((a) => {
          var _a2, _b2, _c, _d, _e, _f;
          return {
            ...a,
            on: true,
            payment_number: (_a2 = pays.get(a.payment_id)) == null ? void 0 : _a2.payment_number,
            order_number: (_b2 = ords.get(a.order_id)) == null ? void 0 : _b2.order_number,
            order_date: (_c = ords.get(a.order_id)) == null ? void 0 : _c.order_date,
            status: (_e = (_d = ords.get(a.order_id)) == null ? void 0 : _d.status) != null ? _e : "",
            owes: (_f = ords.get(a.order_id)) == null ? void 0 : _f.balance_due
          };
        });
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Could not load advance credit");
      } finally {
        loading.value = false;
      }
    }
    watch(() => props.open, (o) => {
      if (o) load();
    });
    const chosenTotal = computed(() => rows.value.filter((r) => r.on).reduce((s, r) => s + Number(r.amount), 0));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-v-58c0f1e6><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-58c0f1e6></div><div class="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col glass-card rounded-b-none sm:rounded-b-2xl !bg-[#14110d]" data-v-58c0f1e6><div class="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06]" data-v-58c0f1e6><h3 class="section-title" data-v-58c0f1e6>\u{1F4B0} Allot advance credit</h3><button class="text-gray-500 hover:text-gray-200 text-lg leading-none" data-v-58c0f1e6>\u2715</button></div><div class="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs" data-v-58c0f1e6>`);
          if (unref(loading)) {
            _push2(`<p class="text-center text-gray-500 py-6" data-v-58c0f1e6>Loading\u2026</p>`);
          } else if (unref(data)) {
            _push2(`<!--[-->`);
            if (!unref(data).payments.length) {
              _push2(`<p class="text-center text-gray-500 italic py-6" data-v-58c0f1e6>This customer has no unallotted advance money.</p>`);
            } else {
              _push2(`<!--[--><p class="text-gray-400 leading-relaxed" data-v-58c0f1e6><b class="text-emerald-400" data-v-58c0f1e6>\u09F3${ssrInterpolate(money(unref(data).total))}</b> paid earlier is not counted against any order yet. The customer&#39;s ledger already has it as a credit \u2014 allotting only decides <i data-v-58c0f1e6>what it pays off</i>: the oldest open orders first (nearest placed), then the opening due. </p><div class="space-y-1" data-v-58c0f1e6><p class="text-[10px] uppercase text-gray-600 font-semibold" data-v-58c0f1e6>Advance on account</p><!--[-->`);
              ssrRenderList(unref(data).payments, (p) => {
                _push2(`<div class="flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] px-3 py-2" data-v-58c0f1e6><span class="font-mono text-gray-300" data-v-58c0f1e6>${ssrInterpolate(p.payment_number)} `);
                if (p.legacy) {
                  _push2(`<span class="ml-1 text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400" data-v-58c0f1e6>OLD APP</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span><span class="text-gray-500" data-v-58c0f1e6>${ssrInterpolate(p.payment_date)} \xB7 ${ssrInterpolate(p.method)}</span><span class="font-mono font-semibold text-emerald-400" data-v-58c0f1e6>\u09F3${ssrInterpolate(money(p.remaining))}</span></div>`);
              });
              _push2(`<!--]--></div><div class="flex gap-2" data-v-58c0f1e6><!--[-->`);
              ssrRenderList([["orders_first", "Orders first"], ["opening_first", "Opening due first"]], (s) => {
                _push2(`<button class="${ssrRenderClass([unref(strategy) === s[0] ? "bg-gold-500/15 border-gold-500/40 text-gold-300 font-semibold" : "border-white/[0.08] text-gray-500", "px-3 py-1.5 rounded-lg border text-[11px] transition-colors"])}" data-v-58c0f1e6>${ssrInterpolate(s[1])}</button>`);
              });
              _push2(`<!--]--></div><div class="space-y-1" data-v-58c0f1e6><p class="text-[10px] uppercase text-gray-600 font-semibold" data-v-58c0f1e6>Plan \u2014 untick a line to skip it</p>`);
              if (!unref(rows).length) {
                _push2(`<p class="text-gray-500 italic" data-v-58c0f1e6>No open order or opening due to apply it to.</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(rows), (r, i) => {
                _push2(`<label class="flex items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 cursor-pointer" data-v-58c0f1e6><input${ssrIncludeBooleanAttr(Array.isArray(r.on) ? ssrLooseContain(r.on, null) : r.on) ? " checked" : ""} type="checkbox" class="accent-emerald-500" data-v-58c0f1e6><span class="flex-1 min-w-0 text-gray-300 truncate" data-v-58c0f1e6>`);
                if (r.target === "opening") {
                  _push2(`<!--[-->Opening due <span class="text-gray-600" data-v-58c0f1e6>(\u09F3${ssrInterpolate(money(unref(data).openingDue))} unsettled)</span><!--]-->`);
                } else {
                  _push2(`<!--[--><span class="font-mono" data-v-58c0f1e6>${ssrInterpolate(r.order_number)}</span> <span class="text-gray-600" data-v-58c0f1e6>${ssrInterpolate(r.order_date)} \xB7 ${ssrInterpolate(r.status.replace(/_/g, " "))} \xB7 owes \u09F3${ssrInterpolate(money(r.owes))}</span><!--]-->`);
                }
                _push2(`</span><span class="text-gray-600 hidden sm:inline" data-v-58c0f1e6>\u2190 ${ssrInterpolate(r.payment_number)}</span><span class="font-mono font-semibold text-gold-400" data-v-58c0f1e6>\u09F3${ssrInterpolate(money(r.amount))}</span></label>`);
              });
              _push2(`<!--]-->`);
              if (unref(rows).length) {
                _push2(`<div class="flex justify-between pt-1 font-semibold" data-v-58c0f1e6><span class="text-gray-400" data-v-58c0f1e6>To allot now</span><span class="text-emerald-400 font-mono" data-v-58c0f1e6>\u09F3${ssrInterpolate(money(unref(chosenTotal)))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><!--]-->`);
            }
            _push2(`<!--]-->`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="flex gap-2 justify-end px-4 sm:px-5 py-3 border-t border-white/[0.06]" data-v-58c0f1e6><button class="btn-ghost text-xs" data-v-58c0f1e6>Close</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(chosenTotal) || unref(saving)) ? " disabled" : ""} data-v-58c0f1e6>${ssrInterpolate(unref(saving) ? "Applying\u2026" : "Apply allotment")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AdvanceAllot.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-58c0f1e6"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CustomerRefund",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    customerId: {},
    returnId: {},
    orderId: {}
  },
  emits: ["close", "done"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { error: toastError } = useToast();
    const money = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
    const info = ref(null), cash = ref([]), banks = ref([]), saving = ref(false);
    const f = reactive({ amount: 0, method: "Cash", cash: "", bank: "", notes: "" });
    watch(() => props.open, async (o) => {
      var _a, _b, _c, _d;
      if (!o) return;
      info.value = null;
      try {
        const [i, c, b] = await Promise.all([
          $fetch(`/api/customers/${props.customerId}/refund-info`),
          $fetch("/api/lookup/cash-accounts"),
          $fetch("/api/bank-accounts")
        ]);
        info.value = i;
        cash.value = (_a = c.accounts) != null ? _a : [];
        banks.value = (_b = b.accounts) != null ? _b : [];
        f.amount = i.credit;
      } catch (e) {
        toastError((_d = (_c = e == null ? void 0 : e.data) == null ? void 0 : _c.statusMessage) != null ? _d : "Could not load");
        emit("close");
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b;
        if (__props.open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-v-05de857e><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-05de857e></div><div class="relative w-full sm:max-w-md max-h-[92vh] flex flex-col glass-card rounded-b-none sm:rounded-b-2xl !bg-[#14110d]" data-v-05de857e><div class="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06]" data-v-05de857e><h3 class="section-title" data-v-05de857e>\u21A9\uFE0F Refund customer</h3><button class="text-gray-500 hover:text-gray-200 text-lg leading-none" data-v-05de857e>\u2715</button></div><div class="overflow-y-auto p-4 sm:p-5 space-y-3 text-xs" data-v-05de857e>`);
          if (!unref(info)) {
            _push2(`<p class="text-center text-gray-500 py-4" data-v-05de857e>Loading\u2026</p>`);
          } else {
            _push2(`<!--[-->`);
            if (!unref(info).credit) {
              _push2(`<p class="text-gray-500 italic text-center py-4" data-v-05de857e>${ssrInterpolate(unref(info).name)} holds no credit \u2014 there is nothing to refund. A return only reduces what they owe; money goes back only when they have paid more than they owe.</p>`);
            } else {
              _push2(`<!--[--><p class="text-gray-400 leading-relaxed" data-v-05de857e><b data-v-05de857e>${ssrInterpolate(unref(info).name)}</b> holds <b class="text-emerald-400" data-v-05de857e>\u09F3${ssrInterpolate(money(unref(info).credit))}</b> in credit (paid more than owed). You may pay back up to that \u2014 the ledger and accounts are updated automatically.</p><label class="block space-y-1" data-v-05de857e><span class="text-gray-500" data-v-05de857e>Amount (\u09F3)</span><input${ssrRenderAttr("value", unref(f).amount)} type="number" min="1"${ssrRenderAttr("max", unref(info).credit)} class="input-glass w-full font-mono" data-v-05de857e></label><div class="flex flex-wrap gap-1.5" data-v-05de857e><!--[-->`);
              ssrRenderList(["Cash", "Bank Transfer", "Cheque", "Mobile Banking"], (m) => {
                _push2(`<button class="${ssrRenderClass([unref(f).method === m ? "bg-gold-500/15 border-gold-500/40 text-gold-300 font-semibold" : "border-white/[0.08] text-gray-500", "px-2.5 py-1 rounded-lg border text-[11px]"])}" data-v-05de857e>${ssrInterpolate(m)}</button>`);
              });
              _push2(`<!--]--></div>`);
              if (unref(f).method === "Cash") {
                _push2(`<label class="block space-y-1" data-v-05de857e><span class="text-gray-500" data-v-05de857e>Paid from cash account *</span><select class="input-glass w-full" data-v-05de857e><option value="" data-v-05de857e${ssrIncludeBooleanAttr(Array.isArray(unref(f).cash) ? ssrLooseContain(unref(f).cash, "") : ssrLooseEqual(unref(f).cash, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
                ssrRenderList(unref(cash), (a) => {
                  _push2(`<option${ssrRenderAttr("value", a.id)} data-v-05de857e${ssrIncludeBooleanAttr(Array.isArray(unref(f).cash) ? ssrLooseContain(unref(f).cash, a.id) : ssrLooseEqual(unref(f).cash, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)}${ssrInterpolate(a.branch_name ? ` \u2014 ${a.branch_name}` : "")}</option>`);
                });
                _push2(`<!--]--></select></label>`);
              } else {
                _push2(`<label class="block space-y-1" data-v-05de857e><span class="text-gray-500" data-v-05de857e>Paid from bank account *</span><select class="input-glass w-full" data-v-05de857e><option value="" data-v-05de857e${ssrIncludeBooleanAttr(Array.isArray(unref(f).bank) ? ssrLooseContain(unref(f).bank, "") : ssrLooseEqual(unref(f).bank, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
                ssrRenderList(unref(banks), (a) => {
                  _push2(`<option${ssrRenderAttr("value", a.id)} data-v-05de857e${ssrIncludeBooleanAttr(Array.isArray(unref(f).bank) ? ssrLooseContain(unref(f).bank, a.id) : ssrLooseEqual(unref(f).bank, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_number)}</option>`);
                });
                _push2(`<!--]--></select></label>`);
              }
              _push2(`<label class="block space-y-1" data-v-05de857e><span class="text-gray-500" data-v-05de857e>Reference / note</span><input${ssrRenderAttr("value", unref(f).notes)} maxlength="200" class="input-glass w-full" placeholder="e.g. return RET-\u2026 refunded by cash" data-v-05de857e></label><!--]-->`);
            }
            if ((_a = unref(info).refunds) == null ? void 0 : _a.length) {
              _push2(`<ul class="text-[11px] text-gray-500 space-y-0.5 pt-1 border-t border-white/[0.06]" data-v-05de857e><!--[-->`);
              ssrRenderList(unref(info).refunds, (r) => {
                _push2(`<li data-v-05de857e>${ssrInterpolate(r.refund_number)} \xB7 ${ssrInterpolate(String(r.refund_date).slice(0, 10))} \xB7 \u09F3${ssrInterpolate(money(r.amount))} \xB7 ${ssrInterpolate(r.payment_method)}</li>`);
              });
              _push2(`<!--]--></ul>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--]-->`);
          }
          _push2(`</div><div class="flex gap-2 justify-end px-4 sm:px-5 py-3 border-t border-white/[0.06]" data-v-05de857e><button class="btn-ghost text-xs" data-v-05de857e>Close</button>`);
          if ((_b = unref(info)) == null ? void 0 : _b.credit) {
            _push2(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving) || !unref(f).amount || unref(f).amount > unref(info).credit || (unref(f).method === "Cash" ? !unref(f).cash : !unref(f).bank)) ? " disabled" : ""} data-v-05de857e>${ssrInterpolate(unref(saving) ? "Refunding\u2026" : "Pay refund")}</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CustomerRefund.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-05de857e"]]);

export { __nuxt_component_4 as _, __nuxt_component_5 as a };
//# sourceMappingURL=CustomerRefund-DPpRIF8r.mjs.map

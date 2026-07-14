import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, reactive, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
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
  __name: "amend",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const orderId = Number(route.params.id);
    const { user } = useUserSession();
    useToast();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const PRE = ["pending_approval", "escalated", "approved", "in_production", "ready_to_ship"];
    const [{ data, pending, refresh }, { data: amdData, refresh: refreshAmd }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        `/api/credit-sales/${orderId}`,
        "$XferAUw3U2"
        /* nuxt-injected */
      ),
      useFetch(
        `/api/credit-sales/${orderId}/amendments`,
        "$Wn2ig3rIV5"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.order) != null ? _b : null;
    });
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const amendments = computed(() => {
      var _a, _b;
      return (_b = (_a = amdData.value) == null ? void 0 : _a.amendments) != null ? _b : [];
    });
    const regime = computed(() => {
      var _a;
      return PRE.includes((_a = order.value) == null ? void 0 : _a.status) ? "pre" : "post";
    });
    const editItems = ref([]);
    watch(items, (its) => {
      editItems.value = its.map((it) => {
        var _a;
        return {
          product_id: it.product_id,
          variant_id: it.variant_id,
          product_name: it.product_name,
          weight_variant: it.weight_variant,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          discount_amount: Number((_a = it.discount_amount) != null ? _a : 0)
        };
      });
    }, { immediate: true });
    function lineTotal(it) {
      return Number(it.quantity || 0) * Number(it.unit_price || 0) - Number(it.discount_amount || 0);
    }
    const newTotal = computed(() => editItems.value.reduce((s, it) => s + lineTotal(it), 0));
    const delta = computed(() => {
      var _a, _b;
      return regime.value === "pre" ? newTotal.value - Number((_b = (_a = order.value) == null ? void 0 : _a.total_amount) != null ? _b : 0) : Number(postForm.flat_amount || 0);
    });
    const postForm = reactive({ amend_type: "freight", flat_amount: null });
    const description = ref("");
    const canSubmit = computed(() => {
      if (!description.value.trim()) return false;
      if (regime.value === "pre") return Math.abs(delta.value) > 5e-3 && editItems.value.every((it) => it.quantity >= 0 && it.unit_price >= 0);
      return !!Number(postForm.flat_amount);
    });
    const saving = ref(false);
    const headerForm = reactive({ required_date: "", priority: "normal", shipping_address: "", special_instructions: "" });
    watch(order, (o) => {
      var _a, _b, _c;
      if (!o) return;
      headerForm.required_date = o.required_date ? String(o.required_date).slice(0, 10) : "";
      headerForm.priority = (_a = o.priority) != null ? _a : "normal";
      headerForm.shipping_address = (_b = o.shipping_address) != null ? _b : "";
      headerForm.special_instructions = (_c = o.special_instructions) != null ? _c : "";
    }, { immediate: true });
    const savingHeader = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: unref(order) ? `Amend ${unref(order).order_number}` : "Amend Order",
        subtitle: (_b = (_a = unref(order)) == null ? void 0 : _a.customer_name) != null ? _b : "",
        breadcrumb: ["Credit Sales", (_d = (_c = unref(order)) == null ? void 0 : _c.order_number) != null ? _d : "\u2026", "Amend"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${unref(orderId)}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Order`);
                } else {
                  return [
                    createTextVNode("\u2190 Order")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/credit-sales/${unref(orderId)}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Order")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center"><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"></div><p class="text-xs text-gray-500">Loading order\u2026</p></div>`);
      } else if (unref(order)) {
        _push(`<!--[--><div class="${ssrRenderClass([unref(regime) === "pre" ? "bg-sky-500/5 border-sky-500/20" : "bg-amber-500/5 border-amber-500/20", "glass-card px-5 py-3.5 flex items-center gap-3 border"])}"><span class="text-2xl">${ssrInterpolate(unref(regime) === "pre" ? "\u270F\uFE0F" : "\u{1F9FE}")}</span><div class="text-xs"><p class="${ssrRenderClass([unref(regime) === "pre" ? "text-sky-300" : "text-amber-300", "font-bold"])}">${ssrInterpolate(unref(regime) === "pre" ? "PRE-DISPATCH \u2014 direct edit" : "POST-DISPATCH \u2014 debit / credit note")}</p><p class="text-gray-500 mt-0.5">${ssrInterpolate(unref(regime) === "pre" ? "The invoice has not hit the ledger yet, so items can be edited directly. Every change is snapshotted." : "The invoice is already posted. Changes go through the ledger as a debit note (+) or credit note (\u2212) with a balanced journal entry \u2014 the original invoice is never touched.")}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(order).status,
          class: "ml-auto"
        }, null, _parent));
        _push(`</div>`);
        if (unref(regime) === "pre") {
          _push(`<div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-bold text-gray-200">Edit Items</h2><span class="text-[11px] text-gray-600">Current total \u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</span></div><div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-white/[0.04] text-[10px] text-gray-600 uppercase"><tr><th class="px-4 py-2.5 text-left">Product</th><th class="px-3 py-2.5 text-center w-24">Qty (bags)</th><th class="px-3 py-2.5 text-center w-28">Unit Price</th><th class="px-3 py-2.5 text-center w-24">Discount</th><th class="px-3 py-2.5 text-right w-28">Line Total</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
          ssrRenderList(unref(editItems), (it, i) => {
            _push(`<tr><td class="px-4 py-2.5 text-gray-300">${ssrInterpolate(it.product_name)} <span class="text-gray-600">${ssrInterpolate(it.weight_variant)}</span></td><td class="px-3 py-2"><input${ssrRenderAttr("value", it.quantity)} type="number" min="0" class="input-glass w-full py-1 text-center font-mono"></td><td class="px-3 py-2"><input${ssrRenderAttr("value", it.unit_price)} type="number" min="0" class="input-glass w-full py-1 text-center font-mono"></td><td class="px-3 py-2"><input${ssrRenderAttr("value", it.discount_amount)} type="number" min="0" class="input-glass w-full py-1 text-center font-mono"></td><td class="px-3 py-2.5 text-right font-mono font-bold text-gray-200"> \u09F3${ssrInterpolate(lineTotal(it).toLocaleString())}</td></tr>`);
          });
          _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.08]"><td colspan="4" class="px-4 py-3 text-right font-semibold text-gray-400">New Total</td><td class="px-3 py-3 text-right font-mono font-bold text-gold-300 text-sm">\u09F3${ssrInterpolate(unref(newTotal).toLocaleString())}</td></tr><tr><td colspan="4" class="px-4 pb-3 text-right text-[11px] text-gray-600">Change</td><td class="${ssrRenderClass([unref(delta) > 0 ? "text-emerald-400" : unref(delta) < 0 ? "text-red-400" : "text-gray-600", "px-3 pb-3 text-right font-mono text-xs"])}">${ssrInterpolate(unref(delta) > 0 ? "+" : "")}\u09F3${ssrInterpolate(unref(delta).toLocaleString())}</td></tr></tfoot></table></div></div>`);
        } else {
          _push(`<div class="glass-card p-5 space-y-4"><h2 class="text-sm font-bold text-gray-200">Debit / Credit Note</h2><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Type</label><select class="input-glass w-full"><option value="freight"${ssrIncludeBooleanAttr(Array.isArray(unref(postForm).amend_type) ? ssrLooseContain(unref(postForm).amend_type, "freight") : ssrLooseEqual(unref(postForm).amend_type, "freight")) ? " selected" : ""}>Freight charge (+)</option><option value="rebate"${ssrIncludeBooleanAttr(Array.isArray(unref(postForm).amend_type) ? ssrLooseContain(unref(postForm).amend_type, "rebate") : ssrLooseEqual(unref(postForm).amend_type, "rebate")) ? " selected" : ""}>Rebate / discount (\u2212)</option><option value="correction"${ssrIncludeBooleanAttr(Array.isArray(unref(postForm).amend_type) ? ssrLooseContain(unref(postForm).amend_type, "correction") : ssrLooseEqual(unref(postForm).amend_type, "correction")) ? " selected" : ""}>Correction (\xB1)</option></select></div><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Amount (\u09F3) \u2014 negative reduces the bill</label><input${ssrRenderAttr("value", unref(postForm).flat_amount)} type="number" step="1" class="${ssrRenderClass([Number(unref(postForm).flat_amount) < 0 ? "text-red-300" : "text-emerald-300", "input-glass w-full text-center font-mono font-bold text-base"])}"></div><div class="flex items-end pb-1"><p class="${ssrRenderClass([Number(unref(postForm).flat_amount) > 0 ? "text-emerald-400" : Number(unref(postForm).flat_amount) < 0 ? "text-red-400" : "text-gray-600", "text-[11px]"])}">${ssrInterpolate(Number(unref(postForm).flat_amount) > 0 ? `Debit note \u2014 customer owes \u09F3${Number(unref(postForm).flat_amount).toLocaleString()} more` : Number(unref(postForm).flat_amount) < 0 ? `Credit note \u2014 bill reduced by \u09F3${Math.abs(Number(unref(postForm).flat_amount)).toLocaleString()}` : "Enter an amount")}</p></div></div></div>`);
        }
        _push(`<div class="glass-card p-5 space-y-4"><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Reason / description *</label><textarea rows="2" class="input-glass w-full resize-none" placeholder="e.g. Truck changed from big to mini at gate \u2014 freight difference">${ssrInterpolate(unref(description))}</textarea></div><div class="flex items-center justify-end gap-3"><button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs px-6 py-2 disabled:opacity-50">${ssrInterpolate(unref(saving) ? "Submitting\u2026" : "Submit Amendment")}</button></div></div>`);
        if (unref(isAdmin)) {
          _push(`<div class="glass-card p-5 space-y-4 border border-violet-500/15"><h2 class="text-sm font-bold text-violet-300">Admin \u2014 Header Edit <span class="text-[10px] font-normal text-gray-600">(non-money fields, audited)</span></h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Required Date</label><input${ssrRenderAttr("value", unref(headerForm).required_date)} type="date" class="input-glass w-full"></div><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Priority</label><select class="input-glass w-full"><option value="normal"${ssrIncludeBooleanAttr(Array.isArray(unref(headerForm).priority) ? ssrLooseContain(unref(headerForm).priority, "normal") : ssrLooseEqual(unref(headerForm).priority, "normal")) ? " selected" : ""}>Normal</option><option value="high"${ssrIncludeBooleanAttr(Array.isArray(unref(headerForm).priority) ? ssrLooseContain(unref(headerForm).priority, "high") : ssrLooseEqual(unref(headerForm).priority, "high")) ? " selected" : ""}>High</option><option value="urgent"${ssrIncludeBooleanAttr(Array.isArray(unref(headerForm).priority) ? ssrLooseContain(unref(headerForm).priority, "urgent") : ssrLooseEqual(unref(headerForm).priority, "urgent")) ? " selected" : ""}>Urgent</option></select></div><div class="space-y-1.5 sm:col-span-2"><label class="text-[11px] text-gray-500">Shipping Address</label><input${ssrRenderAttr("value", unref(headerForm).shipping_address)} type="text" class="input-glass w-full"></div><div class="space-y-1.5 sm:col-span-2"><label class="text-[11px] text-gray-500">Special Instructions</label><input${ssrRenderAttr("value", unref(headerForm).special_instructions)} type="text" class="input-glass w-full"></div></div><div class="flex justify-end"><button${ssrIncludeBooleanAttr(unref(savingHeader)) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40">${ssrInterpolate(unref(savingHeader) ? "Saving\u2026" : "Save Header Changes")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3.5 border-b border-white/[0.06]"><h2 class="text-sm font-bold text-gray-200">Amendment History</h2></div>`);
        if (!unref(amendments).length) {
          _push(`<div class="py-8 text-center text-gray-600 text-xs italic">No amendments yet</div>`);
        } else {
          _push(`<div class="divide-y divide-white/[0.04]"><!--[-->`);
          ssrRenderList(unref(amendments), (a) => {
            var _a2;
            _push(`<div class="px-5 py-3.5 flex items-start gap-3 flex-wrap"><div class="min-w-[130px]"><p class="text-xs font-bold font-mono text-gray-300">${ssrInterpolate(a.amendment_number)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(new Date(a.created_at).toLocaleDateString("en-GB"))}</p></div><span class="${ssrRenderClass([a.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : a.status === "rejected" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400", "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}">${ssrInterpolate(a.status)}</span><span class="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-gray-500">${ssrInterpolate(a.regime)} \xB7 ${ssrInterpolate(a.amend_type)}</span><div class="flex-1 text-xs text-gray-500 min-w-[160px]">${ssrInterpolate(a.description || "\u2014")} `);
            if (a.flat_amount) {
              _push(`<span class="${ssrRenderClass([Number(a.flat_amount) > 0 ? "text-emerald-400" : "text-red-400", "font-mono ml-1"])}">${ssrInterpolate(Number(a.flat_amount) > 0 ? "+" : "")}\u09F3${ssrInterpolate(Number(a.flat_amount).toLocaleString())}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-[10px] text-gray-600 text-right"><p>by ${ssrInterpolate((_a2 = a.requested_by_name) != null ? _a2 : "\u2014")}</p>`);
            if (a.decided_by_name) {
              _push(`<p>${ssrInterpolate(a.status)} by ${ssrInterpolate(a.decided_by_name)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (a.status === "pending" && unref(isAdmin)) {
              _push(`<div class="flex gap-2"><button class="px-3 py-1 rounded-lg text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25">Approve</button><button class="px-3 py-1 rounded-lg text-[11px] text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25">Reject</button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/amend.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=amend-4MblJ1Qw.mjs.map

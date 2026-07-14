import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StatusBadge",
  __ssrInlineRender: true,
  props: {
    status: {}
  },
  setup(__props) {
    const props = __props;
    const map = {
      // Credit order statuses (exact from PHP system)
      draft: { label: "Draft", cls: "bg-gray-500/10 text-gray-400 border border-gray-500/20", dot: "#6b7280" },
      pending_approval: { label: "Pending Approval", cls: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", dot: "#eab308" },
      escalated: { label: "Escalated", cls: "bg-orange-500/10 text-orange-400 border border-orange-500/20", dot: "#f97316" },
      approved: { label: "Approved", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "#10b981" },
      in_production: { label: "In Production", cls: "bg-blue-500/10 text-blue-400 border border-blue-500/20", dot: "#3b82f6" },
      ready_to_ship: { label: "Ready to Ship", cls: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20", dot: "#06b6d4" },
      goods_on_board: { label: "Goods on Board", cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20", dot: "#f59e0b" },
      shipped: { label: "Shipped", cls: "bg-orange-500/10 text-orange-400 border border-orange-500/20", dot: "#f97316" },
      dispatched: { label: "Dispatched", cls: "bg-orange-500/10 text-orange-400 border border-orange-500/20", dot: "#f97316" },
      delivered: { label: "Delivered", cls: "bg-teal-500/10 text-teal-400 border border-teal-500/20", dot: "#14b8a6" },
      partial_delivery: { label: "Partial Delivery", cls: "bg-purple-500/10 text-purple-400 border border-purple-500/20", dot: "#a855f7" },
      completed: { label: "Completed", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "#10b981" },
      rejected: { label: "Rejected", cls: "bg-red-500/10 text-red-400 border border-red-500/20", dot: "#ef4444" },
      cancelled: { label: "Cancelled", cls: "bg-red-500/10 text-red-400 border border-red-500/20", dot: "#ef4444" },
      returned: { label: "Returned", cls: "bg-pink-500/10 text-pink-400 border border-pink-500/20", dot: "#ec4899" },
      // Purchase / GRN statuses
      pending: { label: "Pending", cls: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", dot: "#eab308" },
      confirmed: { label: "Confirmed", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "#10b981" },
      // PO statuses
      active: { label: "Active", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "#10b981" },
      inactive: { label: "Inactive", cls: "bg-gray-500/10 text-gray-400 border border-gray-500/20", dot: "#6b7280" },
      // Payment statuses
      paid: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "#10b981" },
      partial: { label: "Partial", cls: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", dot: "#eab308" },
      unpaid: { label: "Unpaid", cls: "bg-red-500/10 text-red-400 border border-red-500/20", dot: "#ef4444" },
      partially_paid: { label: "Partially Paid", cls: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", dot: "#eab308" },
      // User statuses (exact from PHP: active, pending, suspended)
      suspended: { label: "Suspended", cls: "bg-red-500/10 text-red-400 border border-red-500/20", dot: "#ef4444" },
      // Bank transaction statuses
      // Expense statuses (pending / approved / rejected from PHP)
      blacklisted: { label: "Blacklisted", cls: "bg-red-900/20 text-red-300 border border-red-500/30", dot: "#7f1d1d" },
      // Vehicle statuses
      in_maintenance: { label: "In Maintenance", cls: "bg-orange-500/10 text-orange-400 border border-orange-500/20", dot: "#f97316" },
      retired: { label: "Retired", cls: "bg-gray-600/10 text-gray-500 border border-gray-600/20", dot: "#4b5563" },
      Retired: { label: "Retired", cls: "bg-gray-600/10 text-gray-500 border border-gray-600/20", dot: "#4b5563" },
      // POS customer type
      Credit: { label: "Credit", cls: "bg-gold-500/10 text-gold-400 border border-gold-500/20", dot: "#f59e0b" },
      POS: { label: "POS", cls: "bg-gray-500/10 text-gray-400 border border-gray-500/20", dot: "#6b7280" }
    };
    const entry = computed(() => {
      var _a;
      return (_a = map[props.status]) != null ? _a : { label: props.status, cls: "bg-gray-500/10 text-gray-400 border border-gray-500/20", dot: "#6b7280" };
    });
    const label = computed(() => entry.value.label);
    const cls = computed(() => entry.value.cls);
    const dot = computed(() => entry.value.dot);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["badge font-medium", unref(cls)]
      }, _attrs))}><span class="w-1.5 h-1.5 rounded-full" style="${ssrRenderStyle(`background:${unref(dot)}`)}"></span> ${ssrInterpolate(unref(label))}</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/StatusBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=StatusBadge-CIXHKBxR.mjs.map

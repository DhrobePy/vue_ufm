import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as _sfc_main$2 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, computed, ref, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, createVNode, renderList, createCommentVNode, withDirectives, isRef, vModelSelect, vModelText, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { q as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import './useAppSettings-Cev_RXDm.mjs';
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
  __name: "returns",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error: toastError } = useToast();
    const { user } = useUserSession();
    const canDelete = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(String((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const status = ref(""), from = ref(""), to = ref(""), search = ref("");
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/returns",
      { query: computed(() => ({ status: status.value || void 0, from: from.value || void 0, to: to.value || void 0, search: search.value || void 0 })), watch: [status, from, to, search] },
      "$3EIEs4BRcZ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const stCls = (s) => s === "approved" ? "text-emerald-400" : s === "pending" ? "text-amber-400" : "text-gray-500";
    const period = computed(() => `${from.value || "all dates"} to ${to.value || "today"}${status.value ? " \xB7 " + status.value : ""}`);
    const kpis = computed(() => {
      var _a;
      const s = (_a = data.value) == null ? void 0 : _a.summary;
      return s ? [{ l: "Pending", ...s.pending, cls: "text-amber-400" }, { l: "Approved", ...s.approved, cls: "text-emerald-400" }, { l: "Rejected", ...s.rejected, cls: "text-gray-400" }] : [];
    });
    const busy = ref(false);
    async function decide(r, action) {
      var _a, _b, _c;
      const notes = action === "reject" ? ((_a = prompt("Reason for rejecting this return:")) != null ? _a : "").trim() : "";
      if (action === "reject" && !notes) return;
      if (action === "approve" && !confirm(`Approve ${r.return_number} (\u09F3${n0(r.amount)})? The invoice and customer ledger are adjusted.`)) return;
      busy.value = true;
      try {
        await $fetch(`/api/credit-sales/returns/${r.id}/status`, { method: "PATCH", body: { action, notes } });
        success(`${r.return_number} ${action === "approve" ? "approved" : "rejected"}`);
        await refresh();
      } catch (e) {
        toastError((_c = (_b = e == null ? void 0 : e.data) == null ? void 0 : _b.statusMessage) != null ? _c : "Failed");
      } finally {
        busy.value = false;
      }
    }
    async function remove(r) {
      var _a, _b;
      if (!confirm(`Delete ${r.return_number}?${r.status === "approved" ? " Its effect on the invoice and ledger is reversed." : ""} It goes to the Recycle Bin.`)) return;
      busy.value = true;
      try {
        await $fetch(`/api/credit-sales/returns/${r.id}`, { method: "DELETE" });
        success("Return deleted");
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed");
      } finally {
        busy.value = false;
      }
    }
    const sheets = computed(() => {
      var _a, _b;
      return [{
        name: "Returns",
        cols: [
          { key: "return_number", label: "Return #" },
          { key: "return_date", label: "Date" },
          { key: "order_number", label: "Order #" },
          { key: "customer", label: "Customer" },
          { key: "return_type", label: "Type" },
          { key: "return_reason", label: "Reason" },
          { key: "qty", label: "Qty", fmt: "qty", sum: true },
          { key: "amount", label: "Value \u09F3", fmt: "money", sum: true },
          { key: "status", label: "Status" },
          { key: "created_by", label: "Recorded by" },
          { key: "approved_by", label: "Decided by" }
        ],
        rows: ((_b = (_a = data.value) == null ? void 0 : _a.returns) != null ? _b : []).map((r) => ({ ...r, return_date: String(r.return_date).slice(0, 10) })),
        totals: true
      }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_ReportFrame = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="no-print">`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "returns" }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_ReportFrame, {
        title: "Goods Returns",
        subtitle: "Every return across orders \u2014 a different authorised user must approve each one",
        period: unref(period),
        filename: "goods-returns",
        sheets: unref(sheets)
      }, {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="glass-card p-4 flex flex-wrap items-center gap-2"${_scopeId}><select class="field-input text-xs py-1.5 w-40"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "") : ssrLooseEqual(unref(status), "")) ? " selected" : ""}${_scopeId}>All statuses</option><option value="pending"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "pending") : ssrLooseEqual(unref(status), "pending")) ? " selected" : ""}${_scopeId}>Pending</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "approved") : ssrLooseEqual(unref(status), "approved")) ? " selected" : ""}${_scopeId}>Approved</option><option value="rejected"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "rejected") : ssrLooseEqual(unref(status), "rejected")) ? " selected" : ""}${_scopeId}>Rejected</option></select><input${ssrRenderAttr("value", unref(from))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><span class="text-xs text-gray-600"${_scopeId}>to</span><input${ssrRenderAttr("value", unref(to))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><input${ssrRenderAttr("value", unref(search))} type="search" placeholder="Return #, order #, customer\u2026" class="field-input text-xs py-1.5 w-56"${_scopeId}><span class="text-[11px] text-gray-600 ml-auto"${_scopeId}>To record a return, open the order \u2192 \u201CReturn\u201D.</span></div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 flex flex-wrap items-center gap-2" }, [
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
                  class: "field-input text-xs py-1.5 w-40"
                }, [
                  createVNode("option", { value: "" }, "All statuses"),
                  createVNode("option", { value: "pending" }, "Pending"),
                  createVNode("option", { value: "approved" }, "Approved"),
                  createVNode("option", { value: "rejected" }, "Rejected")
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(status)]
                ]),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(from) ? from.value = $event : null,
                  type: "date",
                  class: "field-input text-xs py-1.5 w-36"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(from)]
                ]),
                createVNode("span", { class: "text-xs text-gray-600" }, "to"),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(to) ? to.value = $event : null,
                  type: "date",
                  class: "field-input text-xs py-1.5 w-36"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(to)]
                ]),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                  type: "search",
                  placeholder: "Return #, order #, customer\u2026",
                  class: "field-input text-xs py-1.5 w-56"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(search)]
                ]),
                createVNode("span", { class: "text-[11px] text-gray-600 ml-auto" }, "To record a return, open the order \u2192 \u201CReturn\u201D.")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (unref(data)) {
              _push2(`<!--[--><div class="grid grid-cols-3 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(kpis), (k) => {
                _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="${ssrRenderClass([k.cls, "text-lg font-bold font-mono"])}"${_scopeId}>${ssrInterpolate(k.n)} <span class="text-xs text-gray-600"${_scopeId}>\xB7 \u09F3${ssrInterpolate(n0(k.v))}</span></p></div>`);
              });
              _push2(`<!--]--></div><div class="glass-card overflow-x-auto"${_scopeId}><table class="w-full text-xs"${_scopeId}><thead${_scopeId}><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"${_scopeId}><th class="px-3 py-2 text-left"${_scopeId}>Return</th><th class="px-3 py-2 text-left"${_scopeId}>Date</th><th class="px-3 py-2 text-left"${_scopeId}>Order</th><th class="px-3 py-2 text-left"${_scopeId}>Customer</th><th class="px-3 py-2 text-left"${_scopeId}>Items</th><th class="px-3 py-2 text-right"${_scopeId}>Qty</th><th class="px-3 py-2 text-right"${_scopeId}>Value \u09F3</th><th class="px-3 py-2 text-left"${_scopeId}>Status</th><th class="px-3 py-2 text-left no-print"${_scopeId}>Actions</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(data).returns, (r) => {
                var _a;
                _push2(`<tr class="border-b border-white/[0.04] align-top"${_scopeId}><td class="px-3 py-2 font-mono"${_scopeId}>${ssrInterpolate(r.return_number)}<div class="text-[10px] text-gray-600"${_scopeId}>${ssrInterpolate(r.return_type)}${ssrInterpolate(r.return_reason ? " \xB7 " + r.return_reason : "")}</div></td><td class="px-3 py-2 whitespace-nowrap"${_scopeId}>${ssrInterpolate(String(r.return_date).slice(0, 10))}</td><td class="px-3 py-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/${r.order_id}`,
                  class: "text-gold-400 hover:underline"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(r.order_number)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(r.order_number), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</td><td class="px-3 py-2"${_scopeId}>${ssrInterpolate(r.customer)}</td><td class="px-3 py-2 text-gray-400"${_scopeId}><!--[-->`);
                ssrRenderList(r.items, (i, k) => {
                  _push2(`<div${_scopeId}>${ssrInterpolate(i.product)} ${ssrInterpolate(i.variant)} \xD7 ${ssrInterpolate(i.qty)}</div>`);
                });
                _push2(`<!--]--></td><td class="px-3 py-2 text-right font-mono"${_scopeId}>${ssrInterpolate(n0(r.qty))}</td><td class="px-3 py-2 text-right font-mono"${_scopeId}>${ssrInterpolate(n0(r.amount))}</td><td class="px-3 py-2"${_scopeId}><span class="${ssrRenderClass(stCls(r.status))}"${_scopeId}>${ssrInterpolate(r.status)}</span><div class="text-[10px] text-gray-600"${_scopeId}>by ${ssrInterpolate((_a = r.created_by) != null ? _a : "\u2014")}${ssrInterpolate(r.approved_by ? " \xB7 decided by " + r.approved_by : "")}</div></td><td class="px-3 py-2 no-print whitespace-nowrap"${_scopeId}>`);
                if (r.status === "pending") {
                  _push2(`<!--[--><button class="btn-gold text-[11px] px-2.5 py-1 mr-1"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}${_scopeId}>Approve</button><button class="btn-ghost text-[11px] px-2.5 py-1"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}${_scopeId}>Reject</button><!--]-->`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(canDelete)) {
                  _push2(`<button class="btn-ghost text-[11px] px-2.5 py-1 text-red-400 ml-1"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}${_scopeId}>Delete</button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td></tr>`);
              });
              _push2(`<!--]-->`);
              if (!unref(data).returns.length) {
                _push2(`<tr${_scopeId}><td colspan="9" class="px-3 py-8 text-center text-gray-600"${_scopeId}>No returns match</td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</tbody></table></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "glass-card p-6 text-center text-red-400 text-sm"
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("div", { class: "grid grid-cols-3 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (k) => {
                    return openBlock(), createBlock("div", {
                      key: k.l,
                      class: "glass-card p-3"
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                      createVNode("p", {
                        class: ["text-lg font-bold font-mono", k.cls]
                      }, [
                        createTextVNode(toDisplayString(k.n) + " ", 1),
                        createVNode("span", { class: "text-xs text-gray-600" }, "\xB7 \u09F3" + toDisplayString(n0(k.v)), 1)
                      ], 2)
                    ]);
                  }), 128))
                ]),
                createVNode("div", { class: "glass-card overflow-x-auto" }, [
                  createVNode("table", { class: "w-full text-xs" }, [
                    createVNode("thead", null, [
                      createVNode("tr", { class: "border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500" }, [
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Return"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Date"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Order"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Customer"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Items"),
                        createVNode("th", { class: "px-3 py-2 text-right" }, "Qty"),
                        createVNode("th", { class: "px-3 py-2 text-right" }, "Value \u09F3"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Status"),
                        createVNode("th", { class: "px-3 py-2 text-left no-print" }, "Actions")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(data).returns, (r) => {
                        var _a;
                        return openBlock(), createBlock("tr", {
                          key: r.id,
                          class: "border-b border-white/[0.04] align-top"
                        }, [
                          createVNode("td", { class: "px-3 py-2 font-mono" }, [
                            createTextVNode(toDisplayString(r.return_number), 1),
                            createVNode("div", { class: "text-[10px] text-gray-600" }, toDisplayString(r.return_type) + toDisplayString(r.return_reason ? " \xB7 " + r.return_reason : ""), 1)
                          ]),
                          createVNode("td", { class: "px-3 py-2 whitespace-nowrap" }, toDisplayString(String(r.return_date).slice(0, 10)), 1),
                          createVNode("td", { class: "px-3 py-2" }, [
                            createVNode(_component_NuxtLink, {
                              to: `/credit-sales/${r.order_id}`,
                              class: "text-gold-400 hover:underline"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(r.order_number), 1)
                              ]),
                              _: 2
                            }, 1032, ["to"])
                          ]),
                          createVNode("td", { class: "px-3 py-2" }, toDisplayString(r.customer), 1),
                          createVNode("td", { class: "px-3 py-2 text-gray-400" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(r.items, (i, k) => {
                              return openBlock(), createBlock("div", { key: k }, toDisplayString(i.product) + " " + toDisplayString(i.variant) + " \xD7 " + toDisplayString(i.qty), 1);
                            }), 128))
                          ]),
                          createVNode("td", { class: "px-3 py-2 text-right font-mono" }, toDisplayString(n0(r.qty)), 1),
                          createVNode("td", { class: "px-3 py-2 text-right font-mono" }, toDisplayString(n0(r.amount)), 1),
                          createVNode("td", { class: "px-3 py-2" }, [
                            createVNode("span", {
                              class: stCls(r.status)
                            }, toDisplayString(r.status), 3),
                            createVNode("div", { class: "text-[10px] text-gray-600" }, "by " + toDisplayString((_a = r.created_by) != null ? _a : "\u2014") + toDisplayString(r.approved_by ? " \xB7 decided by " + r.approved_by : ""), 1)
                          ]),
                          createVNode("td", { class: "px-3 py-2 no-print whitespace-nowrap" }, [
                            r.status === "pending" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode("button", {
                                class: "btn-gold text-[11px] px-2.5 py-1 mr-1",
                                disabled: unref(busy),
                                onClick: ($event) => decide(r, "approve")
                              }, "Approve", 8, ["disabled", "onClick"]),
                              createVNode("button", {
                                class: "btn-ghost text-[11px] px-2.5 py-1",
                                disabled: unref(busy),
                                onClick: ($event) => decide(r, "reject")
                              }, "Reject", 8, ["disabled", "onClick"])
                            ], 64)) : createCommentVNode("", true),
                            unref(canDelete) ? (openBlock(), createBlock("button", {
                              key: 1,
                              class: "btn-ghost text-[11px] px-2.5 py-1 text-red-400 ml-1",
                              disabled: unref(busy),
                              onClick: ($event) => remove(r)
                            }, "Delete", 8, ["disabled", "onClick"])) : createCommentVNode("", true)
                          ])
                        ]);
                      }), 128)),
                      !unref(data).returns.length ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "9",
                          class: "px-3 py-8 text-center text-gray-600"
                        }, "No returns match")
                      ])) : createCommentVNode("", true)
                    ])
                  ])
                ])
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/returns.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=returns-CJlMWYsU.mjs.map

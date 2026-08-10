import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { n as navigateTo } from './server.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

function posReceiptHtml(data, copyLabel) {
  const rows = data.items.map((i) => `
    <tr>
      <td style="padding:2px 0">${i.name}</td>
      <td style="text-align:center;padding:2px 4px">${i.qty}</td>
      <td style="text-align:right;padding:2px 0">\u09F3${(i.price * i.qty).toLocaleString()}</td>
    </tr>`).join("");
  const qrBlock = data.verifyUrl ? `
    <div style="display:flex;justify-content:center;margin-top:8px;"><canvas id="exit-qr" width="90" height="90"></canvas></div>
    <p class="c" style="font-size:9px;color:#666;word-break:break-all;">${data.verifyUrl}</p>
    <script src="https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js"><\/script>
    <script>
      window.addEventListener('load', function() {
        try { new QRious({ element: document.getElementById('exit-qr'), value: ${JSON.stringify(data.verifyUrl)}, size: 90, level: 'M' }); } catch (e) {}
      });
    <\/script>` : "";
  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Receipt ${data.receiptNo}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:monospace;font-size:12px;width:300px;margin:0 auto;padding:10px}
      h2{text-align:center;font-size:15px;margin-bottom:2px}
      .c{text-align:center}
      hr{border:none;border-top:1px dashed #000;margin:6px 0}
      table{width:100%;border-collapse:collapse}
      th{font-size:10px;padding:2px 0;border-bottom:1px solid #000}
      .total{font-weight:bold;font-size:13px}
    </style>
  </head><body>
    <h2>Ujjal Flour Mills</h2>
    <p class="c" style="font-size:10px">${copyLabel}</p>
    <hr/>
    <p class="c">${data.receiptNo}</p>
    <p class="c" style="font-size:10px">${(/* @__PURE__ */ new Date()).toLocaleString("en-BD")}</p>
    ${data.customerName ? `<p class="c" style="font-size:11px;margin-top:2px">Customer: ${data.customerName}</p>` : ""}
    <hr/>
    <table>
      <thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">\u09F3${data.subtotal.toLocaleString()}</td></tr>
      ${data.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-\u09F3${data.discount.toLocaleString()}</td></tr>` : ""}
      <tr class="total"><td>TOTAL</td><td style="text-align:right">\u09F3${data.total.toLocaleString()}</td></tr>
      <tr><td style="font-size:10px">Paid now (${data.paymentMethod})</td><td style="text-align:right;font-size:10px">\u09F3${data.cashAmount.toLocaleString()}</td></tr>
      ${data.creditAmount > 0 ? `<tr><td style="font-size:10px">On credit</td><td style="text-align:right;font-size:10px">\u09F3${data.creditAmount.toLocaleString()}</td></tr>` : ""}
    </table>
    ${qrBlock}
    <hr/>
    <p class="c" style="font-size:10px;margin-top:4px">Thank you!</p>
    <script>window.onload=()=>{setTimeout(()=>window.print(),${data.verifyUrl ? 300 : 0})}<\/script>
  </body></html>`;
}
function printPosReceiptCopies(data) {
  for (const label of ["Office Copy", "Customer Copy", "Delivery Copy"]) {
    const win = (void 0).open("", "_blank", "width=420,height=640");
    if (!win) return false;
    win.document.write(posReceiptHtml(data, label));
    win.document.close();
  }
  return true;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "today",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const cols = [
      { key: "order_number", label: "Receipt #", sortable: true },
      { key: "order_date", label: "Time", sortable: true },
      { key: "customer_name", label: "Customer" },
      { key: "item_count", label: "Items" },
      { key: "payment_method", label: "Method" },
      { key: "total_amount", label: "Amount", sortable: true },
      { key: "order_status", label: "Status" },
      { key: "exit", label: "Gate" }
    ];
    const { error: toastError } = useToast();
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pos/today",
      "$dbIvcs81Tb"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const printingId = ref(null);
    async function reprint(row) {
      var _a, _b, _c, _d;
      printingId.value = row.id;
      try {
        const detail = await $fetch(`/api/pos/${row.id}`);
        const items = ((_a = detail.items) != null ? _a : []).map((it) => {
          var _a2;
          return {
            name: `${it.base_name} ${(_a2 = it.weight_variant) != null ? _a2 : ""}`.trim(),
            qty: Number(it.quantity),
            price: Number(it.unit_price)
          };
        });
        const ok = printPosReceiptCopies({
          receiptNo: detail.order.order_number,
          total: Number(detail.order.total_amount),
          subtotal: Number(detail.order.subtotal),
          discount: Number(detail.order.discount_amount),
          cashAmount: Number(detail.order.cash_amount),
          creditAmount: Number(detail.order.credit_amount),
          paymentMethod: detail.order.payment_method,
          customerName: (_b = detail.order.customer_name) != null ? _b : "",
          items,
          verifyUrl: detail.verify_url
        });
        if (!ok) toastError("Allow popups to print all copies.");
      } catch (e) {
        toastError((_d = (_c = e == null ? void 0 : e.data) == null ? void 0 : _c.statusMessage) != null ? _d : "Failed to load receipt for printing");
      } finally {
        printingId.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Today's POS Sales",
        subtitle: "All counter transactions for today",
        breadcrumb: ["POS", `Today's Sales`]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/pos",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F6D2} Open POS`);
                } else {
                  return [
                    createTextVNode("\u{1F6D2} Open POS")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/pos",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F6D2} Open POS")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Transactions</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total_orders) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Revenue</p><p class="text-2xl font-bold text-gold-400">\u09F3${ssrInterpolate(Number((_b = unref(stats).total_revenue) != null ? _b : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Cash</p><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number((_c = unref(stats).cash_total) != null ? _c : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Other Methods</p><p class="text-2xl font-bold text-blue-400">\u09F3${ssrInterpolate(Number((_d = unref(stats).mobile_total) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-5">`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(orders),
        "per-page": 15,
        "search-placeholder": "Search transactions\u2026"
      }, {
        "cell-order_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
            ];
          }
        }),
        "cell-total_amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs font-bold text-gray-200"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs font-bold text-gray-200" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-payment_method": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-400"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(value), 1)
            ];
          }
        }),
        "cell-order_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: value == null ? void 0 : value.toLowerCase()
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, {
                status: value == null ? void 0 : value.toLowerCase()
              }, null, 8, ["status"])
            ];
          }
        }),
        "cell-exit": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (Number(row.credit_amount) > 0) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/pos/exit/${row.id}`,
                class: ["text-[11px] font-medium", row.exit_status === "cleared" ? "text-emerald-400" : "text-red-400 animate-pulse"]
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(row.exit_status === "cleared" ? "\u2705 Cleared" : "\u23F3 Pending Gate")}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(row.exit_status === "cleared" ? "\u2705 Cleared" : "\u23F3 Pending Gate"), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<span class="text-[11px] text-gray-600"${_scopeId}>\u2014</span>`);
            }
          } else {
            return [
              Number(row.credit_amount) > 0 ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: `/pos/exit/${row.id}`,
                class: ["text-[11px] font-medium", row.exit_status === "cleared" ? "text-emerald-400" : "text-red-400 animate-pulse"]
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(row.exit_status === "cleared" ? "\u2705 Cleared" : "\u23F3 Pending Gate"), 1)
                ]),
                _: 2
              }, 1032, ["to", "class"])) : (openBlock(), createBlock("span", {
                key: 1,
                class: "text-[11px] text-gray-600"
              }, "\u2014"))
            ];
          }
        }),
        actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-1.5"${_scopeId}><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>View</button><button${ssrIncludeBooleanAttr(unref(printingId) === row.id) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2 disabled:opacity-40"${_scopeId}>${ssrInterpolate(unref(printingId) === row.id ? "\u2026" : "\u{1F5A8}")}</button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex gap-1.5" }, [
                createVNode("button", {
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/pos/${row.id}`),
                  class: "btn-ghost text-xs py-1 px-2"
                }, "View", 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => reprint(row),
                  disabled: unref(printingId) === row.id,
                  class: "btn-ghost text-xs py-1 px-2 disabled:opacity-40"
                }, toDisplayString(unref(printingId) === row.id ? "\u2026" : "\u{1F5A8}"), 9, ["onClick", "disabled"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/today.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=today-BybS8bXn.mjs.map

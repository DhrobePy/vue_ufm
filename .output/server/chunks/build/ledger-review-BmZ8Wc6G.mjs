import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-DxEkMwEk.mjs';
import { r as reasonLabel, R as REVIEW_REASONS } from './ledgerReview-BfAlWnhR.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, watch, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc, k as useRoute, n as navigateTo } from './server.mjs';
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
  __name: "ledger-review",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    useToast();
    const route = useRoute();
    const view = computed({ get: () => route.query.view === "checks" ? "checks" : "lines", set: (v) => navigateTo({ query: { ...route.query, view: v === "lines" ? void 0 : v } }, { replace: true }) });
    const { data: audit, pending: auditPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ledger/audit",
      { lazy: true, server: false },
      "$86uAD57KSf"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const open = ref("");
    const f = reactive({ status: "review", reason: "", customer_id: (_a = useRoute().query.customer) != null ? _a : "", q: "", page: 1 });
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ledger/review",
      { query: f, watch: [() => f.status, () => f.reason, () => f.customer_id, () => f.q, () => f.page] },
      "$roteV_QV5a"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(() => [f.status, f.reason, f.customer_id, f.q], () => {
      f.page = 1;
      sel.value = [];
    });
    const rows = computed(() => {
      var _a2, _b;
      return (_b = (_a2 = data.value) == null ? void 0 : _a2.rows) != null ? _b : [];
    });
    const sel = ref([]);
    const showCustomers = ref(false);
    const money = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
    const hint = (c) => {
      var _a2, _b;
      return (_b = (_a2 = REVIEW_REASONS[c]) == null ? void 0 : _a2.hint) != null ? _b : "";
    };
    const customerName = computed(() => {
      var _a2, _b, _c, _d;
      return (_d = (_c = ((_b = (_a2 = data.value) == null ? void 0 : _a2.customers) != null ? _b : []).find((c) => String(c.id) === String(f.customer_id))) == null ? void 0 : _c.name) != null ? _d : "customer";
    });
    const reviewable = computed(() => rows.value.filter((r) => r.review_status === "review"));
    const allSelected = computed(() => reviewable.value.length > 0 && reviewable.value.every((r) => sel.value.includes(r.id)));
    const selectedNet = computed(() => rows.value.filter((r) => sel.value.includes(r.id)).reduce((s, r) => s + Number(r.debit) - Number(r.credit), 0));
    const busy = ref(false);
    const del = reactive({ open: false, ids: [], note: "" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4 pb-24" }, _attrs))} data-v-43b3ab53>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Ledger Review",
        subtitle: "Every flagged ledger line \u2014 keep it, or delete it (restorable from the Recycle Bin)",
        breadcrumb: ["Credit Sales", "Ledger Review"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs" data-v-43b3ab53${_scopeId}>\u21BB Refresh</button>`);
          } else {
            return [
              createVNode("button", {
                class: "btn-ghost text-xs",
                onClick: ($event) => unref(refresh)()
              }, "\u21BB Refresh", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex gap-1.5 p-1 rounded-xl w-fit" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-43b3ab53><!--[-->`);
      ssrRenderList([["lines", "Lines to decide"], ["checks", "Other cross-checks"]], (v) => {
        _push(`<button type="button" class="${ssrRenderClass([unref(view) === v[0] ? "btn-gold" : "text-gray-400 hover:text-gray-100", "px-3 py-1.5 rounded-lg text-xs font-semibold"])}" data-v-43b3ab53>${ssrInterpolate(v[1])}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(view) === "checks") {
        _push(`<div class="space-y-3" data-v-43b3ab53>`);
        if (unref(auditPending)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-43b3ab53>Running the checks\u2026</div>`);
        } else if (unref(audit)) {
          _push(`<!--[--><div class="flex flex-wrap items-center gap-2" data-v-43b3ab53><p class="text-xs text-gray-500" data-v-43b3ab53>${ssrInterpolate(unref(audit).exceptions.length)} item(s) in ${ssrInterpolate(unref(audit).groups.length)} group(s). These are not lines to delete \u2014 each needs an explanation or a missing record.</p><span class="flex-1" data-v-43b3ab53></span><button class="btn-ghost text-xs" data-v-43b3ab53>\u2B07\uFE0F CSV</button></div><!--[-->`);
          ssrRenderList(unref(audit).groups, (g) => {
            _push(`<div class="glass-card p-0 overflow-hidden" data-v-43b3ab53><button class="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left" data-v-43b3ab53><span class="${ssrRenderClass(["sev-" + g.severity, "sev"])}" data-v-43b3ab53>${ssrInterpolate(g.severity)}</span><span class="text-sm font-semibold text-gray-200 flex-1 min-w-[200px]" data-v-43b3ab53>${ssrInterpolate(g.title)}</span><span class="text-xs text-gray-500" data-v-43b3ab53>${ssrInterpolate(g.n)} item(s) \xB7 ${ssrInterpolate(g.customers)} customer(s) \xB7 \u09F3${ssrInterpolate(money(g.amount))}</span><span class="text-gray-600" data-v-43b3ab53>${ssrInterpolate(unref(open) === g.code ? "\u25BE" : "\u25B8")}</span></button>`);
            if (unref(open) === g.code) {
              _push(`<div class="border-t border-white/[0.06] overflow-x-auto" data-v-43b3ab53><table class="w-full text-xs min-w-[640px]" data-v-43b3ab53><tbody class="divide-y divide-white/[0.04]" data-v-43b3ab53><!--[-->`);
              ssrRenderList(unref(audit).exceptions.filter((x) => x.code === g.code).slice(0, 200), (e, i) => {
                _push(`<tr class="hover:bg-white/[0.02]" data-v-43b3ab53><td class="p-2.5" data-v-43b3ab53>`);
                if (e.customer_id) {
                  _push(ssrRenderComponent(_component_NuxtLink, {
                    to: `/customers/${e.customer_id}?tab=ledger`,
                    class: "text-gray-200 hover:underline"
                  }, {
                    default: withCtx((_, _push2, _parent2, _scopeId) => {
                      if (_push2) {
                        _push2(`${ssrInterpolate(e.customer)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(e.customer), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent));
                } else {
                  _push(`<span class="text-gray-500" data-v-43b3ab53>${ssrInterpolate(e.customer)}</span>`);
                }
                _push(`</td><td class="p-2.5 font-mono text-gray-400 whitespace-nowrap" data-v-43b3ab53>${ssrInterpolate(e.ref)}</td><td class="p-2.5 font-mono text-gray-500 whitespace-nowrap" data-v-43b3ab53>${ssrInterpolate(e.date)}</td><td class="p-2.5 text-right font-mono whitespace-nowrap" data-v-43b3ab53>\u09F3${ssrInterpolate(money(e.amount))}</td><td class="p-2.5 text-gray-500" data-v-43b3ab53>${ssrInterpolate(e.detail)}</td></tr>`);
              });
              _push(`<!--]--></tbody></table>`);
              if (unref(audit).exceptions.filter((x) => x.code === g.code).length > 200) {
                _push(`<p class="p-2.5 text-[11px] text-gray-600" data-v-43b3ab53>Showing the first 200 \u2014 download the CSV for all.</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(view) === "lines") {
        _push(`<div class="glass-card p-4 space-y-3" data-v-43b3ab53><div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-400" data-v-43b3ab53><span data-v-43b3ab53><strong class="text-lg font-mono text-amber-400" data-v-43b3ab53>${ssrInterpolate((_b = (_a2 = unref(data)) == null ? void 0 : _a2.pending) != null ? _b : 0)}</strong> line(s) waiting for a decision</span>`);
        if (unref(data)) {
          _push(`<span data-v-43b3ab53>showing <strong class="font-mono text-gray-200" data-v-43b3ab53>${ssrInterpolate(unref(data).total)}</strong> \xB7 net <strong class="${ssrRenderClass([unref(data).net > 0 ? "text-red-400" : "text-emerald-400", "font-mono"])}" data-v-43b3ab53>\u09F3${ssrInterpolate(money(unref(data).net))}</strong></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex flex-wrap gap-1.5" data-v-43b3ab53><button type="button" class="${ssrRenderClass([!unref(f).reason ? "chip-on" : "", "chip"])}" data-v-43b3ab53>All reasons</button><!--[-->`);
        ssrRenderList((_d = (_c = unref(data)) == null ? void 0 : _c.byReason) != null ? _d : [], (r) => {
          _push(`<button type="button" class="${ssrRenderClass([unref(f).reason === r.reason ? "chip-on" : "", "chip"])}"${ssrRenderAttr("title", hint(r.reason))} data-v-43b3ab53>${ssrInterpolate(("reasonLabel" in _ctx ? _ctx.reasonLabel : unref(reasonLabel))(r.reason))} <span class="opacity-60" data-v-43b3ab53>${ssrInterpolate(r.n)}</span></button>`);
        });
        _push(`<!--]--></div><div class="flex flex-wrap items-center gap-2" data-v-43b3ab53><select class="input-glass text-xs" data-v-43b3ab53><option value="review" data-v-43b3ab53${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, "review") : ssrLooseEqual(unref(f).status, "review")) ? " selected" : ""}>To review</option><option value="kept" data-v-43b3ab53${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, "kept") : ssrLooseEqual(unref(f).status, "kept")) ? " selected" : ""}>Kept</option><option value="all" data-v-43b3ab53${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, "all") : ssrLooseEqual(unref(f).status, "all")) ? " selected" : ""}>All reviewed &amp; pending</option></select><input${ssrRenderAttr("value", unref(f).q)} class="input-glass text-xs w-full sm:w-64" placeholder="Search customer / reference / description" data-v-43b3ab53>`);
        if (unref(f).customer_id !== "") {
          _push(`<button class="chip chip-on" data-v-43b3ab53>\u2715 ${ssrInterpolate(unref(customerName))}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(view) === "lines") {
        _push(`<div class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start" data-v-43b3ab53><div class="glass-card p-0 overflow-hidden" data-v-43b3ab53><button class="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-300 xl:cursor-default" data-v-43b3ab53><span data-v-43b3ab53>Customers with flagged lines (${ssrInterpolate((_g = (_f = (_e = unref(data)) == null ? void 0 : _e.customers) == null ? void 0 : _f.length) != null ? _g : 0)})</span><span class="xl:hidden" data-v-43b3ab53>${ssrInterpolate(unref(showCustomers) ? "\u25BE" : "\u25B8")}</span></button><div class="${ssrRenderClass([unref(showCustomers) ? "block" : "hidden xl:block", "max-h-[60vh] overflow-y-auto divide-y divide-white/[0.05]"])}" data-v-43b3ab53><!--[-->`);
        ssrRenderList((_i = (_h = unref(data)) == null ? void 0 : _h.customers) != null ? _i : [], (c) => {
          _push(`<button type="button" class="${ssrRenderClass([String(unref(f).customer_id) === String(c.id) ? "bg-white/[0.06]" : "", "w-full text-left px-4 py-2.5 hover:bg-white/[0.04]"])}" data-v-43b3ab53><div class="flex items-center justify-between gap-2" data-v-43b3ab53><span class="text-xs font-semibold text-gray-200 truncate" data-v-43b3ab53>${ssrInterpolate(c.name)}</span><span class="text-[10px] text-amber-400 shrink-0" data-v-43b3ab53>${ssrInterpolate(c.flagged)} flagged</span></div><div class="flex justify-between text-[11px] text-gray-500 mt-0.5" data-v-43b3ab53><span data-v-43b3ab53>now <b class="font-mono text-gray-300" data-v-43b3ab53>\u09F3${ssrInterpolate(money(c.balance_now))}</b></span><span title="Balance if every flagged line were deleted. For Pilot-period / Not-in-legacy lines this equals what the legacy app shows." data-v-43b3ab53>if cleared <b class="font-mono text-emerald-400" data-v-43b3ab53>\u09F3${ssrInterpolate(money(c.balance_without_flagged))}</b></span></div></button>`);
        });
        _push(`<!--]-->`);
        if (!((_k = (_j = unref(data)) == null ? void 0 : _j.customers) == null ? void 0 : _k.length)) {
          _push(`<p class="p-4 text-xs text-gray-600 text-center" data-v-43b3ab53>Nothing waiting \u{1F389}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-3 min-w-0" data-v-43b3ab53>`);
        if (unref(pending)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-43b3ab53>Loading\u2026</div>`);
        } else if (!unref(rows).length) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-43b3ab53>No lines match.</div>`);
        } else {
          _push(`<div class="hidden md:block glass-card p-0 overflow-x-auto" data-v-43b3ab53><table class="w-full text-xs min-w-[760px]" data-v-43b3ab53><thead data-v-43b3ab53><tr class="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-gray-600" data-v-43b3ab53><th class="p-3 w-8" data-v-43b3ab53><input type="checkbox"${ssrIncludeBooleanAttr(unref(allSelected)) ? " checked" : ""}${ssrIncludeBooleanAttr(unref(f).status === "kept") ? " disabled" : ""} data-v-43b3ab53></th><th class="p-3 text-left" data-v-43b3ab53>Date</th><th class="p-3 text-left" data-v-43b3ab53>Customer</th><th class="p-3 text-left" data-v-43b3ab53>Line</th><th class="p-3 text-right" data-v-43b3ab53>Debit</th><th class="p-3 text-right" data-v-43b3ab53>Credit</th><th class="p-3 text-left" data-v-43b3ab53>Why flagged</th><th class="p-3 w-28" data-v-43b3ab53></th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-43b3ab53><!--[-->`);
          ssrRenderList(unref(rows), (r) => {
            _push(`<tr class="hover:bg-white/[0.02] align-top" data-v-43b3ab53><td class="p-3" data-v-43b3ab53>`);
            if (r.review_status === "review") {
              _push(`<input${ssrIncludeBooleanAttr(Array.isArray(unref(sel)) ? ssrLooseContain(unref(sel), r.id) : unref(sel)) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", r.id)} data-v-43b3ab53>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td><td class="p-3 whitespace-nowrap text-gray-500 font-mono" data-v-43b3ab53>${ssrInterpolate(r.date)}</td><td class="p-3" data-v-43b3ab53>`);
            if (r.customer_id) {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/customers/${r.customer_id}?tab=ledger`,
                class: "text-gray-200 hover:underline"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(r.customer)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(r.customer), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span class="text-gray-500" data-v-43b3ab53>${ssrInterpolate(r.customer)}</span>`);
            }
            _push(`</td><td class="p-3 max-w-[320px]" data-v-43b3ab53><div class="text-gray-300" data-v-43b3ab53>`);
            if (r.linked_order_id) {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${r.linked_order_id}`,
                class: "font-mono text-gold-400/90 hover:underline"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(r.ref)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(r.ref), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span class="font-mono" data-v-43b3ab53>${ssrInterpolate(r.ref || r.type)}</span>`);
            }
            _push(` <span class="text-gray-600" data-v-43b3ab53>\xB7 ${ssrInterpolate(String(r.type).replace(/_/g, " "))}</span></div><div class="text-gray-600 truncate"${ssrRenderAttr("title", r.description)} data-v-43b3ab53>${ssrInterpolate(r.description)}</div></td><td class="p-3 text-right font-mono" data-v-43b3ab53>${ssrInterpolate(Number(r.debit) ? money(r.debit) : "")}</td><td class="p-3 text-right font-mono text-emerald-400" data-v-43b3ab53>${ssrInterpolate(Number(r.credit) ? money(r.credit) : "")}</td><td class="p-3" data-v-43b3ab53><span class="badge"${ssrRenderAttr("title", hint(r.review_reason))} data-v-43b3ab53>${ssrInterpolate(("reasonLabel" in _ctx ? _ctx.reasonLabel : unref(reasonLabel))(r.review_reason))}</span>`);
            if (r.review_status === "kept") {
              _push(`<p class="text-[10px] text-emerald-500 mt-1" data-v-43b3ab53>\u2713 kept${ssrInterpolate(r.reviewed_by ? " by " + r.reviewed_by : "")}${ssrInterpolate(r.review_note ? " \u2014 " + r.review_note : "")}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td><td class="p-3 text-right whitespace-nowrap" data-v-43b3ab53>`);
            if (r.review_status === "review") {
              _push(`<!--[--><button class="btn-ghost text-[11px] py-1 px-2" data-v-43b3ab53>Keep</button><button class="text-[11px] py-1 px-2 rounded-lg text-red-400 hover:bg-red-500/10" data-v-43b3ab53>Delete</button><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        if (unref(rows).length) {
          _push(`<div class="md:hidden space-y-2" data-v-43b3ab53><!--[-->`);
          ssrRenderList(unref(rows), (r) => {
            _push(`<div class="glass-card p-3 text-xs space-y-1.5" data-v-43b3ab53><div class="flex items-start gap-2" data-v-43b3ab53>`);
            if (r.review_status === "review") {
              _push(`<input${ssrIncludeBooleanAttr(Array.isArray(unref(sel)) ? ssrLooseContain(unref(sel), r.id) : unref(sel)) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", r.id)} class="mt-0.5" data-v-43b3ab53>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="min-w-0 flex-1" data-v-43b3ab53><p class="font-semibold text-gray-200 truncate" data-v-43b3ab53>${ssrInterpolate(r.customer)}</p><p class="text-gray-500" data-v-43b3ab53><span class="font-mono" data-v-43b3ab53>${ssrInterpolate(r.date)}</span> \xB7 ${ssrInterpolate(String(r.type).replace(/_/g, " "))} \xB7 <span class="font-mono" data-v-43b3ab53>${ssrInterpolate(r.ref)}</span></p></div><span class="${ssrRenderClass([Number(r.credit) ? "text-emerald-400" : "text-gray-200", "font-mono font-bold shrink-0"])}" data-v-43b3ab53>\u09F3${ssrInterpolate(money(Number(r.debit) || Number(r.credit)))}${ssrInterpolate(Number(r.credit) ? " Cr" : "")}</span></div><p class="text-gray-600 break-words" data-v-43b3ab53>${ssrInterpolate(r.description)}</p><div class="flex flex-wrap items-center gap-2" data-v-43b3ab53><span class="badge" data-v-43b3ab53>${ssrInterpolate(("reasonLabel" in _ctx ? _ctx.reasonLabel : unref(reasonLabel))(r.review_reason))}</span>`);
            if (r.review_status === "kept") {
              _push(`<span class="text-emerald-500 text-[10px]" data-v-43b3ab53>\u2713 kept</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<span class="flex-1" data-v-43b3ab53></span>`);
            if (r.review_status === "review") {
              _push(`<!--[--><button class="btn-ghost text-[11px] py-1 px-2" data-v-43b3ab53>Keep</button><button class="text-[11px] py-1 px-2 rounded-lg text-red-400 border border-red-500/30" data-v-43b3ab53>Delete</button><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(data) && unref(data).total > unref(data).per) {
          _push(`<div class="flex items-center justify-between text-xs text-gray-500" data-v-43b3ab53><button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(f).page <= 1) ? " disabled" : ""} data-v-43b3ab53>\u2190 Prev</button><span data-v-43b3ab53>Page ${ssrInterpolate(unref(f).page)} / ${ssrInterpolate(Math.ceil(unref(data).total / unref(data).per))}</span><button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(f).page >= Math.ceil(unref(data).total / unref(data).per)) ? " disabled" : ""} data-v-43b3ab53>Next \u2192</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sel).length) {
        _push(`<div class="fixed bottom-3 left-3 right-3 lg:left-[280px] z-40 glass-card px-4 py-3 flex flex-wrap items-center gap-3" style="${ssrRenderStyle({ "background": "rgba(22,18,14,0.97)" })}" data-v-43b3ab53><span class="text-xs text-gray-300" data-v-43b3ab53><b data-v-43b3ab53>${ssrInterpolate(unref(sel).length)}</b> selected \xB7 net <b class="font-mono" data-v-43b3ab53>\u09F3${ssrInterpolate(money(unref(selectedNet)))}</b></span><span class="flex-1" data-v-43b3ab53></span><button class="btn-ghost text-xs" data-v-43b3ab53>Clear</button><button class="btn-gold text-xs" data-v-43b3ab53>\u2713 Keep selected</button><button class="text-xs px-4 py-2 rounded-xl font-semibold bg-red-600 text-white" data-v-43b3ab53>\u{1F5D1} Delete selected</button></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(del).open) {
          _push2(`<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-v-43b3ab53><form class="glass-card p-5 w-full max-w-md space-y-3" data-v-43b3ab53><h3 class="font-bold text-red-400" data-v-43b3ab53>\u{1F5D1} Delete ${ssrInterpolate(unref(del).ids.length)} ledger line(s)?</h3><p class="text-xs text-gray-400" data-v-43b3ab53>The lines \u2014 and their journal entries when nothing else uses them \u2014 move to the Recycle Bin as one batch you can restore. Each customer&#39;s balance is recalculated. The order or payment the line belonged to is <b data-v-43b3ab53>not</b> touched.</p><textarea rows="2" class="input-glass w-full resize-none" placeholder="Reason (required) \u2014 e.g. checked with legacy, entered by mistake" required data-v-43b3ab53>${ssrInterpolate(unref(del).note)}</textarea><div class="flex justify-end gap-2" data-v-43b3ab53><button type="button" class="btn-ghost text-xs" data-v-43b3ab53>Cancel</button><button class="text-xs px-4 py-2 rounded-xl font-semibold bg-red-600 text-white"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""} data-v-43b3ab53>${ssrInterpolate(unref(busy) ? "Deleting\u2026" : "Delete")}</button></div></form></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/ledger-review.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ledgerReview = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-43b3ab53"]]);

export { ledgerReview as default };
//# sourceMappingURL=ledger-review-BmZ8Wc6G.mjs.map

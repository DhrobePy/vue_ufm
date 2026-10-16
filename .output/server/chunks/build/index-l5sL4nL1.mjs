import { _ as __nuxt_component_0 } from './nuxt-link-DxEkMwEk.mjs';
import { _ as _sfc_main$1 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { R as REVIEW_REASONS, r as reasonLabel } from './ledgerReview-BfAlWnhR.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, createSlots, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, l as useRouter, q as useUserSession } from './server.mjs';
import { u as usePermissions } from './usePermissions-0FBklcsN.mjs';
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
import './permRoutes-9jg1aj2_.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const router = useRouter();
    const perms = usePermissions();
    const { success, error: toastError } = useToast();
    const { user: me } = useUserSession();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(String((_b = (_a = me.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const can = (path) => perms.canAccessRoute(path);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/customers/${route.params.id}/profile`,
      "$5dQdnDersU"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const p = computed(() => data.value);
    const c = computed(() => {
      var _a, _b;
      return (_b = (_a = p.value) == null ? void 0 : _a.customer) != null ? _b : {};
    });
    const credit = computed(() => {
      var _a, _b;
      return (_b = (_a = p.value) == null ? void 0 : _a.credit) != null ? _b : {};
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = p.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const money = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
    const day = (v) => {
      const m = String(v != null ? v : "").match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "\u2014";
    };
    const stamp = (v) => String(v != null ? v : "").replace("T", " ").slice(0, 16);
    const tabs = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      return [
        { id: "overview", label: "Overview" },
        { id: "orders", label: "Orders", n: (_b = (_a = p.value) == null ? void 0 : _a.orders) == null ? void 0 : _b.length },
        { id: "ledger", label: "Ledger" },
        { id: "payments", label: "Payments", n: stats.value.payments },
        { id: "changes", label: "Returns & Amendments", n: ((_e = (_d = (_c = p.value) == null ? void 0 : _c.returns) == null ? void 0 : _d.length) != null ? _e : 0) + ((_h = (_g = (_f = p.value) == null ? void 0 : _f.amendments) == null ? void 0 : _g.length) != null ? _h : 0) },
        { id: "products", label: "Products" },
        { id: "notes", label: "Notes", n: (_j = (_i = p.value) == null ? void 0 : _i.notes) == null ? void 0 : _j.length },
        { id: "activity", label: "Activity" }
      ];
    });
    const tab = computed({
      get: () => tabs.value.some((t) => t.id === route.query.tab) ? String(route.query.tab) : "overview",
      set: (v) => router.replace({ query: { ...route.query, tab: v === "overview" ? void 0 : v } })
    });
    const ledgerDebit = computed(() => {
      var _a, _b, _c;
      return Number((_c = (_b = (_a = p.value) == null ? void 0 : _a.ledgerTotals) == null ? void 0 : _b.debit) != null ? _c : 0);
    });
    const ledgerCredit = computed(() => {
      var _a, _b, _c;
      return Number((_c = (_b = (_a = p.value) == null ? void 0 : _a.ledgerTotals) == null ? void 0 : _b.credit) != null ? _c : 0);
    });
    const ageBuckets = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      return [
        { label: "0\u201330 days", v: Number((_c = (_b = (_a = p.value) == null ? void 0 : _a.ageing) == null ? void 0 : _b.d0) != null ? _c : 0), color: "#10b981" },
        { label: "31\u201360 days", v: Number((_f = (_e = (_d = p.value) == null ? void 0 : _d.ageing) == null ? void 0 : _e.d31) != null ? _f : 0), color: "#f59e0b" },
        { label: "61\u201390 days", v: Number((_i = (_h = (_g = p.value) == null ? void 0 : _g.ageing) == null ? void 0 : _h.d61) != null ? _i : 0), color: "#f97316", bad: true },
        { label: "Over 90 days", v: Number((_l = (_k = (_j = p.value) == null ? void 0 : _j.ageing) == null ? void 0 : _k.d90) != null ? _l : 0), color: "#ef4444", bad: true }
      ];
    });
    const ageTotal = computed(() => ageBuckets.value.reduce((s, b) => s + b.v, 0));
    const months = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      const by = new Map(((_b = (_a = p.value) == null ? void 0 : _a.monthly) != null ? _b : []).map((m) => [m.m, m]));
      const out = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        out.push({
          key,
          total: Number((_d = (_c = by.get(key)) == null ? void 0 : _c.total) != null ? _d : 0),
          n: Number((_f = (_e = by.get(key)) == null ? void 0 : _e.n) != null ? _f : 0),
          short: d.toLocaleDateString("en-GB", { month: "short" }),
          label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
        });
      }
      return out;
    });
    const monthMax = computed(() => Math.max(0, ...months.value.map((m) => m.total)));
    const monthTotal = computed(() => months.value.reduce((s, m) => s + m.total, 0));
    const openOrders = computed(() => {
      var _a, _b;
      return ((_b = (_a = p.value) == null ? void 0 : _a.orders) != null ? _b : []).filter((o) => Number(o.balance_due) > 0 && !["cancelled", "rejected", "draft"].includes(o.status)).slice(0, 6);
    });
    const orderFilter = ref("all");
    const orderFilters = computed(() => {
      var _a, _b;
      const os = (_b = (_a = p.value) == null ? void 0 : _a.orders) != null ? _b : [];
      const n = (f) => os.filter(f).length;
      return [
        { id: "all", label: "All", n: os.length },
        { id: "open", label: "In progress", n: n((o) => !["delivered", "completed", "cancelled", "rejected", "draft"].includes(o.status)) },
        { id: "due", label: "With balance", n: n((o) => Number(o.balance_due) > 0 && !["cancelled", "rejected", "draft"].includes(o.status)) },
        { id: "done", label: "Delivered", n: n((o) => ["delivered", "completed"].includes(o.status)) },
        { id: "closed", label: "Cancelled / rejected", n: n((o) => ["cancelled", "rejected"].includes(o.status)) }
      ];
    });
    const filteredOrders = computed(() => {
      var _a, _b;
      const os = (_b = (_a = p.value) == null ? void 0 : _a.orders) != null ? _b : [];
      switch (orderFilter.value) {
        case "open":
          return os.filter((o) => !["delivered", "completed", "cancelled", "rejected", "draft"].includes(o.status));
        case "due":
          return os.filter((o) => Number(o.balance_due) > 0 && !["cancelled", "rejected", "draft"].includes(o.status));
        case "done":
          return os.filter((o) => ["delivered", "completed"].includes(o.status));
        case "closed":
          return os.filter((o) => ["cancelled", "rejected"].includes(o.status));
        default:
          return os;
      }
    });
    const orderCols = [
      { key: "order_number", label: "Order #", sortable: true },
      { key: "order_date", label: "Date", sortable: true },
      { key: "status", label: "Status" },
      { key: "total_amount", label: "Total", sortable: true },
      { key: "amount_paid", label: "Paid" },
      { key: "balance_due", label: "Balance", sortable: true }
    ];
    const ledgerCols = [
      { key: "date", label: "Date", sortable: true },
      { key: "type", label: "Type" },
      { key: "ref", label: "Reference" },
      { key: "description", label: "Description" },
      { key: "debit", label: "Debit" },
      { key: "credit", label: "Credit" },
      { key: "balance", label: "Balance" }
    ];
    const payCols = [
      { key: "payment_date", label: "Date", sortable: true },
      { key: "payment_number", label: "Payment #" },
      { key: "payment_method", label: "Method" },
      { key: "reference_number", label: "Reference" },
      { key: "amount", label: "Amount", sortable: true },
      { key: "collected_by", label: "Collected by" },
      { key: "reversed_at", label: "Status" }
    ];
    const menuOpen = ref(false);
    ref(null);
    const statusDlg = reactive({ open: false, target: "inactive", reason: "", busy: false });
    const limitDlg = reactive({ open: false, value: 0, busy: false });
    async function reviewLine(row, action) {
      var _a, _b;
      let note = "";
      if (action === "delete") {
        const r = prompt(`Delete this ledger line (\u09F3${money(Number(row.debit) || Number(row.credit))} ${Number(row.credit) ? "credit" : "debit"}, ${day(row.date)})?
It moves to the Recycle Bin and can be restored.

Reason (required):`);
        if (!r || r.trim().length < 3) return;
        note = r.trim();
      }
      try {
        await $fetch("/api/ledger/review", { method: "POST", body: { ids: [row.id], action, note } });
        success(action === "keep" ? "Line kept" : "Line moved to the Recycle Bin");
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Could not save the decision");
      }
    }
    const deleteOpen = ref(false);
    const busyDelete = ref(false);
    const newNote = ref("");
    const noteBusy = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))} data-v-0a4e99c3>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-0a4e99c3>Loading customer\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-0a4e99c3>\u26A0 ${ssrInterpolate((_a = unref(error).statusMessage) != null ? _a : unref(error).message)}</div>`);
      } else if (unref(p)) {
        _push(`<!--[--><p class="text-xs text-gray-600" data-v-0a4e99c3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/customers",
          class: "hover:text-gray-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Customers`);
            } else {
              return [
                createTextVNode("Customers")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` <span class="mx-1" data-v-0a4e99c3>/</span> <span class="text-gray-400" data-v-0a4e99c3>${ssrInterpolate(unref(c).name)}</span></p><div class="glass-card p-5 relative z-20" data-v-0a4e99c3><div class="flex flex-wrap items-start gap-4" data-v-0a4e99c3><div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,var(--accent-from),var(--accent-to))", "color": "var(--accent-text)" })}" data-v-0a4e99c3>${ssrInterpolate((unref(c).name || "?")[0])}</div><div class="min-w-0 flex-1" data-v-0a4e99c3><div class="flex flex-wrap items-center gap-2" data-v-0a4e99c3><h1 class="text-lg font-bold text-gray-100 leading-tight" data-v-0a4e99c3>${ssrInterpolate(unref(c).name)}</h1>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(c).status
        }, null, _parent));
        _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-gray-400" data-v-0a4e99c3>${ssrInterpolate(unref(c).customer_type)}</span><span class="text-[11px] text-gray-600 font-mono" data-v-0a4e99c3>ID #${ssrInterpolate(unref(c).id)}</span></div>`);
        if (unref(c).business_name) {
          _push(`<p class="text-xs text-gray-500 mt-0.5" data-v-0a4e99c3>${ssrInterpolate(unref(c).business_name)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-400" data-v-0a4e99c3>`);
        if (unref(c).phone_number) {
          _push(`<a${ssrRenderAttr("href", `tel:${unref(c).phone_number}`)} class="hover:text-gold-400" data-v-0a4e99c3>\u{1F4DE} ${ssrInterpolate(unref(c).phone_number)}</a>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).email) {
          _push(`<a${ssrRenderAttr("href", `mailto:${unref(c).email}`)} class="hover:text-gold-400" data-v-0a4e99c3>\u2709\uFE0F ${ssrInterpolate(unref(c).email)}</a>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).business_address) {
          _push(`<span data-v-0a4e99c3>\u{1F4CD} ${ssrInterpolate(unref(c).business_address)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).created_at) {
          _push(`<span class="text-gray-600" data-v-0a4e99c3>Customer since ${ssrInterpolate(day(unref(c).created_at))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="flex flex-wrap items-center gap-2" data-v-0a4e99c3>`);
        if (unref(p).can.createOrder && unref(c).status === "active") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/create?customer=${unref(c).id}`,
            class: "btn-gold text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`+ New Order`);
              } else {
                return [
                  createTextVNode("+ New Order")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(p).can.collect) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/collect?customer=${unref(c).id}`,
            class: "btn-ghost text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F4B0} Collect Payment`);
              } else {
                return [
                  createTextVNode("\u{1F4B0} Collect Payment")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/customers/${unref(c).id}/statement`,
          class: "btn-ghost text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F9FE} Statement`);
            } else {
              return [
                createTextVNode("\u{1F9FE} Statement")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(p).can.edit) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/customers/${unref(c).id}/edit`,
            class: "btn-ghost text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u270F\uFE0F Edit`);
              } else {
                return [
                  createTextVNode("\u270F\uFE0F Edit")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="relative" data-v-0a4e99c3><button class="btn-ghost text-xs" data-v-0a4e99c3>\u22EF More</button>`);
        if (unref(menuOpen)) {
          _push(`<div class="absolute right-0 mt-1.5 w-60 rounded-xl py-1.5 z-30 text-xs" style="${ssrRenderStyle({ "background": "rgba(22,18,14,0.98)", "border": "1px solid rgba(255,255,255,0.1)", "box-shadow": "0 12px 40px rgba(0,0,0,0.6)" })}" data-v-0a4e99c3>`);
          if (can("/credit-sales/ledger")) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/ledger?customer=${unref(c).id}`,
              class: "menu-item",
              onClick: ($event) => menuOpen.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u{1F4D2} Full ledger &amp; adjustments`);
                } else {
                  return [
                    createTextVNode("\u{1F4D2} Full ledger & adjustments")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (can("/credit-sales/all")) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/all?search=${encodeURIComponent(unref(c).name)}`,
              class: "menu-item",
              onClick: ($event) => menuOpen.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u{1F4CB} Orders in All Sales`);
                } else {
                  return [
                    createTextVNode("\u{1F4CB} Orders in All Sales")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (can("/credit-sales/payments")) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/payments?search=${encodeURIComponent(unref(c).name)}`,
              class: "menu-item",
              onClick: ($event) => menuOpen.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u{1F4B3} Payment history`);
                } else {
                  return [
                    createTextVNode("\u{1F4B3} Payment history")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (can("/credit-sales/ageing")) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: "/credit-sales/ageing",
              class: "menu-item",
              onClick: ($event) => menuOpen.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u23F3 Ageing report`);
                } else {
                  return [
                    createTextVNode("\u23F3 Ageing report")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (unref(p).can.creditLimit) {
            _push(`<button class="menu-item" data-v-0a4e99c3>\u{1F39A}\uFE0F Change credit limit</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="menu-item" data-v-0a4e99c3>\u2B07\uFE0F Export ledger (CSV)</button><button class="menu-item" data-v-0a4e99c3>\u{1F5A8}\uFE0F Print profile</button>`);
          if (unref(p).can.status || unref(p).can.delete) {
            _push(`<div class="my-1 border-t border-white/[0.07]" data-v-0a4e99c3></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(p).can.status && unref(c).status !== "active") {
            _push(`<button class="menu-item text-emerald-400" data-v-0a4e99c3>\u2705 Reactivate customer</button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(p).can.status && unref(c).status === "active") {
            _push(`<button class="menu-item" data-v-0a4e99c3>\u23F8\uFE0F Mark inactive</button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(p).can.status && unref(c).status !== "blacklisted") {
            _push(`<button class="menu-item text-red-400" data-v-0a4e99c3>\u{1F6AB} Blacklist</button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(p).can.delete) {
            _push(`<button class="menu-item text-red-400" data-v-0a4e99c3>\u{1F5D1}\uFE0F Delete customer\u2026</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div>`);
        if (unref(c).status !== "active") {
          _push(`<div class="${ssrRenderClass([unref(c).status === "blacklisted" ? "bg-red-500/10 border border-red-500/30 text-red-300" : "bg-gray-500/10 border border-gray-500/25 text-gray-300", "rounded-xl px-4 py-3 text-xs flex items-center gap-2"])}" data-v-0a4e99c3><strong data-v-0a4e99c3>${ssrInterpolate(unref(c).status === "blacklisted" ? "\u{1F6AB} Blacklisted" : "\u23F8\uFE0F Inactive")}</strong> \u2014 new orders are blocked for this customer. `);
          if (unref(p).can.status) {
            _push(`<button class="ml-auto underline" data-v-0a4e99c3>Reactivate</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(credit).limit > 0 && unref(credit).usagePct > 100) {
          _push(`<div class="rounded-xl px-4 py-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300" data-v-0a4e99c3> \u26A0 Over credit limit \u2014 exposure \u09F3${ssrInterpolate(money(unref(credit).exposure))} against a limit of \u09F3${ssrInterpolate(money(unref(credit).limit))}. New orders will be escalated. </div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(p).ageing.d90) > 0) {
          _push(`<div class="rounded-xl px-4 py-3 text-xs bg-red-500/10 border border-red-500/25 text-red-300" data-v-0a4e99c3> \u23F0 \u09F3${ssrInterpolate(money(unref(p).ageing.d90))} is more than 90 days old. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-2 lg:grid-cols-6 gap-3" data-v-0a4e99c3><div class="glass-card p-4" data-v-0a4e99c3><p class="kpi-label" data-v-0a4e99c3>Outstanding</p><p class="${ssrRenderClass([unref(credit).outstanding > 0 ? "text-red-400" : "text-emerald-400", "kpi-value"])}" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(credit).outstanding))}</p><p class="kpi-sub" data-v-0a4e99c3>per ledger</p></div><div class="glass-card p-4" data-v-0a4e99c3><p class="kpi-label" data-v-0a4e99c3>Credit limit</p><p class="kpi-value text-gray-100" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(credit).limit))}</p><div class="h-1.5 rounded-full bg-white/[0.07] mt-2 overflow-hidden" data-v-0a4e99c3><div class="h-full rounded-full" style="${ssrRenderStyle(`width:${Math.min(100, unref(credit).usagePct)}%;background:${unref(credit).usagePct > 100 ? "#ef4444" : unref(credit).usagePct > 80 ? "#f59e0b" : "#10b981"}`)}" data-v-0a4e99c3></div></div><p class="kpi-sub" data-v-0a4e99c3>${ssrInterpolate(unref(credit).usagePct > 900 ? "no limit set" : unref(credit).usagePct + "% used")}</p></div><div class="glass-card p-4" data-v-0a4e99c3><p class="kpi-label" data-v-0a4e99c3>Available</p><p class="kpi-value text-emerald-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(credit).available))}</p><p class="kpi-sub" data-v-0a4e99c3>after open orders</p></div><div class="glass-card p-4" data-v-0a4e99c3><p class="kpi-label" data-v-0a4e99c3>Open orders</p><p class="kpi-value text-sky-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(credit).pending))}</p><p class="kpi-sub" data-v-0a4e99c3>${ssrInterpolate((_b = unref(stats).open_orders) != null ? _b : 0)} not yet invoiced / delivered</p></div><div class="glass-card p-4" data-v-0a4e99c3><p class="kpi-label" data-v-0a4e99c3>Lifetime sales</p><p class="kpi-value text-gray-100" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(stats).sales))}</p><p class="kpi-sub" data-v-0a4e99c3>${ssrInterpolate((_c = unref(stats).orders) != null ? _c : 0)} orders \xB7 avg \u09F3${ssrInterpolate(money(unref(stats).avg_order))}</p></div><div class="glass-card p-4" data-v-0a4e99c3><p class="kpi-label" data-v-0a4e99c3>Last payment</p><p class="kpi-value text-gray-100" data-v-0a4e99c3>${ssrInterpolate(unref(stats).lastPayment ? "\u09F3" + money(unref(stats).lastPayment.amount) : "\u2014")}</p><p class="kpi-sub" data-v-0a4e99c3>${ssrInterpolate(unref(stats).lastPayment ? day(unref(stats).lastPayment.payment_date) : "none yet")}</p></div></div><div class="flex flex-wrap gap-1.5 p-1 rounded-xl w-fit max-w-full" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-0a4e99c3><!--[-->`);
        ssrRenderList(unref(tabs), (t) => {
          _push(`<button type="button" class="${ssrRenderClass([unref(tab) === t.id ? "btn-gold" : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.06]", "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"])}" data-v-0a4e99c3>${ssrInterpolate(t.label)}`);
          if (t.n) {
            _push(`<span class="ml-1.5 opacity-70" data-v-0a4e99c3>${ssrInterpolate(t.n)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(tab) === "overview") {
          _push(`<div class="grid grid-cols-1 xl:grid-cols-3 gap-5" data-v-0a4e99c3><div class="space-y-5 xl:col-span-1" data-v-0a4e99c3><div class="glass-card p-5 space-y-3" data-v-0a4e99c3><h3 class="section-title" data-v-0a4e99c3>Account</h3><dl class="text-xs space-y-2" data-v-0a4e99c3><div class="row" data-v-0a4e99c3><dt data-v-0a4e99c3>Type</dt><dd data-v-0a4e99c3>${ssrInterpolate(unref(c).customer_type)}</dd></div><div class="row" data-v-0a4e99c3><dt data-v-0a4e99c3>Opening due</dt><dd data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(c).initial_due))}</dd></div><div class="row" data-v-0a4e99c3><dt data-v-0a4e99c3>Total invoiced</dt><dd data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(ledgerDebit)))}</dd></div><div class="row" data-v-0a4e99c3><dt data-v-0a4e99c3>Total received</dt><dd class="text-emerald-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(ledgerCredit)))}</dd></div><div class="row" data-v-0a4e99c3><dt data-v-0a4e99c3>First order</dt><dd data-v-0a4e99c3>${ssrInterpolate(unref(stats).first_order ? day(unref(stats).first_order) : "\u2014")}</dd></div><div class="row" data-v-0a4e99c3><dt data-v-0a4e99c3>Last order</dt><dd data-v-0a4e99c3>${ssrInterpolate(unref(stats).last_order ? day(unref(stats).last_order) : "\u2014")}</dd></div>`);
          if (Math.abs(unref(credit).storedBalance - unref(credit).outstanding) > 1) {
            _push(`<div class="row" data-v-0a4e99c3><dt title="The balance stored on the customer record differs from the ledger \u2014 the ledger is the truth" data-v-0a4e99c3>Stored balance</dt><dd class="text-amber-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(credit).storedBalance))} \u26A0</dd></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</dl></div><div class="glass-card p-5 space-y-3" data-v-0a4e99c3><h3 class="section-title" data-v-0a4e99c3>Receivables by age</h3><!--[-->`);
          ssrRenderList(unref(ageBuckets), (b) => {
            _push(`<div class="text-xs" data-v-0a4e99c3><div class="flex justify-between mb-1" data-v-0a4e99c3><span class="text-gray-500" data-v-0a4e99c3>${ssrInterpolate(b.label)}</span><span class="${ssrRenderClass([b.bad && b.v > 0 ? "text-red-400" : "text-gray-300", "font-mono"])}" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(b.v))}</span></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" data-v-0a4e99c3><div class="h-full rounded-full" style="${ssrRenderStyle(`width:${unref(ageTotal) ? Math.round(b.v / unref(ageTotal) * 100) : 0}%;background:${b.color}`)}" data-v-0a4e99c3></div></div></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(ageTotal)) {
            _push(`<p class="text-[11px] text-gray-600" data-v-0a4e99c3>Nothing overdue on dispatched orders.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="space-y-5 xl:col-span-2" data-v-0a4e99c3><div class="glass-card p-5" data-v-0a4e99c3><div class="flex items-center justify-between mb-3" data-v-0a4e99c3><h3 class="section-title" data-v-0a4e99c3>Sales \u2014 last 12 months</h3><span class="text-[11px] text-gray-600" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(monthTotal)))}</span></div><div class="flex items-end gap-1.5 h-32" data-v-0a4e99c3><!--[-->`);
          ssrRenderList(unref(months), (m) => {
            _push(`<div class="flex-1 flex flex-col items-center justify-end h-full group"${ssrRenderAttr("title", `${m.label}: \u09F3${money(m.total)} (${m.n} orders)`)} data-v-0a4e99c3><div class="w-full rounded-t-md min-h-[2px]" style="${ssrRenderStyle(`height:${unref(monthMax) ? Math.max(2, Math.round(m.total / unref(monthMax) * 100)) : 2}%;background:linear-gradient(180deg,var(--accent-from),var(--accent-to));opacity:${m.total ? 1 : 0.25}`)}" data-v-0a4e99c3></div><span class="text-[9px] text-gray-600 mt-1" data-v-0a4e99c3>${ssrInterpolate(m.short)}</span></div>`);
          });
          _push(`<!--]--></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-5" data-v-0a4e99c3><div class="glass-card p-5" data-v-0a4e99c3><div class="flex items-center justify-between mb-3" data-v-0a4e99c3><h3 class="section-title" data-v-0a4e99c3>Recent orders</h3><button class="link" data-v-0a4e99c3>All \u2192</button></div><!--[-->`);
          ssrRenderList(unref(p).orders.slice(0, 5), (o) => {
            _push(`<div class="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0 text-xs" data-v-0a4e99c3>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${o.id}`,
              class: "font-mono text-gold-400/90 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(o.order_number)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(o.order_number), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiStatusBadge, {
              status: o.status
            }, null, _parent));
            _push(`<span class="ml-auto font-mono text-gray-300" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(o.total_amount))}</span></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).orders.length) {
            _push(`<p class="text-xs text-gray-600 py-4 text-center" data-v-0a4e99c3>No orders yet</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="glass-card p-5" data-v-0a4e99c3><div class="flex items-center justify-between mb-3" data-v-0a4e99c3><h3 class="section-title" data-v-0a4e99c3>Recent payments</h3><button class="link" data-v-0a4e99c3>All \u2192</button></div><!--[-->`);
          ssrRenderList(unref(p).payments.slice(0, 5), (pm) => {
            _push(`<div class="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0 text-xs" data-v-0a4e99c3><span class="text-gray-500 font-mono" data-v-0a4e99c3>${ssrInterpolate(day(pm.payment_date))}</span><span class="text-gray-400" data-v-0a4e99c3>${ssrInterpolate(pm.payment_method || "\u2014")}</span>`);
            if (pm.reversed_at) {
              _push(`<span class="text-[10px] text-red-400" data-v-0a4e99c3>reversed</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<span class="${ssrRenderClass([pm.reversed_at ? "text-gray-600 line-through" : "text-emerald-400", "ml-auto font-mono"])}" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(pm.amount))}</span></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).payments.length) {
            _push(`<p class="text-xs text-gray-600 py-4 text-center" data-v-0a4e99c3>No payments yet</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
          if (unref(openOrders).length) {
            _push(`<div class="glass-card p-5" data-v-0a4e99c3><h3 class="section-title mb-3" data-v-0a4e99c3>Orders with a balance</h3><!--[-->`);
            ssrRenderList(unref(openOrders), (o) => {
              _push(`<div class="flex flex-wrap items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 text-xs" data-v-0a4e99c3>`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${o.id}`,
                class: "font-mono text-gold-400/90 hover:underline"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(o.order_number)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(o.order_number), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UiStatusBadge, {
                status: o.status
              }, null, _parent));
              _push(`<span class="text-gray-600" data-v-0a4e99c3>${ssrInterpolate(day(o.order_date))}</span><span class="ml-auto text-gray-500" data-v-0a4e99c3>balance <strong class="font-mono text-red-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(o.balance_due))}</strong></span>`);
              if (unref(p).can.collect) {
                _push(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/${o.id}/payment`,
                  class: "btn-ghost text-[11px] py-1 px-2"
                }, {
                  default: withCtx((_, _push2, _parent2, _scopeId) => {
                    if (_push2) {
                      _push2(`Pay`);
                    } else {
                      return [
                        createTextVNode("Pay")
                      ];
                    }
                  }),
                  _: 2
                }, _parent));
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else if (unref(tab) === "orders") {
          _push(`<div class="glass-card p-5 space-y-3" data-v-0a4e99c3><div class="flex flex-wrap gap-1.5" data-v-0a4e99c3><!--[-->`);
          ssrRenderList(unref(orderFilters), (f) => {
            _push(`<button type="button" class="${ssrRenderClass([unref(orderFilter) === f.id ? "btn-gold" : "bg-white/[0.05] text-gray-400 hover:text-gray-100", "px-2.5 py-1 rounded-full text-[11px] font-semibold"])}" data-v-0a4e99c3>${ssrInterpolate(f.label)} <span class="opacity-60" data-v-0a4e99c3>${ssrInterpolate(f.n)}</span></button>`);
          });
          _push(`<!--]--></div>`);
          _push(ssrRenderComponent(_component_UiDataTable, {
            columns: orderCols,
            rows: unref(filteredOrders),
            "per-page": 10,
            "search-placeholder": "Search orders\u2026",
            exportable: ""
          }, {
            "cell-order_number": withCtx(({ value, row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/${row.id}`,
                  class: "font-mono text-xs text-gold-400/90 hover:underline"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(value)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(value), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_NuxtLink, {
                    to: `/credit-sales/${row.id}`,
                    class: "font-mono text-xs text-gold-400/90 hover:underline"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(value), 1)
                    ]),
                    _: 2
                  }, 1032, ["to"])
                ];
              }
            }),
            "cell-order_date": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-xs text-gray-400" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(day(value))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(day(value)), 1)
                ];
              }
            }),
            "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
                ];
              }
            }),
            "cell-total_amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-mono text-xs text-gray-200" data-v-0a4e99c3${_scopeId}>\u09F3${ssrInterpolate(money(value))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "font-mono text-xs text-gray-200" }, "\u09F3" + toDisplayString(money(value)), 1)
                ];
              }
            }),
            "cell-amount_paid": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-mono text-xs text-emerald-400" data-v-0a4e99c3${_scopeId}>\u09F3${ssrInterpolate(money(value))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "font-mono text-xs text-emerald-400" }, "\u09F3" + toDisplayString(money(value)), 1)
                ];
              }
            }),
            "cell-balance_due": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="${ssrRenderClass([Number(value) > 0 ? "text-red-400" : "text-gray-600", "font-mono text-xs"])}" data-v-0a4e99c3${_scopeId}>\u09F3${ssrInterpolate(money(value))}</span>`);
              } else {
                return [
                  createVNode("span", {
                    class: ["font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-gray-600"]
                  }, "\u09F3" + toDisplayString(money(value)), 3)
                ];
              }
            }),
            actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex gap-1.5 justify-end" data-v-0a4e99c3${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/${row.id}`,
                  class: "btn-ghost text-[11px] py-1 px-2"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`View`);
                    } else {
                      return [
                        createTextVNode("View")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/${row.id}/invoice`,
                  class: "btn-ghost text-[11px] py-1 px-2"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Invoice`);
                    } else {
                      return [
                        createTextVNode("Invoice")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                if (unref(p).can.collect && Number(row.balance_due) > 0) {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: `/credit-sales/${row.id}/payment`,
                    class: "btn-ghost text-[11px] py-1 px-2"
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`Pay`);
                      } else {
                        return [
                          createTextVNode("Pay")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "flex gap-1.5 justify-end" }, [
                    createVNode(_component_NuxtLink, {
                      to: `/credit-sales/${row.id}`,
                      class: "btn-ghost text-[11px] py-1 px-2"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("View")
                      ]),
                      _: 1
                    }, 8, ["to"]),
                    createVNode(_component_NuxtLink, {
                      to: `/credit-sales/${row.id}/invoice`,
                      class: "btn-ghost text-[11px] py-1 px-2"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Invoice")
                      ]),
                      _: 1
                    }, 8, ["to"]),
                    unref(p).can.collect && Number(row.balance_due) > 0 ? (openBlock(), createBlock(_component_NuxtLink, {
                      key: 0,
                      to: `/credit-sales/${row.id}/payment`,
                      class: "btn-ghost text-[11px] py-1 px-2"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Pay")
                      ]),
                      _: 1
                    }, 8, ["to"])) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          if (unref(p).branchLimited) {
            _push(`<p class="text-[11px] text-gray-600" data-v-0a4e99c3>Showing orders from your branch only.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (unref(tab) === "ledger") {
          _push(`<div class="glass-card p-4 sm:p-5 space-y-3" data-v-0a4e99c3>`);
          if (unref(p).review.flagged) {
            _push(`<div class="rounded-xl px-3 py-2.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-wrap items-center gap-x-4 gap-y-1" data-v-0a4e99c3><span data-v-0a4e99c3>\u26A0 <b data-v-0a4e99c3>${ssrInterpolate(unref(p).review.flagged)}</b> line(s) below are flagged for review (net \u09F3${ssrInterpolate(money(unref(p).review.net))}).</span><span data-v-0a4e99c3>Balance if they were all deleted: <b class="font-mono" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(p).review.balanceWithoutFlagged))}</b></span>`);
            if (unref(p).can.reviewLedger) {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/ledger-review?customer=${unref(c).id}`,
                class: "underline ml-auto"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`Open in Ledger Review \u2192`);
                  } else {
                    return [
                      createTextVNode("Open in Ledger Review \u2192")
                    ];
                  }
                }),
                _: 1
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex flex-wrap items-center gap-2" data-v-0a4e99c3><div class="text-xs text-gray-500" data-v-0a4e99c3>Invoiced <strong class="font-mono text-gray-300" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(ledgerDebit)))}</strong> \xB7 Received <strong class="font-mono text-emerald-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(ledgerCredit)))}</strong> \xB7 Balance <strong class="${ssrRenderClass([unref(credit).outstanding > 0 ? "text-red-400" : "text-emerald-400", "font-mono"])}" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(credit).outstanding))}</strong></div><span class="flex-1" data-v-0a4e99c3></span>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/customers/${unref(c).id}/statement`,
            class: "btn-ghost text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F9FE} Statement`);
              } else {
                return [
                  createTextVNode("\u{1F9FE} Statement")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<button class="btn-ghost text-xs" data-v-0a4e99c3>\u2B07\uFE0F CSV</button>`);
          if (can("/credit-sales/ledger")) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/ledger?customer=${unref(c).id}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Full ledger \u2192`);
                } else {
                  return [
                    createTextVNode("Full ledger \u2192")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          _push(ssrRenderComponent(_component_UiDataTable, {
            columns: ledgerCols,
            rows: unref(p).ledger,
            "per-page": 12,
            "search-placeholder": "Search ledger\u2026"
          }, createSlots({
            "cell-date": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-xs text-gray-400" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(day(value))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(day(value)), 1)
                ];
              }
            }),
            "cell-type": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-[11px] text-gray-400" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(String(value).replace(/_/g, " "))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "text-[11px] text-gray-400" }, toDisplayString(String(value).replace(/_/g, " ")), 1)
                ];
              }
            }),
            "cell-ref": withCtx(({ value, row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (row.linked_order_id) {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: `/credit-sales/${row.linked_order_id}`,
                    class: "font-mono text-xs text-gold-400/90 hover:underline"
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(value)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(value), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<span class="font-mono text-xs text-gray-400" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(value)}</span>`);
                }
              } else {
                return [
                  row.linked_order_id ? (openBlock(), createBlock(_component_NuxtLink, {
                    key: 0,
                    to: `/credit-sales/${row.linked_order_id}`,
                    class: "font-mono text-xs text-gold-400/90 hover:underline"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(value), 1)
                    ]),
                    _: 2
                  }, 1032, ["to"])) : (openBlock(), createBlock("span", {
                    key: 1,
                    class: "font-mono text-xs text-gray-400"
                  }, toDisplayString(value), 1))
                ];
              }
            }),
            "cell-description": withCtx(({ value, row }, _push2, _parent2, _scopeId) => {
              var _a2, _b2;
              if (_push2) {
                _push2(`<span class="text-xs text-gray-300" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(value)}</span>`);
                if (row.review_status === "review") {
                  _push2(`<span class="ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"${ssrRenderAttr("title", (_a2 = ("REVIEW_REASONS" in _ctx ? _ctx.REVIEW_REASONS : unref(REVIEW_REASONS))[row.review_reason]) == null ? void 0 : _a2.hint)} data-v-0a4e99c3${_scopeId}>\u26A0 ${ssrInterpolate(("reasonLabel" in _ctx ? _ctx.reasonLabel : unref(reasonLabel))(row.review_reason))}</span>`);
                } else if (row.review_status === "kept") {
                  _push2(`<span class="ml-1.5 text-[10px] text-emerald-500"${ssrRenderAttr("title", row.review_note)} data-v-0a4e99c3${_scopeId}>\u2713 reviewed</span>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("span", { class: "text-xs text-gray-300" }, toDisplayString(value), 1),
                  row.review_status === "review" ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30",
                    title: (_b2 = ("REVIEW_REASONS" in _ctx ? _ctx.REVIEW_REASONS : unref(REVIEW_REASONS))[row.review_reason]) == null ? void 0 : _b2.hint
                  }, "\u26A0 " + toDisplayString(("reasonLabel" in _ctx ? _ctx.reasonLabel : unref(reasonLabel))(row.review_reason)), 9, ["title"])) : row.review_status === "kept" ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "ml-1.5 text-[10px] text-emerald-500",
                    title: row.review_note
                  }, "\u2713 reviewed", 8, ["title"])) : createCommentVNode("", true)
                ];
              }
            }),
            "cell-debit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-mono text-xs" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(Number(value) ? "\u09F3" + money(value) : "")}</span>`);
              } else {
                return [
                  createVNode("span", { class: "font-mono text-xs" }, toDisplayString(Number(value) ? "\u09F3" + money(value) : ""), 1)
                ];
              }
            }),
            "cell-credit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-mono text-xs text-emerald-400" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(Number(value) ? "\u09F3" + money(value) : "")}</span>`);
              } else {
                return [
                  createVNode("span", { class: "font-mono text-xs text-emerald-400" }, toDisplayString(Number(value) ? "\u09F3" + money(value) : ""), 1)
                ];
              }
            }),
            "cell-balance": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-mono text-xs text-gray-200" data-v-0a4e99c3${_scopeId}>\u09F3${ssrInterpolate(money(value))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "font-mono text-xs text-gray-200" }, "\u09F3" + toDisplayString(money(value)), 1)
                ];
              }
            }),
            _: 2
          }, [
            unref(p).can.reviewLedger ? {
              name: "actions",
              fn: withCtx(({ row }, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  if (row.review_status === "review") {
                    _push2(`<div class="flex gap-1 justify-end" data-v-0a4e99c3${_scopeId}><button class="btn-ghost text-[11px] py-1 px-2" data-v-0a4e99c3${_scopeId}>Keep</button><button class="text-[11px] py-1 px-2 rounded-lg text-red-400 hover:bg-red-500/10" data-v-0a4e99c3${_scopeId}>Delete</button></div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    row.review_status === "review" ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex gap-1 justify-end"
                    }, [
                      createVNode("button", {
                        class: "btn-ghost text-[11px] py-1 px-2",
                        onClick: ($event) => reviewLine(row, "keep")
                      }, "Keep", 8, ["onClick"]),
                      createVNode("button", {
                        class: "text-[11px] py-1 px-2 rounded-lg text-red-400 hover:bg-red-500/10",
                        onClick: ($event) => reviewLine(row, "delete")
                      }, "Delete", 8, ["onClick"])
                    ])) : createCommentVNode("", true)
                  ];
                }
              }),
              key: "0"
            } : void 0
          ]), _parent));
          _push(`</div>`);
        } else if (unref(tab) === "payments") {
          _push(`<div class="glass-card p-5 space-y-3" data-v-0a4e99c3><div class="flex flex-wrap items-center gap-2" data-v-0a4e99c3><div class="text-xs text-gray-500" data-v-0a4e99c3>${ssrInterpolate(unref(stats).payments)} payments \xB7 <strong class="font-mono text-emerald-400" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(unref(stats).paid))}</strong> received</div><span class="flex-1" data-v-0a4e99c3></span>`);
          if (unref(p).can.collect) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/collect?customer=${unref(c).id}`,
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u{1F4B0} Collect Payment`);
                } else {
                  return [
                    createTextVNode("\u{1F4B0} Collect Payment")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          _push(ssrRenderComponent(_component_UiDataTable, {
            columns: payCols,
            rows: unref(p).payments,
            "per-page": 10,
            "search-placeholder": "Search payments\u2026",
            exportable: ""
          }, {
            "cell-payment_date": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-xs text-gray-400" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(day(value))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(day(value)), 1)
                ];
              }
            }),
            "cell-payment_number": withCtx(({ value, row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="${ssrRenderClass([row.reversed_at ? "text-gray-600 line-through" : "text-gray-300", "font-mono text-xs"])}" data-v-0a4e99c3${_scopeId}>${ssrInterpolate(value || row.receipt_number || "\u2014")}</span>`);
              } else {
                return [
                  createVNode("span", {
                    class: ["font-mono text-xs", row.reversed_at ? "text-gray-600 line-through" : "text-gray-300"]
                  }, toDisplayString(value || row.receipt_number || "\u2014"), 3)
                ];
              }
            }),
            "cell-amount": withCtx(({ value, row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="${ssrRenderClass([row.reversed_at ? "text-gray-600 line-through" : "text-emerald-400", "font-mono text-xs"])}" data-v-0a4e99c3${_scopeId}>\u09F3${ssrInterpolate(money(value))}</span>`);
              } else {
                return [
                  createVNode("span", {
                    class: ["font-mono text-xs", row.reversed_at ? "text-gray-600 line-through" : "text-emerald-400"]
                  }, "\u09F3" + toDisplayString(money(value)), 3)
                ];
              }
            }),
            "cell-reversed_at": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiStatusBadge, {
                  status: value ? "cancelled" : "completed"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiStatusBadge, {
                    status: value ? "cancelled" : "completed"
                  }, null, 8, ["status"])
                ];
              }
            }),
            actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/receipt/${row.id}`,
                  class: "btn-ghost text-[11px] py-1 px-2"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Receipt`);
                    } else {
                      return [
                        createTextVNode("Receipt")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_NuxtLink, {
                    to: `/credit-sales/receipt/${row.id}`,
                    class: "btn-ghost text-[11px] py-1 px-2"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Receipt")
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else if (unref(tab) === "changes") {
          _push(`<div class="grid grid-cols-1 xl:grid-cols-2 gap-5" data-v-0a4e99c3><div class="glass-card p-5" data-v-0a4e99c3><h3 class="section-title mb-3" data-v-0a4e99c3>Returns</h3><!--[-->`);
          ssrRenderList(unref(p).returns, (r) => {
            _push(`<div class="flex flex-wrap items-center gap-2 py-2 border-b border-white/[0.04] last:border-0 text-xs" data-v-0a4e99c3><span class="font-mono text-gray-300" data-v-0a4e99c3>${ssrInterpolate(r.return_number)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${r.order_id}`,
              class: "font-mono text-gold-400/90 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(r.order_number)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(r.order_number), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiStatusBadge, {
              status: r.status
            }, null, _parent));
            _push(`<span class="text-gray-600" data-v-0a4e99c3>${ssrInterpolate(day(r.return_date))}</span><span class="ml-auto font-mono text-red-400" data-v-0a4e99c3>\u2212\u09F3${ssrInterpolate(money(r.total_returned_amount))}</span></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).returns.length) {
            _push(`<p class="text-xs text-gray-600 py-4 text-center" data-v-0a4e99c3>No returns</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="glass-card p-5" data-v-0a4e99c3><h3 class="section-title mb-3" data-v-0a4e99c3>Amendments</h3><!--[-->`);
          ssrRenderList(unref(p).amendments, (a) => {
            _push(`<div class="py-2 border-b border-white/[0.04] last:border-0 text-xs" data-v-0a4e99c3><div class="flex flex-wrap items-center gap-2" data-v-0a4e99c3><span class="font-mono text-gray-300" data-v-0a4e99c3>${ssrInterpolate(a.amendment_number)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${a.order_id}`,
              class: "font-mono text-gold-400/90 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(a.order_number)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(a.order_number), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiStatusBadge, {
              status: a.status
            }, null, _parent));
            _push(`<span class="text-gray-600" data-v-0a4e99c3>${ssrInterpolate(a.regime)} \xB7 ${ssrInterpolate(a.amend_type)}</span>`);
            if (a.flat_amount) {
              _push(`<span class="${ssrRenderClass([Number(a.flat_amount) > 0 ? "text-amber-400" : "text-emerald-400", "ml-auto font-mono"])}" data-v-0a4e99c3>${ssrInterpolate(Number(a.flat_amount) > 0 ? "+" : "")}\u09F3${ssrInterpolate(money(a.flat_amount))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (a.description) {
              _push(`<p class="text-gray-600 mt-0.5" data-v-0a4e99c3>${ssrInterpolate(a.description)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).amendments.length) {
            _push(`<p class="text-xs text-gray-600 py-4 text-center" data-v-0a4e99c3>No amendments</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else if (unref(tab) === "products") {
          _push(`<div class="glass-card p-5" data-v-0a4e99c3><h3 class="section-title mb-3" data-v-0a4e99c3>What this customer buys</h3><table class="w-full text-xs" data-v-0a4e99c3><thead data-v-0a4e99c3><tr class="border-b border-white/[0.06] text-gray-600 uppercase tracking-wider text-[10px]" data-v-0a4e99c3><th class="pb-2 text-left" data-v-0a4e99c3>Product</th><th class="pb-2 text-right" data-v-0a4e99c3>Bags</th><th class="pb-2 text-right" data-v-0a4e99c3>Value</th><th class="pb-2 text-right" data-v-0a4e99c3>Orders</th><th class="pb-2 text-right" data-v-0a4e99c3>Last bought</th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-0a4e99c3><!--[-->`);
          ssrRenderList(unref(p).products, (pr, i) => {
            _push(`<tr data-v-0a4e99c3><td class="py-2 text-gray-300" data-v-0a4e99c3>${ssrInterpolate(pr.product)} <span class="text-gray-600" data-v-0a4e99c3>${ssrInterpolate(pr.weight_variant)} ${ssrInterpolate(pr.grade)}</span></td><td class="py-2 text-right font-mono" data-v-0a4e99c3>${ssrInterpolate(money(pr.qty))}</td><td class="py-2 text-right font-mono text-gray-200" data-v-0a4e99c3>\u09F3${ssrInterpolate(money(pr.amount))}</td><td class="py-2 text-right text-gray-500" data-v-0a4e99c3>${ssrInterpolate(pr.orders)}</td><td class="py-2 text-right text-gray-500" data-v-0a4e99c3>${ssrInterpolate(day(pr.last_order))}</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).products.length) {
            _push(`<tr data-v-0a4e99c3><td colspan="5" class="py-6 text-center text-gray-600" data-v-0a4e99c3>No purchases yet</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else if (unref(tab) === "notes") {
          _push(`<div class="glass-card p-5 space-y-4 max-w-3xl" data-v-0a4e99c3><form class="space-y-2" data-v-0a4e99c3><textarea rows="3" maxlength="2000" class="input-glass w-full resize-none" placeholder="Internal note \u2014 call outcome, promise to pay, dispute, special handling\u2026" data-v-0a4e99c3>${ssrInterpolate(unref(newNote))}</textarea><div class="flex justify-end" data-v-0a4e99c3><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(newNote).trim() || unref(noteBusy)) ? " disabled" : ""} data-v-0a4e99c3>${ssrInterpolate(unref(noteBusy) ? "Saving\u2026" : "Add note")}</button></div></form><!--[-->`);
          ssrRenderList(unref(p).notes, (n) => {
            var _a2;
            _push(`<div class="${ssrRenderClass([n.kind === "status" ? "bg-amber-500/5 border border-amber-500/20" : "bg-white/[0.03] border border-white/[0.06]", "rounded-xl p-3 text-xs"])}" data-v-0a4e99c3><div class="flex items-center gap-2 text-[11px] text-gray-500 mb-1" data-v-0a4e99c3><span data-v-0a4e99c3>${ssrInterpolate(n.kind === "status" ? "\u{1F6A6} Status change" : "\u{1F4DD}")}</span><span data-v-0a4e99c3>${ssrInterpolate(n.author || "System")}</span><span data-v-0a4e99c3>\xB7 ${ssrInterpolate(stamp(n.created_at))}</span>`);
            if (n.kind !== "status" && (unref(isAdmin) || n.created_by_user_id === ((_a2 = unref(me)) == null ? void 0 : _a2.id))) {
              _push(`<button class="ml-auto text-gray-600 hover:text-red-400" data-v-0a4e99c3>delete</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><p class="text-gray-300 whitespace-pre-wrap" data-v-0a4e99c3>${ssrInterpolate(n.note)}</p></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).notes.length) {
            _push(`<p class="text-xs text-gray-600 text-center py-4" data-v-0a4e99c3>No notes yet</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (unref(tab) === "activity") {
          _push(`<div class="glass-card p-5 max-w-3xl" data-v-0a4e99c3><h3 class="section-title mb-3" data-v-0a4e99c3>Recent activity</h3><!--[-->`);
          ssrRenderList(unref(p).activity, (a, i) => {
            _push(`<div class="flex gap-3 py-2.5 border-b border-white/[0.04] last:border-0 text-xs" data-v-0a4e99c3><span class="text-base leading-none mt-0.5" data-v-0a4e99c3>${ssrInterpolate(a.icon)}</span><div class="min-w-0" data-v-0a4e99c3><p class="text-gray-300" data-v-0a4e99c3>`);
            if (a.order_id) {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${a.order_id}`,
                class: "hover:underline"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(a.title)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(a.title), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span data-v-0a4e99c3>${ssrInterpolate(a.title)}</span>`);
            }
            _push(`</p>`);
            if (a.detail) {
              _push(`<p class="text-gray-600 truncate" data-v-0a4e99c3>${ssrInterpolate(a.detail)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<p class="text-[11px] text-gray-600" data-v-0a4e99c3>${ssrInterpolate(a.by || "System")} \xB7 ${ssrInterpolate(stamp(a.at))}</p></div></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(p).activity.length) {
            _push(`<p class="text-xs text-gray-600 text-center py-4" data-v-0a4e99c3>No activity yet</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(statusDlg).open) {
          _push2(`<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-v-0a4e99c3><form class="glass-card p-6 w-full max-w-md space-y-4" data-v-0a4e99c3><h3 class="font-bold text-gray-100" data-v-0a4e99c3>${ssrInterpolate(unref(statusDlg).target === "blacklisted" ? "\u{1F6AB} Blacklist customer" : unref(statusDlg).target === "inactive" ? "\u23F8\uFE0F Mark inactive" : "\u2705 Reactivate customer")}</h3><p class="text-xs text-gray-500" data-v-0a4e99c3>${ssrInterpolate(unref(statusDlg).target === "active" ? "New orders will be allowed again." : "New orders will be blocked. Existing orders and payments are not affected.")} The reason is kept permanently in the notes.</p><textarea rows="3" class="input-glass w-full resize-none" placeholder="Reason (required)" required data-v-0a4e99c3>${ssrInterpolate(unref(statusDlg).reason)}</textarea><div class="flex justify-end gap-2" data-v-0a4e99c3><button type="button" class="btn-ghost text-xs" data-v-0a4e99c3>Cancel</button><button class="${ssrRenderClass([unref(statusDlg).target === "blacklisted" ? "bg-red-600 text-white" : "btn-gold", "text-xs px-4 py-2 rounded-xl font-semibold"])}"${ssrIncludeBooleanAttr(unref(statusDlg).busy) ? " disabled" : ""} data-v-0a4e99c3>${ssrInterpolate(unref(statusDlg).busy ? "Saving\u2026" : "Confirm")}</button></div></form></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(limitDlg).open) {
          _push2(`<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-v-0a4e99c3><form class="glass-card p-6 w-full max-w-sm space-y-4" data-v-0a4e99c3><h3 class="font-bold text-gray-100" data-v-0a4e99c3>\u{1F39A}\uFE0F Credit limit</h3><p class="text-xs text-gray-500" data-v-0a4e99c3>Current limit \u09F3${ssrInterpolate(money(unref(credit).limit))}. Exposure (ledger + open orders) is \u09F3${ssrInterpolate(money(unref(credit).exposure))}.</p><input${ssrRenderAttr("value", unref(limitDlg).value)} type="number" min="0" step="1000" class="input-glass w-full font-mono" required data-v-0a4e99c3><div class="flex justify-end gap-2" data-v-0a4e99c3><button type="button" class="btn-ghost text-xs" data-v-0a4e99c3>Cancel</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(limitDlg).busy) ? " disabled" : ""} data-v-0a4e99c3>${ssrInterpolate(unref(limitDlg).busy ? "Saving\u2026" : "Save")}</button></div></form></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(deleteOpen)) {
          _push2(`<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-v-0a4e99c3><div class="glass-card p-6 w-full max-w-md space-y-4" data-v-0a4e99c3><h3 class="font-bold text-red-400" data-v-0a4e99c3>\u{1F5D1}\uFE0F Delete ${ssrInterpolate(unref(c).name)}?</h3><p class="text-xs text-gray-400" data-v-0a4e99c3>This archives the customer with every order, payment and ledger entry to the Recycle Bin (restorable by an admin). It is refused if the ledger balance is not zero.</p><div class="flex justify-end gap-2" data-v-0a4e99c3><button class="btn-ghost text-xs" data-v-0a4e99c3>Cancel</button><button class="text-xs px-4 py-2 rounded-xl font-semibold bg-red-600 text-white"${ssrIncludeBooleanAttr(unref(busyDelete)) ? " disabled" : ""} data-v-0a4e99c3>${ssrInterpolate(unref(busyDelete) ? "Deleting\u2026" : "Delete customer")}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/customers/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0a4e99c3"]]);

export { index as default };
//# sourceMappingURL=index-l5sL4nL1.mjs.map

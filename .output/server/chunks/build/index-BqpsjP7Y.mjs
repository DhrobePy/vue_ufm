import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { c as _export_sfc, n as navigateTo } from './server.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, createTextVNode, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const perPage = 25;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const search = ref("");
    const typeFilter = ref("");
    const statusFilter = ref("");
    const page = ref(1);
    const { data, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/suppliers",
      {
        query: computed(() => ({
          search: search.value,
          type: typeFilter.value,
          status: statusFilter.value,
          page: page.value,
          per: perPage
        }))
      },
      "$IBBLUBwHhy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const cols = [
      { key: "supplier_code", label: "Code", sortable: true },
      { key: "company_name", label: "Company", sortable: true },
      { key: "contact_person", label: "Contact" },
      { key: "phone", label: "Phone" },
      { key: "city", label: "City" },
      { key: "supplier_type", label: "Type" },
      { key: "total_pos", label: "POs" },
      { key: "current_balance", label: "Balance (\u09F3)", sortable: true },
      { key: "status", label: "Status" }
    ];
    const showModal = ref(false);
    const saving = ref(false);
    const editingId = ref(null);
    const emptyForm = () => ({
      company_name: "",
      contact_person: "",
      phone: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      country: "Bangladesh",
      supplier_type: "local",
      payment_terms: "advance",
      credit_limit: 0,
      tax_id: "",
      opening_balance: 0,
      status: "active",
      notes: ""
    });
    const form = reactive(emptyForm());
    function openAdd() {
      editingId.value = null;
      Object.assign(form, emptyForm());
      showModal.value = true;
    }
    function openEdit(s) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      editingId.value = s.id;
      Object.assign(form, {
        company_name: (_a = s.company_name) != null ? _a : "",
        contact_person: (_b = s.contact_person) != null ? _b : "",
        phone: (_c = s.phone) != null ? _c : "",
        mobile: (_d = s.mobile) != null ? _d : "",
        email: (_e = s.email) != null ? _e : "",
        address: (_f = s.address) != null ? _f : "",
        city: (_g = s.city) != null ? _g : "",
        country: (_h = s.country) != null ? _h : "Bangladesh",
        supplier_type: (_i = s.supplier_type) != null ? _i : "local",
        payment_terms: (_j = s.payment_terms) != null ? _j : "advance",
        credit_limit: Number((_k = s.credit_limit) != null ? _k : 0),
        tax_id: (_l = s.tax_id) != null ? _l : "",
        opening_balance: Number((_m = s.opening_balance) != null ? _m : 0),
        status: (_n = s.status) != null ? _n : "active",
        notes: (_o = s.notes) != null ? _o : ""
      });
      showModal.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-1af481f9>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Suppliers",
        subtitle: "All registered wheat suppliers",
        breadcrumb: ["Purchase", "Suppliers"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-1af481f9${_scopeId}>+ Add Supplier</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: openAdd,
                class: "btn-gold text-xs"
              }, "+ Add Supplier")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-3" data-v-1af481f9><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search company, code, phone\u2026" data-v-1af481f9><select class="field-input text-xs py-1.5 w-36" data-v-1af481f9><option value="" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "") : ssrLooseEqual(unref(typeFilter), "")) ? " selected" : ""}>All Types</option><option value="local" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "local") : ssrLooseEqual(unref(typeFilter), "local")) ? " selected" : ""}>Local</option><option value="international" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "international") : ssrLooseEqual(unref(typeFilter), "international")) ? " selected" : ""}>International</option><option value="both" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(typeFilter)) ? ssrLooseContain(unref(typeFilter), "both") : ssrLooseEqual(unref(typeFilter), "both")) ? " selected" : ""}>Both</option></select><select class="field-input text-xs py-1.5 w-36" data-v-1af481f9><option value="" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="active" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "active") : ssrLooseEqual(unref(statusFilter), "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "inactive") : ssrLooseEqual(unref(statusFilter), "inactive")) ? " selected" : ""}>Inactive</option><option value="blocked" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "blocked") : ssrLooseEqual(unref(statusFilter), "blocked")) ? " selected" : ""}>Blocked</option></select><button class="btn-ghost text-xs py-1.5" data-v-1af481f9>Reset</button><div class="ml-auto text-xs text-gray-500" data-v-1af481f9><span class="font-medium text-gray-300" data-v-1af481f9>${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)}</span> suppliers </div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-1af481f9>Loading\u2026</div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-1af481f9>\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(rows),
          "per-page": perPage,
          exportable: "",
          "search-placeholder": "",
          onRowClick: (r) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/purchase/suppliers/${r.id}/ledger`)
        }, {
          "cell-supplier_code": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80" data-v-1af481f9${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-current_balance": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(["font-semibold font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-emerald-400"])}" data-v-1af481f9${_scopeId}> \u09F3${ssrInterpolate(Number(Math.abs(value)).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["font-semibold font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-emerald-400"]
                }, " \u09F3" + toDisplayString(Number(Math.abs(value)).toLocaleString()), 3)
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
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex gap-1.5" data-v-1af481f9${_scopeId}><button class="btn-ghost text-xs py-1 px-2.5" data-v-1af481f9${_scopeId}>Edit</button>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/purchase/suppliers/${row.id}/ledger`,
                class: "btn-ghost text-xs py-1 px-2.5"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Ledger`);
                  } else {
                    return [
                      createTextVNode("Ledger")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex gap-1.5" }, [
                  createVNode("button", {
                    onClick: withModifiers(($event) => openEdit(row), ["stop"]),
                    class: "btn-ghost text-xs py-1 px-2.5"
                  }, "Edit", 8, ["onClick"]),
                  createVNode(_component_NuxtLink, {
                    to: `/purchase/suppliers/${row.id}/ledger`,
                    class: "btn-ghost text-xs py-1 px-2.5"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Ledger")
                    ]),
                    _: 1
                  }, 8, ["to"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (((_d = (_c = unref(data)) == null ? void 0 : _c.total) != null ? _d : 0) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500" data-v-1af481f9><span data-v-1af481f9>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(((_f = (_e = unref(data)) == null ? void 0 : _e.total) != null ? _f : 0) / perPage))}</span><div class="flex gap-2" data-v-1af481f9><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}" data-v-1af481f9>\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(((_h = (_g = unref(data)) == null ? void 0 : _g.total) != null ? _h : 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3" data-v-1af481f9>Next \u2192</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" data-v-1af481f9><div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4 my-8" data-v-1af481f9><div class="flex items-center justify-between" data-v-1af481f9><h3 class="text-lg font-bold text-gray-100" data-v-1af481f9>${ssrInterpolate(unref(editingId) ? "Edit Supplier" : "Add Supplier")}</h3><button class="text-gray-500 hover:text-gray-200 text-xl leading-none" data-v-1af481f9>\u2715</button></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-1af481f9><div class="sm:col-span-2 space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Company Name *</label><input${ssrRenderAttr("value", unref(form).company_name)} class="input-glass" placeholder="e.g. Rahim Traders Ltd." data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Contact Person</label><input${ssrRenderAttr("value", unref(form).contact_person)} class="input-glass" placeholder="Full name" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Phone</label><input${ssrRenderAttr("value", unref(form).phone)} class="input-glass" placeholder="+880\u2026" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Mobile</label><input${ssrRenderAttr("value", unref(form).mobile)} class="input-glass" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Email</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="input-glass" data-v-1af481f9></div><div class="sm:col-span-2 space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Address</label><input${ssrRenderAttr("value", unref(form).address)} class="input-glass" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>City</label><input${ssrRenderAttr("value", unref(form).city)} class="input-glass" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Country</label><input${ssrRenderAttr("value", unref(form).country)} class="input-glass" placeholder="Bangladesh" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Supplier Type</label><select class="input-glass" data-v-1af481f9><option value="local" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplier_type) ? ssrLooseContain(unref(form).supplier_type, "local") : ssrLooseEqual(unref(form).supplier_type, "local")) ? " selected" : ""}>Local</option><option value="international" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplier_type) ? ssrLooseContain(unref(form).supplier_type, "international") : ssrLooseEqual(unref(form).supplier_type, "international")) ? " selected" : ""}>International</option><option value="both" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplier_type) ? ssrLooseContain(unref(form).supplier_type, "both") : ssrLooseEqual(unref(form).supplier_type, "both")) ? " selected" : ""}>Both</option></select></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Payment Terms</label><select class="input-glass" data-v-1af481f9><option value="advance" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_terms) ? ssrLooseContain(unref(form).payment_terms, "advance") : ssrLooseEqual(unref(form).payment_terms, "advance")) ? " selected" : ""}>Advance</option><option value="credit-7" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_terms) ? ssrLooseContain(unref(form).payment_terms, "credit-7") : ssrLooseEqual(unref(form).payment_terms, "credit-7")) ? " selected" : ""}>Credit 7 Days</option><option value="credit-15" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_terms) ? ssrLooseContain(unref(form).payment_terms, "credit-15") : ssrLooseEqual(unref(form).payment_terms, "credit-15")) ? " selected" : ""}>Credit 15 Days</option><option value="credit-30" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_terms) ? ssrLooseContain(unref(form).payment_terms, "credit-30") : ssrLooseEqual(unref(form).payment_terms, "credit-30")) ? " selected" : ""}>Credit 30 Days</option><option value="credit-60" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_terms) ? ssrLooseContain(unref(form).payment_terms, "credit-60") : ssrLooseEqual(unref(form).payment_terms, "credit-60")) ? " selected" : ""}>Credit 60 Days</option></select></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Credit Limit (\u09F3)</label><input${ssrRenderAttr("value", unref(form).credit_limit)} type="number" min="0" class="input-glass font-mono" data-v-1af481f9></div><div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Tax ID / BIN</label><input${ssrRenderAttr("value", unref(form).tax_id)} class="input-glass font-mono" data-v-1af481f9></div>`);
          if (!unref(editingId)) {
            _push2(`<div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Opening Balance (\u09F3)</label><input${ssrRenderAttr("value", unref(form).opening_balance)} type="number" class="input-glass font-mono" data-v-1af481f9></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(editingId)) {
            _push2(`<div class="space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Status</label><select class="input-glass" data-v-1af481f9><option value="active" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option><option value="blocked" data-v-1af481f9${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "blocked") : ssrLooseEqual(unref(form).status, "blocked")) ? " selected" : ""}>Blocked</option></select></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="sm:col-span-2 space-y-1.5" data-v-1af481f9><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1af481f9>Notes</label><textarea rows="2" class="input-glass resize-none" data-v-1af481f9>${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-1af481f9><button${ssrIncludeBooleanAttr(!unref(form).company_name.trim() || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-1af481f9>${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editingId) ? "Save Changes" : "Add Supplier")}</button><button class="btn-ghost text-xs" data-v-1af481f9>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/suppliers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1af481f9"]]);

export { index as default };
//# sourceMappingURL=index-BqpsjP7Y.mjs.map

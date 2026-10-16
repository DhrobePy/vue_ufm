import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-DxEkMwEk.mjs';
import { _ as _sfc_main$1 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_3 } from './UiSlideOver-CLan9S2M.mjs';
import { defineComponent, ref, reactive, computed, withAsyncContext, watch, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, isRef, withModifiers, withDirectives, vModelText, vModelSelect, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-0FBklcsN.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "delivery-schedule",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const { success, error: toastError } = useToast();
    const tab = ref("schedule");
    const f = reactive({ order: "", customer: "", vehicle: "", branch: "", from: "", to: "" });
    const query = computed(() => ({ tab: tab.value, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")) }));
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/delivery-schedule",
      { query, watch: [query] },
      "$YSGqgtYYZg"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = ref([]);
    watch(data, (d) => {
      var _a;
      rows.value = [...(_a = d == null ? void 0 : d.orders) != null ? _a : []];
    }, { immediate: true });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const day = (d) => String(d).slice(0, 10);
    const canReorder = computed(() => perms.canDo("credit_sales", "delivery-schedule", "can_change_priority"));
    const canEdit = computed(() => perms.canExplicit("credit_sales", "delivery-schedule", "can_edit"));
    ref(null);
    const editOpen = ref(false);
    const editing = ref(null);
    const form = reactive({ required_date: "", delivery_type: "big_truck", branch_id: 0 });
    async function saveEdit() {
      var _a, _b, _c;
      try {
        const r = await $fetch("/api/credit-sales/delivery-schedule", { method: "POST", body: { action: "edit", order_id: editing.value.id, ...form } });
        success((_a = r.message) != null ? _a : "Saved");
        editOpen.value = false;
        refresh();
      } catch (e) {
        toastError((_c = (_b = e == null ? void 0 : e.data) == null ? void 0 : _b.statusMessage) != null ? _c : "Could not save");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_UiStatusBadge = _sfc_main$1;
      const _component_UiSlideOver = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Delivery Schedule",
        subtitle: "Orders still to go out \u2014 by required date, then your drag order",
        breadcrumb: ["Credit Sales", "Delivery Schedule"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u21BB Refresh</button>`);
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
      _push(`<div class="flex flex-wrap items-center gap-2"><!--[-->`);
      ssrRenderList(["schedule", "overdue"], (t) => {
        _push(`<button type="button" class="${ssrRenderClass([unref(tab) === t ? "btn-gold" : "btn-ghost", "px-3 py-1.5 rounded-lg text-xs font-semibold"])}">${ssrInterpolate(t === "schedule" ? "Due today & upcoming" : "Overdue")}</button>`);
      });
      _push(`<!--]--><input${ssrRenderAttr("value", unref(f).order)} class="input-glass text-xs w-36" placeholder="Order #"><input${ssrRenderAttr("value", unref(f).customer)} class="input-glass text-xs w-40" placeholder="Customer / phone"><select class="input-glass text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).vehicle) ? ssrLooseContain(unref(f).vehicle, "") : ssrLooseEqual(unref(f).vehicle, "")) ? " selected" : ""}>Any truck</option><option value="big_truck"${ssrIncludeBooleanAttr(Array.isArray(unref(f).vehicle) ? ssrLooseContain(unref(f).vehicle, "big_truck") : ssrLooseEqual(unref(f).vehicle, "big_truck")) ? " selected" : ""}>Big truck</option><option value="mini_truck"${ssrIncludeBooleanAttr(Array.isArray(unref(f).vehicle) ? ssrLooseContain(unref(f).vehicle, "mini_truck") : ssrLooseEqual(unref(f).vehicle, "mini_truck")) ? " selected" : ""}>Mini truck</option></select><select class="input-glass text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).branch) ? ssrLooseContain(unref(f).branch, "") : ssrLooseEqual(unref(f).branch, "")) ? " selected" : ""}>All branches</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).branch) ? ssrLooseContain(unref(f).branch, b.id) : ssrLooseEqual(unref(f).branch, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select><input${ssrRenderAttr("value", unref(f).from)} type="date" class="input-glass text-xs" title="Required from"><input${ssrRenderAttr("value", unref(f).to)} type="date" class="input-glass text-xs" title="Required to"></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (!unref(rows).length) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Nothing on this list.</div>`);
      } else {
        _push(`<div class="glass-card p-0 overflow-hidden divide-y divide-white/[0.05]"><!--[-->`);
        ssrRenderList(unref(rows), (o, i) => {
          _push(`<div${ssrRenderAttr("draggable", unref(canReorder))} class="${ssrRenderClass([unref(canReorder) ? "cursor-grab" : "", "px-4 py-3 flex flex-wrap items-center gap-3"])}">`);
          if (unref(canReorder)) {
            _push(`<span class="text-gray-600 select-none">\u22EE\u22EE</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="min-w-[150px]">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${o.id}`,
            class: "text-xs font-bold text-gold-400 hover:underline"
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
          _push(`<p class="text-[11px] text-gray-500">${ssrInterpolate(o.customer_name)}`);
          if (o.customer_phone) {
            _push(`<span> \xB7 ${ssrInterpolate(o.customer_phone)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p></div><div class="text-xs text-gray-400 min-w-[110px]"> Due <strong class="${ssrRenderClass(unref(tab) === "overdue" ? "text-red-400" : "text-gray-200")}">${ssrInterpolate(day(o.required_date))}</strong><p class="text-[11px] text-gray-600">${ssrInterpolate(o.branch_name)} \xB7 ${ssrInterpolate(o.delivery_type === "mini_truck" ? "Mini" : "Big")} truck</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: o.status
          }, null, _parent));
          _push(`<div class="flex-1 text-[11px] text-gray-500 min-w-[200px]"><!--[-->`);
          ssrRenderList(o.items, (it, k) => {
            _push(`<span class="mr-3">${ssrInterpolate(it.product_name)} ${ssrInterpolate(it.weight_variant)} ${ssrInterpolate(it.grade)} \xD7 ${ssrInterpolate(Number(it.quantity))}</span>`);
          });
          _push(`<!--]--></div>`);
          if (unref(canEdit)) {
            _push(`<button class="btn-ghost text-xs">\u270F\uFE0F Edit</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(ssrRenderComponent(_component_UiSlideOver, {
        modelValue: unref(editOpen),
        "onUpdate:modelValue": ($event) => isRef(editOpen) ? editOpen.value = $event : null,
        title: "Edit schedule",
        subtitle: (_a = unref(editing)) == null ? void 0 : _a.order_number
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4 flex justify-end gap-2"${_scopeId}><button type="button" class="btn-ghost text-xs"${_scopeId}>Cancel</button><button type="submit" form="ds-form" class="btn-gold text-xs"${_scopeId}>Save</button></div>`);
          } else {
            return [
              createVNode("div", { class: "p-4 flex justify-end gap-2" }, [
                createVNode("button", {
                  type: "button",
                  class: "btn-ghost text-xs",
                  onClick: ($event) => editOpen.value = false
                }, "Cancel", 8, ["onClick"]),
                createVNode("button", {
                  type: "submit",
                  form: "ds-form",
                  class: "btn-gold text-xs"
                }, "Save")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="ds-form" class="p-6 space-y-4"${_scopeId}><div${_scopeId}><label class="field-label"${_scopeId}>Required date</label><input${ssrRenderAttr("value", unref(form).required_date)} type="date" class="field-input w-full" required${_scopeId}></div><div${_scopeId}><label class="field-label"${_scopeId}>Truck type</label><select class="field-input w-full"${_scopeId}><option value="big_truck"${ssrIncludeBooleanAttr(Array.isArray(unref(form).delivery_type) ? ssrLooseContain(unref(form).delivery_type, "big_truck") : ssrLooseEqual(unref(form).delivery_type, "big_truck")) ? " selected" : ""}${_scopeId}>Big truck</option><option value="mini_truck"${ssrIncludeBooleanAttr(Array.isArray(unref(form).delivery_type) ? ssrLooseContain(unref(form).delivery_type, "mini_truck") : ssrLooseEqual(unref(form).delivery_type, "mini_truck")) ? " selected" : ""}${_scopeId}>Mini truck</option></select></div><div${_scopeId}><label class="field-label"${_scopeId}>Branch</label><select class="field-input w-full"${_scopeId}><!--[-->`);
            ssrRenderList(unref(branches), (b) => {
              _push2(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch_id) ? ssrLooseContain(unref(form).branch_id, b.id) : ssrLooseEqual(unref(form).branch_id, b.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(b.name)}</option>`);
            });
            _push2(`<!--]--></select></div><p class="text-[11px] text-gray-600"${_scopeId}>Changes the order header only \u2014 prices and totals are not recalculated.</p></form>`);
          } else {
            return [
              createVNode("form", {
                id: "ds-form",
                class: "p-6 space-y-4",
                onSubmit: withModifiers(saveEdit, ["prevent"])
              }, [
                createVNode("div", null, [
                  createVNode("label", { class: "field-label" }, "Required date"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(form).required_date = $event,
                    type: "date",
                    class: "field-input w-full",
                    required: ""
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(form).required_date]
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "field-label" }, "Truck type"),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => unref(form).delivery_type = $event,
                    class: "field-input w-full"
                  }, [
                    createVNode("option", { value: "big_truck" }, "Big truck"),
                    createVNode("option", { value: "mini_truck" }, "Mini truck")
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(form).delivery_type]
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "field-label" }, "Branch"),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
                    class: "field-input w-full"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(branches), (b) => {
                      return openBlock(), createBlock("option", {
                        key: b.id,
                        value: b.id
                      }, toDisplayString(b.name), 9, ["value"]);
                    }), 128))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(form).branch_id]
                  ])
                ]),
                createVNode("p", { class: "text-[11px] text-gray-600" }, "Changes the order header only \u2014 prices and totals are not recalculated.")
              ], 32)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/delivery-schedule.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=delivery-schedule-CoGBUwso.mjs.map

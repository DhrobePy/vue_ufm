import { _ as __nuxt_component_3 } from './UiSlideOver-CLan9S2M.mjs';
import { defineComponent, reactive, ref, watch, mergeProps, withCtx, unref, createVNode, withModifiers, withDirectives, vModelText, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DispatchSlideOver",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    orderId: {},
    orderLabel: {}
  },
  emits: ["update:modelValue", "done"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { success, error: toastError } = useToast();
    const blank = () => ({
      truck_number: "",
      driver_name: "",
      driver_contact: "",
      bags_boarded: null,
      bag_size_kg: null,
      extra_discount_amount: 0,
      extra_discount_reason: ""
    });
    const f = reactive(blank());
    const busy = ref(false);
    watch(() => props.modelValue, (open) => {
      if (open) Object.assign(f, blank());
    });
    async function submit() {
      var _a, _b, _c;
      if (!props.orderId) return;
      busy.value = true;
      try {
        await $fetch(`/api/credit-sales/${props.orderId}/workflow`, {
          method: "POST",
          body: { to_status: "goods_on_board", comments: "Goods on board", dispatch: { ...f } }
        });
        success(`${(_a = props.orderLabel) != null ? _a : "Order"} \u2014 goods on board, invoice posted`);
        emit("update:modelValue", false);
        emit("done");
      } catch (e) {
        toastError((_c = (_b = e == null ? void 0 : e.data) == null ? void 0 : _b.statusMessage) != null ? _c : "Failed to mark goods on board");
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSlideOver = __nuxt_component_3;
      _push(ssrRenderComponent(_component_UiSlideOver, mergeProps({
        "model-value": __props.modelValue,
        title: "Goods on Board",
        subtitle: __props.orderLabel,
        "onUpdate:modelValue": ($event) => _ctx.$emit("update:modelValue", $event)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4 flex justify-end gap-2"${_scopeId}><button type="button" class="btn-ghost text-xs"${_scopeId}>Cancel</button><button type="submit" form="dispatch-form" class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(busy) ? "Posting\u2026" : "\u{1F4E6} Confirm Goods on Board")}</button></div>`);
          } else {
            return [
              createVNode("div", { class: "p-4 flex justify-end gap-2" }, [
                createVNode("button", {
                  type: "button",
                  class: "btn-ghost text-xs",
                  onClick: ($event) => _ctx.$emit("update:modelValue", false)
                }, "Cancel", 8, ["onClick"]),
                createVNode("button", {
                  type: "submit",
                  form: "dispatch-form",
                  class: "btn-gold text-xs",
                  disabled: unref(busy)
                }, toDisplayString(unref(busy) ? "Posting\u2026" : "\u{1F4E6} Confirm Goods on Board"), 9, ["disabled"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="dispatch-form" class="p-6 space-y-4"${_scopeId}><p class="text-xs text-gray-500"${_scopeId}>Truck and driver are required. Putting goods on board posts the invoice to the customer ledger.</p><div${_scopeId}><label class="field-label"${_scopeId}>Truck number *</label><input${ssrRenderAttr("value", unref(f).truck_number)} class="field-input w-full" required placeholder="e.g. DM-DA-14-1304"${_scopeId}></div><div class="grid grid-cols-2 gap-3"${_scopeId}><div${_scopeId}><label class="field-label"${_scopeId}>Driver name *</label><input${ssrRenderAttr("value", unref(f).driver_name)} class="field-input w-full" required${_scopeId}></div><div${_scopeId}><label class="field-label"${_scopeId}>Driver contact</label><input${ssrRenderAttr("value", unref(f).driver_contact)} class="field-input w-full" inputmode="tel"${_scopeId}></div></div><div class="grid grid-cols-2 gap-3"${_scopeId}><div${_scopeId}><label class="field-label"${_scopeId}>Bags boarded</label><input${ssrRenderAttr("value", unref(f).bags_boarded)} type="number" min="0" step="1" class="field-input w-full" placeholder="optional"${_scopeId}></div><div${_scopeId}><label class="field-label"${_scopeId}>Bag size (kg)</label><input${ssrRenderAttr("value", unref(f).bag_size_kg)} type="number" min="0" step="0.01" class="field-input w-full" placeholder="optional"${_scopeId}></div></div><div class="rounded-xl p-3 space-y-3" style="${ssrRenderStyle({ "border": "1px solid rgba(255,255,255,0.08)" })}"${_scopeId}><p class="text-xs font-semibold text-gray-400"${_scopeId}>Additional discount (optional)</p><div class="grid grid-cols-2 gap-3"${_scopeId}><div${_scopeId}><label class="field-label"${_scopeId}>Amount (\u09F3)</label><input${ssrRenderAttr("value", unref(f).extra_discount_amount)} type="number" min="0" step="0.01" class="field-input w-full"${_scopeId}></div><div${_scopeId}><label class="field-label"${_scopeId}>Reason ${ssrInterpolate(unref(f).extra_discount_amount > 0 ? "*" : "")}</label><input${ssrRenderAttr("value", unref(f).extra_discount_reason)} class="field-input w-full" maxlength="500"${ssrIncludeBooleanAttr(unref(f).extra_discount_amount > 0) ? " required" : ""} placeholder="e.g. short-weight adjustment"${_scopeId}></div></div><p class="text-[11px] text-gray-600"${_scopeId}>Reduces this order&#39;s invoice before it is posted; the reason is kept on the order.</p></div></form>`);
          } else {
            return [
              createVNode("form", {
                id: "dispatch-form",
                class: "p-6 space-y-4",
                onSubmit: withModifiers(submit, ["prevent"])
              }, [
                createVNode("p", { class: "text-xs text-gray-500" }, "Truck and driver are required. Putting goods on board posts the invoice to the customer ledger."),
                createVNode("div", null, [
                  createVNode("label", { class: "field-label" }, "Truck number *"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(f).truck_number = $event,
                    class: "field-input w-full",
                    required: "",
                    placeholder: "e.g. DM-DA-14-1304"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(f).truck_number]
                  ])
                ]),
                createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "field-label" }, "Driver name *"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(f).driver_name = $event,
                      class: "field-input w-full",
                      required: ""
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(f).driver_name]
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "field-label" }, "Driver contact"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(f).driver_contact = $event,
                      class: "field-input w-full",
                      inputmode: "tel"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(f).driver_contact]
                    ])
                  ])
                ]),
                createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "field-label" }, "Bags boarded"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(f).bags_boarded = $event,
                      type: "number",
                      min: "0",
                      step: "1",
                      class: "field-input w-full",
                      placeholder: "optional"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [
                        vModelText,
                        unref(f).bags_boarded,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "field-label" }, "Bag size (kg)"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(f).bag_size_kg = $event,
                      type: "number",
                      min: "0",
                      step: "0.01",
                      class: "field-input w-full",
                      placeholder: "optional"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [
                        vModelText,
                        unref(f).bag_size_kg,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ]),
                createVNode("div", {
                  class: "rounded-xl p-3 space-y-3",
                  style: { "border": "1px solid rgba(255,255,255,0.08)" }
                }, [
                  createVNode("p", { class: "text-xs font-semibold text-gray-400" }, "Additional discount (optional)"),
                  createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                    createVNode("div", null, [
                      createVNode("label", { class: "field-label" }, "Amount (\u09F3)"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(f).extra_discount_amount = $event,
                        type: "number",
                        min: "0",
                        step: "0.01",
                        class: "field-input w-full"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [
                          vModelText,
                          unref(f).extra_discount_amount,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "field-label" }, "Reason " + toDisplayString(unref(f).extra_discount_amount > 0 ? "*" : ""), 1),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(f).extra_discount_reason = $event,
                        class: "field-input w-full",
                        maxlength: "500",
                        required: unref(f).extra_discount_amount > 0,
                        placeholder: "e.g. short-weight adjustment"
                      }, null, 8, ["onUpdate:modelValue", "required"]), [
                        [vModelText, unref(f).extra_discount_reason]
                      ])
                    ])
                  ]),
                  createVNode("p", { class: "text-[11px] text-gray-600" }, "Reduces this order's invoice before it is posted; the reason is kept on the order.")
                ])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DispatchSlideOver.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=DispatchSlideOver-DfWSkhn9.mjs.map

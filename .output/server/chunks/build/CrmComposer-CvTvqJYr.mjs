import { defineComponent, ref, withAsyncContext, watch, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CrmComposer",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    partyType: {},
    partyId: {},
    name: {},
    phone: {},
    kind: {},
    optedOut: { type: Boolean }
  },
  emits: ["close", "done"],
  async setup(__props, { emit: __emit }) {
    var _a;
    let __temp, __restore;
    const props = __props;
    useToast();
    const KINDS = { reorder: "Reorder nudge", collect: "Payment reminder", winback: "Win-back", crosssell: "Offer a product", checkin: "Check-in" };
    const ch = ref("whatsapp"), lang = ref("bn"), kd = ref((_a = props.kind) != null ? _a : "checkin"), body = ref(""), source = ref(""), busy = ref(false), sending = ref(false);
    const { data: gw } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/messages/status",
      { lazy: true, server: false },
      "$2KQVbFWLk0"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(() => props.open, (v) => {
      var _a2;
      if (v) {
        kd.value = (_a2 = props.kind) != null ? _a2 : "checkin";
        body.value = "";
        source.value = "";
      }
    });
    const kindLabel = computed(() => props.partyType === "prospect" ? "First contact" : KINDS[kd.value]);
    const intl = computed(() => {
      var _a2;
      const d = String((_a2 = props.phone) != null ? _a2 : "").replace(/\D/g, "");
      return d.startsWith("880") ? d : d.startsWith("0") ? "88" + d : d.length === 10 ? "880" + d : d;
    });
    const ok = computed(() => !!body.value.trim() && !!props.phone && !props.optedOut && !body.value.includes("[PHONE]"));
    const waUrl = computed(() => intl.value ? `https://wa.me/${intl.value}?text=${encodeURIComponent(body.value)}` : "");
    const smsUrl = computed(() => intl.value ? `sms:+${intl.value}?body=${encodeURIComponent(body.value)}` : "");
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      if (__props.open) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3" }, _attrs))}><div class="glass-card w-full max-w-lg p-4 space-y-3 max-h-[90vh] overflow-y-auto"><div class="flex items-start gap-2"><div class="flex-1"><h3 class="section-title">Message ${ssrInterpolate(__props.name)}</h3><p class="text-[11px] text-gray-500">${ssrInterpolate(unref(kindLabel))} \u2014 a draft you check and send; nothing goes out by itself.</p></div><button class="text-gray-500 hover:text-gray-200 text-lg leading-none">\xD7</button></div><div class="flex flex-wrap gap-2"><select class="field-input text-xs py-1.5 w-32"><option value="whatsapp"${ssrIncludeBooleanAttr(Array.isArray(unref(ch)) ? ssrLooseContain(unref(ch), "whatsapp") : ssrLooseEqual(unref(ch), "whatsapp")) ? " selected" : ""}>WhatsApp</option><option value="sms"${ssrIncludeBooleanAttr(Array.isArray(unref(ch)) ? ssrLooseContain(unref(ch), "sms") : ssrLooseEqual(unref(ch), "sms")) ? " selected" : ""}>SMS</option></select><select class="field-input text-xs py-1.5 w-28"><option value="bn"${ssrIncludeBooleanAttr(Array.isArray(unref(lang)) ? ssrLooseContain(unref(lang), "bn") : ssrLooseEqual(unref(lang), "bn")) ? " selected" : ""}>\u09AC\u09BE\u0982\u09B2\u09BE</option><option value="en"${ssrIncludeBooleanAttr(Array.isArray(unref(lang)) ? ssrLooseContain(unref(lang), "en") : ssrLooseEqual(unref(lang), "en")) ? " selected" : ""}>English</option></select>`);
        if (__props.partyType === "customer") {
          _push(`<select class="field-input text-xs py-1.5 w-40"><!--[-->`);
          ssrRenderList(KINDS, (l, k) => {
            _push(`<option${ssrRenderAttr("value", k)}${ssrIncludeBooleanAttr(Array.isArray(unref(kd)) ? ssrLooseContain(unref(kd), k) : ssrLooseEqual(unref(kd), k)) ? " selected" : ""}>${ssrInterpolate(l)}</option>`);
          });
          _push(`<!--]--></select>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}>${ssrInterpolate(unref(busy) ? "Writing\u2026" : unref(body) ? "Rewrite" : "Write draft")}</button></div><textarea rows="6" class="field-input text-xs w-full" placeholder="Press \u201CWrite draft\u201D, then edit as you like.">${ssrInterpolate(unref(body))}</textarea>`);
        if (unref(source)) {
          _push(`<p class="text-[11px] text-gray-600">${ssrInterpolate(unref(source) === "assistant" ? "written by the assistant" : "standard template (switch the assistant on in Settings \u2192 CRM for tailored drafts)")} \xB7 ${ssrInterpolate(unref(body).length)} characters${ssrInterpolate(unref(ch) === "sms" && unref(body).length > 160 ? " \xB7 more than one SMS" : "")}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(body).includes("[PHONE]")) {
          _push(`<p class="text-[11px] text-amber-400">Replace [PHONE] with the company number (or set it in Admin \u2192 Settings \u2192 Company) before sending.</p>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.optedOut) {
          _push(`<p class="text-[11px] text-red-400">This number asked not to be contacted \u2014 do not message it.</p>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.phone) {
          _push(`<p class="text-[11px] text-amber-400">No phone number on record for this contact.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex flex-wrap gap-2 items-center">`);
        if (((_a2 = unref(gw)) == null ? void 0 : _a2.enabled) && (unref(ch) === "sms" ? unref(gw).sms : unref(gw).whatsapp)) {
          _push(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(ok) || unref(sending)) ? " disabled" : ""}>${ssrInterpolate(unref(sending) ? "Sending\u2026" : "Send now")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(ch) === "whatsapp" && unref(waUrl)) {
          _push(`<a${ssrRenderAttr("href", unref(waUrl))} target="_blank" rel="noopener" class="${ssrRenderClass([{ "pointer-events-none opacity-40": !unref(ok) }, "btn-ghost text-xs"])}">Open in WhatsApp</a>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(ch) === "sms" && unref(smsUrl)) {
          _push(`<a${ssrRenderAttr("href", unref(smsUrl))} class="${ssrRenderClass([{ "pointer-events-none opacity-40": !unref(ok) }, "btn-ghost text-xs"])}">Open in SMS app</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(!unref(body)) ? " disabled" : ""}>Copy</button>`);
        if (unref(gw) && !unref(gw).enabled) {
          _push(`<span class="text-[11px] text-gray-600">Direct sending is off (Settings \u2192 CRM) \u2014 use the buttons that open your own phone.</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CrmComposer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=CrmComposer-CvTvqJYr.mjs.map

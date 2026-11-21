import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, computed, withAsyncContext, reactive, watchEffect, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { w as whatsappLink } from './usePrintSize-CHoLIjZz.mjs';
import { k as useRoute, q as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import '../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const { user } = useUserSession();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(String((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const segments = ["Trader / Store", "Bakery", "Food manufacturer", "Hotel / Institution", "Other business", "Unclassified"];
    const stages = ["new", "researching", "contacted", "quoted", "trial", "won", "lost"];
    const { data: d, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/crm/prospects/${route.params.id}`,
      "$EtidkyzL66"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const p = computed(() => d.value.prospect), a = computed(() => d.value.assessment);
    const edit = reactive({ segment: "", phone: "", contact_person: "", address: "", district: "" });
    const cl = reactive({ visited: false, shop_photo: false, nid_checked: false, trade_license_no: "", monthly_bags_declared: null, current_supplier: "", years_in_business: "", payment_history_notes: "", references: [{ name: "", phone: "" }, { name: "", phone: "" }] });
    watchEffect(() => {
      var _a, _b, _c, _d, _e, _f, _g;
      if (!d.value) return;
      const x = d.value.prospect;
      Object.assign(edit, { segment: (_a = x.segment) != null ? _a : "", phone: (_b = x.phone) != null ? _b : "", contact_person: (_c = x.contact_person) != null ? _c : "", address: (_d = x.address) != null ? _d : "", district: (_e = x.district) != null ? _e : "" });
      Object.assign(cl, (_f = x.checklist) != null ? _f : {});
      if (!Array.isArray(cl.references) || cl.references.length < 2) cl.references = [...(_g = cl.references) != null ? _g : [], { name: "", phone: "" }, { name: "", phone: "" }].slice(0, 2);
    });
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const verdictCls = computed(() => a.value.verdict.startsWith("Pursue") ? "bg-emerald-500/15 text-emerald-300" : a.value.verdict.startsWith("Already") ? "bg-amber-500/15 text-amber-300" : "bg-white/10 text-gray-300");
    const tiles = computed(() => {
      const x = a.value;
      return [
        { l: "Fit", v: `${x.fit}/100`, s: `${x.segment} \xB7 ${x.district}` },
        { l: "Estimated monthly potential", v: `\u09F3${n0(x.potential.monthly_low)}\u2013${n0(x.potential.monthly_high)}`, s: x.potential.basis },
        { l: "Risk", v: x.risk.band, s: `score ${x.risk.score} \xB7 ${x.risk.flags.length} flag(s)`, cls: x.risk.band === "High" ? "text-red-400" : x.risk.band === "Medium" ? "text-amber-400" : "text-emerald-400" },
        { l: "Confidence", v: `${x.confidence}%`, s: `${x.checklist.completeness}% of the checklist done` }
      ];
    });
    const dr = reactive({ channel: "sms", lang: "bn", subject: "", body: "", source: "" }), dbusy = ref(false);
    const waUrl = computed(() => whatsappLink(p.value.phone, dr.body));
    const f = reactive({ channel: "call", outcome: "", summary: "", follow_up_date: "" });
    const busy = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_HubTabs = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else if (unref(d)) {
        _push(`<!--[--><div class="glass-card p-5 space-y-3"><div class="flex flex-wrap items-center gap-3"><h1 class="text-xl font-bold text-gray-100">${ssrInterpolate(unref(p).name)}</h1><span class="text-xs text-gray-500">${ssrInterpolate(unref(p).business_name)}</span><span class="${ssrRenderClass([unref(verdictCls), "px-2 py-0.5 rounded-full text-[11px] font-semibold"])}">${ssrInterpolate(unref(a).verdict)}</span><div class="ml-auto flex flex-wrap gap-1.5"><!--[-->`);
        ssrRenderList(stages, (s) => {
          _push(`<button class="${ssrRenderClass([unref(p).stage === s ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300", "px-2.5 py-1 rounded-lg text-[11px] border"])}">${ssrInterpolate(s)}</button>`);
        });
        _push(`<!--]--></div></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs"><label class="text-gray-500">Business type <select class="field-input text-xs w-full mt-0.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(edit).segment) ? ssrLooseContain(unref(edit).segment, "") : ssrLooseEqual(unref(edit).segment, "")) ? " selected" : ""}>${ssrInterpolate(unref(a).segment)} (guess)</option><!--[-->`);
        ssrRenderList(segments, (s) => {
          _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(edit).segment) ? ssrLooseContain(unref(edit).segment, s) : ssrLooseEqual(unref(edit).segment, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
        });
        _push(`<!--]--></select></label><label class="text-gray-500">Phone <input${ssrRenderAttr("value", unref(edit).phone)} class="field-input text-xs w-full mt-0.5"></label><label class="text-gray-500">Contact person <input${ssrRenderAttr("value", unref(edit).contact_person)} class="field-input text-xs w-full mt-0.5"></label><label class="text-gray-500 sm:col-span-2">Address <input${ssrRenderAttr("value", unref(edit).address)} class="field-input text-xs w-full mt-0.5"></label><label class="text-gray-500">District <input${ssrRenderAttr("value", unref(edit).district)}${ssrRenderAttr("placeholder", unref(a).district + " (guess)")} class="field-input text-xs w-full mt-0.5"></label></div><p class="text-[11px] text-gray-600">Source: ${ssrInterpolate((_a = unref(p).source) != null ? _a : "\u2014")}`);
        if (unref(p).source_url) {
          _push(`<!--[--> \xB7 <a${ssrRenderAttr("href", unref(p).source_url)} target="_blank" rel="noopener" class="text-gold-400 hover:underline">${ssrInterpolate(unref(p).source_url)}</a><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).source_note) {
          _push(`<!--[--> \xB7 ${ssrInterpolate(unref(p).source_note)}<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).created_by_agent) {
          _push(`<!--[--> \xB7 found by the assistant \u2014 check before relying on it<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        if (unref(a).same_as_customers.length) {
          _push(`<div class="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">Already a customer: <!--[-->`);
          ssrRenderList(unref(a).same_as_customers, (m) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: m.id,
              to: `/crm/customers/${m.id}`,
              class: "underline mr-2"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(m.name)} (#${ssrInterpolate(m.id)})`);
                } else {
                  return [
                    createTextVNode(toDisplayString(m.name) + " (#" + toDisplayString(m.id) + ")", 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><!--[-->`);
        ssrRenderList(unref(tiles), (k) => {
          var _a2;
          _push(`<div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">${ssrInterpolate(k.l)}</p><p class="${ssrRenderClass([(_a2 = k.cls) != null ? _a2 : "text-gray-100", "text-lg font-bold font-mono"])}">${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(k.s)}</p></div>`);
        });
        _push(`<!--]--></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4 space-y-2 text-xs"><h2 class="section-title">Suggested first-order terms</h2><p><span class="text-gray-500">First order: </span>${ssrInterpolate(unref(a).terms.first_order)}</p><p><span class="text-gray-500">Credit: </span>${ssrInterpolate(unref(a).terms.credit_limit)}</p><p><span class="text-gray-500">Price: </span>${ssrInterpolate(unref(a).terms.price_tier)}</p><p><span class="text-gray-500">Delivery: </span>${ssrInterpolate(unref(a).terms.delivery)}</p><p class="text-[11px] text-gray-600 pt-1">A suggestion from how ${ssrInterpolate(unref(a).benchmark.n)} similar customers behaved (${ssrInterpolate(unref(a).benchmark.scope)}); they usually pay in ~${ssrInterpolate(Math.round(unref(a).benchmark.pay_days_median))} days. Opening credit still goes through your normal approval.</p><h2 class="section-title pt-2">Risk flags</h2><ul class="list-disc pl-5 space-y-0.5"><!--[-->`);
        ssrRenderList(unref(a).risk.flags, (f2) => {
          _push(`<li class="text-amber-200/90">${ssrInterpolate(f2)}</li>`);
        });
        _push(`<!--]-->`);
        if (!unref(a).risk.flags.length) {
          _push(`<li class="text-emerald-400 list-none -ml-5">No flags found</li>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</ul></div><div class="glass-card p-4 space-y-2 text-xs"><h2 class="section-title">Visit / call checklist <span class="text-gray-600 font-normal">\u2014 ${ssrInterpolate(unref(a).checklist.completeness)}% complete</span></h2><label class="flex items-center gap-2"><input${ssrIncludeBooleanAttr(Array.isArray(unref(cl).visited) ? ssrLooseContain(unref(cl).visited, null) : unref(cl).visited) ? " checked" : ""} type="checkbox"> Visited the premises</label><label class="flex items-center gap-2"><input${ssrIncludeBooleanAttr(Array.isArray(unref(cl).shop_photo) ? ssrLooseContain(unref(cl).shop_photo, null) : unref(cl).shop_photo) ? " checked" : ""} type="checkbox"> Photo of shop / factory taken</label><label class="flex items-center gap-2"><input${ssrIncludeBooleanAttr(Array.isArray(unref(cl).nid_checked) ? ssrLooseContain(unref(cl).nid_checked, null) : unref(cl).nid_checked) ? " checked" : ""} type="checkbox"> Owner ID checked</label><div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", unref(cl).trade_license_no)} class="field-input text-xs" placeholder="Trade licence no."><input${ssrRenderAttr("value", unref(cl).monthly_bags_declared)} type="number" class="field-input text-xs" placeholder="Monthly flour use (bags)"><input${ssrRenderAttr("value", unref(cl).current_supplier)} class="field-input text-xs" placeholder="Current supplier"><input${ssrRenderAttr("value", unref(cl).years_in_business)} class="field-input text-xs" placeholder="Years in business"></div><!--[-->`);
        ssrRenderList(unref(cl).references, (r, i) => {
          _push(`<div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", r.name)} class="field-input text-xs"${ssrRenderAttr("placeholder", `Reference ${i + 1} name`)}><input${ssrRenderAttr("value", r.phone)} class="field-input text-xs" placeholder="Phone"></div>`);
        });
        _push(`<!--]--><input${ssrRenderAttr("value", unref(cl).payment_history_notes)} class="field-input text-xs w-full" placeholder="How they pay other suppliers">`);
        if (unref(a).checklist.missing.length) {
          _push(`<p class="text-[11px] text-gray-600">Still unknown: ${ssrInterpolate(unref(a).checklist.missing.join(" \xB7 "))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="glass-card p-4 space-y-2"><h2 class="section-title">First-contact message <span class="text-gray-600 font-normal">\u2014 a draft; a person sends it</span></h2><div class="flex flex-wrap items-center gap-2 text-xs"><select class="field-input text-xs py-1.5 w-32"><option value="sms"${ssrIncludeBooleanAttr(Array.isArray(unref(dr).channel) ? ssrLooseContain(unref(dr).channel, "sms") : ssrLooseEqual(unref(dr).channel, "sms")) ? " selected" : ""}>SMS</option><option value="whatsapp"${ssrIncludeBooleanAttr(Array.isArray(unref(dr).channel) ? ssrLooseContain(unref(dr).channel, "whatsapp") : ssrLooseEqual(unref(dr).channel, "whatsapp")) ? " selected" : ""}>WhatsApp</option><option value="email"${ssrIncludeBooleanAttr(Array.isArray(unref(dr).channel) ? ssrLooseContain(unref(dr).channel, "email") : ssrLooseEqual(unref(dr).channel, "email")) ? " selected" : ""}>Email</option></select><select class="field-input text-xs py-1.5 w-28"><option value="bn"${ssrIncludeBooleanAttr(Array.isArray(unref(dr).lang) ? ssrLooseContain(unref(dr).lang, "bn") : ssrLooseEqual(unref(dr).lang, "bn")) ? " selected" : ""}>\u09AC\u09BE\u0982\u09B2\u09BE</option><option value="en"${ssrIncludeBooleanAttr(Array.isArray(unref(dr).lang) ? ssrLooseContain(unref(dr).lang, "en") : ssrLooseEqual(unref(dr).lang, "en")) ? " selected" : ""}>English</option></select><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(dbusy)) ? " disabled" : ""}>${ssrInterpolate(unref(dbusy) ? "Writing\u2026" : "Write draft")}</button>`);
        if (unref(dr).source) {
          _push(`<span class="text-[11px] text-gray-600">${ssrInterpolate(unref(dr).source === "assistant" ? "written by the assistant" : "standard template (switch the assistant on in Settings \u2192 CRM for tailored drafts)")}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(dr).body) {
          _push(`<!--[-->`);
          if (unref(dr).subject) {
            _push(`<input${ssrRenderAttr("value", unref(dr).subject)} class="field-input text-xs w-full">`);
          } else {
            _push(`<!---->`);
          }
          _push(`<textarea rows="5" class="field-input text-xs w-full">${ssrInterpolate(unref(dr).body)}</textarea><div class="flex flex-wrap gap-2"><button class="btn-ghost text-xs">Copy</button>`);
          if (unref(dr).channel === "whatsapp" && unref(waUrl)) {
            _push(`<a${ssrRenderAttr("href", unref(waUrl))} target="_blank" rel="noopener" class="btn-ghost text-xs">Open in WhatsApp</a>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(dr).channel === "email" && unref(p).email) {
            _push(`<a${ssrRenderAttr("href", `mailto:${unref(p).email}?subject=${encodeURIComponent(unref(dr).subject)}&body=${encodeURIComponent(unref(dr).body)}`)} class="btn-ghost text-xs">Open in email</a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="btn-ghost text-xs">I sent it \u2014 log it</button></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4 space-y-2"><h2 class="section-title">Log a contact</h2><div class="flex gap-2"><select class="field-input text-xs py-1.5 w-32"><!--[-->`);
        ssrRenderList(["call", "visit", "whatsapp", "sms", "email", "note"], (x) => {
          _push(`<option${ssrRenderAttr("value", x)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).channel) ? ssrLooseContain(unref(f).channel, x) : ssrLooseEqual(unref(f).channel, x)) ? " selected" : ""}>${ssrInterpolate(x)}</option>`);
        });
        _push(`<!--]--></select><input${ssrRenderAttr("value", unref(f).outcome)} class="field-input text-xs py-1.5 flex-1" placeholder="Outcome"></div><textarea rows="2" class="field-input text-xs w-full" placeholder="What was said / agreed\u2026">${ssrInterpolate(unref(f).summary)}</textarea><div class="flex items-center gap-2 text-xs text-gray-400">Follow up on <input${ssrRenderAttr("value", unref(f).follow_up_date)} type="date" class="field-input text-xs py-1.5 w-36"><button class="btn-gold text-xs ml-auto"${ssrIncludeBooleanAttr(!unref(f).summary.trim()) ? " disabled" : ""}>Save</button></div><div class="pt-2 border-t border-white/[0.06] max-h-60 overflow-y-auto"><!--[-->`);
        ssrRenderList(unref(d).interactions, (i) => {
          _push(`<div class="text-xs py-1.5 border-b border-white/[0.04]"><span class="text-gray-500">${ssrInterpolate(String(i.created_at).slice(0, 16))}</span> <span class="px-1.5 py-0.5 rounded bg-white/10 mx-1">${ssrInterpolate(i.channel)}</span>${ssrInterpolate(i.summary)}`);
          if (i.outcome) {
            _push(`<span class="text-emerald-400"> \u2014 ${ssrInterpolate(i.outcome)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-4 space-y-2 text-xs"><h2 class="section-title">Make them a customer</h2>`);
        if (unref(p).converted_customer_id) {
          _push(`<p class="text-emerald-400">Linked to customer `);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/crm/customers/${unref(p).converted_customer_id}`,
            class: "underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`#${ssrInterpolate(unref(p).converted_customer_id)}`);
              } else {
                return [
                  createTextVNode("#" + toDisplayString(unref(p).converted_customer_id), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`.</p>`);
        } else {
          _push(`<!--[--><p class="text-gray-400">Creates the customer record with a \u09F30 credit limit (credit is opened later, through your normal approval, following the terms above) and marks this prospect Won.</p><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(p).phone || unref(a).same_as_customers.length > 0 || unref(busy)) ? " disabled" : ""}>Create customer</button>`);
          if (!unref(p).phone) {
            _push(`<p class="text-[11px] text-amber-300">A phone number is needed first.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
        _push(`<h2 class="section-title pt-3">Danger zone</h2><div class="flex gap-2"><button class="btn-ghost text-xs">Mark lost\u2026</button>`);
        if (unref(isAdmin)) {
          _push(`<button class="btn-ghost text-xs text-red-400">Delete</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/prospects/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-wTZrpHTF.mjs.map

import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, computed, withAsyncContext, reactive, watchEffect, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { w as whatsappLink } from './usePrintSize-CHoLIjZz.mjs';
import { c as _export_sfc, k as useRoute, q as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const R = 84;
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
    const initials = computed(() => {
      var _a;
      return String((_a = p.value.name) != null ? _a : "?").split(/[\s/&]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
    });
    const lastContact = computed(() => {
      var _a, _b;
      return ((_b = (_a = d.value.interactions) == null ? void 0 : _a[0]) == null ? void 0 : _b.created_at) ? String(d.value.interactions[0].created_at).slice(0, 10) : "NONE ON RECORD";
    });
    const stageIdx = computed(() => stages.indexOf(p.value.stage));
    const stamp = computed(() => {
      const v = a.value.verdict;
      return v.startsWith("Pursue") ? "PURSUE" : v.startsWith("Already") ? "EXISTING ASSET" : v.startsWith("Worth") ? "VERIFY FIRST" : "LOW PRIORITY";
    });
    const stampCls = computed(() => stamp.value === "PURSUE" ? "go" : stamp.value === "EXISTING ASSET" ? "warn" : stamp.value === "VERIFY FIRST" ? "mid" : "low");
    const mapUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.value.name, p.value.address, p.value.district || a.value.district].filter(Boolean).join(" "))}`);
    const axisXY = (i, k, r = R) => {
      const t = (-90 + i * 72) * Math.PI / 180;
      return [Math.cos(t) * r * k, Math.sin(t) * r * k];
    };
    const ring = (k) => [0, 1, 2, 3, 4].map((i) => axisXY(i, k).join(",")).join(" ");
    const radar = computed(() => {
      var _a;
      const x = a.value, hi = Number((_a = x.potential.monthly_high) != null ? _a : 0);
      const vals = [["FIT", x.fit], ["VALUE", Math.min(100, Math.round(100 * Math.log10(1 + hi) / Math.log10(5e6)))], ["SAFETY", 100 - x.risk.score], ["CONFIDENCE", x.confidence], ["INTEL", x.checklist.completeness]];
      const axes = vals.map(([label, v], i) => {
        const [ex, ey] = axisXY(i, 1), [px, py] = axisXY(i, Math.max(0.04, v / 100)), [lx, ly] = axisXY(i, 1, R + 16);
        return { label, v: Math.round(v), x: ex, y: ey, px, py, lx, ly: ly + 3 };
      });
      return { axes, points: axes.map((q) => `${q.px},${q.py}`).join(" ") };
    });
    const gauges = computed(() => {
      const x = a.value;
      return [
        { l: "ACQUISITION INDEX", v: `${x.fit}`, bar: x.fit, s: `${x.segment} \xB7 ${x.district}`, tone: "cy" },
        { l: "RISK EXPOSURE", v: String(x.risk.band).toUpperCase(), bar: x.risk.score, s: `score ${x.risk.score} \xB7 ${x.risk.flags.length} flag(s)`, tone: x.risk.band === "High" ? "rd" : x.risk.band === "Medium" ? "am" : "gn" },
        { l: "EST. MONTHLY VALUE", v: `\u09F3${n0(x.potential.monthly_low)}\u2013${n0(x.potential.monthly_high)}`, bar: null, s: x.potential.basis, tone: "cy" },
        { l: "INTEL CONFIDENCE", v: `${x.confidence}%`, bar: x.confidence, s: `${x.checklist.completeness}% of the checklist done`, tone: "cy" }
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4 dx" }, _attrs))} data-v-78164280>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-78164280>Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-78164280>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else if (unref(d)) {
        _push(`<!--[--><section class="dx-hero" data-v-78164280><div class="dx-strip" data-v-78164280><span data-v-78164280><i class="dx-dot" data-v-78164280></i> CASE FILE \u2116 ${ssrInterpolate(String(unref(p).id).padStart(5, "0"))}</span><span class="hidden sm:inline" data-v-78164280>CLASS: ${ssrInterpolate(String(unref(a).segment).toUpperCase())}</span><span class="hidden md:inline" data-v-78164280>SECTOR: ${ssrInterpolate(String(unref(a).district).toUpperCase())}</span><span class="ml-auto" data-v-78164280>LAST CONTACT: ${ssrInterpolate(unref(lastContact))}</span></div><div class="dx-grid" data-v-78164280><div class="dx-id" data-v-78164280><div class="dx-avatar" aria-hidden="true" data-v-78164280><svg viewBox="0 0 120 120" class="dx-ring" data-v-78164280><circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 5" data-v-78164280></circle><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="40 120" data-v-78164280></circle></svg><div class="dx-hex" data-v-78164280><span data-v-78164280>${ssrInterpolate(unref(initials))}</span><b class="dx-scan" data-v-78164280></b></div></div><div class="min-w-0" data-v-78164280><p class="dx-eyebrow" data-v-78164280>SUBJECT</p><h1 class="dx-name" data-v-78164280>${ssrInterpolate(unref(p).name)}</h1>`);
        if (unref(p).business_name) {
          _push(`<p class="dx-aka" data-v-78164280>A.K.A. ${ssrInterpolate(unref(p).business_name)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="${ssrRenderClass([unref(stampCls), "dx-stamp"])}" data-v-78164280>${ssrInterpolate(unref(stamp))}</p></div></div><div class="dx-radar" data-v-78164280><svg viewBox="0 0 280 250" role="img"${ssrRenderAttr("aria-label", `Profile radar: ${unref(radar).axes.map((x) => x.label + " " + x.v).join(", ")}`)} data-v-78164280><g transform="translate(140,125)" data-v-78164280><!--[-->`);
        ssrRenderList([0.25, 0.5, 0.75, 1], (r) => {
          _push(`<polygon${ssrRenderAttr("points", ring(r))} class="dx-grid-ring" data-v-78164280></polygon>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(radar).axes, (ax, i) => {
          _push(`<line x1="0" y1="0"${ssrRenderAttr("x2", ax.x)}${ssrRenderAttr("y2", ax.y)} class="dx-grid-ring" data-v-78164280></line>`);
        });
        _push(`<!--]--><polygon${ssrRenderAttr("points", unref(radar).points)} class="dx-shape" data-v-78164280></polygon><!--[-->`);
        ssrRenderList(unref(radar).axes, (ax, i) => {
          _push(`<circle${ssrRenderAttr("cx", ax.px)}${ssrRenderAttr("cy", ax.py)} r="3" class="dx-node" data-v-78164280></circle>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(radar).axes, (ax, i) => {
          _push(`<text${ssrRenderAttr("x", ax.lx)}${ssrRenderAttr("y", ax.ly)} text-anchor="middle" class="dx-axis" data-v-78164280>${ssrInterpolate(ax.label)} <tspan class="dx-axis-v" data-v-78164280>${ssrInterpolate(ax.v)}</tspan></text>`);
        });
        _push(`<!--]--></g></svg></div></div><div class="dx-gauges" data-v-78164280><!--[-->`);
        ssrRenderList(unref(gauges), (g) => {
          _push(`<div class="${ssrRenderClass([g.tone, "dx-gauge"])}" data-v-78164280><p class="dx-lab" data-v-78164280>${ssrInterpolate(g.l)}</p><p class="dx-big" data-v-78164280>${ssrInterpolate(g.v)}</p>`);
          if (g.bar != null) {
            _push(`<div class="dx-seg" aria-hidden="true" data-v-78164280><!--[-->`);
            ssrRenderList(20, (n) => {
              _push(`<i class="${ssrRenderClass({ on: n <= Math.round(g.bar / 5) })}" data-v-78164280></i>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<p class="dx-sub" data-v-78164280>${ssrInterpolate(g.s)}</p></div>`);
        });
        _push(`<!--]--></div><div class="dx-rail" role="group" aria-label="Pipeline stage" data-v-78164280><!--[-->`);
        ssrRenderList(stages, (s, i) => {
          _push(`<button type="button" class="${ssrRenderClass([{ cur: unref(p).stage === s, done: unref(stageIdx) > i && unref(p).stage !== "lost" && s !== "lost", lost: s === "lost" }, "dx-step"])}" data-v-78164280><i data-v-78164280></i><span data-v-78164280>${ssrInterpolate(s)}</span></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(a).same_as_customers.length) {
          _push(`<div class="dx-alert" data-v-78164280>\u26A0 ASSET ALREADY ON FILE \u2014 <!--[-->`);
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
        _push(`</section><div class="grid grid-cols-1 lg:grid-cols-3 gap-4" data-v-78164280><div class="glass-card p-4 space-y-2 lg:col-span-2" data-v-78164280><h2 class="section-title" data-v-78164280>Field intel</h2><div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs" data-v-78164280><label class="text-gray-500" data-v-78164280>Business type <select class="field-input text-xs w-full mt-0.5" data-v-78164280><option value="" data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(edit).segment) ? ssrLooseContain(unref(edit).segment, "") : ssrLooseEqual(unref(edit).segment, "")) ? " selected" : ""}>${ssrInterpolate(unref(a).segment)} (guess)</option><!--[-->`);
        ssrRenderList(segments, (s) => {
          _push(`<option${ssrRenderAttr("value", s)} data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(edit).segment) ? ssrLooseContain(unref(edit).segment, s) : ssrLooseEqual(unref(edit).segment, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
        });
        _push(`<!--]--></select></label><label class="text-gray-500" data-v-78164280>Phone <input${ssrRenderAttr("value", unref(edit).phone)} class="field-input text-xs w-full mt-0.5" data-v-78164280></label><label class="text-gray-500" data-v-78164280>Contact person <input${ssrRenderAttr("value", unref(edit).contact_person)} class="field-input text-xs w-full mt-0.5" data-v-78164280></label><label class="text-gray-500 sm:col-span-2" data-v-78164280>Address <input${ssrRenderAttr("value", unref(edit).address)} class="field-input text-xs w-full mt-0.5" data-v-78164280></label><label class="text-gray-500" data-v-78164280>District <input${ssrRenderAttr("value", unref(edit).district)}${ssrRenderAttr("placeholder", unref(a).district + " (guess)")} class="field-input text-xs w-full mt-0.5" data-v-78164280></label></div><p class="text-[11px] text-gray-600" data-v-78164280>Source: ${ssrInterpolate((_a = unref(p).source) != null ? _a : "\u2014")}`);
        if (unref(p).source_url) {
          _push(`<!--[--> \xB7 <a${ssrRenderAttr("href", unref(p).source_url)} target="_blank" rel="noopener" class="text-gold-400 hover:underline" data-v-78164280>${ssrInterpolate(unref(p).source_url)}</a><!--]-->`);
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
        _push(` \xB7 <a${ssrRenderAttr("href", unref(mapUrl))} target="_blank" rel="noopener" class="text-gold-400 hover:underline" data-v-78164280>\u{1F4CD} Locate on map</a></p></div><div class="glass-card p-4 space-y-2" data-v-78164280><h2 class="section-title" data-v-78164280>Unverified intel <span class="text-gray-600 font-normal" data-v-78164280>\u2014 ${ssrInterpolate(unref(a).checklist.missing.length)} redacted</span></h2><!--[-->`);
        ssrRenderList(unref(a).checklist.missing, (m) => {
          _push(`<div class="dx-redact" data-v-78164280><span data-v-78164280>${ssrInterpolate(m)}</span></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(a).checklist.missing.length) {
          _push(`<p class="text-xs text-emerald-400" data-v-78164280>Nothing redacted \u2014 file complete.</p>`);
        } else {
          _push(`<p class="text-[11px] text-gray-600" data-v-78164280>Visit or call, then tick the checklist below to declassify.</p>`);
        }
        _push(`</div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4" data-v-78164280><div class="glass-card p-4 space-y-2 text-xs" data-v-78164280><h2 class="section-title" data-v-78164280>Suggested first-order terms</h2><p data-v-78164280><span class="text-gray-500" data-v-78164280>First order: </span>${ssrInterpolate(unref(a).terms.first_order)}</p><p data-v-78164280><span class="text-gray-500" data-v-78164280>Credit: </span>${ssrInterpolate(unref(a).terms.credit_limit)}</p><p data-v-78164280><span class="text-gray-500" data-v-78164280>Price: </span>${ssrInterpolate(unref(a).terms.price_tier)}</p><p data-v-78164280><span class="text-gray-500" data-v-78164280>Delivery: </span>${ssrInterpolate(unref(a).terms.delivery)}</p><p class="text-[11px] text-gray-600 pt-1" data-v-78164280>A suggestion from how ${ssrInterpolate(unref(a).benchmark.n)} similar customers behaved (${ssrInterpolate(unref(a).benchmark.scope)}); they usually pay in ~${ssrInterpolate(Math.round(unref(a).benchmark.pay_days_median))} days. Opening credit still goes through your normal approval.</p><h2 class="section-title pt-2" data-v-78164280>Risk flags</h2><ul class="list-disc pl-5 space-y-0.5" data-v-78164280><!--[-->`);
        ssrRenderList(unref(a).risk.flags, (f2) => {
          _push(`<li class="text-amber-200/90" data-v-78164280>${ssrInterpolate(f2)}</li>`);
        });
        _push(`<!--]-->`);
        if (!unref(a).risk.flags.length) {
          _push(`<li class="text-emerald-400 list-none -ml-5" data-v-78164280>No flags found</li>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</ul></div><div class="glass-card p-4 space-y-2 text-xs" data-v-78164280><h2 class="section-title" data-v-78164280>Visit / call checklist <span class="text-gray-600 font-normal" data-v-78164280>\u2014 ${ssrInterpolate(unref(a).checklist.completeness)}% complete</span></h2><label class="flex items-center gap-2" data-v-78164280><input${ssrIncludeBooleanAttr(Array.isArray(unref(cl).visited) ? ssrLooseContain(unref(cl).visited, null) : unref(cl).visited) ? " checked" : ""} type="checkbox" data-v-78164280> Visited the premises</label><label class="flex items-center gap-2" data-v-78164280><input${ssrIncludeBooleanAttr(Array.isArray(unref(cl).shop_photo) ? ssrLooseContain(unref(cl).shop_photo, null) : unref(cl).shop_photo) ? " checked" : ""} type="checkbox" data-v-78164280> Photo of shop / factory taken</label><label class="flex items-center gap-2" data-v-78164280><input${ssrIncludeBooleanAttr(Array.isArray(unref(cl).nid_checked) ? ssrLooseContain(unref(cl).nid_checked, null) : unref(cl).nid_checked) ? " checked" : ""} type="checkbox" data-v-78164280> Owner ID checked</label><div class="grid grid-cols-2 gap-2" data-v-78164280><input${ssrRenderAttr("value", unref(cl).trade_license_no)} class="field-input text-xs" placeholder="Trade licence no." data-v-78164280><input${ssrRenderAttr("value", unref(cl).monthly_bags_declared)} type="number" class="field-input text-xs" placeholder="Monthly flour use (bags)" data-v-78164280><input${ssrRenderAttr("value", unref(cl).current_supplier)} class="field-input text-xs" placeholder="Current supplier" data-v-78164280><input${ssrRenderAttr("value", unref(cl).years_in_business)} class="field-input text-xs" placeholder="Years in business" data-v-78164280></div><!--[-->`);
        ssrRenderList(unref(cl).references, (r, i) => {
          _push(`<div class="grid grid-cols-2 gap-2" data-v-78164280><input${ssrRenderAttr("value", r.name)} class="field-input text-xs"${ssrRenderAttr("placeholder", `Reference ${i + 1} name`)} data-v-78164280><input${ssrRenderAttr("value", r.phone)} class="field-input text-xs" placeholder="Phone" data-v-78164280></div>`);
        });
        _push(`<!--]--><input${ssrRenderAttr("value", unref(cl).payment_history_notes)} class="field-input text-xs w-full" placeholder="How they pay other suppliers" data-v-78164280>`);
        if (unref(a).checklist.missing.length) {
          _push(`<p class="text-[11px] text-gray-600" data-v-78164280>Still unknown: ${ssrInterpolate(unref(a).checklist.missing.join(" \xB7 "))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="glass-card p-4 space-y-2" data-v-78164280><h2 class="section-title" data-v-78164280>First-contact message <span class="text-gray-600 font-normal" data-v-78164280>\u2014 a draft; a person sends it</span></h2><div class="flex flex-wrap items-center gap-2 text-xs" data-v-78164280><select class="field-input text-xs py-1.5 w-32" data-v-78164280><option value="sms" data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(dr).channel) ? ssrLooseContain(unref(dr).channel, "sms") : ssrLooseEqual(unref(dr).channel, "sms")) ? " selected" : ""}>SMS</option><option value="whatsapp" data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(dr).channel) ? ssrLooseContain(unref(dr).channel, "whatsapp") : ssrLooseEqual(unref(dr).channel, "whatsapp")) ? " selected" : ""}>WhatsApp</option><option value="email" data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(dr).channel) ? ssrLooseContain(unref(dr).channel, "email") : ssrLooseEqual(unref(dr).channel, "email")) ? " selected" : ""}>Email</option></select><select class="field-input text-xs py-1.5 w-28" data-v-78164280><option value="bn" data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(dr).lang) ? ssrLooseContain(unref(dr).lang, "bn") : ssrLooseEqual(unref(dr).lang, "bn")) ? " selected" : ""}>\u09AC\u09BE\u0982\u09B2\u09BE</option><option value="en" data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(dr).lang) ? ssrLooseContain(unref(dr).lang, "en") : ssrLooseEqual(unref(dr).lang, "en")) ? " selected" : ""}>English</option></select><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(dbusy)) ? " disabled" : ""} data-v-78164280>${ssrInterpolate(unref(dbusy) ? "Writing\u2026" : "Write draft")}</button>`);
        if (unref(dr).source) {
          _push(`<span class="text-[11px] text-gray-600" data-v-78164280>${ssrInterpolate(unref(dr).source === "assistant" ? "written by the assistant" : "standard template (switch the assistant on in Settings \u2192 CRM for tailored drafts)")}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(dr).body) {
          _push(`<!--[-->`);
          if (unref(dr).subject) {
            _push(`<input${ssrRenderAttr("value", unref(dr).subject)} class="field-input text-xs w-full" data-v-78164280>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<textarea rows="5" class="field-input text-xs w-full" data-v-78164280>${ssrInterpolate(unref(dr).body)}</textarea><div class="flex flex-wrap gap-2" data-v-78164280><button class="btn-ghost text-xs" data-v-78164280>Copy</button>`);
          if (unref(dr).channel === "whatsapp" && unref(waUrl)) {
            _push(`<a${ssrRenderAttr("href", unref(waUrl))} target="_blank" rel="noopener" class="btn-ghost text-xs" data-v-78164280>Open in WhatsApp</a>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(dr).channel === "email" && unref(p).email) {
            _push(`<a${ssrRenderAttr("href", `mailto:${unref(p).email}?subject=${encodeURIComponent(unref(dr).subject)}&body=${encodeURIComponent(unref(dr).body)}`)} class="btn-ghost text-xs" data-v-78164280>Open in email</a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="btn-ghost text-xs" data-v-78164280>I sent it \u2014 log it</button></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4" data-v-78164280><div class="glass-card p-4 space-y-2" data-v-78164280><h2 class="section-title" data-v-78164280>Log a contact</h2><div class="flex gap-2" data-v-78164280><select class="field-input text-xs py-1.5 w-32" data-v-78164280><!--[-->`);
        ssrRenderList(["call", "visit", "whatsapp", "sms", "email", "note"], (x) => {
          _push(`<option${ssrRenderAttr("value", x)} data-v-78164280${ssrIncludeBooleanAttr(Array.isArray(unref(f).channel) ? ssrLooseContain(unref(f).channel, x) : ssrLooseEqual(unref(f).channel, x)) ? " selected" : ""}>${ssrInterpolate(x)}</option>`);
        });
        _push(`<!--]--></select><input${ssrRenderAttr("value", unref(f).outcome)} class="field-input text-xs py-1.5 flex-1" placeholder="Outcome" data-v-78164280></div><textarea rows="2" class="field-input text-xs w-full" placeholder="What was said / agreed\u2026" data-v-78164280>${ssrInterpolate(unref(f).summary)}</textarea><div class="flex items-center gap-2 text-xs text-gray-400" data-v-78164280>Follow up on <input${ssrRenderAttr("value", unref(f).follow_up_date)} type="date" class="field-input text-xs py-1.5 w-36" data-v-78164280><button class="btn-gold text-xs ml-auto"${ssrIncludeBooleanAttr(!unref(f).summary.trim()) ? " disabled" : ""} data-v-78164280>Save</button></div><div class="pt-2 border-t border-white/[0.06] max-h-60 overflow-y-auto" data-v-78164280><!--[-->`);
        ssrRenderList(unref(d).interactions, (i) => {
          _push(`<div class="text-xs py-1.5 border-b border-white/[0.04]" data-v-78164280><span class="text-gray-500" data-v-78164280>${ssrInterpolate(String(i.created_at).slice(0, 16))}</span> <span class="px-1.5 py-0.5 rounded bg-white/10 mx-1" data-v-78164280>${ssrInterpolate(i.channel)}</span>${ssrInterpolate(i.summary)}`);
          if (i.outcome) {
            _push(`<span class="text-emerald-400" data-v-78164280> \u2014 ${ssrInterpolate(i.outcome)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-4 space-y-2 text-xs" data-v-78164280><h2 class="section-title" data-v-78164280>Make them a customer</h2>`);
        if (unref(p).converted_customer_id) {
          _push(`<p class="text-emerald-400" data-v-78164280>Linked to customer `);
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
          _push(`<!--[--><p class="text-gray-400" data-v-78164280>Creates the customer record with a \u09F30 credit limit (credit is opened later, through your normal approval, following the terms above) and marks this prospect Won.</p><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(p).phone || unref(a).same_as_customers.length > 0 || unref(busy)) ? " disabled" : ""} data-v-78164280>Create customer</button>`);
          if (!unref(p).phone) {
            _push(`<p class="text-[11px] text-amber-300" data-v-78164280>A phone number is needed first.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
        _push(`<h2 class="section-title pt-3" data-v-78164280>Danger zone</h2><div class="flex gap-2" data-v-78164280><button class="btn-ghost text-xs" data-v-78164280>Mark lost\u2026</button>`);
        if (unref(isAdmin)) {
          _push(`<button class="btn-ghost text-xs text-red-400" data-v-78164280>Delete</button>`);
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
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-78164280"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-jumRKELv.mjs.map

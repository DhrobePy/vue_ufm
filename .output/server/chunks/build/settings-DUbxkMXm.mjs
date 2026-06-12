import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-C6rBgLMJ.mjs';
import { defineComponent, ref, watch, withAsyncContext, reactive, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useTheme } from './useTheme-DcI34_eY.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
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
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    let __temp, __restore;
    useToast();
    const themeStore = useTheme();
    const appCustomHex = ref(themeStore.customHex.value);
    watch(() => themeStore.customHex.value, (v) => {
      appCustomHex.value = v;
    });
    const TC_DEFAULTS = {
      tc_purchase_order: [
        "Goods must conform to specified quality standards upon delivery.",
        "Moisture content must not exceed 13% for wheat.",
        "Supplier must provide phytosanitary certificate for imported wheat.",
        "Payment terms as stated above from GRN acceptance.",
        "Any short delivery must be notified before unloading.",
        "Subject to Sirajgonj jurisdiction."
      ].join("\n"),
      tc_credit_invoice: [
        "Payment due within 30 days of invoice date.",
        "Goods once sold cannot be returned without prior written approval.",
        "Interest @ 2% per month charged on overdue balances.",
        "All disputes subject to Sirajgonj jurisdiction.",
        "This invoice is valid only with authorised company stamp."
      ].join("\n")
    };
    const { data: docData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/documents",
      "$DwdUfiZ5-1"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const docSettings = reactive({
      tc_purchase_order: (_c = (_b = (_a = docData.value) == null ? void 0 : _a.settings) == null ? void 0 : _b.tc_purchase_order) != null ? _c : TC_DEFAULTS.tc_purchase_order,
      tc_credit_invoice: (_f = (_e = (_d = docData.value) == null ? void 0 : _d.settings) == null ? void 0 : _e.tc_credit_invoice) != null ? _f : TC_DEFAULTS.tc_credit_invoice
    });
    const docSaving = ref(false);
    const { data: deliveryData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/delivery",
      "$R2g-v84IhP"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const deliverySettings = reactive({
      require_dispatch_pin: (_i = (_h = (_g = deliveryData.value) == null ? void 0 : _g.settings) == null ? void 0 : _h.require_dispatch_pin) != null ? _i : true,
      require_delivery_pin: (_l = (_k = (_j = deliveryData.value) == null ? void 0 : _j.settings) == null ? void 0 : _k.require_delivery_pin) != null ? _l : false
    });
    const deliverySaving = ref(false);
    const deliverySaveMsg = ref("");
    const seeding = ref(false);
    const seedReport = ref(null);
    const seedSummary = ref("");
    const activeTab = ref("company");
    const tabs = [
      { id: "company", icon: "\u{1F3E2}", label: "Company" },
      { id: "branches", icon: "\u{1F4CD}", label: "Branches" },
      { id: "finance", icon: "\u{1F4B0}", label: "Finance" },
      { id: "orders", icon: "\u{1F4CB}", label: "Orders" },
      { id: "documents", icon: "\u{1F4C4}", label: "Documents" },
      { id: "delivery", icon: "\u{1F4E6}", label: "Delivery" },
      { id: "appearance", icon: "\u{1F3A8}", label: "Appearance" },
      { id: "notifications", icon: "\u{1F514}", label: "Notifications" },
      { id: "security", icon: "\u{1F512}", label: "Security" },
      { id: "maintenance", icon: "\u{1F527}", label: "Maintenance" }
    ];
    const company = reactive({
      name: "Ujjal Flour Mills Company",
      tradeName: "Ujjal FMC",
      regNo: "C-XXXXXX/XX",
      tin: "123456789-0101",
      address: "Sirajgonj Sadar, Sirajgonj-6700, Bangladesh",
      phone: "+880 1711-000000",
      email: "info@ujjalfmc.com"
    });
    const { data: branchData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$NqHOlEdr6Q"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(
      () => {
        var _a2, _b2;
        return ((_b2 = (_a2 = branchData.value) == null ? void 0 : _a2.branches) != null ? _b2 : []).map((b) => {
          var _a3, _b3, _c2;
          return {
            id: b.id,
            name: b.name,
            code: (_a3 = b.code) != null ? _a3 : "",
            address: (_b3 = b.address) != null ? _b3 : "\u2014",
            status: (_c2 = b.status) != null ? _c2 : "active"
          };
        });
      }
    );
    const finance = reactive({
      fyStart: "07",
      currency: "BDT",
      defaultCreditLimit: 5e5,
      defaultPaymentTerms: 30,
      vatRate: 0,
      lateRate: 1.5
    });
    const orderOptions = reactive([
      { key: "auto_approve", label: "Auto-approve orders under credit limit", description: "Orders within limit bypass manual approval", value: false },
      { key: "require_pod", label: "Require Proof of Delivery", description: "Driver must upload photo or signature", value: true },
      { key: "allow_partial", label: "Allow partial deliveries", description: "Orders can be delivered in multiple trips", value: true },
      { key: "block_overdue", label: "Block orders for overdue customers", description: "Prevent new orders if customer has overdue amount", value: true }
    ]);
    const notifChannels = reactive([
      { key: "telegram", label: "Telegram Notifications", description: "Send order & payment alerts to Telegram", enabled: true },
      { key: "email", label: "Email Notifications", description: "Send daily summaries by email", enabled: false }
    ]);
    const notifSettings = reactive({ telegramToken: "", adminChatId: "" });
    const security = reactive({ sessionTimeout: 120, maxLoginAttempts: 5 });
    const securityOptions = reactive([
      { key: "force_2fa", label: "Require 2FA for Admin roles", description: "Superadmin and admin must use two-factor auth", value: false },
      { key: "ip_whitelist", label: "IP Whitelist (office only)", description: "Restrict login to known office IPs", value: false },
      { key: "audit_all", label: "Log all page views", description: "Include read actions in audit trail", value: false }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "System Settings",
        subtitle: "Configure ERP preferences, branches, and integrations",
        breadcrumb: ["Admin", "Settings"]
      }, null, _parent));
      _push(`<div class="flex gap-6 flex-col lg:flex-row"><div class="lg:w-52 shrink-0"><div class="glass-card p-2 space-y-0.5"><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass([
          "w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
          unref(activeTab) !== tab.id && "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
        ])}" style="${ssrRenderStyle(unref(activeTab) === tab.id ? "background:rgb(var(--accent)/0.10);color:var(--accent-from);border:1px solid rgb(var(--accent)/0.20)" : "")}"><span class="text-base">${ssrInterpolate(tab.icon)}</span> ${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div></div><div class="flex-1 space-y-5">`);
      if (unref(activeTab) === "company") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Company Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</label><input${ssrRenderAttr("value", unref(company).name)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trade Name</label><input${ssrRenderAttr("value", unref(company).tradeName)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration No.</label><input${ssrRenderAttr("value", unref(company).regNo)} type="text" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">TIN / BIN</label><input${ssrRenderAttr("value", unref(company).tin)} type="text" class="input-glass font-mono"></div><div class="space-y-1.5 sm:col-span-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Address</label><textarea rows="2" class="input-glass resize-none">${ssrInterpolate(unref(company).address)}</textarea></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label><input${ssrRenderAttr("value", unref(company).phone)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label><input${ssrRenderAttr("value", unref(company).email)} type="email" class="input-glass"></div></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "branches") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-4"><div class="flex items-center justify-between"><h3 class="section-title">Branches</h3><button class="btn-gold text-xs">+ Add Branch</button></div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]"><div><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(b.name)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(b.address)}</p></div><div class="flex items-center gap-3">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: b.status
          }, null, _parent));
          _push(`<button class="text-xs text-gray-500 hover:text-gold-400 transition-colors">Edit</button></div></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "finance") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Fiscal Settings</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fiscal Year Start</label><select class="input-glass"><option value="01"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "01") : ssrLooseEqual(unref(finance).fyStart, "01")) ? " selected" : ""}>January</option><option value="04"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "04") : ssrLooseEqual(unref(finance).fyStart, "04")) ? " selected" : ""}>April</option><option value="07"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "07") : ssrLooseEqual(unref(finance).fyStart, "07")) ? " selected" : ""}>July (Bangladesh FY)</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Currency</label><select class="input-glass"><option value="BDT"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).currency) ? ssrLooseContain(unref(finance).currency, "BDT") : ssrLooseEqual(unref(finance).currency, "BDT")) ? " selected" : ""}>BDT \u2014 Bangladeshi Taka (\u09F3)</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Credit Limit (\u09F3)</label><input${ssrRenderAttr("value", unref(finance).defaultCreditLimit)} type="number" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Payment Terms (days)</label><input${ssrRenderAttr("value", unref(finance).defaultPaymentTerms)} type="number" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">VAT Rate (%)</label><input${ssrRenderAttr("value", unref(finance).vatRate)} type="number" step="0.5" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Late Payment Penalty (%)</label><input${ssrRenderAttr("value", unref(finance).lateRate)} type="number" step="0.5" class="input-glass font-mono"></div></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "orders") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Order Settings</h3><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(orderOptions), (opt) => {
          _push(`<div class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"><div><p class="text-sm font-medium text-gray-200">${ssrInterpolate(opt.label)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(opt.description)}</p></div><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(opt.value) ? ssrLooseContain(opt.value, null) : opt.value) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "documents") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-6"><h3 class="section-title">Document Terms &amp; Conditions</h3><p class="text-xs text-gray-500">Customize the T&amp;C text printed on vouchers. Enter one clause per line \u2014 each line becomes a bullet point on the document.</p><div class="space-y-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order T&amp;C</label><p class="text-[11px] text-gray-600">Printed in the Terms &amp; Conditions box of every PO receipt.</p><textarea rows="7" class="input-glass resize-y font-mono text-xs leading-relaxed" placeholder="One clause per line\u2026">${ssrInterpolate(unref(docSettings).tc_purchase_order)}</textarea></div><div class="space-y-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Sales Invoice T&amp;C</label><p class="text-[11px] text-gray-600">Printed in the Notes &amp; Terms section of every credit sales invoice.</p><textarea rows="7" class="input-glass resize-y font-mono text-xs leading-relaxed" placeholder="One clause per line\u2026">${ssrInterpolate(unref(docSettings).tc_credit_invoice)}</textarea></div><div class="flex items-center justify-between pt-2"><button class="btn-ghost text-xs">Reset to Defaults</button><button${ssrIncludeBooleanAttr(unref(docSaving)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(docSaving)) {
          _push(`<svg class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(docSaving) ? "Saving\u2026" : "Save Document Settings")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "appearance") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-6"><div><h3 class="section-title">Appearance &amp; Theme</h3><p class="text-xs text-gray-500 mt-1">Personalise the look of your workspace \u2014 background, accent colour, and presets.</p></div><div class="space-y-3"><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Background</p><div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5"><!--[-->`);
        ssrRenderList(unref(themeStore).BASE_THEMES, (base) => {
          _push(`<button style="${ssrRenderStyle([unref(themeStore).baseId.value === base.id ? "border-color:var(--accent-from);box-shadow:0 0 0 3px rgb(var(--accent)/0.18)" : "border-color:transparent", { "height": "76px" }])}" class="${ssrRenderClass([unref(themeStore).baseId.value !== base.id && "hover:border-white/20", "relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left"])}"><div class="absolute inset-0" style="${ssrRenderStyle(`background: linear-gradient(135deg, ${base.preview[0]} 0%, ${base.bgTo} 100%)`)}"></div><div class="absolute top-0 left-0 bottom-0 w-[28%]" style="${ssrRenderStyle(`background: linear-gradient(180deg, ${base.sidebarFrom} 0%, ${base.sidebarTo} 100%); opacity: 0.9`)}"></div><div class="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-9 rounded-lg opacity-80" style="${ssrRenderStyle(`background: ${base.dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.80)"}; border: 1px solid ${base.dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`)}"></div><div class="absolute bottom-2 right-3 text-right"><p class="text-[11px] font-semibold leading-tight" style="${ssrRenderStyle(`color: ${base.dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)"}`)}">${ssrInterpolate(base.emoji)} ${ssrInterpolate(base.name)}</p></div>`);
          if (unref(themeStore).baseId.value === base.id) {
            _push(`<div class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style="${ssrRenderStyle({ "background": "var(--accent-from)" })}"><svg class="w-3 h-3 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div></div><div class="space-y-3"><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Accent Color</p><div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(themeStore).ACCENTS, (accent) => {
          _push(`<button${ssrRenderAttr("title", accent.name)} style="${ssrRenderStyle(`background: linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`)}" class="${ssrRenderClass([unref(themeStore).accentId.value === accent.id ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105", "relative w-9 h-9 rounded-full transition-all duration-200"])}">`);
          if (unref(themeStore).accentId.value === accent.id) {
            _push(`<span class="absolute inset-0 flex items-center justify-center"><svg class="w-4 h-4" style="${ssrRenderStyle(`color:${accent.btnText}`)}" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--><div class="relative"><label${ssrRenderAttr("title", `Custom: ${unref(appCustomHex)}`)} class="${ssrRenderClass([unref(themeStore).accentId.value === "custom" ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105", "relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all"])}" style="${ssrRenderStyle(`background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`)}">`);
        if (unref(themeStore).accentId.value !== "custom") {
          _push(`<svg class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-6.343l-.707.707M7.05 16.95l-.707.707m12.02 0l-.707-.707M7.05 7.05l-.707-.707"></path><circle cx="12" cy="12" r="3"></circle></svg>`);
        } else {
          _push(`<svg class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`);
        }
        _push(`<input type="color"${ssrRenderAttr("value", unref(appCustomHex))} class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"></label></div></div><div class="flex items-center gap-2 text-xs text-gray-500 mt-1"><div class="w-4 h-4 rounded-full shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)" })}"></div><span>${ssrInterpolate(unref(themeStore).accentId.value === "custom" ? `Custom ${unref(appCustomHex)}` : (_b2 = (_a2 = unref(themeStore).currentAccent.value) == null ? void 0 : _a2.name) != null ? _b2 : "Custom")}</span></div></div><div class="rounded-xl p-4 space-y-3" style="${ssrRenderStyle({ "background": "rgb(var(--tint)/0.04)", "border": "1px solid rgb(var(--tint)/0.08)" })}"><p class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Preview</p><div class="flex gap-2 items-center flex-wrap"><button class="btn-gold text-xs px-3 py-1.5">Primary Action</button><button class="btn-ghost text-xs px-3 py-1.5">Secondary</button><span class="nav-item nav-item-active text-xs px-2.5 py-1">Active item</span></div><div class="flex gap-2 items-center"><div class="h-1.5 flex-1 rounded-full overflow-hidden" style="${ssrRenderStyle({ "background": "rgb(var(--tint)/0.08)" })}"><div class="h-full w-[65%] rounded-full" style="${ssrRenderStyle({ "background": "linear-gradient(90deg,var(--accent-from),var(--accent-to))" })}"></div></div><span class="text-[10px] text-gray-500">65%</span></div></div><div class="flex justify-between items-center pt-2"><button class="btn-ghost text-xs">\u21BA Reset to default</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "notifications") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Notification Channels</h3><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(notifChannels), (ch) => {
          _push(`<div class="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0"><div class="flex-1 mr-4"><p class="text-sm font-medium text-gray-200">${ssrInterpolate(ch.label)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(ch.description)}</p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5"><input${ssrIncludeBooleanAttr(Array.isArray(ch.enabled) ? ssrLooseContain(ch.enabled, null) : ch.enabled) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div>`);
        });
        _push(`<!--]--></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram Bot Token</label><input${ssrRenderAttr("value", unref(notifSettings).telegramToken)} type="password" class="input-glass font-mono" placeholder="bot:xxxx\u2026"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Telegram Chat ID</label><input${ssrRenderAttr("value", unref(notifSettings).adminChatId)} type="text" class="input-glass font-mono" placeholder="-100xxxxx"></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "security") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Security &amp; Access</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Session Timeout (minutes)</label><input${ssrRenderAttr("value", unref(security).sessionTimeout)} type="number" min="5" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Login Attempts</label><input${ssrRenderAttr("value", unref(security).maxLoginAttempts)} type="number" min="3" class="input-glass font-mono"></div></div><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(securityOptions), (opt) => {
          _push(`<div class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"><div><p class="text-sm font-medium text-gray-200">${ssrInterpolate(opt.label)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(opt.description)}</p></div><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(opt.value) ? ssrLooseContain(opt.value, null) : opt.value) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div><div class="glass-card p-6 space-y-4 border border-red-500/20"><h3 class="text-sm font-semibold text-red-400">Danger Zone</h3><div class="flex items-center justify-between py-3"><div><p class="text-sm font-medium text-gray-200">Clear All Cache</p><p class="text-xs text-gray-500">Flush system cache and session data</p></div><button class="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Clear Cache</button></div><div class="flex items-center justify-between py-3 border-t border-white/[0.04]"><div><p class="text-sm font-medium text-gray-200">Export All Data</p><p class="text-xs text-gray-500">Download full database backup as SQL</p></div><button class="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/[0.05] transition-colors">Export</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "delivery") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><div><h3 class="section-title">QR Delivery Verification</h3><p class="text-xs text-gray-500 mt-1"> Each credit sales invoice gets a unique QR code and 6-digit PIN. When scanned, the dispatcher or driver can confirm dispatch / delivery without logging into the ERP. </p></div><div class="flex items-start justify-between gap-4 py-4 border-t border-white/[0.06]"><div class="flex-1"><p class="text-sm font-semibold text-gray-200">Require Dispatch PIN <span class="text-[10px] font-normal text-emerald-400 ml-1.5">Active</span></p><p class="text-xs text-gray-500 mt-0.5"> Dispatcher must scan the invoice QR and enter the 6-digit PIN to mark an order as <span class="text-gray-300 font-mono text-[11px]">dispatched</span>. PIN is printed on the invoice footer and never expires. </p><p class="text-xs text-gray-600 mt-1">Status transition: <span class="text-purple-400 font-mono text-[11px]">ready_to_ship \u2192 dispatched</span></p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0"><input${ssrIncludeBooleanAttr(Array.isArray(unref(deliverySettings).require_dispatch_pin) ? ssrLooseContain(unref(deliverySettings).require_dispatch_pin, null) : unref(deliverySettings).require_dispatch_pin) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div><div class="flex items-start justify-between gap-4 py-4 border-t border-white/[0.06]"><div class="flex-1"><p class="text-sm font-semibold text-gray-200"> Require Delivery PIN \u2014 Driver Side <span class="text-[10px] font-normal text-amber-400 ml-1.5 border border-amber-400/30 rounded px-1.5 py-0.5">Provisioned \xB7 Not Active</span></p><p class="text-xs text-gray-500 mt-0.5"> Customer receives a delivery PIN (separate from dispatch PIN) that the driver enters at point of delivery to confirm goods were received. Enable when driver-side verification is needed. </p><p class="text-xs text-gray-600 mt-1">Status transition: <span class="text-blue-400 font-mono text-[11px]">dispatched \u2192 delivered</span></p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0"><input${ssrIncludeBooleanAttr(Array.isArray(unref(deliverySettings).require_delivery_pin) ? ssrLooseContain(unref(deliverySettings).require_delivery_pin, null) : unref(deliverySettings).require_delivery_pin) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div><div class="rounded-xl p-4 bg-white/[0.03] border border-white/[0.07] space-y-2"><p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">How it works</p><ol class="text-xs text-gray-500 space-y-1.5 list-decimal list-inside"><li>Invoice is printed with a QR code and 6-digit PIN in the footer.</li><li>When order is <span class="text-gray-300 font-mono">ready_to_ship</span>, dispatcher scans the QR with any phone camera.</li><li>Public page opens \u2014 no login needed. Dispatcher enters the PIN.</li><li>Status updates to <span class="text-gray-300 font-mono">dispatched</span> automatically.</li><li>QR is rescanable \u2014 scanning again shows current status and audit trail.</li></ol></div>`);
        if (unref(deliverySaveMsg)) {
          _push(`<div class="${ssrRenderClass([unref(deliverySaveMsg).startsWith("\u2713") ? "text-emerald-400" : "text-red-400", "text-xs"])}">${ssrInterpolate(unref(deliverySaveMsg))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end"><button${ssrIncludeBooleanAttr(unref(deliverySaving)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">${ssrInterpolate(unref(deliverySaving) ? "Saving\u2026" : "Save Delivery Settings")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "maintenance") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Data Migrations</h3><p class="text-xs text-gray-500">One-time tasks to backfill historical data into new accounting tables. Safe to run multiple times \u2014 already-linked records are skipped automatically.</p><div class="border border-white/[0.06] rounded-xl p-5 space-y-4"><div><p class="text-sm font-semibold text-gray-200">Backfill Expense Journal Entries</p><p class="text-xs text-gray-500 mt-1"> Creates <strong class="text-gray-300">journal_entries</strong> and <strong class="text-gray-300">transaction_lines</strong> for every approved / cancelled-after-approval expense voucher that currently has no GL entry. Cancelled expenses also get a matching reversal entry. </p></div>`);
        if (unref(seedReport)) {
          _push(`<div class="rounded-xl p-4 text-xs space-y-1" style="${ssrRenderStyle(unref(seedReport).errors.length ? "background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2)" : "background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2)")}"><p class="${ssrRenderClass(unref(seedReport).errors.length ? "text-red-300 font-semibold" : "text-emerald-300 font-semibold")}">${ssrInterpolate(unref(seedSummary))}</p><p class="text-gray-400">\u2705 Created: ${ssrInterpolate(unref(seedReport).created)} \xA0\xB7\xA0 \u23ED Skipped: ${ssrInterpolate(unref(seedReport).skipped)} \xA0\xB7\xA0 \u274C Errors: ${ssrInterpolate(unref(seedReport).errors.length)}</p>`);
          if (unref(seedReport).errors.length) {
            _push(`<div class="mt-2 space-y-1"><p class="text-red-400 font-semibold">Errors (missing GL account config):</p><!--[-->`);
            ssrRenderList(unref(seedReport).errors, (e) => {
              _push(`<div class="text-red-300 font-mono">${ssrInterpolate(e.voucher)}: ${ssrInterpolate(e.reason)}</div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button${ssrIncludeBooleanAttr(unref(seeding)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(seeding)) {
          _push(`<svg class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(seeding) ? "Running backfill\u2026" : "\u25B6 Run Backfill Now")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-DUbxkMXm.mjs.map

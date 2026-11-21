import { p as useState, t as tryUseNuxtApp } from './server.mjs';
import { watch, computed, hasInjectionContext, inject } from 'vue';
import { u as useHead$1, h as headSymbol } from '../routes/renderer.mjs';

function injectHead(nuxtApp) {
  var _a;
  const nuxt = nuxtApp || tryUseNuxtApp();
  return ((_a = nuxt == null ? void 0 : nuxt.ssrContext) == null ? void 0 : _a.head) || (nuxt == null ? void 0 : nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      return inject(headSymbol);
    }
  }));
}
function useHead(input, options = {}) {
  const head = injectHead(options.nuxt);
  if (head) {
    return useHead$1(input, { head, ...options });
  }
}
const PRINT_SIZES = [
  { value: "a5", label: "Half page (A5) \u2014 saves paper" },
  { value: "a4", label: "Full page (A4)" },
  { value: "thermal", label: "Thermal roll (80 mm)" }
];
const PAGE_CSS = {
  a4: "@page { size: A4 portrait; margin: 10mm }",
  a5: "@page { size: A5 landscape; margin: 6mm }",
  thermal: "@page { size: 80mm auto; margin: 3mm }"
};
function usePrintSize() {
  const size = useState("print-size", () => "a5");
  watch(size, (v) => {
    try {
      localStorage.setItem("erp_print_size", v);
    } catch {
    }
  });
  useHead({ style: [{ key: "print-page", innerHTML: computed(() => PAGE_CSS[size.value]) }] });
  return { size, sizes: PRINT_SIZES };
}
function whatsappLink(phone, text) {
  const d = String(phone != null ? phone : "").replace(/\D/g, "");
  const n = d.startsWith("880") ? d : d.startsWith("0") ? "88" + d : d.length === 10 ? "880" + d : "";
  return n.length >= 12 ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

export { usePrintSize as u, whatsappLink as w };
//# sourceMappingURL=usePrintSize-CHoLIjZz.mjs.map

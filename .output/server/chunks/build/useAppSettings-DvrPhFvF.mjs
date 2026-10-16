import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { computed } from 'vue';

function useAppSettings() {
  const { data } = useFetch(
    "/api/settings/app",
    { key: "app-settings", server: true, default: () => null },
    "$tiUU8QXART"
    /* nuxt-injected */
  );
  const company = computed(() => {
    var _a, _b;
    return {
      name: "Ujjal Flour Mills Co.",
      tradeName: "Ujjal FMC",
      regNo: "TL-SRG-2018-4821",
      tin: "",
      bin: "002148694",
      address: "Sirajgonj Sadar, Sirajgonj-6700 \xB7 Demra, Dhaka-1361",
      phone: "+880 1711-000000",
      email: "accounts@ujjalfmc.com",
      ...(_b = (_a = data.value) == null ? void 0 : _a.company_profile) != null ? _b : {}
    };
  });
  const finance = computed(() => {
    var _a, _b;
    return { fyStart: 7, defaultCreditLimit: 0, defaultPaymentTerms: 30, lateRate: 0, ...(_b = (_a = data.value) == null ? void 0 : _a.finance_settings) != null ? _b : {} };
  });
  return { settings: data, company, finance };
}

export { useAppSettings as u };
//# sourceMappingURL=useAppSettings-DvrPhFvF.mjs.map

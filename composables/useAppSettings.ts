/** Company-wide settings for print pages and forms (company name/address/phone, payment terms…). Falls back to the built-in defaults. */
export function useAppSettings() {
  const { data } = useFetch<any>('/api/settings/app', { key: 'app-settings', server: true, default: () => null })
  const company = computed(() => ({
    name: 'Ujjal Flour Mills Co.', tradeName: 'Ujjal FMC', regNo: 'TL-SRG-2018-4821', tin: '', bin: '002148694',
    address: 'Sirajgonj Sadar, Sirajgonj-6700 · Demra, Dhaka-1361', phone: '+880 1711-000000', email: 'accounts@ujjalfmc.com',
    ...(data.value?.company_profile ?? {}),
  }))
  const finance = computed(() => ({ fyStart: 7, defaultCreditLimit: 0, defaultPaymentTerms: 30, lateRate: 0, ...(data.value?.finance_settings ?? {}) }))
  return { settings: data, company, finance }
}

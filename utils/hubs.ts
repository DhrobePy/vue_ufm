/**
 * Screens that live together under ONE sidebar entry, shown as a tab strip at the top of each
 * member page (<HubTabs hub="…" />). Pages and their permissions are unchanged — a tab only
 * appears if the user may open that page. `also` = extra URL prefixes that count as this tab
 * (e.g. the New Transaction form belongs to the Bank dashboard tab).
 */
export interface HubTab { label: string; to: string; also?: string[]; exact?: boolean }

export const HUBS: Record<string, HubTab[]> = {
  bank: [
    { label: 'Dashboard',       to: '/bank', exact: true, also: ['/bank/transaction', '/bank/transfer'] },
    { label: 'Statement',       to: '/bank/statement' },
    { label: 'Reconciliation',  to: '/bank/reconciliation' },
    { label: 'Bank Accounts',   to: '/bank/accounts' },
  ],
  accounts: [
    { label: 'Overview',          to: '/accounts', exact: true, also: ['/accounts/transfer'] },
    { label: 'Chart of Accounts', to: '/accounts/coa' },
    { label: 'Journal',           to: '/accounts/journal' },
    { label: 'Debit Vouchers',    to: '/accounts/voucher' },
  ],
  statements: [
    { label: 'GL Statement',  to: '/accounts/statement' },
    { label: 'Tax Statement', to: '/accounts/tax-statement' },
  ],
  close: [
    { label: 'Daily Log',            to: '/accounts/daily-log' },
    { label: 'Day-End Reconciliation', to: '/accounts/day-end-reconciliation' },
  ],
}

export function hubTabActive(tab: HubTab, path: string): boolean {
  if (path === tab.to) return true
  if (!tab.exact && path.startsWith(tab.to + '/')) return true
  return (tab.also ?? []).some(p => path === p || path.startsWith(p + '/'))
}

/** Does this path belong to any tab of the hub? (sidebar highlight) */
export const hubOwnsPath = (hub: string, path: string): boolean =>
  (HUBS[hub] ?? []).some(t => hubTabActive(t, path))

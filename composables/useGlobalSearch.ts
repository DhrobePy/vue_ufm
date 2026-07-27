export interface SearchResult {
  type: 'page' | 'order' | 'customer' | 'product' | 'user' | 'action' | 'supplier' | 'po' | 'expense' | 'employee' | 'branch' | 'trading' | 'loan'
  icon: string
  label: string
  sublabel?: string
  route: string
  keywords?: string[]
}

// Static navigation index — pages and quick actions never come from the DB.
const PAGES: SearchResult[] = [
  { type: 'page', icon: '📊', label: 'Dashboard',          route: '/dashboard' },
  { type: 'page', icon: '📋', label: 'All Credit Orders',  route: '/credit-sales/all' },
  { type: 'page', icon: '✅', label: 'Approve Orders',     route: '/credit-sales/approve' },
  { type: 'page', icon: '🏭', label: 'Production Queue',   route: '/credit-sales/production' },
  { type: 'page', icon: '📤', label: 'Dispatch Queue',     route: '/credit-sales/dispatch' },
  { type: 'page', icon: '📒', label: 'Customer Ledger',    route: '/credit-sales/ledger' },
  { type: 'page', icon: '📈', label: 'Ageing Report',      route: '/credit-sales/ageing' },
  { type: 'page', icon: '🛒', label: 'Purchase Orders',    route: '/purchase/orders' },
  { type: 'page', icon: '📦', label: 'Goods Received (GRN)', route: '/purchase/grn' },
  { type: 'page', icon: '🏢', label: 'Suppliers',          route: '/purchase/suppliers' },
  { type: 'page', icon: '💸', label: 'Expenses',           route: '/expenses' },
  { type: 'page', icon: '✅', label: 'Approve Expenses',   route: '/expenses/approve' },
  { type: 'page', icon: '🏦', label: 'Bank Overview',      route: '/bank' },
  { type: 'page', icon: '💰', label: 'New Bank Transaction', route: '/bank/transaction/create' },
  { type: 'page', icon: '👥', label: 'Customers',          route: '/customers' },
  { type: 'page', icon: '➕', label: 'Add Customer',       route: '/customers/create' },
  { type: 'page', icon: '📦', label: 'Products',           route: '/products' },
  { type: 'page', icon: '🚛', label: 'Logistics',          route: '/logistics' },
  { type: 'page', icon: '🚛', label: 'Vehicles',           route: '/logistics/vehicles' },
  { type: 'page', icon: '👤', label: 'Drivers',            route: '/logistics/drivers' },
  { type: 'page', icon: '📍', label: 'Trips',              route: '/logistics/trips' },
  { type: 'page', icon: '🖥️', label: 'POS Terminal',      route: '/pos' },
  { type: 'page', icon: '📈', label: 'Sales Report',       route: '/sales' },
  { type: 'page', icon: '🏭', label: 'Production Floor',   route: '/production' },
  { type: 'page', icon: '📤', label: 'Dispatch',           route: '/dispatch' },
  { type: 'page', icon: '💰', label: 'Collections',        route: '/collector' },
  { type: 'page', icon: '📦', label: 'Trading Dashboard',  route: '/trading/dashboard' },
  { type: 'page', icon: '📦', label: 'Trading Sales',      route: '/trading/sales' },
  { type: 'page', icon: '🤝', label: 'Loans',              route: '/loans' },
  { type: 'page', icon: '⚙️', label: 'Admin',              route: '/admin' },
  { type: 'page', icon: '👥', label: 'Users',              route: '/admin/users' },
  { type: 'page', icon: '➕', label: 'Create User',        route: '/admin/users/create' },
  { type: 'page', icon: '📜', label: 'Audit Trail',        route: '/admin/audit' },
  { type: 'page', icon: '⚙️', label: 'Settings',           route: '/admin/settings' },
  { type: 'page', icon: '📋', label: 'Expense History',    sublabel: 'All submitted expenses', route: '/expenses/history', keywords: ['expense', 'history', 'all'] },
  { type: 'page', icon: '🗂️', label: 'Expense Vouchers',  sublabel: 'Voucher listing', route: '/expenses/vouchers', keywords: ['voucher', 'expense'] },
  // Quick actions
  { type: 'action', icon: '➕', label: 'New Credit Order',    route: '/credit-sales/create', keywords: ['new', 'order', 'create'] },
  { type: 'action', icon: '➕', label: 'New Purchase Order',  route: '/purchase/orders/create', keywords: ['new', 'po', 'purchase'] },
  { type: 'action', icon: '➕', label: 'Add Customer',        route: '/customers/create', keywords: ['add', 'customer', 'new'] },
  { type: 'action', icon: '➕', label: 'Record Expense',      route: '/expenses/create', keywords: ['expense', 'create'] },
  { type: 'action', icon: '🖥️', label: 'Open POS Terminal',  route: '/pos', keywords: ['pos', 'sale', 'counter'] },
]

function matchesPage(item: SearchResult, q: string) {
  return item.label.toLowerCase().includes(q) ||
    item.sublabel?.toLowerCase().includes(q) ||
    item.keywords?.some(k => k.includes(q))
}

export function useGlobalSearch() {
  const open   = ref(false)
  const query  = ref('')
  const dynamicResults = ref<SearchResult[]>([])
  const loading = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let requestSeq = 0

  watch(query, (q) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    const term = q.trim()
    if (term.length < 2) {
      dynamicResults.value = []
      loading.value = false
      return
    }
    loading.value = true
    debounceTimer = setTimeout(async () => {
      const seq = ++requestSeq
      try {
        const res = await $fetch<{ results: SearchResult[] }>('/api/search', { query: { q: term } })
        if (seq === requestSeq) dynamicResults.value = res.results ?? []
      } catch {
        if (seq === requestSeq) dynamicResults.value = []
      } finally {
        if (seq === requestSeq) loading.value = false
      }
    }, 250)
  })

  const results = computed(() => {
    const term = query.value.trim().toLowerCase()
    if (!term) return PAGES.slice(0, 8)
    const pageMatches = PAGES.filter(item => matchesPage(item, term)).slice(0, 5)
    return [...dynamicResults.value, ...pageMatches].slice(0, 20)
  })

  function show() { open.value = true; query.value = ''; dynamicResults.value = [] }
  function hide() { open.value = false; query.value = ''; dynamicResults.value = [] }
  function toggle() { open.value ? hide() : show() }

  return { open, query, results, loading, show, hide, toggle }
}

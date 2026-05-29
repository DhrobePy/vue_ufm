export interface SearchResult {
  type: 'page' | 'order' | 'customer' | 'product' | 'user' | 'action'
  icon: string
  label: string
  sublabel?: string
  route: string
  keywords?: string[]
}

// Static search index — in production this would hit /api/search
const INDEX: SearchResult[] = [
  // Pages / navigation
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
  { type: 'page', icon: '⚙️', label: 'Admin',              route: '/admin' },
  { type: 'page', icon: '👥', label: 'Users',              route: '/admin/users' },
  { type: 'page', icon: '➕', label: 'Create User',        route: '/admin/users/create' },
  { type: 'page', icon: '📜', label: 'Audit Trail',        route: '/admin/audit' },
  { type: 'page', icon: '⚙️', label: 'Settings',           route: '/admin/settings' },
  // Sample orders
  { type: 'order', icon: '📋', label: 'CR-20260525-0001', sublabel: 'Rahim Traders Ltd.', route: '/credit-sales/1', keywords: ['cr-20260525-0001', 'rahim'] },
  { type: 'order', icon: '📋', label: 'CR-20260525-0002', sublabel: 'Karim Flour Depot', route: '/credit-sales/2', keywords: ['cr-20260525-0002', 'karim'] },
  { type: 'order', icon: '📋', label: 'CR-20260524-0008', sublabel: 'Dhaka Bakeries Co.', route: '/credit-sales/3', keywords: ['cr-20260524-0008', 'dhaka'] },
  // Sample customers
  { type: 'customer', icon: '👤', label: 'Rahim Traders Ltd.',   sublabel: 'Credit · Sirajgonj', route: '/customers/1', keywords: ['rahim', 'traders'] },
  { type: 'customer', icon: '👤', label: 'Karim Flour Depot',    sublabel: 'Credit · Demra',     route: '/customers/2', keywords: ['karim', 'flour'] },
  { type: 'customer', icon: '👤', label: 'Dhaka Bakeries Co.',   sublabel: 'Credit · Dhaka',     route: '/customers/3', keywords: ['dhaka', 'bakeries'] },
  { type: 'customer', icon: '👤', label: 'National Biscuit Ltd.', sublabel: 'Credit · Demra',    route: '/customers/4', keywords: ['national', 'biscuit'] },
  // Sample products
  { type: 'product', icon: '🌾', label: '2Hati Moida 50kg',  sublabel: '৳2,200 · 142 bags', route: '/products', keywords: ['2hati', 'moida', '50kg'] },
  { type: 'product', icon: '🌾', label: '1Hati Moida 50kg',  sublabel: '৳2,000 · 98 bags',  route: '/products', keywords: ['1hati', 'moida'] },
  { type: 'product', icon: '🌾', label: 'Aam Moida 50kg',    sublabel: '৳1,850 · 74 bags',  route: '/products', keywords: ['aam', 'moida'] },
  { type: 'product', icon: '🌿', label: 'Mota Vushi 37kg',   sublabel: '৳480 · 88 bags',    route: '/products', keywords: ['mota', 'vushi', 'bran'] },
  // Expense pages + records
  { type: 'page',     icon: '📋', label: 'Expense History',      sublabel: 'All submitted expenses',   route: '/expenses/history',    keywords: ['expense', 'history', 'all'] },
  { type: 'page',     icon: '🗂️', label: 'Expense Vouchers',    sublabel: 'Voucher listing',           route: '/expenses/vouchers',   keywords: ['voucher', 'expense'] },
  { type: 'order',    icon: '💸', label: 'EXP-20260525-001',    sublabel: 'Fuel & Vehicle · ৳12,500',  route: '/expenses/1',          keywords: ['exp', 'exp-001', 'fuel', 'kamal'] },
  { type: 'order',    icon: '💸', label: 'EXP-20260524-002',    sublabel: 'Maintenance · ৳24,000',     route: '/expenses/2',          keywords: ['exp', 'exp-002', 'maintenance', 'trk'] },
  { type: 'order',    icon: '💸', label: 'EXP-20260523-003',    sublabel: 'Labour & Wages · ৳1,20,000',route: '/expenses/3',          keywords: ['exp', 'exp-003', 'labour', 'wages'] },
  { type: 'order',    icon: '💸', label: 'EXP-20260522-004',    sublabel: 'Office & Admin · ৳3,200',   route: '/expenses/4',          keywords: ['exp', 'exp-004', 'office'] },
  { type: 'order',    icon: '💸', label: 'EXP-20260521-005',    sublabel: 'Utilities · ৳18,600',       route: '/expenses/5',          keywords: ['exp', 'exp-005', 'electricity'] },
  // Quick actions
  { type: 'action', icon: '➕', label: 'New Credit Order',    route: '/credit-sales/create', keywords: ['new', 'order', 'create'] },
  { type: 'action', icon: '➕', label: 'New Purchase Order',  route: '/purchase/orders/create', keywords: ['new', 'po', 'purchase'] },
  { type: 'action', icon: '➕', label: 'Add Customer',        route: '/customers/create', keywords: ['add', 'customer', 'new'] },
  { type: 'action', icon: '➕', label: 'Record Expense',      route: '/expenses/create', keywords: ['expense', 'create'] },
  { type: 'action', icon: '🖥️', label: 'Open POS Terminal',  route: '/pos', keywords: ['pos', 'sale', 'counter'] },
]

export function useGlobalSearch() {
  const open   = ref(false)
  const query  = ref('')

  const results = computed(() => {
    if (!query.value.trim()) return INDEX.slice(0, 8)
    const q = query.value.toLowerCase()
    return INDEX.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sublabel?.toLowerCase().includes(q) ||
      item.keywords?.some(k => k.includes(q))
    ).slice(0, 12)
  })

  function show() { open.value = true; query.value = '' }
  function hide() { open.value = false; query.value = '' }
  function toggle() { open.value ? hide() : show() }

  return { open, query, results, show, hide, toggle }
}

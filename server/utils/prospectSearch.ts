import { query } from '~/server/utils/db'

/**
 * Prospect discovery — public business listings only (OpenStreetMap; Google Places when NUXT_GOOGLE_PLACES_KEY is set in the server .env).
 * Only a business type and a place name leave the server — never customer data. Nothing is saved here: the caller picks what to keep.
 */
export const KINDS = {
  bakery: { label: 'Bakeries', segment: 'Bakery', osm: ['["shop"="bakery"]', '["craft"="bakery"]'], q: 'bakery' },
  sweets: { label: 'Sweets / confectionery', segment: 'Bakery', osm: ['["shop"="confectionery"]', '["shop"="pastry"]', '["craft"="confectionery"]'], q: 'sweets confectionery shop' },
  wholesale: { label: 'Wholesalers / traders', segment: 'Trader / Store', osm: ['["shop"="wholesale"]["name"]'], q: 'food grain wholesale trader' },
  factory: { label: 'Food factories', segment: 'Food manufacturer', osm: ['["industrial"="food_production"]'], q: 'biscuit noodle food factory' },
} as const
export type Kind = keyof typeof KINDS

// rough city boxes: south, west, north, east
export const AREAS: Record<string, [number, number, number, number]> = {
  Dhaka: [23.65, 90.30, 23.95, 90.55], Gazipur: [23.90, 90.30, 24.15, 90.55], Narayanganj: [23.55, 90.40, 23.70, 90.60],
  Chattogram: [22.20, 91.70, 22.50, 91.95], Sylhet: [24.85, 91.80, 24.95, 91.92], Khulna: [22.78, 89.50, 22.88, 89.60],
  Rajshahi: [24.34, 88.55, 24.42, 88.65], Bogura: [24.82, 89.33, 24.88, 89.40], Sirajganj: [24.40, 89.65, 24.50, 89.75],
  Cumilla: [23.43, 91.15, 23.50, 91.22], Mymensingh: [24.72, 90.38, 24.79, 90.45],
}

export interface Candidate { name: string; kind: Kind; segment: string; district: string; address: string; phone: string; website: string; source: 'osm' | 'google'; source_url: string; source_note: string; lat: number | null; lon: number | null }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ঀ-৿]/g, '')
const last9 = (s: string) => s.replace(/\D/g, '').slice(-9)

async function osm(district: string, kinds: Kind[]): Promise<Candidate[]> {
  const bb = AREAS[district]!.join(',')
  const body = `[out:json][timeout:60];(${kinds.flatMap(k => KINDS[k].osm.map(f => `nwr${f}(${bb});`)).join('')});out center tags 800;`
  const r: any = await $fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: new URLSearchParams({ data: body }), headers: { 'User-Agent': 'ujjal-erp-prospecting/1.0' }, timeout: 70000 })
  return (r.elements ?? []).filter((e: any) => e.tags?.name).map((e: any): Candidate => {
    const t = e.tags
    const kind = (kinds.find(k => KINDS[k].osm.some(f => { const m = f.match(/\["(\w+)"="(\w+)"\]/); return m && t[m[1]!] === m[2] })) ?? kinds[0]!) as Kind
    return {
      name: String(t.name).slice(0, 160), kind, segment: KINDS[kind].segment, district,
      address: [t['addr:housenumber'], t['addr:street'], t['addr:suburb'] ?? t['addr:neighbourhood'], t['addr:city']].filter(Boolean).join(', '),
      phone: String(t.phone ?? t['contact:phone'] ?? t.mobile ?? '').split(';')[0]!.trim(), website: String(t.website ?? t['contact:website'] ?? ''),
      source: 'osm', source_url: `https://www.openstreetmap.org/${e.type}/${e.id}`, source_note: 'OpenStreetMap listing (community-edited; verify before contact)',
      lat: e.lat ?? e.center?.lat ?? null, lon: e.lon ?? e.center?.lon ?? null,
    }
  })
}

async function google(key: string, district: string, kinds: Kind[]): Promise<Candidate[]> {
  const out: Candidate[] = []
  for (const k of kinds) {
    const r: any = await $fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST', timeout: 30000,
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.location' },
      body: { textQuery: `${KINDS[k].q} in ${district}, Bangladesh`, pageSize: 20 },
    })
    for (const p of r.places ?? []) out.push({
      name: String(p.displayName?.text ?? '').slice(0, 160), kind: k, segment: KINDS[k].segment, district, address: p.formattedAddress ?? '',
      phone: p.nationalPhoneNumber ?? '', website: p.websiteUri ?? '', source: 'google', source_url: p.googleMapsUri ?? '',
      source_note: `Google Places${p.rating ? ` — rated ${p.rating} (${p.userRatingCount ?? 0} reviews)` : ''}`, lat: p.location?.latitude ?? null, lon: p.location?.longitude ?? null,
    })
  }
  return out.filter(c => c.name)
}

/** Candidates not already a customer / prospect (by phone, else by name), best-contactable first. */
export async function discover(district: string, kinds: Kind[], googleKey = '') {
  if (!AREAS[district]) throw createError({ statusCode: 400, statusMessage: 'Unknown area' })
  kinds = kinds.filter(k => k in KINDS)
  if (!kinds.length) throw createError({ statusCode: 400, statusMessage: 'Pick at least one business type' })
  const raw = googleKey ? await google(googleKey, district, kinds) : await osm(district, kinds)
  const known = await query<any>(`SELECT name, phone_number AS phone FROM customers UNION ALL SELECT name, phone FROM crm_prospects`)
  const names = new Set(known.map((k: any) => norm(String(k.name ?? ''))).filter(Boolean)), phones = new Set(known.map((k: any) => last9(String(k.phone ?? ''))).filter((p: string) => p.length >= 8))
  const seen = new Set<string>(); let dup = 0
  const list = raw.filter((c) => {
    const key = norm(c.name) + '|' + (c.address ? norm(c.address) : c.lat?.toFixed(3)); const p = last9(c.phone)
    if (seen.has(key)) return false
    seen.add(key)
    if ((p.length >= 8 && phones.has(p)) || names.has(norm(c.name))) { dup++; return false }
    return true
  }).sort((a, b) => (+!!b.phone - +!!a.phone) || (+!!b.address - +!!a.address) || a.name.localeCompare(b.name))
  return { source: googleKey ? 'google' : 'osm', total: raw.length, already_known: dup, with_phone: list.filter(c => c.phone).length, with_address: list.filter(c => c.address).length, candidates: list }
}

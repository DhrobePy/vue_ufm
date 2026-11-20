import { getAppSettings } from '~/server/utils/appSettings'

export type GrnBasis = 'expected' | 'received'

/** Company default for valuing a goods-received note (Settings → Finance). */
export async function defaultGrnBasis(): Promise<GrnBasis> {
  return (await getAppSettings()).finance_settings.grnValueBasis === 'received' ? 'received' : 'expected'
}

/** The quantity a GRN is priced on. "expected" = what the supplier billed (falls back to weighed if no billed qty was entered); "received" = weighed. */
export const grnPricedQty = (basis: GrnBasis, received: number, expected: number) => (basis === 'expected' && expected > 0 ? expected : received)

/** A saved GRN's basis: the recorded one, else inferred from its stored value (older rows carry legacy's received-based values). */
export function grnBasisOf(g: { value_basis?: string | null; total_value: any; quantity_received_kg: any; expected_quantity: any; unit_price_per_kg: any }): GrnBasis {
  if (g.value_basis === 'expected' || g.value_basis === 'received') return g.value_basis
  const tv = Number(g.total_value), p = Number(g.unit_price_per_kg), r = Number(g.quantity_received_kg), e = Number(g.expected_quantity) || 0
  return e > 0 && Math.abs(tv - e * p) < 1 && Math.abs(tv - r * p) >= 1 ? 'expected' : 'received'
}

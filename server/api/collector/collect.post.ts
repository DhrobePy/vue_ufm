/**
 * RETIRED. This endpoint inserted a bare customer_payments row (unallocated advance, no customer-ledger credit, no journal
 * entry, no cash/bank movement, Bank/Cheque saved as Cash, user id hard-coded to 1), so money collected through it never reached
 * the books. Collections are recorded at Credit Sales → Collect Payment (/api/customers/:id/collect-payment), which does all of that.
 */
export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Use Credit Sales → Collect Payment to record a collection.' })
})

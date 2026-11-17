/**
 * Single source of truth for the Cal.com booking links.
 * These open only after Stripe confirms payment: each checkout success page verifies the
 * paid session first and then redirects here, and the payment-confirmed emails reuse the same links.
 */
export const CAL_LINKS = {
  dealDiagnostic: "https://cal.com/theafricaplug/deal01",
  call: "https://cal.com/theafricaplug/fkcall01",
  petTravel: "https://cal.com/theafricaplug/pet-travel-consultation",
} as const;

export const REFUNDS_URL = "https://theafricaplug.com/refunds";
export const REFUNDS_DISPLAY = "theafricaplug.com/refunds";

/**
 * Patiyolu fiyat motoru.
 *
 * base       = max(min_charge, base_rate × distance_km)
 * multiplier = urgency × weight × intercity
 * min        = base × multiplier × 0.85
 * max        = base × multiplier × 1.20
 */

export type Urgency = "standard" | "express" | "sameday";

export interface PricingInput {
  distanceKm: number;
  baseRatePerKm: number; // default 8.00 TL/km
  minCharge: number; // default 350 TL
  urgency: Urgency;
  weightKg: number;
}

export interface PricingQuote {
  base: number;
  multiplier: number;
  estMin: number;
  estMax: number;
  breakdown: {
    urgencyMult: number;
    weightMult: number;
    intercityMult: number;
  };
}

export const PLATFORM_COMMISSION = 0.1 as const;
export const LISTING_FEE_TRY = 49 as const;

const URGENCY_MULT: Record<Urgency, number> = {
  standard: 1.0,
  express: 1.3,
  sameday: 1.6,
};

function weightMultiplier(weightKg: number): number {
  if (weightKg < 5) return 1.0;
  if (weightKg < 20) return 1.1;
  if (weightKg < 40) return 1.25;
  return 1.5;
}

function intercityMultiplier(distanceKm: number): number {
  return distanceKm > 200 ? 1.15 : 1.0;
}

export function quote(input: PricingInput): PricingQuote {
  const base = Math.max(input.minCharge, input.baseRatePerKm * input.distanceKm);

  const urgencyMult = URGENCY_MULT[input.urgency];
  const weightMult = weightMultiplier(input.weightKg);
  const intercityMult = intercityMultiplier(input.distanceKm);
  const multiplier = urgencyMult * weightMult * intercityMult;

  const adjusted = base * multiplier;

  return {
    base,
    multiplier,
    estMin: Math.round(adjusted * 0.85),
    estMax: Math.round(adjusted * 1.2),
    breakdown: { urgencyMult, weightMult, intercityMult },
  };
}

export function platformFee(agreedPrice: number): number {
  return Math.round(agreedPrice * PLATFORM_COMMISSION);
}

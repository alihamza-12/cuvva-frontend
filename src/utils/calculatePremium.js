/**
 * frontend/src/utils/calculatePremium.js
 *
 * Deterministic quote calculator for short-term vehicle insurance,
 * modeled on how real temp-cover insurers (Cuvva, Veygo, Tempcover)
 * actually price policies: a FLAT BASE FEE to open a policy (covers
 * admin/risk underwriting cost) + a small MARGINAL rate per extra hour,
 * then loaded up/down by risk factors (vehicle, driver age, cover type).
 *
 * This is NOT a simple "hours x hourly rate" formula — real short-term
 * cover is front-loaded (e.g. Cuvva-style: 1hr ~£15-20, but going from
 * 1hr to 3hr only adds a few pounds), which is why this uses a base fee
 * + marginal-hour model instead.
 *
 * All the knobs are constants at the top — tune them as you get real
 * underwriting guidance, without touching the calculation logic itself.
 *
 * IMPORTANT: This is a placeholder rating engine for an MVP/demo. Real
 * insurance pricing requires an actual underwriter/actuarial model —
 * do not use these numbers for a live regulated insurance product
 * without review from whoever underwrites your policies (per your
 * Policy schema: Wakam / ERS Syndicate / Crawford).
 */

// ---------------------------------------------------------------------------
// Tunable constants — change these numbers, not the logic below.
// ---------------------------------------------------------------------------

const BASE_FEE_GBP = 17.5; // flat cost to open any policy (covers the first hour)
const MARGINAL_RATE_PER_EXTRA_HOUR_GBP = 2.25; // cost per hour beyond the first

const COVERAGE_MULTIPLIER = {
  Comprehensive: 1.0,
  "Third Party Only": 0.7,
};

const EXCESS_BY_COVERAGE = {
  Comprehensive: 500,
  "Third Party Only": 750,
};

// Vehicle risk loadings (stack additively, e.g. big engine + old car both apply)
const ENGINE_CC_LOADING = [
  { max: 1200, loading: 0 },
  { max: 2000, loading: 0.1 },
  { max: Infinity, loading: 0.25 },
];

const POWER_BHP_LOADING = [
  { max: 120, loading: 0 },
  { max: 200, loading: 0.12 },
  { max: Infinity, loading: 0.3 },
];

const VEHICLE_AGE_LOADING = [
  { maxYears: 5, loading: 0 },
  { maxYears: 10, loading: 0.06 },
  { maxYears: 15, loading: 0.12 },
  { maxYears: Infinity, loading: 0.2 },
];

// Driver age loading — young/inexperienced and elderly drivers cost more
// to insure short-term. Requires the customer's dateOfBirth.
const DRIVER_AGE_LOADING = [
  { maxAge: 21, loading: 0.7 },
  { maxAge: 24, loading: 0.35 },
  { maxAge: 69, loading: 0 },
  { maxAge: Infinity, loading: 0.25 },
];

const MINIMUM_PREMIUM_GBP = 8.0; // never quote below this, regardless of duration

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const findLoading = (bands, value, key) => {
  const band = bands.find((b) => value <= (b[key] ?? Infinity));
  return band ? band.loading : 0;
};

const getAgeInYears = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
};

/**
 * @param {Object} params
 * @param {number} params.durationHours - length of cover, e.g. 1, 3, 24
 * @param {Object} params.vehicle - { year, engineCapacityCC, powerBHP }
 * @param {string} params.coverageType - "Comprehensive" | "Third Party Only"
 * @param {string} [params.driverDateOfBirth] - customer's dateOfBirth (ISO string)
 *
 * @returns {{
 *   premiumGBP: number,       // e.g. 18.59
 *   premiumPence: number,     // e.g. 1859 — store this in Policy.premiumAmount
 *   excess: number,           // e.g. 500
 *   breakdown: Array<{ label: string, amount: number }>
 * }}
 */
export function calculatePremium({
  durationHours,
  vehicle = {},
  coverageType = "Comprehensive",
  driverDateOfBirth,
}) {
  const currentYear = new Date().getFullYear();
  const vehicleAgeYears = vehicle.year ? currentYear - vehicle.year : 0;
  const driverAge = getAgeInYears(driverDateOfBirth);

  const engineLoading = vehicle.engineCapacityCC
    ? findLoading(ENGINE_CC_LOADING, vehicle.engineCapacityCC, "max")
    : 0;

  const powerLoading = vehicle.powerBHP
    ? findLoading(POWER_BHP_LOADING, vehicle.powerBHP, "max")
    : 0;

  const ageLoading = findLoading(VEHICLE_AGE_LOADING, vehicleAgeYears, "maxYears");

  const driverLoading =
    driverAge != null ? findLoading(DRIVER_AGE_LOADING, driverAge, "maxAge") : 0;

  const totalLoading = 1 + engineLoading + powerLoading + ageLoading + driverLoading;
  const coverageMultiplier = COVERAGE_MULTIPLIER[coverageType] ?? 1;

  const extraHours = Math.max(0, durationHours - 1);
  const rawPremium =
    (BASE_FEE_GBP + extraHours * MARGINAL_RATE_PER_EXTRA_HOUR_GBP) *
    totalLoading *
    coverageMultiplier;

  const premiumGBP = Math.max(
    MINIMUM_PREMIUM_GBP,
    Math.round(rawPremium * 100) / 100,
  );

  return {
    premiumGBP,
    premiumPence: Math.round(premiumGBP * 100),
    excess: EXCESS_BY_COVERAGE[coverageType] ?? 500,
    breakdown: [
      { label: "Base policy fee (first hour)", amount: BASE_FEE_GBP },
      { label: `Extra hours (${extraHours}h x £${MARGINAL_RATE_PER_EXTRA_HOUR_GBP}/h)`, amount: extraHours * MARGINAL_RATE_PER_EXTRA_HOUR_GBP },
      { label: "Vehicle engine size loading", amount: engineLoading },
      { label: "Vehicle power loading", amount: powerLoading },
      { label: "Vehicle age loading", amount: ageLoading },
      { label: "Driver age loading", amount: driverLoading },
      { label: "Coverage type multiplier", amount: coverageMultiplier },
    ],
  };
}

/**
 * Quick helper to price the "extend cover" upsell shown on the quote
 * screen (e.g. "Get 3 hours instead for an extra £4.78").
 */
export function calculateExtensionCost(baseParams, extraHours) {
  const current = calculatePremium(baseParams);
  const extended = calculatePremium({
    ...baseParams,
    durationHours: baseParams.durationHours + extraHours,
  });
  return Math.round((extended.premiumGBP - current.premiumGBP) * 100) / 100;
}

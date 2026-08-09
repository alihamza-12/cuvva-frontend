

const BASE_FEE_GBP = 17.5; 
const MARGINAL_RATE_PER_EXTRA_HOUR_GBP = 2.25; 

const COVERAGE_MULTIPLIER = {
  Comprehensive: 1.0,
  "Third Party Only": 0.7,
};

const EXCESS_BY_COVERAGE = {
  Comprehensive: 500,
  "Third Party Only": 750,
};

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

const DRIVER_AGE_LOADING = [
  { maxAge: 21, loading: 0.7 },
  { maxAge: 24, loading: 0.35 },
  { maxAge: 69, loading: 0 },
  { maxAge: Infinity, loading: 0.25 },
];

const MINIMUM_PREMIUM_GBP = 8.0; 

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

export function calculateExtensionCost(baseParams, extraHours) {
  const current = calculatePremium(baseParams);
  const extended = calculatePremium({
    ...baseParams,
    durationHours: baseParams.durationHours + extraHours,
  });
  return Math.round((extended.premiumGBP - current.premiumGBP) * 100) / 100;
}

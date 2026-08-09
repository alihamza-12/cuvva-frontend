

const KEYS = {
  BANK_DETAILS: "cuvva_bank_details",
  PAYMENT_METHOD: "cuvva_payment_method",
  DISCOUNT_CODE: "cuvva_discount_code",
  APP_RATING: "cuvva_app_rating",
  PREFERRED_NAME: "cuvva_preferred_name",
  RESIDENTIAL_ADDRESS: "cuvva_residential_address",
  MARKETING_PREFERENCES: "cuvva_marketing_preferences",
  IDENTITY_EXTRA: "cuvva_identity_extra",
  PREVIOUS_INCIDENTS: "cuvva_previous_incidents",
  INCIDENTS_DECLARATION_DONE: "cuvva_incidents_declaration_done",
  JOINED_CAR_CLUBS: "cuvva_joined_car_clubs",
  CREATED_CAR_CLUBS: "cuvva_created_car_clubs",
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {

    return false;
  }
}

export const getBankDetails = () => safeGet(KEYS.BANK_DETAILS, null);
export const saveBankDetails = (details) => safeSet(KEYS.BANK_DETAILS, details);

export const getPaymentMethod = () => safeGet(KEYS.PAYMENT_METHOD, "apple-pay");
export const savePaymentMethod = (method) => safeSet(KEYS.PAYMENT_METHOD, method);

export const getAppliedDiscounts = () => safeGet(KEYS.DISCOUNT_CODE, []);
export const saveAppliedDiscounts = (list) => safeSet(KEYS.DISCOUNT_CODE, list);

export const getAppRating = () => safeGet(KEYS.APP_RATING, null);
export const saveAppRating = (rating) => safeSet(KEYS.APP_RATING, rating);

export const getPreferredName = () => safeGet(KEYS.PREFERRED_NAME, null);
export const savePreferredName = (name) => safeSet(KEYS.PREFERRED_NAME, name);

export const getResidentialAddress = () => safeGet(KEYS.RESIDENTIAL_ADDRESS, null);
export const saveResidentialAddress = (address) => safeSet(KEYS.RESIDENTIAL_ADDRESS, address);

export const getMarketingPreferences = () =>
  safeGet(KEYS.MARKETING_PREFERENCES, { cuvvaChoice: "stay-in-loop", toyotaOffers: false });
export const saveMarketingPreferences = (prefs) => safeSet(KEYS.MARKETING_PREFERENCES, prefs);

export const getIdentityExtra = () => safeGet(KEYS.IDENTITY_EXTRA, null);
export const saveIdentityExtra = (extra) => safeSet(KEYS.IDENTITY_EXTRA, extra);

export const getPreviousIncidents = () => safeGet(KEYS.PREVIOUS_INCIDENTS, []);
export const savePreviousIncidents = (list) => safeSet(KEYS.PREVIOUS_INCIDENTS, list);
export const addPreviousIncident = (incident) => {
  const existing = getPreviousIncidents();
  const next = [...existing, incident];
  savePreviousIncidents(next);
  return next;
};

export const getIncidentsDeclarationDone = () =>
  safeGet(KEYS.INCIDENTS_DECLARATION_DONE, false);
export const saveIncidentsDeclarationDone = (done) =>
  safeSet(KEYS.INCIDENTS_DECLARATION_DONE, done);

export const getJoinedCarClubIds = () => safeGet(KEYS.JOINED_CAR_CLUBS, []);
export const saveJoinedCarClubIds = (ids) => safeSet(KEYS.JOINED_CAR_CLUBS, ids);
export const addJoinedCarClub = (clubId) => {
  const existing = getJoinedCarClubIds();
  if (existing.includes(clubId)) return existing;
  const next = [...existing, clubId];
  saveJoinedCarClubIds(next);
  return next;
};
export const isCarClubJoined = (clubId) => getJoinedCarClubIds().includes(clubId);

export const getCreatedCarClubs = () => safeGet(KEYS.CREATED_CAR_CLUBS, []);
export const saveCreatedCarClubs = (clubs) => safeSet(KEYS.CREATED_CAR_CLUBS, clubs);

/**
 * frontend/src/utils/profileLocalStorage.js
 *
 * Shared localStorage read/write helpers for the Profile sub-pages that
 * explicitly have NO backend endpoint (per instruction: "make sure that
 * this component work through local storage i donot want to implement
 * backend for this components"): Bank account details, Payment
 * methods, Discount code, App rating.
 *
 * Everything here is 100% client-side and device-local — it does NOT
 * sync across devices/sessions, is NOT sent to any server, and is
 * wiped if the user clears site data. This is intentional per your
 * request, not an oversight; flagged here and in each consuming file
 * so it's never mistaken for real persisted backend data.
 */

const KEYS = {
  BANK_DETAILS: "cuvva_bank_details",
  PAYMENT_METHOD: "cuvva_payment_method",
  DISCOUNT_CODE: "cuvva_discount_code",
  APP_RATING: "cuvva_app_rating",
  PREFERRED_NAME: "cuvva_preferred_name",
  RESIDENTIAL_ADDRESS: "cuvva_residential_address",
  MARKETING_PREFERENCES: "cuvva_marketing_preferences",
  IDENTITY_EXTRA: "cuvva_identity_extra",
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
    // localStorage unavailable/full — fail silently, matches the
    // existing RecentlyViewed pattern elsewhere in the app.
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

// --- Added for AccountDetailsPage.jsx's sub-pages ---
// Preferred first name: User.js has no "preferredName" field distinct
// from fullName, and there's no PATCH route exposed to a Customer for
// this specific field — stored locally only, purely as a display
// override (does NOT change the real fullName used elsewhere).
export const getPreferredName = () => safeGet(KEYS.PREFERRED_NAME, null);
export const savePreferredName = (name) => safeSet(KEYS.PREFERRED_NAME, name);

// Residential address: User.js DOES have a real `address` object
// field, but there is no route exposing/editing it for a Customer
// (customers.js's PATCH /:id only accepts fullName/email/expiresAt/
// password, and is Admin-only anyway) — stored locally only until a
// real PATCH /customers/me endpoint supports it.
export const getResidentialAddress = () => safeGet(KEYS.RESIDENTIAL_ADDRESS, null);
export const saveResidentialAddress = (address) => safeSet(KEYS.RESIDENTIAL_ADDRESS, address);

// Marketing preferences: no such field exists anywhere on User.js.
export const getMarketingPreferences = () =>
  safeGet(KEYS.MARKETING_PREFERENCES, { cuvvaChoice: "stay-in-loop", toyotaOffers: false });
export const saveMarketingPreferences = (prefs) => safeSet(KEYS.MARKETING_PREFERENCES, prefs);

// "My identity" extra fields (date of birth, gender, driving licence
// number, verification-photo status) — dateOfBirth exists on User.js
// but isn't returned by /customers/me's current .select() list;
// gender/licence number/verification photos don't exist on the
// schema at all. Stored locally purely so the UI has something to
// show/edit until a real identity-verification backend exists.
export const getIdentityExtra = () => safeGet(KEYS.IDENTITY_EXTRA, null);
export const saveIdentityExtra = (extra) => safeSet(KEYS.IDENTITY_EXTRA, extra);

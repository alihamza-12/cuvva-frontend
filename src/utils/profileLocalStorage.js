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

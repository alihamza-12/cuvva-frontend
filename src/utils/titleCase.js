/*
 * Case helpers shared by the admin dashboard forms.
 *
 * These mirror the rules in the backend (`utils/normalizeCase.js` and
 * `utils/normalizeCardLast4.js`) so what the admin sees while typing, what is
 * sent in the request body and what MongoDB stores are all the same value:
 *
 *   - Names and address prose : first letter capital, the rest lower case
 *                               ("jane doe" -> "Jane Doe")
 *   - Postcode / driving licence / registration : UPPERCASE
 *   - Card marker : exactly four digits, or empty
 */

/** Title case a single word: "SMITH" -> "Smith", "mcdonald" -> "McDonald". */
const titleCaseWord = (word) => {
  if (!word) return word;

  if (/^mc[a-z]/i.test(word) && word.length > 3) {
    return `Mc${titleCaseWord(word.slice(2))}`;
  }
  if (/^mac[a-z]/i.test(word) && word.length > 4) {
    return `Mac${titleCaseWord(word.slice(3))}`;
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

/** Title case a token, keeping hyphen / apostrophe segments capitalised. */
const titleCaseToken = (token) =>
  token
    .split(/([-'’])/)
    .map((part) => (/^[-'’]$/.test(part) ? part : titleCaseWord(part)))
    .join("");

/**
 * Full normalisation used when building a request body: "  jane   doe  " ->
 * "Jane Doe". Never use this while the user is typing — trimming the trailing
 * space would make it impossible to start a second word.
 */
export const toTitleCase = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed.split(/\s+/).map(titleCaseToken).join(" ");
};

/**
 * Live normalisation for onChange handlers. Keeps every space the user typed
 * (so the caret never jumps and typing still feels normal) and only changes the
 * casing of the letters.
 */
export const toTitleCaseLive = (value) => {
  if (typeof value !== "string") return value;

  return value
    .split(/(\s+)/)
    .map((chunk) => (chunk.trim() ? titleCaseToken(chunk) : chunk))
    .join("");
};

/** Uppercase without trimming — safe to run on every keystroke. */
export const toUpperCaseValue = (value) =>
  typeof value === "string" ? value.toUpperCase() : value;

/** Keep digits only, capped at `maxLength` characters. */
export const digitsOnly = (value, maxLength = 4) => {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\D/g, "").slice(0, maxLength);
};

/** True when the card marker is exactly four digits. */
export const isValidCardLast4 = (value) => /^\d{4}$/.test(String(value ?? ""));

/** True when the card marker is empty (allowed on customer creation). */
export const isBlankCardLast4 = (value) =>
  value === undefined || value === null || String(value).trim() === "";

/** One message, used by every form, matching the backend wording. */
export const CARD_LAST4_MESSAGE =
  "Card last four digits must contain exactly 4 numbers.";

/* ------------------------------------------------------------------ *
 * Field level validation messages
 * ------------------------------------------------------------------ */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "This field is required." style message with the field's label. */
export const requiredMessage = (label) => `${label} is required.`;

export default {
  toTitleCase,
  toTitleCaseLive,
  toUpperCaseValue,
  digitsOnly,
  isValidCardLast4,
  isBlankCardLast4,
  CARD_LAST4_MESSAGE,
  EMAIL_PATTERN,
  requiredMessage,
};

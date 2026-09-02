import { policyDateTimeToInstant } from "./policyDateTime";

/*
 * Mirror of the backend's utils/policyStatus.js — the SINGLE SOURCE OF TRUTH
 * for whether a policy is Upcoming / Active / Expired in the UI.
 *
 *   now <  start                  -> Upcoming
 *   start <= now <= end + 59.999s -> Active   (endTime = last covered minute)
 *   now  >  end + 59.999s         -> Expired
 *   "Cancelled"                   -> never recomputed
 *
 * The UI must NOT trust `policy.status` on its own: between two background
 * worker ticks (or immediately after creation) that stored value can lag, which
 * is exactly what made a live policy render as "Expired" and hid the
 * notification bar.
 *
 * Keep this file in sync with cuvva-backend/utils/policyStatus.js.
 */

export const END_MINUTE_GRACE_MS = 60 * 1000 - 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const getPolicyWindow = (policy) => {
  if (!policy) return null;

  const start = policyDateTimeToInstant(policy.startDate, policy.startTime);
  const end = policyDateTimeToInstant(policy.endDate, policy.endTime);
  if (!start || !end) return null;

  const startMs = start.getTime();
  let endMs = end.getTime();

  // Overnight policies (23:00 -> 01:00) must roll forward, never go negative.
  let guard = 0;
  while (endMs <= startMs && guard < 366) {
    endMs += ONE_DAY_MS;
    guard += 1;
  }

  // The stored end minute is fully covered.
  endMs += END_MINUTE_GRACE_MS;

  return { start, end: new Date(endMs), startMs, endMs };
};

export const computePolicyStatus = (policy, now = new Date()) => {
  if (!policy) return null;
  if (policy.status === "Cancelled") return "Cancelled";

  const window = getPolicyWindow(policy);
  if (!window) return policy.status || "Upcoming";

  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();

  if (nowMs < window.startMs) return "Upcoming";
  if (nowMs <= window.endMs) return "Active";
  return "Expired";
};

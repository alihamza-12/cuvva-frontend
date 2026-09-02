import { getMyPolicies } from "../app/api/policyApi";
import { getNotificationPreferences } from "../app/api/customerApi";
import { policyDateTimeToInstant } from "../utils/policyDateTime";
import { requestPushPermission } from "./oneSignal";

/*
 * Shows policy alerts in the DEVICE NOTIFICATION PANEL (system tray) using
 * the standard Web Notifications API through a dedicated service worker.
 *
 * Unlike the old in-app banner, these are genuine OS-level notifications:
 * they appear in the pull-down notification panel even while the app is
 * open, and the "policy ends in …" text is recomputed from live policy
 * data on every poll so the notification in the panel counts down
 * dynamically (same-tag notifications replace each other silently).
 *
 * Works with or without OneSignal: OneSignal (when configured) still
 * delivers server-side pushes, while this manager guarantees on-device
 * panel notifications driven entirely by the customer's real policies.
 */

const WORKER_URL = "/push/policy-worker.js";
const WORKER_SCOPE = "/push/";
const POLL_MS = 30000;
const UPCOMING_WINDOW_MS = 5 * 60 * 1000;

const DEFAULT_PREFERENCES = { policyUpcoming: true, policyActive: true };
const MUTE_KEY = "cuvva:local-push:muted";

export const isLocalPushMuted = () =>
  typeof window !== "undefined" &&
  window.localStorage.getItem(MUTE_KEY) === "1";

export const setLocalPushMuted = (muted) => {
  if (muted) window.localStorage.setItem(MUTE_KEY, "1");
  else window.localStorage.removeItem(MUTE_KEY);
};

let timer = null;
let running = false;
let registrationPromise = null;

export const isLocalPushSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator;

export const ensurePolicyWorker = () => {
  if (!isLocalPushSupported()) return Promise.resolve(null);
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(WORKER_URL, { scope: WORKER_SCOPE })
      .catch((error) => {
        console.warn("[push] policy worker registration failed:", error?.message);
        registrationPromise = null;
        return null;
      });
  }
  return registrationPromise;
};

export const requestLocalPermission = async () => {
  if (!isLocalPushSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
};

/*
 * Grant flow used by the one-time modal and the settings card:
 * try OneSignal first (server pushes), fall back to the plain Web
 * Notifications API so panel notifications work either way.
 */
export const enablePushWithFallback = async () => {
  let granted;
  let viaOneSignal = false;

  try {
    const result = await requestPushPermission();
    granted = Boolean(result.permission);
    viaOneSignal = granted && Boolean(result.optedIn);
  } catch {
    granted = false;
  }

  if (!granted) {
    const permission = await requestLocalPermission();
    granted = permission === "granted";
  }

  if (granted) {
    setLocalPushMuted(false);
    await ensurePolicyWorker();
    refreshPolicyNotificationsNow();
  }

  return { granted, viaOneSignal };
};

const humanize = (milliseconds) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
};

const formatLondon = (instant) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(instant);

const shownOnceKey = (type, policyId) => `cuvva:notified:${type}:${policyId}`;
const wasShown = (type, policyId) =>
  window.localStorage.getItem(shownOnceKey(type, policyId)) === "1";
const markShown = (type, policyId) =>
  window.localStorage.setItem(shownOnceKey(type, policyId), "1");

const show = async (registration, options) => {
  try {
    await registration.showNotification(options.title, options);
  } catch (error) {
    console.warn("[push] showNotification failed:", error?.message);
  }
};

const NOTIFICATION_ICON = "/icons/icon-192.png";

const clearCuvvaNotifications = async (registration) => {
  try {
    const open = await registration.getNotifications();
    open.forEach((notification) => {
      if (String(notification.tag || "").startsWith("cuvva-")) {
        notification.close();
      }
    });
  } catch {
    // Non-fatal.
  }
};

const tick = async () => {
  if (!isLocalPushSupported()) return;

  const registration = await ensurePolicyWorker();
  if (!registration) return;

  if (Notification.permission !== "granted" || isLocalPushMuted()) {
    await clearCuvvaNotifications(registration);
    return;
  }

  const [policiesResult, preferencesResult] = await Promise.allSettled([
    getMyPolicies(),
    getNotificationPreferences(),
  ]);
  if (policiesResult.status !== "fulfilled") return;

  const policies = policiesResult.value.data?.policies || [];
  const preferences =
    preferencesResult.status === "fulfilled"
      ? { ...DEFAULT_PREFERENCES, ...(preferencesResult.value.data?.preferences || {}) }
      : DEFAULT_PREFERENCES;

  const now = new Date();
  const candidates = policies
    .filter((policy) => policy.status !== "Cancelled")
    .map((policy) => ({
      policy,
      start: policyDateTimeToInstant(policy.startDate, policy.startTime),
      end: policyDateTimeToInstant(policy.endDate, policy.endTime),
    }))
    .filter((entry) => entry.start && entry.end && now < entry.end)
    .sort((a, b) => a.start - b.start);

  const active = candidates.find((entry) => now >= entry.start && now < entry.end);
  const upcoming = candidates.find(
    (entry) => entry.start > now && entry.start - now <= UPCOMING_WINDOW_MS,
  );

  const keepTags = new Set();

  if (active) {
    const { policy, end } = active;
    const tag = `cuvva-active-${policy._id}`;
    keepTags.add(tag);
    const registrationText = policy.vehicleId?.registration || "Your vehicle";
    const endText = formatLondon(end);
    const path = `customer/policies/${policy._id}`;

    if (!wasShown("active", policy._id)) {
      markShown("active", policy._id);
      if (preferences.policyActive !== false) {
        await show(registration, {
          tag,
          title: "Your policy is now active",
          body: `${registrationText} is covered until ${endText} — ends in ${humanize(end - now)}.`,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_ICON,
          silent: false,
          requireInteraction: true,
          data: { path },
        });
      }
    } else {
      // Live countdown: same tag replaces the notification in the panel.
      await show(registration, {
        tag,
        title: "Active cover",
        body: `${registrationText} is covered — policy ends in ${humanize(end - now)} (${endText}).`,
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON,
        silent: true,
        data: { path },
      });
    }
  }

  if (upcoming) {
    const { policy, start } = upcoming;
    const tag = `cuvva-upcoming-${policy._id}`;
    keepTags.add(tag);
    const registrationText = policy.vehicleId?.registration || "Your vehicle";
    const startText = formatLondon(start);
    const path = `customer/policies/${policy._id}`;

    if (!wasShown("upcoming", policy._id)) {
      markShown("upcoming", policy._id);
      if (preferences.policyUpcoming !== false) {
        await show(registration, {
          tag,
          title: `Policy starts in ${humanize(start - now)}`,
          body: `Your cover for ${registrationText} begins ${startText} (UK time).`,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_ICON,
          silent: false,
          requireInteraction: true,
          data: { path },
        });
      }
    } else {
      await show(registration, {
        tag,
        title: "Upcoming cover",
        body: `${registrationText} starts in ${humanize(start - now)} (${startText}).`,
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON,
        silent: true,
        data: { path },
      });
    }
  }

  // Clear panel notifications whose policy is no longer active/upcoming.
  try {
    const open = await registration.getNotifications();
    open.forEach((notification) => {
      const tag = String(notification.tag || "");
      if (
        (tag.startsWith("cuvva-active-") || tag.startsWith("cuvva-upcoming-")) &&
        !keepTags.has(tag)
      ) {
        notification.close();
      }
    });
  } catch {
    // Non-fatal: stale notifications simply expire with their TTL.
  }
};

const onVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    tick().catch(() => {});
  }
};

export const startPolicyNotifications = () => {
  if (running) return;
  running = true;
  tick().catch(() => {});
  timer = window.setInterval(() => tick().catch(() => {}), POLL_MS);
  document.addEventListener("visibilitychange", onVisibilityChange);
};

export const stopPolicyNotifications = () => {
  running = false;
  if (timer) window.clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onVisibilityChange);
};

export const refreshPolicyNotificationsNow = () => {
  tick().catch(() => {});
};

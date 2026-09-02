import { getMyPolicies } from "../app/api/policyApi";
import { getNotificationPreferences } from "../app/api/customerApi";
import { computePolicyStatus, getPolicyWindow } from "../utils/policyStatus";
import { requestPushPermission } from "./oneSignal";

/*
 * Shows policy alerts in the DEVICE NOTIFICATION PANEL (system tray).
 *
 * Delivery channel fallback chain (so a notification always gets through):
 *   1. our own service worker at "/push/" scope (handles taps),
 *   2. any already-registered service worker (e.g. the OneSignal one) —
 *      showNotification works on it too,
 *   3. the plain Notification constructor (desktop browsers).
 *
 * The "policy ends in …" copy is recomputed from live policy data on every
 * poll; same-tag notifications replace each other silently so the entry in
 * the panel counts down dynamically.  The rich in-app bar with the running
 * progress line is rendered by PolicyNotificationBar.
 */

const WORKER_URL = "/push/policy-worker.js";
const WORKER_SCOPE = "/push/";
const POLL_MS = 15000;
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
let channelPromise = null;

export const isLocalPushSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator;

const detectChannel = async () => {
  if (!isLocalPushSupported()) return { kind: "none" };

  try {
    const registration = await navigator.serviceWorker.register(WORKER_URL, {
      scope: WORKER_SCOPE,
    });
    return { kind: "sw", registration };
  } catch (error) {
    console.warn("[push] own worker unavailable, trying existing registration:", error?.message);
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) return { kind: "sw", registration };
  } catch {
    // fall through to the constructor channel
  }

  return { kind: "constructor" };
};

export const ensurePolicyWorker = () => {
  if (!isLocalPushSupported()) return Promise.resolve({ kind: "none" });
  if (!channelPromise) {
    channelPromise = detectChannel().catch((error) => {
      console.warn("[push] notification channel detection failed:", error?.message);
      channelPromise = null;
      return { kind: "none" };
    });
  }
  return channelPromise;
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

const NOTIFICATION_ICON = "/icons/icon-192.png";

const showOnChannel = (channel, options) => {
  if (channel.kind === "sw") {
    return channel.registration.showNotification(options.title, options);
  }
  if (channel.kind === "constructor") {
    const notification = new Notification(options.title, {
      body: options.body,
      tag: options.tag,
      icon: options.icon,
      silent: options.silent,
      requireInteraction: options.requireInteraction,
    });
    notification.onclick = () => {
      window.focus();
      if (options.data?.path) {
        window.location.assign(`/${options.data.path}`);
      }
    };
    return Promise.resolve();
  }
  return Promise.resolve();
};

const show = async (channel, options) => {
  try {
    await showOnChannel(channel, options);
  } catch (error) {
    console.warn("[push] showNotification failed:", error?.message);
  }
};

const clearCuvvaNotifications = async (channel) => {
  if (channel.kind !== "sw") return;
  try {
    const open = await channel.registration.getNotifications();
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

  const channel = await ensurePolicyWorker();
  if (channel.kind === "none") return;

  if (Notification.permission !== "granted" || isLocalPushMuted()) {
    await clearCuvvaNotifications(channel);
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
  // Derived (window-based) status, never the possibly-stale stored status.
  const candidates = policies
    .filter((policy) => policy.status !== "Cancelled")
    .map((policy) => {
      const range = getPolicyWindow(policy);
      if (!range) return null;
      return {
        policy,
        start: range.start,
        end: range.end,
        status: computePolicyStatus(policy, now),
      };
    })
    .filter((entry) => entry && entry.status !== "Expired")
    .sort((a, b) => a.start - b.start);

  const active = candidates.find((entry) => entry.status === "Active");
  const upcoming = candidates.find(
    (entry) =>
      entry.status === "Upcoming" &&
      entry.start - now > 0 &&
      entry.start - now <= UPCOMING_WINDOW_MS,
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
        console.info("[push] showing active notification in panel", { policyId: policy._id });
        await show(channel, {
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
      await show(channel, {
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
        console.info("[push] showing upcoming notification in panel", { policyId: policy._id });
        await show(channel, {
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
      await show(channel, {
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

  // Announce upcoming cover once, as soon as an upcoming policy exists
  // (the rich in-app bar is reserved for Active policies only).
  const upcomingAny = candidates.find((entry) => entry.start > now);
  if (upcomingAny) {
    const { policy, start } = upcomingAny;
    const announceTag = `cuvva-upcoming-ann-${policy._id}`;
    keepTags.add(announceTag);
    if (!wasShown("upcoming-announce", policy._id)) {
      markShown("upcoming-announce", policy._id);
      if (preferences.policyUpcoming !== false) {
        const registrationText = policy.vehicleId?.registration || "Your vehicle";
        const startText = formatLondon(start);
        console.info("[push] showing upcoming announcement in panel", {
          policyId: policy._id,
        });
        await show(channel, {
          tag: announceTag,
          title: "Upcoming cover",
          body: `Your cover for ${registrationText} begins ${startText} (UK time) — starts in ${humanize(start - now)}.`,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_ICON,
          silent: false,
          data: { path: `customer/policies/${policy._id}` },
        });
      }
    }
  }

  // Clear panel notifications whose policy is no longer active/upcoming.
  if (channel.kind === "sw") {
    try {
      const open = await channel.registration.getNotifications();
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

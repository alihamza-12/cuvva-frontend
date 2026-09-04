import { getMyPolicies } from "../app/api/policyApi";
import { getNotificationPreferences } from "../app/api/customerApi";
import { getPolicyWindow } from "../utils/policyStatus";
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
 * SIX LIFECYCLE STAGES — each fires EXACTLY ONCE per policy:
 *
 *   1. UPCOMING        policy created / still ahead   -> "Policy is upcoming"
 *   2. STARTING_SOON   5 minutes before start         -> "Starts in 5 minutes"
 *   3. ACTIVE          cover begins                   -> "Policy is now active"
 *   4. HALFWAY         50% of the window elapsed      -> "Halfway through"
 *   5. ENDING_SOON     98% of the window elapsed      -> "Expiring soon"
 *   6. EXPIRED         cover finished                 -> "Policy expired"
 *
 * Each stage is latched in localStorage, so a stage can never fire twice — no
 * repeating countdown, no duplicate stack in the panel.
 */

const WORKER_URL = "/push/policy-worker.js";
const WORKER_SCOPE = "/push/";
const POLL_MS = 15000;
const UPCOMING_WINDOW_MS = 5 * 60 * 1000;

// Lifecycle thresholds (fractions of the total cover window).
const HALFWAY_FRACTION = 0.5;
const ENDING_SOON_FRACTION = 0.98;

// Stage keys — one latch per policy per stage.
const STAGE = {
  UPCOMING: "upcoming",
  STARTING_SOON: "starting-soon",
  ACTIVE: "active",
  HALFWAY: "halfway",
  ENDING_SOON: "ending-soon",
  EXPIRED: "expired",
};

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
  const nowMs = now.getTime();

  /*
   * Evaluate EVERY non-cancelled policy independently and fire whichever
   * lifecycle stages it has newly crossed. Stages are latched, so each one
   * fires exactly once and never repeats.
   */
  for (const policy of policies) {
    if (!policy || policy.status === "Cancelled") continue;

    const range = getPolicyWindow(policy);
    if (!range) continue;

    const policyId = policy._id;
    const startMs = range.startMs;
    const endMs = range.endMs;
    const totalMs = endMs - startMs;
    if (!(totalMs > 0)) continue;

    const registrationText = policy.vehicleId?.registration || "Your vehicle";
    const startText = formatLondon(range.start);
    const endText = formatLondon(new Date(endMs));
    const path = `customer/policies/${policyId}`;
    const data = { path, policyId: String(policyId) };

    const elapsedFraction = (nowMs - startMs) / totalMs;

    const fire = async (stage, options) => {
      if (wasShown(stage, policyId)) return;
      markShown(stage, policyId);
      await show(channel, {
        tag: `cuvva-${stage}-${policyId}`,
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON,
        data,
        ...options,
      });
    };

    // ---- 6. EXPIRED -----------------------------------------------------
    if (nowMs > endMs) {
      await fire(STAGE.EXPIRED, {
        title: "Policy expired",
        body: `Your cover for ${registrationText} ended at ${endText}. You are no longer insured to drive.`,
        requireInteraction: false,
      });
      continue; // nothing later applies
    }

    // ---- 1 & 2. BEFORE COVER STARTS -------------------------------------
    if (nowMs < startMs) {
      if (preferences.policyUpcoming === false) continue;

      const untilStart = startMs - nowMs;

      // 1. Upcoming — announced once, as soon as we first see the policy.
      await fire(STAGE.UPCOMING, {
        title: "Policy is upcoming",
        body: `Your cover for ${registrationText} starts ${startText} (UK time).`,
        requireInteraction: false,
      });

      // 2. Starting soon — within 5 minutes of the start instant.
      if (untilStart > 0 && untilStart <= UPCOMING_WINDOW_MS) {
        await fire(STAGE.STARTING_SOON, {
          title: "Policy starts in 5 minutes",
          body: `${registrationText} — cover begins at ${startText}. Get ready.`,
          requireInteraction: true,
          silent: false,
        });
      }
      continue;
    }

    // ---- 3, 4, 5. COVER IS RUNNING --------------------------------------
    if (preferences.policyActive === false) continue;

    // 3. Active — fired the moment cover begins.
    await fire(STAGE.ACTIVE, {
      title: "Your policy is now active",
      body: `${registrationText} is covered until ${endText}.`,
      requireInteraction: true,
      silent: false,
    });

    // 4. Halfway — 50% of the cover window has elapsed.
    if (elapsedFraction >= HALFWAY_FRACTION) {
      await fire(STAGE.HALFWAY, {
        title: "Policy is halfway through",
        body: `${registrationText} — half your cover has been used. ${humanize(
          endMs - nowMs,
        )} remaining (until ${endText}).`,
        requireInteraction: false,
      });
    }

    // 5. Ending soon — 98% of the cover window has elapsed.
    if (elapsedFraction >= ENDING_SOON_FRACTION) {
      await fire(STAGE.ENDING_SOON, {
        title: "Policy is expiring soon",
        body: `${registrationText} — only ${humanize(
          endMs - nowMs,
        )} of cover left. It ends at ${endText}.`,
        requireInteraction: true,
        silent: false,
      });
    }
  }

  // NOTE: notifications are intentionally NOT auto-closed here. Each stage is
  // a one-off announcement the customer should be able to read in their own
  // time, exactly like any other app's alerts.
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

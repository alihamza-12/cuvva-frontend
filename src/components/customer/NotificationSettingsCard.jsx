import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Share } from "lucide-react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../app/api/customerApi";
import {
  getPushState,
  isIosDevice,
  isStandalonePwa,
  optOutOfPush,
} from "../../services/oneSignal";
import {
  enablePushWithFallback,
  isLocalPushMuted,
  isLocalPushSupported,
  setLocalPushMuted,
} from "../../services/policyNotificationManager";

const DEFAULT_PREFERENCES = { policyUpcoming: true, policyActive: true };

export default function NotificationSettingsCard() {
  const [state, setState] = useState({
    loading: true,
    supported: false,
    permission: false,
    permissionState: "default",
    optedIn: false,
  });
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const iosNeedsInstall = isIosDevice() && !isStandalonePwa();

  const refresh = useCallback(async () => {
    const [pushResult, preferenceResult] = await Promise.allSettled([
      getPushState(),
      getNotificationPreferences(),
    ]);

    setMuted(isLocalPushMuted());

    if (pushResult.status === "fulfilled") {
      setState({ loading: false, ...pushResult.value });
    } else {
      // OneSignal may be unconfigured; on-device panel notifications can
      // still work through the standard Web Notifications API.
      setState((current) => ({
        ...current,
        loading: false,
        supported: current.supported || isLocalPushSupported(),
      }));
    }

    if (preferenceResult.status === "fulfilled") {
      setPreferences(
        preferenceResult.value.data?.preferences || DEFAULT_PREFERENCES,
      );
    } else if (pushResult.status === "fulfilled") {
      setError(
        preferenceResult.reason?.message ||
          "Could not load your notification choices.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const enable = async () => {
    setError("");
    try {
      // OneSignal first (server pushes), standard Web Notifications as a
      // fallback so on-device panel alerts always work.
      const result = await enablePushWithFallback();
      setState((current) => ({
        ...current,
        permission: result.granted,
        permissionState: result.granted ? "granted" : current.permissionState,
        supported: current.supported || isLocalPushSupported(),
        loading: false,
      }));
      if (!result.granted) {
        setError("Permission was not granted. Enable notifications in your device settings.");
      }
    } catch (requestError) {
      setError(requestError?.message || "Could not enable notifications.");
    }
  };

  const disable = async () => {
    setError("");
    try {
      try {
        await optOutOfPush();
      } catch {
        // OneSignal may be unconfigured; muting on-device alerts still applies.
      }
      setLocalPushMuted(true);
      setMuted(true);
      await refresh();
    } catch (requestError) {
      setError(requestError?.message || "Could not disable notifications.");
    }
  };

  const togglePreference = async (field) => {
    const previous = preferences;
    const next = { ...previous, [field]: !previous[field] };
    setPreferences(next);
    setError("");
    try {
      const response = await updateNotificationPreferences({ [field]: next[field] });
      setPreferences(response.data?.preferences || next);
    } catch (requestError) {
      setPreferences(previous);
      setError(requestError?.message || "Could not update your notification choices.");
    }
  };

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-white/5 bg-[#17181c] p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-[#7c6bff]/15 p-2.5 text-[#9a8cff]">
          <Bell size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-extrabold text-white">Policy notifications</h3>
          <p className="mt-1 text-[13px] leading-5 text-[#9497a1]">
            Get an alert five minutes before cover and when your policy becomes active.
          </p>
        </div>
      </div>

      {iosNeedsInstall ? (
        <div className="mt-4 rounded-xl bg-white/5 p-3 text-[13px] leading-5 text-[#c8c9d1]">
          <div className="flex items-center gap-2 font-bold text-white">
            <Share size={15} /> Install on iPhone first
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[#9497a1]">
            <li>Open the Share menu.</li>
            <li>Tap Add to Home Screen.</li>
            <li>Open Cuvva from its Home Screen icon.</li>
            <li>Return here and tap Enable notifications.</li>
          </ol>
        </div>
      ) : state.loading ? (
        <p className="mt-4 text-[13px] text-[#9497a1]">Checking notification status…</p>
      ) : !state.supported && !isLocalPushSupported() ? (
        <p className="mt-4 text-[13px] text-[#e6a8a8]">Push notifications are not supported on this device.</p>
      ) : state.permissionState === "denied" ? (
        <div className="mt-4 rounded-xl bg-red-400/10 p-3 text-[13px] leading-5 text-[#e6a8a8]">
          Notifications are blocked. Open this site’s browser or device notification settings, allow notifications, then return here.
        </div>
      ) : !muted && ((state.permission && state.optedIn) || state.permissionState === "granted") ? (
        <button type="button" onClick={disable} className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 text-[14px] font-bold text-white">
          <BellOff size={17} /> Disable notifications
        </button>
      ) : (
        <button type="button" onClick={enable} className="mt-4 min-h-[44px] w-full rounded-full bg-[#7c6bff] text-[14px] font-bold text-white">
          Enable notifications
        </button>
      )}

      <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
        {[
          ["policyUpcoming", "Five-minute reminder"],
          ["policyActive", "Policy active alert"],
        ].map(([field, label]) => (
          <label key={field} className="flex min-h-[40px] items-center justify-between gap-3 text-[13px] text-[#c8c9d1]">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={preferences[field]}
              onChange={() => togglePreference(field)}
              className="h-5 w-5 accent-[#7c6bff]"
            />
          </label>
        ))}
      </div>

      {error && <p className="mt-3 text-[12px] leading-5 text-[#e05a5a]">{error}</p>}
    </div>
  );
}

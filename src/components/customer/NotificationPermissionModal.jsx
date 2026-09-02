import { useEffect, useState } from "react";
import { Bell, Share, X } from "lucide-react";
import { getPushState, isIosDevice, isStandalonePwa } from "../../services/oneSignal";
import {
  enablePushWithFallback,
  ensurePolicyWorker,
  isLocalPushSupported,
} from "../../services/policyNotificationManager";

const storageKey = (customerId) =>
  `cuvva:notification-permission-prompt:${customerId}`;

export default function NotificationPermissionModal({ customerId }) {
  const [visible, setVisible] = useState(false);
  const [installRequired, setInstallRequired] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) return undefined;
    if (window.localStorage.getItem(storageKey(customerId)) === "completed") {
      return undefined;
    }

    let mounted = true;
    const timer = window.setTimeout(async () => {
      if (isIosDevice() && !isStandalonePwa()) {
        if (mounted) {
          setInstallRequired(true);
          setVisible(true);
        }
        return;
      }

      // OneSignal may be unavailable (missing env config, SDK blocked, …).
      // The modal must still appear, so a failure there is not fatal:
      // we fall back to the standard Web Notifications API.
      let oneSignalState;
      try {
        oneSignalState = await getPushState();
      } catch {
        oneSignalState = null;
      }
      if (!mounted) return;

      const permissionState =
        oneSignalState?.permissionState ||
        window.Notification?.permission ||
        "default";
      const alreadyEnabled =
        (oneSignalState && oneSignalState.permission && oneSignalState.optedIn) ||
        permissionState === "granted";

      if (alreadyEnabled || permissionState === "denied") {
        if (permissionState === "granted") ensurePolicyWorker();
        window.localStorage.setItem(storageKey(customerId), "completed");
        return;
      }

      // Show whenever ANY notification mechanism exists on this device.
      if (oneSignalState?.supported || isLocalPushSupported()) {
        setVisible(true);
      }
    }, 600);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [customerId]);

  if (!visible) return null;

  const close = () => {
    if (!installRequired) {
      window.localStorage.setItem(storageKey(customerId), "completed");
    }
    setVisible(false);
  };

  const enable = async () => {
    setRequesting(true);
    setError("");
    try {
      const result = await enablePushWithFallback();
      if (result.granted) {
        window.localStorage.setItem(storageKey(customerId), "completed");
        setVisible(false);
      } else {
        setError("Permission was not granted. You can allow notifications in your device settings.");
      }
    } catch (requestError) {
      setError(requestError?.message || "Could not enable notifications.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-4 pb-[max(20px,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:pb-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-permission-title"
        className="w-full max-w-[410px] rounded-[26px] border border-white/10 bg-[#18191f] p-6 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-2xl bg-[#7c6bff]/20 p-3 text-[#9587ff]">
            {installRequired ? <Share size={27} /> : <Bell size={27} />}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close notification prompt"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#a7a8b0]"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="notification-permission-title" className="mt-5 text-[24px] font-extrabold leading-tight">
          {installRequired ? "Install Cuvva to get alerts" : "Never miss your cover"}
        </h2>

        {installRequired ? (
          <div className="mt-3 text-[15px] leading-6 text-[#a7a8b0]">
            <p>On iPhone and iPad, notifications work from the Home Screen app:</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5">
              <li>Tap the Safari Share button.</li>
              <li>Choose Add to Home Screen.</li>
              <li>Open Cuvva from its Home Screen icon.</li>
            </ol>
          </div>
        ) : (
          <p className="mt-3 text-[15px] leading-6 text-[#a7a8b0]">
            Allow notifications to get a reminder before your policy starts and an alert when your cover becomes active. Alerts appear in your phone&apos;s notification panel.
          </p>
        )}

        {error && <p className="mt-4 text-[13px] leading-5 text-[#f18b8b]">{error}</p>}

        {installRequired ? (
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-6 min-h-[50px] w-full rounded-full bg-[#7c6bff] text-[16px] font-extrabold"
          >
            Got it
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={enable}
              disabled={requesting}
              className="mt-6 min-h-[50px] w-full rounded-full bg-[#7c6bff] text-[16px] font-extrabold disabled:opacity-60"
            >
              {requesting ? "Enabling…" : "Enable notifications"}
            </button>
            <button
              type="button"
              onClick={close}
              className="mt-2 min-h-[44px] w-full text-[14px] font-bold text-[#a7a8b0]"
            >
              Not now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

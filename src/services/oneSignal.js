const APP_ID = import.meta.env?.VITE_ONESIGNAL_APP_ID;

let initializationPromise;

export const initializeOneSignal = () => {
  if (!APP_ID) {
    return Promise.reject(new Error("VITE_ONESIGNAL_APP_ID is not configured."));
  }
  if (initializationPromise) return initializationPromise;

  initializationPromise = new Promise((resolve, reject) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: "OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/" },
          notifyButton: { enable: false },
        });
        resolve(OneSignal);
      } catch (error) {
        reject(error);
      }
    });
  });

  return initializationPromise;
};

export const loginOneSignalCustomer = async (customerId) => {
  if (!customerId) return;
  const OneSignal = await initializeOneSignal();
  await OneSignal.login(String(customerId));
};

export const logoutOneSignalCustomer = async () => {
  try {
    const OneSignal = await initializeOneSignal();
    await OneSignal.logout();
  } catch {
    // Backend logout must continue even when push services are unavailable.
  }
};

export const requestPushPermission = async () => {
  const OneSignal = await initializeOneSignal();
  if (!OneSignal.Notifications.isPushSupported()) {
    throw new Error("Push notifications are not supported on this device.");
  }
  await OneSignal.Notifications.requestPermission();
  if (OneSignal.Notifications.permission) {
    await OneSignal.User.PushSubscription.optIn();
  }
  return {
    permission: OneSignal.Notifications.permission,
    permissionState: window.Notification?.permission || "default",
    optedIn: OneSignal.User.PushSubscription.optedIn,
  };
};

export const optOutOfPush = async () => {
  const OneSignal = await initializeOneSignal();
  await OneSignal.User.PushSubscription.optOut();
};

export const getPushState = async () => {
  const OneSignal = await initializeOneSignal();
  return {
    supported: OneSignal.Notifications.isPushSupported(),
    permission: OneSignal.Notifications.permission,
    permissionState: window.Notification?.permission || "default",
    optedIn: OneSignal.User.PushSubscription.optedIn,
  };
};

export const isStandalonePwa = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent);

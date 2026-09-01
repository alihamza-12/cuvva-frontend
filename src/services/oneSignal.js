const APP_ID = import.meta.env?.VITE_ONESIGNAL_APP_ID;

let initializationPromise;
let identityOperation = Promise.resolve();
let currentCustomerId = null;

export const initializeOneSignal = () => {
  if (!APP_ID) {
    return Promise.reject(new Error("VITE_ONESIGNAL_APP_ID is not configured."));
  }
  if (initializationPromise) return initializationPromise;

  const attempt = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("OneSignal SDK did not load within 10 seconds."));
    }, 10000);

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
        window.clearTimeout(timeout);
        resolve(OneSignal);
      } catch (error) {
        window.clearTimeout(timeout);
        reject(error);
      }
    });
  });

  initializationPromise = attempt.catch((error) => {
    initializationPromise = undefined;
    throw error;
  });
  return initializationPromise;
};

export const loginOneSignalCustomer = async (customerId) => {
  if (!customerId) return;
  const nextCustomerId = String(customerId);

  identityOperation = identityOperation.catch(() => {}).then(async () => {
    const OneSignal = await initializeOneSignal();
    if (currentCustomerId === nextCustomerId) return;
    if (currentCustomerId) await OneSignal.logout();
    await OneSignal.login(nextCustomerId);
    currentCustomerId = nextCustomerId;
  });

  return identityOperation;
};

export const logoutOneSignalCustomer = async () => {
  identityOperation = identityOperation.catch(() => {}).then(async () => {
    try {
      const OneSignal = await initializeOneSignal();
      await OneSignal.logout();
      currentCustomerId = null;
    } catch {
      // Backend logout must continue even when push services are unavailable.
    }
  });

  return identityOperation;
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

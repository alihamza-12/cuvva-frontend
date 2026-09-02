/*
 * Cuvva policy notification worker.
 *
 * Registered at its own scope ("/push/") so it can coexist with the
 * OneSignal service worker that controls "/".  Its only job is to give
 * locally-shown policy notifications a click behaviour: tapping the
 * notification in the device notification panel opens (or re-uses) the
 * app and navigates straight to the relevant policy screen.
 */

const appUrl = (path) => {
  const scopeUrl = new URL(self.registration.scope);
  return new URL(path || "", scopeUrl.origin + "/").href;
};

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  if (!notification) return;

  const tag = String(notification.tag || "");
  if (!tag.startsWith("cuvva-")) return; // leave OneSignal notifications to OneSignal

  event.preventDefault();
  notification.close();

  const target = appUrl(notification.data && notification.data.path);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((client) => "navigate" in client);
        if (existing) {
          return existing.focus().then((client) => client.navigate(target));
        }
        return clients.openWindow(target);
      })
      .catch(() => clients.openWindow(target))
  );
});

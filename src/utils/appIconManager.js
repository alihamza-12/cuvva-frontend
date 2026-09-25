import {
  APP_ICONS,
  APP_ICON_STORAGE_KEY,
  DEFAULT_APP_ICON_ID,
  getAppIconById,
} from "../data/appIcons";

/*
 * Customer-facing app icon manager.
 *
 * The bootstrap script in index.html owns the actual DOM work (it has to run
 * before React so an already-installed home-screen app shows the chosen icon
 * on its next launch). It exposes window.__cuvvaSetAppIcon(id).
 *
 * This module:
 *  - persists the customer's choice in localStorage,
 *  - asks the bootstrap to re-apply the icon immediately,
 *  - falls back to doing the DOM work itself when the bootstrap is absent
 *    (e.g. unit tests / storybook).
 *
 * How the installed home-screen icon changes WITHOUT re-adding:
 *  - iOS/Safari reads <link rel="apple-touch-icon"> — we re-point its href.
 *  - Chromium/Android reads the web app manifest — we rebuild the manifest
 *    as a blob URL with the chosen icon URLs and swap <link rel="manifest">.
 *    Chrome refreshes the installed PWA icon from the updated manifest.
 */

export function getSelectedAppIconId() {
  try {
    const stored = window.localStorage.getItem(APP_ICON_STORAGE_KEY);
    return APP_ICONS.some((icon) => icon.id === stored)
      ? stored
      : DEFAULT_APP_ICON_ID;
  } catch {
    return DEFAULT_APP_ICON_ID;
  }
}

const bust = (url) =>
  `${url}${url.includes("?") ? "&" : "?"}v=3`;

function applyLocally(id) {
  const icon = getAppIconById(id);
  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const main = document.getElementById("apple-touch-icon");
  const darkLink = document.getElementById("apple-touch-icon-dark");
  if (main) main.href = bust(isDark ? icon.dark : icon.light);
  if (darkLink) darkLink.href = bust(icon.dark);

  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink && window.URL && window.Blob) {
    // The manifest is served from a blob: URL, so every URL inside it must be
    // absolute — relative ones resolve against blob: and Chrome ignores them
    // with "URL is invalid" warnings.
    const origin = window.location.origin;
    const manifest = {
      short_name: "Cuvva",
      name: "Cuvva Insurance",
      id: origin + "/",
      start_url: origin + "/",
      scope: origin + "/",
      display: "standalone",
      theme_color: "#7B5CFA",
      background_color: "#7B5CFA",
      icons: [
        { src: bust(origin + icon.light192), sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: bust(origin + icon.light), sizes: "512x512", type: "image/png", purpose: "any maskable" },
        { src: bust(origin + icon.dark192), sizes: "192x192", type: "image/png", purpose: "any maskable", media: "(prefers-color-scheme: dark)" },
        { src: bust(origin + icon.dark), sizes: "512x512", type: "image/png", purpose: "any maskable", media: "(prefers-color-scheme: dark)" },
      ],
    };

    if (manifestLink.__cuvvaBlobUrl) {
      try {
        URL.revokeObjectURL(manifestLink.__cuvvaBlobUrl);
      } catch {
        /* ignore */
      }
    }
    const blob = new Blob([JSON.stringify(manifest)], {
      type: "application/manifest+json",
    });
    const url = URL.createObjectURL(blob);
    manifestLink.__cuvvaBlobUrl = url;
    manifestLink.href = url;
  }
}

export function applyAppIcon(id) {
  if (typeof window.__cuvvaSetAppIcon === "function") {
    window.__cuvvaSetAppIcon(id);
    return;
  }
  applyLocally(id);
}

/**
 * Persist the choice and change the app icon right now
 * (home screen included — no re-adding needed).
 */
export function selectAppIcon(id) {
  const icon = getAppIconById(id);
  try {
    window.localStorage.setItem(APP_ICON_STORAGE_KEY, icon.id);
  } catch {
    /* private mode etc. — the icon still applies for this session */
  }
  applyAppIcon(icon.id);
  return icon;
}

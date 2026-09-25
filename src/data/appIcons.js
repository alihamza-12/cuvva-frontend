/*
 * Alternate home-screen app icons for the customer "Change icon" screen
 * (Profile -> Settings -> Change icon).
 *
 * Every icon has a LIGHT and a DARK artwork, exactly like the real Cuvva
 * app: the "Preview Dark Mode" toggle on the Change icon screen previews the
 * dark set, and the device theme decides which artwork is used for the
 * actual home-screen icon.
 *
 * NOTE: this map is mirrored in the bootstrap script of index.html
 * (which must apply the chosen icon before the React bundle loads, so an
 * already-installed home-screen app shows the new icon on next launch).
 * If you add/remove/rename an icon here, update index.html too.
 */

export const APP_ICON_STORAGE_KEY = "cuvva_selected_app_icon";
export const DEFAULT_APP_ICON_ID = "default";

export const APP_ICONS = [
  {
    id: "default",
    name: "Default",
    light: "/icons/icon-512.png",
    dark: "/icons/icon-dark-512.png",
    light192: "/icons/icon-192.png",
    dark192: "/icons/icon-dark-192.png",
  },
  {
    id: "investor",
    name: "Investor",
    light: "/icons/app/investor-light-512.png",
    dark: "/icons/app/investor-dark-512.png",
    light192: "/icons/app/investor-light-192.png",
    dark192: "/icons/app/investor-dark-192.png",
  },
  {
    id: "pride",
    name: "Pride",
    light: "/icons/app/pride-light-512.png",
    dark: "/icons/app/pride-dark-512.png",
    light192: "/icons/app/pride-light-192.png",
    dark192: "/icons/app/pride-dark-192.png",
  },
  {
    id: "black-culture",
    name: "Black Culture",
    light: "/icons/app/black-culture-light-512.png",
    dark: "/icons/app/black-culture-dark-512.png",
    light192: "/icons/app/black-culture-light-192.png",
    dark192: "/icons/app/black-culture-dark-192.png",
  },
  {
    id: "neon",
    name: "Neon",
    light: "/icons/app/neon-light-512.png",
    dark: "/icons/app/neon-dark-512.png",
    light192: "/icons/app/neon-light-192.png",
    dark192: "/icons/app/neon-dark-192.png",
  },
  {
    id: "black-and-white",
    name: "Black And White",
    light: "/icons/app/black-and-white-light-512.png",
    dark: "/icons/app/black-and-white-dark-512.png",
    light192: "/icons/app/black-and-white-light-192.png",
    dark192: "/icons/app/black-and-white-dark-192.png",
  },
  {
    id: "christmas",
    name: "Christmas",
    light: "/icons/app/christmas-light-512.png",
    dark: "/icons/app/christmas-dark-512.png",
    light192: "/icons/app/christmas-light-192.png",
    dark192: "/icons/app/christmas-dark-192.png",
  },
  {
    id: "halloween-zombie",
    name: "Halloween Zombie",
    light: "/icons/app/halloween-zombie-light-512.png",
    dark: "/icons/app/halloween-zombie-dark-512.png",
    light192: "/icons/app/halloween-zombie-light-192.png",
    dark192: "/icons/app/halloween-zombie-dark-192.png",
  },
  {
    id: "halloween-pumpkin",
    name: "Halloween Pumpkin",
    light: "/icons/app/halloween-pumpkin-light-512.png",
    dark: "/icons/app/halloween-pumpkin-dark-512.png",
    light192: "/icons/app/halloween-pumpkin-light-192.png",
    dark192: "/icons/app/halloween-pumpkin-dark-192.png",
  },
  {
    id: "cuvvarati",
    name: "Cuvvarati",
    light: "/icons/app/cuvvarati-light-512.png",
    dark: "/icons/app/cuvvarati-dark-512.png",
    light192: "/icons/app/cuvvarati-light-192.png",
    dark192: "/icons/app/cuvvarati-dark-192.png",
  },
];

export const getAppIconById = (id) =>
  APP_ICONS.find((icon) => icon.id === id) || APP_ICONS[0];

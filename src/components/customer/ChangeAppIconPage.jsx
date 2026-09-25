import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion, Check } from "lucide-react";

import Screen from "../layout/Screen";
import { APP_ICONS } from "../../data/appIcons";
import {
  getSelectedAppIconId,
  selectAppIcon,
} from "../../utils/appIconManager";

/*
 * Profile -> Settings -> Change icon.
 *
 * Mirrors the real Cuvva screen:
 *  - "Preview Dark Mode" toggle switches the list between the light and the
 *    dark artwork of every icon;
 *  - the green tick sits ONLY on the icon that is currently applied;
 *  - tapping an icon applies it immediately (the installed home-screen icon
 *    changes too, without re-adding) and shows the confirmation dialog:
 *    "You have changed the icon for "Cuvva"." with an OK button.
 */
export default function ChangeAppIconPage() {
  const navigate = useNavigate();

  const [previewDark, setPreviewDark] = useState(false);
  const [selectedId, setSelectedId] = useState(getSelectedAppIconId);
  const [modalIconId, setModalIconId] = useState(null);

  const variantOf = (icon) => (previewDark ? icon.dark : icon.light);

  const modalIcon = APP_ICONS.find((icon) => icon.id === modalIconId) || null;

  const handlePick = (id) => {
    // Apply now so the app / home-screen icon changes with the tapped icon,
    // then show the confirmation dialog exactly like the real app.
    selectAppIcon(id);
    setSelectedId(id);
    setModalIconId(id);
  };

  return (
    <Screen className="text-white pb-32">
      {/* Header — round back + round help, like the screenshots */}
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#17181c] border border-white/5 active:opacity-60"
        >
          <ChevronLeft size={22} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#17181c] border border-white/5 active:opacity-60"
        >
          <MessageCircleQuestion size={19} className="text-white" />
        </button>
      </div>

      {/* Preview Dark Mode toggle */}
      <div className="mx-4 mt-5 rounded-2xl bg-[#17181c] border border-white/5 px-4 py-4 flex items-center justify-between">
        <span className="text-[17px] font-semibold text-white">
          Preview Dark Mode
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={previewDark}
          aria-label="Preview Dark Mode"
          onClick={() => setPreviewDark((value) => !value)}
          className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${
            previewDark ? "bg-[#30d158]" : "bg-[#39393d]"
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-transform duration-200 ${
              previewDark ? "translate-x-[20px]" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Icon list — one rounded card, tick only on the applied icon */}
      <div className="mx-4 mt-4 rounded-3xl bg-[#17181c] border border-white/5 px-4 py-3 flex flex-col">
        {APP_ICONS.map((icon) => {
          const isSelected = icon.id === selectedId;
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => handlePick(icon.id)}
              className="flex items-center gap-4 py-3.5 text-left active:opacity-60"
            >
              <img
                src={variantOf(icon)}
                alt={`${icon.name} app icon`}
                draggable={false}
                className="w-16 h-16 rounded-[18px] object-cover select-none"
              />
              <span className="flex-1 text-[17px] font-semibold text-white">
                {icon.name}
              </span>
              {isSelected && (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#30d158]">
                  <Check size={15} strokeWidth={3} className="text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation dialog — same as the real app */}
      {modalIcon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-[430px] rounded-[24px] bg-[#1d1e22] p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <img
                src={variantOf(modalIcon)}
                alt=""
                draggable={false}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <p className="text-[20px] leading-snug text-white">
                You have changed the icon for "Cuvva".
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalIconId(null)}
              className="mt-6 w-full rounded-2xl bg-[#2a2b30] py-4 text-[19px] font-semibold text-white active:opacity-70"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
}

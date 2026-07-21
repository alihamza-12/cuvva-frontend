import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import { getPreferredName, savePreferredName } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/PreferredNamePage.jsx
 *
 * "Edit preferred name" — opened from AccountDetailsPage.jsx's
 * "Preferred first name" row. Matches reference: header, title,
 * subtitle copy, single pill input pre-filled with the current
 * preferred name, sticky "Save" button.
 *
 * NO BACKEND FIELD/ENDPOINT for a distinct "preferred name" exists on
 * User.js (only fullName/firstName/lastName, auto-derived from
 * fullName). Saved 100% client-side via localStorage
 * (profileLocalStorage.js) as a display-only override — it does NOT
 * change the account's real fullName anywhere else in the app.
 * Defaults to the real fullName's first word (from GET
 * /customers/me) the first time this page is opened, before any
 * local override has been saved.
 */
export default function PreferredNamePage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const realFirstName = data?.customer?.fullName?.trim()?.split(/\s+/)?.[0] || "";

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getPreferredName();
    setName(stored ?? realFirstName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realFirstName]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleSave = () => {
    // localStorage only — no backend field/endpoint for this exists.
    savePreferredName(name.trim());
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Edit preferred name
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          Preferred name is optional. We'll refer to you by this name where
          possible, except where your legal name is required
        </p>

        <div className="mt-6">
          <input
            type="text"
            placeholder="Preferred name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="w-full px-5 py-4 rounded-full bg-[#242429] text-white placeholder:text-[#8a8a92] text-[15px] outline-none focus:ring-2 focus:ring-[#7c6bff]/50"
          />
        </div>

        {saved && (
          <p className="text-[13px] text-[#7fdba0] mt-4">
            Saved to this device.
          </p>
        )}
      </div>

      {/* Sticky footer — offset above CustomerBottomNav (bottom-24)
          rather than bottom-0, since this page now renders inside
          CustomerLayout (bottom nav visible) instead of full-screen. */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          Save
        </button>
      </div>
    </div>
  );
}

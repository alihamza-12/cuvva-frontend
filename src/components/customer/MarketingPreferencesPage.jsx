import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import {
  getMarketingPreferences,
  saveMarketingPreferences,
} from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/MarketingPreferencesPage.jsx
 *
 * "Marketing preferences" — opened from AccountDetailsPage.jsx's
 * "Marketing preferences" row. Matches reference: header, "Cuvva"
 * section with 3 radio-style options (All the good stuff / Stay in
 * the loop / Opt out), "Toyota" section with a single toggle switch
 * ("Send me offers").
 *
 * NO BACKEND FIELD for marketing preferences exists anywhere on
 * User.js. Saved 100% client-side via localStorage
 * (profileLocalStorage.js) — flagged clearly, not a real
 * consent-management/CRM integration.
 */
export default function MarketingPreferencesPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ cuvvaChoice: "stay-in-loop", toyotaOffers: false });

  useEffect(() => {
    setPrefs(getMarketingPreferences());
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const setCuvvaChoice = (choice) => {
    const next = { ...prefs, cuvvaChoice: choice };
    setPrefs(next);
    saveMarketingPreferences(next);
  };

  const toggleToyotaOffers = () => {
    const next = { ...prefs, toyotaOffers: !prefs.toyotaOffers };
    setPrefs(next);
    saveMarketingPreferences(next);
  };

  const options = [
    {
      id: "all-the-good-stuff",
      title: "All the good stuff",
      description: "Offers, tips, and the best bits from Cuvva and relevant partners",
    },
    {
      id: "stay-in-loop",
      title: "Stay in the loop",
      description: "With special offers, news, and tips we think you'll love",
    },
    {
      id: "opt-out",
      title: "Opt out",
      description: "Get account and policy information only",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-40">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Marketing preferences</h1>
        <button
          type="button"
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <p className="text-[13px] font-bold text-[#9497a1] px-4 mt-6 mb-2">Cuvva</p>
      <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
        {options.map((opt, i) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setCuvvaChoice(opt.id)}
            className={`w-full flex items-start justify-between gap-3 px-4 py-4 text-left ${
              i !== options.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <div>
              <p className="text-[15px] font-bold text-white">{opt.title}</p>
              <p className="text-[13px] text-[#9497a1] leading-relaxed mt-0.5">
                {opt.description}
              </p>
            </div>
            <RadioDot selected={prefs.cuvvaChoice === opt.id} />
          </button>
        ))}
      </div>

      <p className="text-[13px] font-bold text-[#9497a1] px-4 mt-6 mb-2">Toyota</p>
      <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
        <div className="w-full flex items-start justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[15px] font-bold text-white">Send me offers</p>
            <p className="text-[13px] text-[#9497a1] leading-relaxed mt-0.5">
              Get products and services from Toyota by email and text message
            </p>
          </div>
          <ToggleSwitch checked={prefs.toyotaOffers} onChange={toggleToyotaOffers} />
        </div>
      </div>
    </div>
  );
}

function RadioDot({ selected }) {
  return (
    <span
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
        selected ? "border-[#7c6bff] bg-[#7c6bff]" : "border-[#5c5e68]"
      }`}
    >
      {selected && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors shrink-0 mt-0.5 ${
        checked ? "bg-[#7c6bff] justify-end" : "bg-[#3a3a41] justify-start"
      }`}
    >
      <span className="w-6 h-6 rounded-full bg-white shadow" />
    </button>
  );
}

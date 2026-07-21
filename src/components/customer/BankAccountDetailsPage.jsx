import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { getBankDetails, saveBankDetails } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/BankAccountDetailsPage.jsx
 *
 * "Bank account details" — opened from Profile > Bank details.
 * Matches reference screenshot exactly: header, title + subtitle,
 * 4 stacked pill inputs, "How payouts work" link, sticky "Save
 * details" button.
 *
 * NO BACKEND ENDPOINT EXISTS for this (per instruction) — this is
 * Cuvva's car-SHARING host payout feature, unrelated to insurance
 * policies, and there's nothing in customers.js/User.js for bank
 * details. Persisted 100% client-side via localStorage
 * (profileLocalStorage.js) — device-local only, not synced to any
 * server. Flagged clearly, not silently faked as a real save.
 */
export default function BankAccountDetailsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    accountName: "",
    sortCode: "",
    accountNumber: "",
    accountNumberConfirm: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getBankDetails();
    if (existing) setForm((prev) => ({ ...prev, ...existing }));
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const canSave =
    form.accountName.trim() &&
    form.sortCode.trim() &&
    form.accountNumber.trim() &&
    form.accountNumber.trim() === form.accountNumberConfirm.trim();

  const handleSave = () => {
    if (!canSave) return;
    // localStorage only — no backend endpoint exists for bank details.
    saveBankDetails(form);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Bank account details
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          Let us know where to send your money when someone books a trip on
          your car
        </p>

        <div className="mt-6 space-y-3">
          <PillInput
            placeholder="First and last name on the account"
            value={form.accountName}
            onChange={handleChange("accountName")}
          />
          <PillInput
            placeholder="Sort code"
            value={form.sortCode}
            onChange={handleChange("sortCode")}
            inputMode="numeric"
          />
          <PillInput
            placeholder="Account number"
            value={form.accountNumber}
            onChange={handleChange("accountNumber")}
            inputMode="numeric"
          />
          <PillInput
            placeholder="Re-enter account number"
            value={form.accountNumberConfirm}
            onChange={handleChange("accountNumberConfirm")}
            inputMode="numeric"
          />
        </div>

        <button
          type="button"
          onClick={() => console.log("How payouts work tapped — not wired up yet.")}
          className="flex items-center gap-2 mt-5 text-[15px] font-bold text-[#7c6bff]"
        >
          <HelpCircle size={18} className="text-[#7c6bff]" />
          How payouts work
        </button>

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
          disabled={!canSave}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          Save details
        </button>
      </div>
    </div>
  );
}

function PillInput({ placeholder, value, onChange, inputMode }) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-4 rounded-full bg-[#242429] text-white placeholder:text-[#8a8a92] text-[15px] outline-none focus:ring-2 focus:ring-[#7c6bff]/50"
    />
  );
}

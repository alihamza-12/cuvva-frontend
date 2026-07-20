import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { getAppliedDiscounts, saveAppliedDiscounts } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/DiscountCodePage.jsx
 *
 * "Apply discount code" — opened from Profile > Apply discount code.
 * Matches reference: centered header title, help icon, instructional
 * copy, single pill input, "Redeem" button.
 *
 * NO BACKEND ENDPOINT EXISTS for discount codes anywhere in
 * policies.js/customers.js — there's no discount/voucher schema at
 * all. Per instruction, this works entirely through localStorage:
 * "redeeming" a code just appends it to a locally-stored list
 * (profileLocalStorage.js), with no real validation, discount
 * calculation, or server-side effect. Flagged clearly so it's never
 * mistaken for a real working discount system.
 */
export default function DiscountCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null); // null | "redeemed" | "empty"

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleRedeem = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setStatus("empty");
      return;
    }
    // localStorage only — no real discount/voucher backend exists.
    const existing = getAppliedDiscounts();
    saveAppliedDiscounts([...existing, { code: trimmed, appliedAt: new Date().toISOString() }]);
    setStatus("redeemed");
    setCode("");
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
        <h1 className="text-[16px] font-bold text-white">Apply discount code</h1>
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
      <div className="flex-1 px-4 pt-6">
        <p className="text-[15px] text-[#9497a1] leading-relaxed text-center">
          Enter a discount code if you have been referred by a friend or have
          a promotional discount code
        </p>

        <div className="mt-5">
          <input
            type="text"
            placeholder="Discount code..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setStatus(null);
            }}
            className="w-full px-5 py-4 rounded-full bg-[#242429] text-white placeholder:text-[#8a8a92] text-[15px] outline-none focus:ring-2 focus:ring-[#7c6bff]/50"
          />
        </div>

        <button
          type="button"
          onClick={handleRedeem}
          className="w-full mt-3 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
        >
          Redeem
        </button>

        {status === "redeemed" && (
          <p className="text-[13px] text-[#7fdba0] mt-4 text-center">
            Code saved to this device.
          </p>
        )}
        {status === "empty" && (
          <p className="text-[13px] text-[#e05a5a] mt-4 text-center">
            Enter a code first.
          </p>
        )}
      </div>
    </div>
  );
}

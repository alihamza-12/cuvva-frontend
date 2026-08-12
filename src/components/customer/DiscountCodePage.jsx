import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, MessageCircleQuestion } from "lucide-react";
import {
  getAppliedDiscounts,
  saveAppliedDiscounts,
} from "../../utils/profileLocalStorage";
import notFoundIcon from "/details-not-found-icon.png";

export default function DiscountCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null); 
  const [showNotFound, setShowNotFound] = useState(false);

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

    const existing = getAppliedDiscounts();
    saveAppliedDiscounts([
      ...existing,
      { code: trimmed, appliedAt: new Date().toISOString() },
    ]);
    setStatus(null);
    setShowNotFound(true);
  };

  return (
    <div className="relative flex flex-col text-white">

      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">
          Apply discount code
        </h1>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="relative z-10 px-4 pt-6">
        <p className="text-[15px] text-[#9497a1] leading-relaxed text-center">
          Enter a discount code if you have been referred by a friend or have a
          promotional discount code
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

        {status === "empty" && (
          <p className="text-[13px] text-[#e05a5a] mt-4 text-center">
            Enter a code first.
          </p>
        )}
      </div>

      {showNotFound && (
        <>
          
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowNotFound(false)}
            className="absolute top-0 left-0 right-0 z-20"
            style={{ height: "38%", background: "rgba(0,0,0,0.65)" }}
          />

          <div className="absolute z-40 left-4 right-4" style={{ top: "34%" }}>
            <div className="bg-[#1b1c21] rounded-3xl px-6 pt-8 pb-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex justify-center">
                <img
                  src={notFoundIcon}
                  alt=""
                  className="w-[92px] h-[92px] object-contain"
                />
              </div>
              <h2 className="text-[19px] font-extrabold text-white mt-5">
                Details not found
              </h2>
              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-3">
                That code doesn't look right! Please try entering it again. 🙂
              </p>
            </div>
          </div>

          {/* Replaces CustomerBottomNav in place: same fixed/bottom
              screen position, but a HIGHER z-index (z-[60] > the
              nav's own z-50) and fully opaque, so the real nav pill
              underneath — including its rounded top edge / shadow,
              which needs a good chunk of extra height above it to
              fully mask — is completely covered/invisible. "Chat to
              our team" now sits exactly where the nav used to be.
              min-h-[110px] is generous on purpose: taller than the
              nav's own tallest possible rendered height (pill + its
              12px drop-shadow blur + safe-area padding), so no sliver
              of the real nav can ever peek out above this bar on any
              device. */}
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-black flex items-center justify-center min-h-[110px] safe-bottom-replace">
            <button
              type="button"
              onClick={() => navigate("/customer/support")}
              className="flex items-center gap-1.5 text-[14px] font-semibold text-white"
            >
              <MessageCircleQuestion size={16} className="text-white" />
              Chat to our team
            </button>
          </div>
        </>
      )}

      <style>{`
        .safe-bottom-replace { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
}

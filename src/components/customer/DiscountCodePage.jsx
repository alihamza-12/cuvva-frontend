import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { getAppliedDiscounts, saveAppliedDiscounts } from "../../utils/profileLocalStorage";
import notFoundIcon from "/details-not-found-icon.png";

/**
 * frontend/src/components/customer/DiscountCodePage.jsx
 *
 * "Apply discount code" — opened from Profile > Apply discount code.
 * Base screen (before Redeem is tapped) matches the reference EXACTLY
 * as originally built: centered header title, help icon, instructional
 * copy, single pill input, "Redeem" button, NOTHING else — no visible
 * "Chat to our team" text on this base screen at all. That only shows
 * up once "Details not found" appears (see below).
 *
 * NO BACKEND ENDPOINT EXISTS for discount codes anywhere in
 * policies.js/customers.js — there's no discount/voucher schema at
 * all. Per instruction, this works entirely through localStorage:
 * "redeeming" a code just appends it to a locally-stored list
 * (profileLocalStorage.js), with no real validation, discount
 * calculation, or server-side effect. Flagged clearly so it's never
 * mistaken for a real working discount system.
 *
 * "Details not found" state (matches 20p exactly): typing ANY code
 * and tapping "Redeem" triggers this — there's no real backend to
 * validate the code against, so every code gets the same result.
 * Three things all appear together the instant this is triggered:
 *   1. A dim/transparent-ish backdrop (rgba(0,0,0,0.65)) over the
 *      header/subtitle/input/Redeem area — you can still see that
 *      content faintly through it, matching the reference.
 *   2. The "Details not found" card, positioned right under the
 *      Redeem button (not centered on the whole screen).
 *   3. CustomerBottomNav is REPLACED — not just covered/hidden, its
 *      exact screen position (fixed, bottom, full-width, same height
 *      band) now shows a "Chat to our team" bar INSTEAD of the nav
 *      pill, exactly matching 20p where the 4-tab nav is completely
 *      gone and a single centered "Chat to our team" link sits where
 *      the nav used to be. This is done from THIS page only (a
 *      same-fixed-position, higher-z-index, opaque black bar) — no
 *      edit to CustomerBottomNav.jsx/CustomerLayout.jsx, since the
 *      standing rule is not to touch that file; it's still mounted
 *      and running behind this bar, just fully visually replaced by
 *      it while "Details not found" is showing. Tapping ANY blank
 *      area of the dimmed backdrop instantly returns to the plain
 *      base screen (dim gone, card gone, real bottom nav visible
 *      again) — nothing navigates away from this page.
 *
 * Icon: real image import (`details-not-found-icon.png`, placed in
 * `frontend/public/`) rather than a hand-drawn SVG — swap that file
 * for whatever icon you want; no code changes needed here for that.
 */
export default function DiscountCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null); // null | "empty"
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
    // localStorage only — no real discount/voucher backend exists, so
    // every code (right or wrong) is saved locally for record-keeping,
    // but the UI always shows "Details not found" per instruction,
    // since there's nothing real to validate the code against.
    const existing = getAppliedDiscounts();
    saveAppliedDiscounts([...existing, { code: trimmed, appliedAt: new Date().toISOString() }]);
    setStatus(null);
    setShowNotFound(true);
  };

  return (
    <div className="relative flex flex-col min-h-screen text-white bg-black">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Apply discount code</h1>
        <button
          type="button"
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      {/* Content — this is the base screen, matches your original
          code exactly (no "Chat to our team" here at all). */}
      <div className="relative z-10 px-4 pt-6">
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

        {status === "empty" && (
          <p className="text-[13px] text-[#e05a5a] mt-4 text-center">
            Enter a code first.
          </p>
        )}
      </div>

      {/* Everything below only exists once "Details not found" is
          triggered — none of it is present on the base screen. */}
      {showNotFound && (
        <>
          {/* Dim backdrop over the header/input/Redeem area. Tapping
              anywhere on it closes everything and returns to the
              plain base screen (real bottom nav reappears). */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowNotFound(false)}
            className="absolute top-0 left-0 right-0 z-20"
            style={{ height: "38%", background: "rgba(0,0,0,0.65)" }}
          />

          {/* "Details not found" card — sits just under the Redeem
              button, not centered on the whole screen. */}
          <div className="absolute z-40 left-4 right-4" style={{ top: "34%" }}>
            <div className="bg-[#1b1c21] rounded-3xl px-6 pt-8 pb-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex justify-center">
                <img src={notFoundIcon} alt="" className="w-[92px] h-[92px] object-contain" />
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
              onClick={() => console.log("Chat to our team tapped — not wired up yet.")}
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

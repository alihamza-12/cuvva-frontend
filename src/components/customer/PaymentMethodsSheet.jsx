import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Plus } from "lucide-react";
import { getPaymentMethod, savePaymentMethod } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/PaymentMethodsSheet.jsx
 *
 * "Manage your payment methods" bottom sheet — opened by tapping the
 * "Payment methods" row on ProfilePage.jsx. Rebuilt to match the
 * reference screenshot's exact tile shape: wide credit-card-style
 * rounded rectangles (not small squares) — a dashed-border "+ Add"
 * tile with a solid grey circle+plus centered, and a solid
 * purple-bordered "Apple Pay" tile containing a white card-style
 * badge (Apple glyph + "Pay" wordmark) with a purple checkmark circle
 * overlapping its bottom-right corner.
 *
 * STACKING FIX: rendered via a React portal straight into
 * document.body (instead of inline inside ProfilePage's tree), with a
 * z-index (z-[100]) higher than CustomerBottomNav's z-50. Without
 * this, the sheet — despite being `position: fixed` — could end up
 * stacking BELOW the bottom nav bar (same z-index, different
 * stacking context via CustomerLayout's tree), causing the nav to
 * visibly cut across the sheet's bottom edge instead of the sheet
 * covering the full screen. The portal guarantees this sheet always
 * renders on top and reaches true screen edges, everywhere it's used.
 *
 * NO BACKEND ENDPOINT/SCHEMA for payment methods exists on User.js —
 * there's no real Apple Pay/Stripe/card integration wired up.
 * Selection is persisted 100% client-side via localStorage
 * (profileLocalStorage.js), purely so the UI remembers your choice
 * between visits — it does NOT charge or store any real payment
 * credentials. The Apple glyph below is drawn as a plain inline SVG
 * shape (not Apple's actual trademarked logo asset), just enough to
 * visually read as the familiar "apple" silhouette next to "Pay".
 */
export default function PaymentMethodsSheet({ onClose }) {
  const [selected, setSelected] = useState("apple-pay");

  useEffect(() => {
    setSelected(getPaymentMethod());
  }, []);

  // Lock background scroll while the sheet is open, same as a native
  // bottom sheet would.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSelect = (method) => {
    setSelected(method);
    savePaymentMethod(method);
  };

  const handleAddMethod = () => {
    // Placeholder — no real card/payment-provider integration exists.
    console.log("Add payment method tapped — not wired up yet.");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* Sheet */}
      <div className="relative w-full bg-[#1c1d22] rounded-t-3xl px-4 pt-4 pb-8 z-10">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <h2 className="text-[22px] font-extrabold text-white mt-2">
          Manage your payment methods
        </h2>

        <div className="flex items-start gap-4 mt-6">
          {/* + Add tile — wide dashed-border card with a centered
              solid circle+plus icon */}
          <button
            type="button"
            onClick={handleAddMethod}
            className="flex flex-col items-center gap-2.5"
          >
            <div className="w-[108px] h-[70px] rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-[#4a4a52] flex items-center justify-center">
                <Plus size={22} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-[14px] font-semibold text-white">+ Add</span>
          </button>

          {/* Apple Pay tile — wide card, purple border when selected,
              white Apple Pay badge centered, purple checkmark overlapping
              the bottom-right corner. */}
          <button
            type="button"
            onClick={() => handleSelect("apple-pay")}
            className="flex flex-col items-center gap-2.5 relative"
          >
            <div
              className={`w-[108px] h-[70px] rounded-2xl border-2 flex items-center justify-center ${
                selected === "apple-pay" ? "border-[#7c6bff]" : "border-white/10"
              }`}
            >
              <ApplePayBadge />
            </div>
            {selected === "apple-pay" && (
              <span className="absolute top-[46px] right-[-6px] w-6 h-6 rounded-full bg-[#7c6bff] border-2 border-[#1c1d22] flex items-center justify-center">
                <Check size={13} className="text-white" strokeWidth={3.5} />
              </span>
            )}
            <span className="text-[14px] font-semibold text-white">Apple Pay</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}


/**
 * Small white rounded-rect card badge with an Apple glyph + "Pay"
 * wordmark, matching the reference's tile artwork. The apple shape is
 * a plain inline SVG silhouette (not Apple's real trademarked logo
 * file) — close enough visually to read correctly at this size
 * without using any protected brand asset.
 */
function ApplePayBadge() {
  return (
    <div className="w-[72px] h-[38px] rounded-lg bg-white flex items-center justify-center gap-1">
      <svg width="15" height="17" viewBox="0 0 15 17" fill="black">
        <path d="M10.6 2.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
        <path d="M13.3 6.3c-1.3-.1-2.4.8-3 .8-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.1 1.9-1.3 2.3-.3 5.7 1 7.6.6.9 1.3 1.9 2.3 1.9.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.9.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.8 0-1.8 1.4-2.6 1.5-2.6-.8-1.2-2.1-1.3-2.3-1.1z" />
      </svg>
      <span className="text-[15px] font-bold text-black leading-none tracking-tight">
        Pay
      </span>
    </div>
  );
}

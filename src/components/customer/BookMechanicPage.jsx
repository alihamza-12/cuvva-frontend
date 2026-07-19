import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, ExternalLink } from "lucide-react";
import mechanic from "/mechanic.png";
import mechanicicon from "/mechanicicon.png";

/**
 * frontend/src/components/customer/BookMechanicPage.jsx
 *
 * "Book a mechanic" hand-off screen — opened from the Get help row's
 * "Book a mechanic" action on PolicyDetailPage.jsx. Matches the
 * reference screenshot exactly: a gradient hero image (mechanic photo
 * + MOT / Repairs / Servicing floating badges, connected by dotted
 * lines) that curves into a black content section below, listing the
 * ClickMechanic value props, a "Provided by ClickMechanic" credit, and
 * a sticky "Continue to ClickMechanic" button.
 *
 * IMPORTANT — the curved bottom edge is NOT baked into mechanic.png
 * (confirmed by inspecting the raw file: its bottom edge is still flat
 * gradient colour, not black). The wavy cut is created here in CSS via
 * an elliptical `border-radius` on the wrapping div (bigger radius on
 * the corners than the center dip), which is the same technique the
 * reference screenshot's curve was pixel-traced from. This scales
 * correctly at any screen width, unlike a hand-drawn SVG mask sized to
 * one fixed viewport.
 *
 * This is purely a static informational/hand-off screen — Cuvva
 * doesn't run its own mechanic booking flow, it hands off to a real
 * third-party partner (ClickMechanic). "Continue to ClickMechanic"
 * opens ClickMechanic's real public site (https://www.clickmechanic.com/)
 * in a new browser tab — there's no backend endpoint in
 * policies.js/vehicles.js for this, so it's a plain outbound link, not
 * a real partner referral/API integration (no tracking params, no
 * pre-filled vehicle/policy data passed across). Flagging clearly so
 * it's not mistaken for a deeper integration than it is.
 *
 * Implemented as a real <a target="_blank" rel="noopener noreferrer">
 * rather than a window.open() call in a JS handler — anchor-tag
 * navigation is treated as a normal user-initiated link by mobile
 * browsers (iOS Safari in particular), so it reliably opens a new tab
 * both on desktop and on phone; script-triggered window.open() can get
 * silently blocked as a popup on some mobile browsers/webviews.
 */
export default function BookMechanicPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/customer/policies", { replace: true });
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">
      {/* Hero — pre-composed gradient image asset, clipped into the
          reference's wavy bottom edge via border-radius (see comment
          above), back button overlaid on top. */}
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: "0 0 50% 50% / 0 0 12% 12%" }}
      >
        <img
          src={mechanic}
          alt="Mechanic offering MOT, repairs and servicing"
          className="object-cover w-full h-auto pointer-events-none select-none block"
          draggable={false}
        />
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="absolute z-10 flex items-center justify-center w-10 h-10 border rounded-full pointer-events-auto top-4 left-4 bg-black/25 backdrop-blur-sm border-white/20"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Car repair and servicing made easy
        </h1>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-3">
          There's no need to go to the garage anymore. Get a local mechanic to
          come to you.
        </p>

        <ul className="mt-6 space-y-4">
          {[
            "Next-day bookings",
            "Up to 50% cheaper than franchise dealers",
            "Fixed price quotes (no hidden estimates)",
            "Fully vetted and qualified mechanics",
            "1 year parts and repairs warranty",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check size={18} className="text-[#7c6bff] shrink-0 mt-0.5" />
              <span className="text-[15px] text-[#d1d2d8]">{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center mt-10">
          <p className="text-[13px] text-[#6f7178]">Provided by</p>
          <div className="flex items-center gap-2 mt-1.5">
            <img
              src={mechanicicon}
              alt=""
              className="w-6 h-6 object-contain select-none pointer-events-none"
              draggable={false}
            />
            <p className="text-[18px] font-extrabold text-white">
              ClickMechanic
            </p>
          </div>
        </div>
      </div>

      {/* Sticky footer — real outbound link, opens in a new tab. Using
          an <a> tag (not window.open in a click handler) so mobile
          browsers treat it as a genuine user-initiated navigation and
          don't block it as a popup. */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-8 bg-black">
        <a
          href="https://www.clickmechanic.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white flex items-center justify-center gap-2"
        >
          Continue to ClickMechanic
          <ExternalLink size={16} className="text-white" />
        </a>
      </div>
    </div>
  );
}

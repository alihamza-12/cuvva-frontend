import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import claimcar from "/claimcar.png";

/**
 * frontend/src/pages/customer/MakeAClaimPage.jsx
 *
 * "Make a claim" info screen — opened from the Make a claim quick-action
 * / Get help row on PolicyDetailPage.jsx. Matches the reference
 * screenshot: back arrow + help icon header, damaged-car illustration,
 * bold "Make a claim" title, two informational paragraphs, a "How
 * claims work" link, and a sticky "Continue" button.
 *
 * Illustration: now a real background-removed PNG (claimcar.png, placed
 * in frontend/public/) instead of the hand-drawn inline SVG — swap
 * requested to use the actual downloaded image asset.
 *
 * This page is purely informational/static — no policy-specific data
 * is required to render it (matches the reference, which shows the
 * same generic copy regardless of which policy you came from).
 *
 * "Continue" and "How claims work" currently just log to console —
 * no backend claims-submission endpoint exists yet (nothing in
 * policies.js handles claims). Wire these once that flow exists;
 * flagging so it's not silently mistaken for a working submission.
 */
export default function MakeAClaimPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const policy = location.state?.policy;

  const handleContinue = () => {
    // Placeholder — no backend claims endpoint exists yet.
    console.log(
      "Continue tapped on Make a claim — not wired up yet.",
      policy?._id,
    );
  };

  const handleHowClaimsWork = () => {
    console.log("How claims work tapped — not wired up yet.");
  };

  // navigate(-1) only works if this page was reached via an in-app SPA
  // navigation (i.e. there's a history entry to pop). If the page was
  // opened directly/refreshed (location.key === "default"), there's no
  // SPA history to go back to and navigate(-1) silently no-ops — so we
  // fall back to a known-good route instead.
  const handleBack = () => {
    if (location.key === "default") {
      navigate("/customer/policies", { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-8 -mt-10 text-center">
        <img
          src={claimcar}
          alt="Damaged car"
          className="w-[220px] h-auto object-contain"
        />

        <h1 className="text-[24px] font-extrabold text-white mt-6">
          Make a claim
        </h1>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-4 max-w-[320px]">
          If you've had an accident or your vehicle has been damaged or stolen,
          you need to tell us as soon as you can, even if it wasn't your fault.
        </p>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-4 max-w-[320px]">
          You should always report an incident, whether you plan to make a claim
          or not.
        </p>

        <button
          type="button"
          onClick={handleHowClaimsWork}
          className="mt-6 text-[15px] font-bold text-[#7c6bff]"
        >
          How claims work
        </button>
      </div>

      {/* Sticky footer */}
      <div className="px-4 pt-3 pb-8">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

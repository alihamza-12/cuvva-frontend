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
 *
 * DEBUG NOTE: back button was found to receive zero click events
 * (nothing logs on click) — this means something else is intercepting
 * the click, not a logic bug. Removed the `-mt-10` negative margin on
 * the content block below (which was pulling the illustration/content
 * up and could overlap the header depending on image height) and
 * pinned the header with `relative z-20` + `pointer-events-auto` as a
 * belt-and-braces fix. If the button still doesn't respond after this,
 * the cause is external to this file (see chat for the console
 * diagnostic to run: document.elementFromPoint on the button's rect).
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
    const url =
      "https://support.cuvva.com/en/articles/89942-reporting-an-accident-theft-or-damage-to-your-vehicle-what-to-do-and-how-to-make-a-claim";

    // If running inside your mobile app wrapper
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "OPEN_SYSTEM_BROWSER", url }),
      );
    } else {
      // Standard web browser fallback
      window.location.href = url;
    }
  };

  const handleBack = () => {
    console.log("Back Button");
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/customer/policies", { replace: true });
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">
      {/* Header — relative + z-20 so nothing below can ever cover it */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="relative z-20 flex items-center justify-center w-10 h-10 border rounded-full pointer-events-auto bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="relative z-20 flex items-center justify-center w-10 h-10 border rounded-full pointer-events-auto bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      {/* Content — removed the -mt-10 negative margin that was pulling
          this block up (and could overlap the header row above it
          depending on the illustration's rendered height) */}
      <div className="flex flex-col items-center justify-center flex-1 px-8 mt-4 text-center">
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

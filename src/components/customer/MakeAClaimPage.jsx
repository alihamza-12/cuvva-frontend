import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import claimcar from "/claimcar.png";

export default function MakeAClaimPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const policy = location.state?.policy;

  const handleContinue = () => {

    console.log(
      "Continue tapped on Make a claim — not wired up yet.",
      policy?._id,
    );
  };

  const handleHowClaimsWork = () => {
    console.log("How claims work tapped — not wired up yet.");
    const url =
      "https://support.cuvva.com/en/articles/89942-reporting-an-accident-theft-or-damage-to-your-vehicle-what-to-do-and-how-to-make-a-claim";

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "OPEN_SYSTEM_BROWSER", url }),
      );
    } else {

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
    <div className="flex flex-col text-white">

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
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="relative z-20 flex items-center justify-center w-10 h-10 border rounded-full pointer-events-auto bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

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

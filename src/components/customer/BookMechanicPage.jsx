import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, ExternalLink } from "lucide-react";
import mechanic from "/mechanic.png";
import mechanicicon from "/mechanicicon.png";

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
    <div className="flex flex-col text-white">

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

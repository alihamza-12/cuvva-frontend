import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Lock,
  CarFront,
  ShieldAlert,
  GlassWater,
  Flame,
  CloudRain,
  Hammer,
  HelpCircle,
  X,
  MessageCircleQuestion,
} from "lucide-react";
import {
  getPreviousIncidents,
  getIncidentsDeclarationDone,
  saveIncidentsDeclarationDone,
} from "../../utils/profileLocalStorage";

const TYPE_ICON = {
  Accident: CarFront,
  Theft: ShieldAlert,
  Glass: GlassWater,
  Fire: Flame,
  Weather: CloudRain,
  Vandalism: Hammer,
  Other: HelpCircle,
};

function buildIncidentSummary(incident) {
  const parts = [incident.dateLabel];
  if (incident.type === "Accident") {
    if (incident.faultStatus) {
      const faultLabel =
        incident.faultStatus === "Me"
          ? "At fault"
          : incident.faultStatus === "The other driver"
            ? "Not at fault"
            : "Joint fault";
      parts.push(faultLabel);
    }
    if (incident.injured === "Yes") parts.push("Injuries");
  }
  if (incident.type === "Theft" && incident.stolenItem) {
    parts.push(incident.stolenItem);
  }
  return parts.join(" · ");
}

export default function PreviousIncidentsPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [showDeclareSheet, setShowDeclareSheet] = useState(false);
  const [showWhatCounts, setShowWhatCounts] = useState(false);

  useEffect(() => {
    setIncidents(getPreviousIncidents());
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleWhatCounts = () => {
    setShowWhatCounts(true);
  };

  const handleContactUs = () => {
    navigate("/customer/support");
  };

  const handleAddIncident = () => {
    setShowDeclareSheet(false);
    navigate("/customer/profile/account/incidents/add");
  };

  const handleMainButtonTap = () => {
    if (incidents.length > 0) {

      saveIncidentsDeclarationDone(true);
      navigate("/customer/profile/account", { replace: true });
      return;
    }

    setShowDeclareSheet(true);
  };

  const handleDeclaredAllIncidents = () => {
    saveIncidentsDeclarationDone(true);
    setShowDeclareSheet(false);
    navigate("/customer/profile/account", { replace: true });
  };

  return (
    <div className="flex flex-col text-white">

      <div className="flex items-center px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 pb-40">
        <h1 className="text-[22px] font-extrabold text-white leading-tight">
          Add any incidents you've been involved in over the last 3 years
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-3">
          You need to declare any previous incidents even if you weren't at
          fault or a claim was never made. This includes car accidents, theft
          and vehicle damage. Find out{" "}
          <button
            type="button"
            onClick={handleWhatCounts}
            className="font-semibold text-[#7c6bff]"
          >
            what counts as an incident.
          </button>
        </p>

        <button
          type="button"
          onClick={() => navigate("/customer/profile/account/incidents/add")}
          className="w-full flex items-center gap-2 mt-5 py-4 px-5 rounded-full bg-[#17181c] border border-white/5"
        >
          <span className="text-[20px] font-bold text-[#7c6bff] leading-none">
            +
          </span>
          <span className="text-[15px] font-semibold text-[#7c6bff]">
            Add an incident
          </span>
        </button>

        {incidents.length > 0 && (
          <>
            <div className="mt-3 rounded-2xl bg-[#17181c] overflow-hidden">
              {incidents.map((incident, i) => {
                const Icon = TYPE_ICON[incident.type] || HelpCircle;
                return (
                  <div
                    key={incident.id}
                    className={`w-full flex items-center gap-3 px-4 py-4 ${
                      i !== incidents.length - 1
                        ? "border-b border-white/5"
                        : ""
                    }`}
                  >
                    <Icon size={22} className="text-[#7c6bff] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-white">
                        {incident.type}
                      </p>
                      <p className="text-[13px] text-[#9497a1] mt-0.5">
                        {buildIncidentSummary(incident)}
                      </p>
                    </div>
                    <Lock size={16} className="text-[#5c5e68] shrink-0" />
                  </div>
                );
              })}
            </div>
            <p className="text-[14px] text-[#9497a1] mt-4">
              To edit your existing incident details,{" "}
              <button
                type="button"
                onClick={handleContactUs}
                className="font-semibold text-[#7c6bff]"
              >
                contact us.
              </button>
            </p>
          </>
        )}
      </div>

      <div className="fixed z-40 bottom-24 left-4 right-4">
        <button
          type="button"
          onClick={handleMainButtonTap}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          {incidents.length > 0 ? "Done" : "No incidents to declare"}
        </button>
      </div>

      {showDeclareSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowDeclareSheet(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative w-full bg-[#17181c] rounded-t-3xl px-5 pt-3 pb-8 z-10">
            <div className="flex justify-center pb-3">
              <div className="h-1 rounded-full w-9 bg-white/20" />
            </div>
            <h2 className="text-[22px] font-extrabold text-white">
              Confirm you've declared:
            </h2>

            <ul className="mt-4 space-y-3">
              {[
                "All incidents where you were either at fault, joint-fault, or not at fault",
                "All incidents where you were a passenger",
                "Fire, theft or vandalism incidents",
                "Glass or windscreen damage",
                "All reported incidents, even if you didn't make a claim",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[16px] text-white shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-[15px] text-white leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-[14px] text-[#9497a1] leading-relaxed mt-4">
              If you've been involved in or reported an incident in the last 3
              years, you need to declare it now.
            </p>

            <button
              type="button"
              onClick={handleDeclaredAllIncidents}
              className="w-full mt-6 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
            >
              I've declared all incidents
            </button>
            <button
              type="button"
              onClick={handleAddIncident}
              className="w-full mt-3 py-4 bg-[#242429] hover:bg-[#2c2c33] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
            >
              Add an incident
            </button>
          </div>
        </div>
      )}

      {/* "What counts as an incident" — a FULL-SCREEN page (matches
          your reference: solid black from the very top, its own
          header with X-close + help-bubble icon), not a bottom sheet
          like the two above. Rendered as an overlay on top of this
          page (fixed inset-0) rather than a real route, so no router
          changes were needed — closing it (X or "OK") just hides it
          again and you're back on this same page underneath. */}
      {showWhatCounts && (
        <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col">
          <div className="flex items-center justify-between px-4 pt-4">
            <button
              type="button"
              onClick={() => setShowWhatCounts(false)}
              aria-label="Close"
              className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
            >
              <X size={20} className="text-white" />
            </button>
            <button
              type="button"
              onClick={handleContactUs}
              aria-label="Help"
              className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
            >
              <MessageCircleQuestion size={20} className="text-white" />
            </button>
          </div>

          <div className="flex-1 px-4 pt-4 overflow-y-auto pb-28">
            <h1 className="text-[22px] font-extrabold text-white leading-tight">
              What counts as an incident
            </h1>
            <p className="text-[15px] text-[#9497a1] leading-relaxed mt-3">
              Here are all the scenarios that would need to be declared:
            </p>

            <ul className="mt-4 space-y-3.5">
              {[
                "You were the driver",
                "You were a passenger",
                "You were a policyholder",
                "There's an ongoing claim",
                "Non-fault incident",
                "No claim was made, but it was reported",
                "Glass or windscreen damage",
                "Fire or theft to vehicle",
                "Vandalism to the vehicle",
                "At fault or joint-fault",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[16px] text-white shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-[15px] text-white leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="fixed left-4 right-4 z-[61]"
            style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              onClick={() => setShowWhatCounts(false)}
              className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

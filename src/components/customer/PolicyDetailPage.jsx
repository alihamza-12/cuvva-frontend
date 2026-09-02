import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMyPolicyById } from "../../app/api/policyApi";
import { computePolicyStatus } from "../../utils/policyStatus";
import {
  X,
  FileText,
  Ticket,
  ShieldAlert,
  Timer,
  Copy,
  ChevronRight,
  Wrench,
  MessageCircle,
  HelpCircle,
  MapPin,
} from "lucide-react";

export default function PolicyDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { policyId } = useParams();
  const initialPolicy = location.state?.policy || null;
  const [policy, setPolicy] = useState(initialPolicy);
  const [loading, setLoading] = useState(Boolean(policyId && !initialPolicy));
  // Ticks every second so the pill flips exactly on the UK start/end instant.
  const [nowTick, setNowTick] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!policyId || policy?._id === policyId) return undefined;
    let mounted = true;

    getMyPolicyById(policyId)
      .then((response) => {
        if (mounted) setPolicy(response.data?.policy || response.data || null);
      })
      .catch(() => {
        if (mounted) setPolicy(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [policyId, policy?._id]);

  if (loading || !policy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center text-white bg-black">
        <p className="text-[15px] text-[#9497a1]">
          {loading
            ? "Loading policy details…"
            : "We couldn't load this policy's details. Please go back and try again."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-[#7c6bff] rounded-full text-[14px] font-bold text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  const vehicle = policy?.vehicleId;
  const customer = policy?.customerId;

  const registration = vehicle?.registration || "";
  const ownerFirstName = customer?.fullName?.trim()?.split(/\s+/)?.[0] || "";
  const ownerLabel =
    ownerFirstName && vehicle?.make
      ? `${ownerFirstName}'s ${vehicle.make} ${vehicle.model || ""}`.trim()
      : `${vehicle?.make || ""} ${vehicle?.model || ""}`.trim() || "Vehicle";

  const dynamicStatus = computePolicyStatus(policy, nowTick) || "Upcoming";

  const showBadge = dynamicStatus === "Active" || dynamicStatus === "Upcoming";

  const statusStyles = {
    Upcoming: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    Active: "bg-green-500/10 text-green-400 border-green-500/30",
    Expired: "bg-red-500/10 text-red-400 border-red-500/30",
    Cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };

  const coverLabel =
    policy?.coverageType === "Comprehensive"
      ? "Fully comprehensive"
      : policy?.coverageType === "Third Party Only"
        ? "Third party only"
        : policy?.coverageType || "—";

  const totalCostLabel =
    typeof policy?.premiumAmount === "number" || policy?.premiumAmount
      ? `£${Number(policy.premiumAmount).toFixed(2)}`
      : "—";

  const handleCopyPolicyNumber = () => {
    if (policy?.policyNumber) {
      navigator.clipboard?.writeText(policy.policyNumber).catch(() => {});
    }
  };

  const handlePolicyDocs = () => {
    navigate(`/customer/policies/${policy._id}/documents`);
  };

  const handleBuyAgain = () => {
    if (!vehicle) return;
    navigate(`/customer/policies/new?vehicleId=${vehicle._id}`, {
      state: { prefillVehicle: vehicle },
    });
  };

  const handleReceipt = () => {
    navigate("/customer/policies/receipt", { state: { policy } });
  };

  const handleMakeAClaim = () => {
    navigate("/customer/policies/claim", { state: { policy } });
  };

  const handleBookAMechanic = () => {
    navigate("/customer/policies/mechanic");
  };

  return (
    <div className="text-white">

      <div className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-black/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      <div className="pb-28">
        <div className="flex flex-col items-center px-4 -mt-2">
          <h1 className="text-[22px] font-extrabold text-[#c8c9d1]">
            {ownerLabel}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[14px] text-[#9497a1] tracking-wide">
              {registration}
            </p>
          
            {showBadge && (
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${statusStyles[dynamicStatus] || statusStyles.Upcoming}`}
              >
                {dynamicStatus}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start justify-center gap-10 px-4 mt-6">
          <QuickAction
            icon={FileText}
            label="Policy docs"
            onClick={handlePolicyDocs}
          />
          <QuickAction icon={Ticket} label="Receipt" onClick={handleReceipt} />
          <QuickAction
            icon={ShieldAlert}
            label="Make a claim"
            onClick={handleMakeAClaim}
          />
        </div>

        <div className="mx-4 mt-6 rounded-2xl bg-[#17181c] px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#9497a1]">Start</p>
            <p className="text-[19px] font-extrabold text-white mt-0.5">
              {policy.startTime}
            </p>
            <p className="text-[12px] text-[#9497a1] mt-0.5">
              {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(policy.startDate))}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-2">
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1 text-[12px] text-[#9497a1]">
              <Timer size={13} className="text-[#9497a1]" />
              <span>{(() => { const [sh, sm] = String(policy.startTime).split(":").map(Number); const [eh, em] = String(policy.endTime).split(":").map(Number); return `${eh * 60 + em - (sh * 60 + sm)}m`; })()}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
          </div>

          <div className="text-right">
            <p className="text-[12px] text-[#9497a1]">End</p>
            <p className="text-[19px] font-extrabold text-white mt-0.5">
              {policy.endTime}
            </p>
            <p className="text-[12px] text-[#9497a1] mt-0.5">
              {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(policy.endDate))}
            </p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[16px] font-bold text-white">Policy summary</h2>
          </div>

          <SummaryRow label="Main driver" value={customer?.fullName || "—"} />
          <SummaryRow
            label="Policy number"
            value={
              <span className="flex items-center gap-2">
                {policy?.policyNumber || "—"}
                <button
                  type="button"
                  onClick={handleCopyPolicyNumber}
                  aria-label="Copy policy number"
                >
                  <Copy size={14} className="text-[#9497a1]" />
                </button>
              </span>
            }
          />
          <SummaryRow label="Cover" value={coverLabel} />
          <SummaryRow label="Breakdown cover" value="No" isLast />

          <button
            type="button"
            onClick={handlePolicyDocs}
            className="w-full flex items-center gap-3 px-4 py-4 border-t border-white/5 hover:bg-white/[0.03] transition-colors"
          >
            <FileText size={17} className="text-[#c8c9d1] shrink-0" />
            <span className="flex-1 text-left text-[14px] text-white">
              Policy documents
            </span>
            <ChevronRight size={17} className="text-[#5c5e68] shrink-0" />
          </button>
        </div>

        <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-[16px] font-bold text-white">Start location</h2>
          </div>

          <div className="mx-4 rounded-xl overflow-hidden relative h-[130px] bg-[#20342b]">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="absolute top-2 left-2 flex items-center gap-1 text-[11px] font-semibold text-[#7fdba0]">
              <MapPin size={12} /> Park nearby
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#7c6bff] flex items-center justify-center ring-4 ring-[#7c6bff]/25">
                <MapPin size={16} className="text-white" fill="white" />
              </div>
            </div>
          </div>

          <div className="px-4 pt-3 pb-4">
            <p className="text-[14px] font-semibold text-white">Address</p>
            <p className="text-[13px] text-[#9497a1] mt-0.5">
              {policy?.location?.address || "Address not available"}
            </p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[16px] font-bold text-white">
              Payment information
            </h2>
          </div>

          <SummaryRow label="Total cost" value={totalCostLabel} isLast />

          <button
            type="button"
            onClick={handleReceipt}
            className="w-full flex items-center gap-3 px-4 py-4 border-t border-white/5 hover:bg-white/[0.03] transition-colors"
          >
            <Ticket size={17} className="text-[#c8c9d1] shrink-0" />
            <span className="flex-1 text-left text-[14px] text-white">
              Receipt
            </span>
            <ChevronRight size={17} className="text-[#5c5e68] shrink-0" />
          </button>
        </div>

        <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[16px] font-bold text-white">Get help</h2>
          </div>

          <HelpRow
            icon={ShieldAlert}
            label="Make a claim"
            onClick={handleMakeAClaim}
          />
          <HelpRow
            icon={Wrench}
            label="Book a mechanic"
            onClick={handleBookAMechanic}
          />
          <HelpRow
            icon={MessageCircle}
            label="Chat to us"
            onClick={() => navigate("/customer/support")}
          />
          <HelpRow
            icon={HelpCircle}
            label="Visit the help centre"
            onClick={() => navigate("/customer/support")}
            isLast
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4 bg-black border-t border-white/5">
        <button
          type="button"
          onClick={handleBuyAgain}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
        >
          Buy again
        </button>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-[76px]"
    >
      <div className="flex items-center justify-center border rounded-full w-14 h-14 bg-white/5 border-white/10">
        <Icon size={20} className="text-[#7c6bff]" />
      </div>
      <span className="text-[12px] text-[#9497a1] text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

function SummaryRow({ label, value, isLast }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <span className="text-[14px] text-[#9497a1]">{label}</span>
      <span className="text-[14px] font-semibold text-white">{value}</span>
    </div>
  );
}

function HelpRow({ icon: Icon, label, onClick, isLast }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <Icon size={17} className="text-[#c8c9d1] shrink-0" />
      <span className="flex-1 text-left text-[14px] text-white">{label}</span>
      <ChevronRight size={17} className="text-[#5c5e68] shrink-0" />
    </button>
  );
}

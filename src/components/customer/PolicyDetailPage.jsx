import { useLocation, useNavigate } from "react-router-dom";
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

/**
 * frontend/src/pages/customer/PolicyDetailPage.jsx
 *
 * Full policy detail screen — opened by tapping a "Past" policy card on
 * PoliciesPage.jsx. Matches the reference screenshots exactly: header
 * (X / vehicle name / plate), 3 quick-action icons (Policy docs /
 * Receipt / Make a claim), Start-End time card with duration, Policy
 * summary card, Start location card, Payment information card, Get
 * help card, and a sticky "Buy again" button.
 *
 * DATA SOURCE: the full policy object is passed via router state from
 * PoliciesPage.jsx (it's already fetched there via GET /api/policies/my
 * — no new network call needed). If this page is opened directly
 * without that state (e.g. a hard refresh), it shows a graceful
 * "not found" fallback rather than crashing, since your backend's
 * single-policy lookup (GET /api/policies/:id) is Super-Admin-only per
 * policies.js and can't be called by a Customer directly. If you want
 * this page to survive a refresh, a new customer-scoped endpoint like
 * GET /api/policies/my/:id would need to be added — flag it if you
 * want that built.
 *
 * FIELDS NOT IN YOUR CURRENT SCHEMA (rendered as clearly-labeled
 * placeholders, NOT fabricated real data):
 *   - "Breakdown cover" — no such field on Policy.js; hardcoded "No".
 *   - "Start location" / address / map — no location/geo field exists
 *     anywhere in Policy, Vehicle, or User schemas. The map is a
 *     static illustrative placeholder, not a real maps integration.
 *   - Receipt and Make a claim navigate to their real pages.
 *     Book a mechanic navigates to BookMechanicPage.jsx (a static
 *     Cuvva -> ClickMechanic hand-off screen — no real backend
 *     endpoint or partner integration exists yet).
 *   - Chat to us, Visit the help centre — no backend endpoints exist
 *     for these yet; buttons are inert placeholders (logged to
 *     console) until you build them out.
 */
export default function PolicyDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const policy = location.state?.policy;

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center text-white bg-black">
        <p className="text-[15px] text-[#9497a1]">
          We couldn't load this policy's details. Please go back and try again.
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

  const combineDateAndTime = (dateValue, timeValue) => {
    if (!dateValue) return null;
    const datePart = new Date(dateValue);
    if (Number.isNaN(datePart.getTime())) return null;
    const combined = new Date(datePart);
    if (timeValue && /^\d{1,2}:\d{2}$/.test(timeValue)) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      combined.setUTCHours(hours, minutes, 0, 0);
    }
    return combined;
  };

  const start = combineDateAndTime(policy?.startDate, policy?.startTime);
  let end = combineDateAndTime(policy?.endDate, policy?.endTime);
  if (start && end && end <= start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  const formatTime = (d) =>
    d
      ? d.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "--";

  const formatDayDate = (d) =>
    d
      ? d.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  const durationLabel = (() => {
    if (!start || !end) return "";
    const totalMinutes = Math.round((end - start) / (1000 * 60));
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.round(totalMinutes / 60);
    return `${hours}h`;
  })();

  const coverLabel =
    policy?.coverageType === "Comprehensive"
      ? "Fully comprehensive"
      : policy?.coverageType === "Third Party Only"
        ? "Third party only"
        : policy?.coverageType || "—";

  const totalCostLabel =
    typeof policy?.premiumAmount === "number"
      ? `£${(policy.premiumAmount / 100).toFixed(2)}`
      : "—";

  const handleCopyPolicyNumber = () => {
    if (policy?.policyNumber) {
      navigator.clipboard?.writeText(policy.policyNumber).catch(() => {});
    }
  };

  const handlePolicyDocs = () => {
    navigate("/customer/policies/documents");
  };

  const handleBuyAgain = () => {
    if (!vehicle) return;
    navigate(`/customer/policies/new?vehicleId=${vehicle._id}`, {
      state: { prefillVehicle: vehicle },
    });
  };

  const handleNotWiredUp = (label) => {
    // Placeholder — no backend endpoint exists yet for this action.
    console.log(`${label} tapped — not wired up yet.`);
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
    <div className="min-h-screen text-white bg-black">
      {/* Header */}
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

      {/* Scrollable content — pb-28 reserves space so the fixed footer
          below never overlaps the last card, regardless of how short
          or tall the content is. */}
      <div className="pb-28">
        <div className="px-4 -mt-2 text-center">
          <h1 className="text-[22px] font-extrabold text-[#c8c9d1]">
            {ownerLabel}
          </h1>
          <p className="text-[14px] text-[#9497a1] mt-1 tracking-wide">
            {registration}
          </p>
        </div>

        {/* Quick actions */}
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

        {/* Start / End card */}
        <div className="mx-4 mt-6 rounded-2xl bg-[#17181c] px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#9497a1]">Start</p>
            <p className="text-[19px] font-extrabold text-white mt-0.5">
              {formatTime(start)}
            </p>
            <p className="text-[12px] text-[#9497a1] mt-0.5">
              {formatDayDate(start)}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-2">
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1 text-[12px] text-[#9497a1]">
              <Timer size={13} className="text-[#9497a1]" />
              <span>{durationLabel}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
          </div>

          <div className="text-right">
            <p className="text-[12px] text-[#9497a1]">End</p>
            <p className="text-[19px] font-extrabold text-white mt-0.5">
              {formatTime(end)}
            </p>
            <p className="text-[12px] text-[#9497a1] mt-0.5">
              {formatDayDate(end)}
            </p>
          </div>
        </div>

        {/* Policy summary */}
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

        {/* Start location */}
        <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-[16px] font-bold text-white">Start location</h2>
          </div>

          {/* Static illustrative map placeholder — NOT a real maps
              integration, since no location/geo data exists on the
              Policy/Vehicle/User schemas yet. */}
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

        {/* Payment information */}
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

        {/* Get help */}
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
            onClick={() => handleNotWiredUp("Chat to us")}
          />
          <HelpRow
            icon={HelpCircle}
            label="Visit the help centre"
            onClick={() => handleNotWiredUp("Help centre")}
            isLast
          />
        </div>
      </div>

      {/* Fixed footer — position: fixed (not part of the flex/flow
          layout), so it always pins to the bottom of the viewport
          regardless of how much content is above it. This is what
          fixes the large empty gap: previously this footer was inside
          a `flex-1` scroll container, which stretched to fill the
          screen on short content and pushed the footer down with a
          big gap before it. */}
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

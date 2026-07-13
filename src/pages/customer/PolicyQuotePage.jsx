import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  X,
  MoreHorizontal,
  ChevronRight,
  User as UserIcon,
  Info,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import CarBrandIcon from "../../components/customer/CarBrandIcon";
import DurationPickerSheet from "../../components/customer/DurationPickerSheet";
import StartTimePickerSheet from "../../components/customer/StartTimePickerSheet";
import StatementsConfirmationModal from "../../components/customer/StatementsConfirmationModal";
import {
  calculatePremium,
  calculateExtensionCost,
} from "../../utils/calculatePremium";

/**
 * frontend/src/pages/customer/PolicyQuotePage.jsx
 *
 * SINGLE combined screen — this replaces the earlier two-route split
 * (PolicySetupPage.jsx + QuoteReviewPage.jsx). Both screenshots you sent
 * are actually one continuously scrollable page:
 *
 *   [header] -> [vehicle icon/name] -> [Start/Duration rows]
 *   -> [breakdown cover note] -> [benefit checklist]
 *   -> [policy documents] -> [extend-cover upsell]
 *   -> [sticky price + Continue footer]
 *
 * The Duration row still opens DurationPickerSheet.jsx as a bottom-sheet
 * overlay on TOP of this page (not a page navigation) — exactly like
 * your third screenshot showed the sheet appearing over the dimmed page.
 *
 * Route: /customer/policies/new?vehicleId=...
 *
 * IMPORTANT DATA NOTE: your backend (vehicles.js) only exposes vehicle
 * lookup by REGISTRATION (`GET /api/vehicles/lookup/:registration`),
 * there is no `GET /api/vehicles/:id` route. So this page relies on the
 * vehicle object being passed via `navigate(..., { state: { prefillVehicle } })`
 * from PlateSearchBar.jsx / RecentlyViewedSection.jsx / BuyAgainSection.jsx.
 * If someone opens this URL directly (e.g. a refresh or shared link) and
 * `location.state` is empty, there's currently no way to re-fetch the
 * vehicle by the `vehicleId` query param alone — flag this to me if you
 * want a workaround (e.g. also storing the last-looked-up vehicle in
 * localStorage keyed by id, purely client-side, no backend change).
 */
export default function PolicyQuotePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const vehicle = location.state?.prefillVehicle || {
    make: "Vehicle",
    model: "",
    registration: searchParams.get("plate") || "",
  };

  const [durationHours, setDurationHours] = useState(1);
  const [isDurationSheetOpen, setDurationSheetOpen] = useState(false);
  const coverageType = "Comprehensive";

  // --- Start time state ---
  const [startMode, setStartMode] = useState("immediate"); // "immediate" | "scheduled"
  const [scheduledStartDate, setScheduledStartDate] = useState(null);
  const [isStartSheetOpen, setStartSheetOpen] = useState(false);

  // --- Statements confirmation modal (shown on "Continue") ---
  const [isStatementsModalOpen, setStatementsModalOpen] = useState(false);

  const quote = useMemo(
    () => calculatePremium({ durationHours, vehicle, coverageType }),
    [durationHours, vehicle],
  );

  const endsAtLabel = useMemo(() => {
    const end = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    const isToday = end.toDateString() === new Date().toDateString();
    const time = end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return isToday
      ? `Ends today, ${time}`
      : `Ends ${end.toLocaleDateString()}, ${time}`;
  }, [durationHours]);

  const durationLabel =
    durationHours === 1 ? "1 hour" : `${durationHours} hours`;

  // "Get X hours instead for an extra £Y" upsell — steps to the next
  // duration tier up from whatever is currently selected.
  const DURATION_TIERS = [1, 2, 3, 6, 24];
  const nextTier = DURATION_TIERS.find((h) => h > durationHours);
  const extensionCost = nextTier
    ? calculateExtensionCost(
        { durationHours, vehicle, coverageType },
        nextTier - durationHours,
      )
    : null;

  const handleConfirmDuration = (hours) => {
    setDurationHours(hours);
    setDurationSheetOpen(false);
  };

  const handleConfirmStart = (result) => {
    if (result.mode === "immediate") {
      setStartMode("immediate");
      setScheduledStartDate(null);
    } else {
      setStartMode("scheduled");
      setScheduledStartDate(result.date);
    }
    setStartSheetOpen(false);
  };

  const startMainLabel =
    startMode === "immediate"
      ? "Immediately"
      : scheduledStartDate
        ? scheduledStartDate.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
        : "Choose time";

  const startSubLabel =
    startMode === "immediate"
      ? "Starts at time of payment"
      : scheduledStartDate
        ? `Starts at ${scheduledStartDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`
        : "";

  // "Continue" now opens the statements confirmation modal instead of
  // navigating straight to checkout. What happens on Yes/No is wired
  // up separately below (currently: Yes proceeds to checkout, No just
  // closes the modal) — update these once you decide the exact behavior.
  const handleContinue = () => {
    setStatementsModalOpen(true);
  };

  const handleStatementsConfirm = () => {
    setStatementsModalOpen(false);
    // "Yes" now leads into the vehicle condition photo capture flow
    // (front/back/left/right) before checkout, instead of skipping
    // straight to checkout.
    navigate("/customer/policies/photos/front", {
      state: {
        vehicle,
        durationHours,
        coverageType,
        premiumAmount: quote.premiumPence, // pence, matches Policy.premiumAmount
        excess: quote.excess,
      },
    });
  };

  const handleStatementsClose = () => {
    setStatementsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center"
        >
          <X size={16} className="text-white" />
        </button>
        <div className="text-center">
          <div className="text-[15px] font-bold text-white">
            {vehicle.make} {vehicle.model}
          </div>
          <div className="text-[12px] text-[#8b8d98] tracking-wide">
            {vehicle.registration}
          </div>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center"
        >
          <MoreHorizontal size={16} className="text-white" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Vehicle identity block */}
        <div className="flex flex-col items-center pt-1 pb-2">
          <CarBrandIcon make={vehicle.make} size={56} />
          <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17181c] border border-white/5">
            <UserIcon size={13} className="text-[#8b8d98]" />
            <span className="text-[13px] font-semibold text-[#c8c9d1]">
              Your car
            </span>
          </div>
        </div>

        {/* Start / Duration rows */}
        <div className="rounded-2xl bg-[#17181c] overflow-hidden">
          <button
            type="button"
            onClick={() => setStartSheetOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-[14px] text-[#8b8d98]">Start</span>
            <div className="text-right">
              <div className="text-[14px] font-bold text-[#7c6bff]">
                {startMainLabel}
              </div>
              <div className="text-[12px] text-[#7c6bff]/70">
                {startSubLabel}
              </div>
            </div>
            <ChevronRight size={16} className="text-[#5c5e68] ml-2 shrink-0" />
          </button>

          <div className="h-px bg-white/5 mx-4" />

          <button
            type="button"
            onClick={() => setDurationSheetOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-[14px] text-[#8b8d98]">Duration</span>
            <div className="text-right">
              <div className="text-[14px] font-bold text-[#7c6bff]">
                {durationLabel}
              </div>
              <div className="text-[12px] text-[#7c6bff]/70">{endsAtLabel}</div>
            </div>
            <ChevronRight size={16} className="text-[#5c5e68] ml-2 shrink-0" />
          </button>
        </div>

        {/* Breakdown cover note */}
        <div className="bg-[#17181c] rounded-2xl p-4">
          <p className="text-[13px] text-[#b5b6bd] leading-relaxed">
            Get 24/7 roadside assistance and local recovery from Call Assist.
          </p>
          <button
            type="button"
            className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[#7c6bff]"
          >
            <Info size={14} />
            Learn more about breakdown cover
          </button>
        </div>

        {/* Benefit checklist */}
        <div className="bg-[#17181c] rounded-2xl p-4 space-y-5">
          <BenefitRow
            title={`Your excess is £${quote.excess}`}
            body="This is the total you have to pay towards a claim. It usually comes off the claim amount, so you don't have to pay it upfront. We work out your excess based on your quote."
          />
          <BenefitRow
            title={`Your cover is ${coverageType === "Comprehensive" ? "fully comprehensive" : "third party only"}`}
            body="If there's an incident, we'll cover you against loss or damage to your vehicle or caused by your vehicle. We also cover any personal injury claims."
          />
          <BenefitRow
            title="You can extend your cover"
            body="If you need to add more time to your policy, it's quick to extend your cover in the app."
          />
          <BenefitRow
            title="We're available 365 days a year"
            body="Get fast support, 9am to 9pm Monday to Saturday, and 9am to 6pm on Sunday."
          />
        </div>

        {/* Policy documents */}
        <button
          type="button"
          onClick={() =>
            navigate("/customer/policies/documents", { state: { vehicle } })
          }
          className="w-full flex items-center justify-between bg-[#17181c] rounded-2xl px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-[#8b8d98]" />
            <span className="text-[14px] font-semibold text-white">
              Policy documents
            </span>
          </div>
          <ChevronRight size={18} className="text-[#5c5e68]" />
        </button>

        {/* Extend-cover upsell */}
        {nextTier && extensionCost != null && (
          <button
            type="button"
            onClick={() => setDurationHours(nextTier)}
            className="w-full flex items-center justify-between bg-[#2a2270] rounded-2xl px-4 py-3.5"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#a99bff]" />
              <span className="text-[13px] text-[#e6e2ff]">
                Get {nextTier === 1 ? "1 hour" : `${nextTier} hours`} instead
                for an extra{" "}
                <span className="font-bold">£{extensionCost.toFixed(2)}</span>
              </span>
            </div>
            <span className="text-[13px] font-bold text-[#a99bff]">Add</span>
          </button>
        )}
      </div>

      {/* Sticky footer: price + continue */}
      <div className="sticky bottom-0 bg-black border-t border-white/5 px-4 py-4 flex items-center justify-between">
        <div>
          <div className="text-[22px] font-extrabold text-white">
            £{quote.premiumGBP.toFixed(2)}
          </div>
          <button
            type="button"
            className="text-[12px] font-semibold text-[#7c6bff]"
          >
            Pricing breakdown
          </button>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-3.5 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[15px] font-bold text-white"
        >
          Continue
        </button>
      </div>

      <DurationPickerSheet
        open={isDurationSheetOpen}
        vehicle={vehicle}
        coverageType={coverageType}
        initialHours={durationHours}
        onClose={() => setDurationSheetOpen(false)}
        onConfirm={handleConfirmDuration}
      />

      <StartTimePickerSheet
        open={isStartSheetOpen}
        initialMode={startMode}
        initialDate={scheduledStartDate}
        onClose={() => setStartSheetOpen(false)}
        onConfirm={handleConfirmStart}
      />

      <StatementsConfirmationModal
        open={isStatementsModalOpen}
        onClose={handleStatementsClose}
        onConfirm={handleStatementsConfirm}
      />
    </div>
  );
}

function BenefitRow({ title, body }) {
  return (
    <div className="flex gap-3">
      <CheckCircle2
        size={20}
        className="text-white shrink-0 mt-0.5"
        strokeWidth={1.8}
      />
      <div>
        <div className="text-[15px] font-bold text-white">{title}</div>
        <p className="mt-1 text-[13px] text-[#8b8d98] leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}

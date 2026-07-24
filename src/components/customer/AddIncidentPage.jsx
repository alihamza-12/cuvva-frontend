import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, HelpCircle } from "lucide-react";
import InlineWheelField from "./InlineWheelField";
import InlineDateField from "./InlineDateField";
import { addPreviousIncident } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/AddIncidentPage.jsx
 *
 * "Add incident" — opened from PreviousIncidentsPage.jsx's "Add an
 * incident" row (or from the "Add an incident" button inside the
 * declaration confirmation sheet). Matches all of your reference
 * screenshots for this flow:
 *
 *   - "Type of incident" wheel (Accident / Theft / Glass / Fire /
 *     Weather / Vandalism / Other) — expands inline, not an overlay.
 *   - "Date" field — expands inline into a full month calendar grid.
 *   - Type-specific extra fields:
 *       Accident -> "Was anyone injured?" (Yes/No wheel) + "Who was
 *         at fault?" (Me / The other driver / Joint fault or
 *         unresolved wheel) + "Understanding fault status" info sheet
 *         link ("More about fault status.").
 *       Theft -> "What was stolen?" (Vehicle / Contents wheel).
 *       Glass / Fire / Weather / Vandalism / Other -> no extra
 *         fields, just Type + Date.
 *   - "Add incident" button — dim/disabled purple until all REQUIRED
 *     fields for the selected type are filled, bright purple +
 *     enabled once they are.
 *   - Tapping "Add incident" opens the "Add incident details?"
 *     confirmation sheet ("Once you add an incident, it's not
 *     possible to edit or delete it.") with "Confirm incident
 *     details" (saves + navigates back) and "Keep editing" (closes
 *     the sheet, stays on the form) buttons.
 *
 * ALL OF THIS IS 100% LOCAL STORAGE — there is no incidents/claims
 * collection anywhere in the backend schema (Policy.js/User.js), so
 * per instruction this entire feature runs client-side only via
 * profileLocalStorage.js. Once "confirmed", an incident is permanent
 * (no edit/delete UI exists anywhere), matching the reference app's
 * real "contact us to edit" behavior.
 */

const INCIDENT_TYPES = [
  { value: "Accident", label: "Accident" },
  { value: "Theft", label: "Theft" },
  { value: "Glass", label: "Glass" },
  { value: "Fire", label: "Fire" },
  { value: "Weather", label: "Weather" },
  { value: "Vandalism", label: "Vandalism" },
  { value: "Other", label: "Other" },
];

const INJURED_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const FAULT_OPTIONS = [
  { value: "Me", label: "Me" },
  { value: "The other driver", label: "The other driver" },
  { value: "Joint fault or unresolved", label: "Joint fault or unresolved" },
];

const STOLEN_OPTIONS = [
  { value: "Vehicle", label: "Vehicle" },
  { value: "Contents", label: "Contents" },
];

export default function AddIncidentPage() {
  const navigate = useNavigate();

  const [incidentType, setIncidentType] = useState(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [injured, setInjured] = useState(null);
  const [faultStatus, setFaultStatus] = useState(null);
  const [stolenItem, setStolenItem] = useState(null);

  const [openField, setOpenField] = useState(null); // "type" | "date" | "injured" | "fault" | "stolen" | null
  const [showFaultInfo, setShowFaultInfo] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const toggleField = (field) => {
    setOpenField((current) => (current === field ? null : field));
  };

  const handleClose = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account/incidents", { replace: true });
  };

  // Required-fields validation per type, matching exactly what the
  // reference screenshots show gating the "Add incident" button.
  const isComplete = (() => {
    if (!incidentType) return false;
    if (incidentType === "Accident") {
      return Boolean(injured && faultStatus);
    }
    if (incidentType === "Theft") {
      return Boolean(stolenItem);
    }
    // Glass / Fire / Weather / Vandalism / Other only need type + date.
    return true;
  })();

  const formatDateForStorage = (d) =>
    d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  const handleAddIncidentTap = () => {
    if (!isComplete) return;
    setShowConfirmSheet(true);
  };

  const handleConfirm = () => {
    const incident = {
      id: `${Date.now()}`,
      type: incidentType,
      date: date.toISOString(),
      dateLabel: formatDateForStorage(date),
      injured: incidentType === "Accident" ? injured : undefined,
      faultStatus: incidentType === "Accident" ? faultStatus : undefined,
      stolenItem: incidentType === "Theft" ? stolenItem : undefined,
      addedAt: new Date().toISOString(),
    };
    addPreviousIncident(incident);
    setShowConfirmSheet(false);
    navigate("/customer/profile/account/incidents", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <X size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Add incident</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Content */}
      {/* pb-28 (not pb-32) — this page has no bottom nav (it's rendered
          outside CustomerLayout, see AppRouter.jsx), so we only need
          enough bottom padding to clear the sticky "Add incident"
          button itself, not a nav bar + button. */}
      <div className="flex-1 px-4 pt-4 pb-28 space-y-3">
        <InlineWheelField
          label="Type of incident"
          placeholder="Type of incident"
          options={INCIDENT_TYPES}
          value={incidentType}
          onChange={(val) => {
            setIncidentType(val);
            // Reset type-specific fields when the type changes so
            // stale answers from a previous type selection can never
            // leak into a saved incident of a different type.
            setInjured(null);
            setFaultStatus(null);
            setStolenItem(null);
            setOpenField(null);
          }}
          open={openField === "type"}
          onToggle={() => toggleField("type")}
        />

        {incidentType && (
          <InlineDateField
            value={date}
            onChange={setDate}
            open={openField === "date"}
            onToggle={() => toggleField("date")}
          />
        )}

        {incidentType === "Accident" && (
          <>
            <InlineWheelField
              label="Was anyone injured?"
              placeholder="Was anyone injured?"
              options={INJURED_OPTIONS}
              value={injured}
              onChange={setInjured}
              open={openField === "injured"}
              onToggle={() => toggleField("injured")}
            />
            <InlineWheelField
              label="Who was at fault?"
              placeholder="Who was at fault?"
              options={FAULT_OPTIONS}
              value={faultStatus}
              onChange={setFaultStatus}
              open={openField === "fault"}
              onToggle={() => toggleField("fault")}
            />
            <div className="px-1">
              <p className="text-[13px] text-[#9497a1]">Understanding fault status</p>
              <button
                type="button"
                onClick={() => setShowFaultInfo(true)}
                className="text-[13px] font-semibold text-[#7c6bff] mt-0.5"
              >
                More about fault status.
              </button>
            </div>
          </>
        )}

        {incidentType === "Theft" && (
          <InlineWheelField
            label="What was stolen?"
            placeholder="What was stolen?"
            options={STOLEN_OPTIONS}
            value={stolenItem}
            onChange={setStolenItem}
            open={openField === "stolen"}
            onToggle={() => toggleField("stolen")}
          />
        )}
      </div>

      {/* Sticky "Add incident" button — pinned to the true bottom edge
          (bottom-4, not bottom-24) since there's no bottom nav on this
          screen to clear anymore now that it's routed outside
          CustomerLayout. */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <button
          type="button"
          onClick={handleAddIncidentTap}
          disabled={!isComplete}
          className={`w-full py-4 rounded-full text-[16px] font-bold text-white transition-all shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
            isComplete
              ? "bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98]"
              : "bg-[#352d5c] cursor-not-allowed"
          }`}
        >
          Add incident
        </button>
      </div>

      {/* "Understanding fault status" info sheet */}
      {showFaultInfo && (
        <div className="fixed inset-0 z-50 flex items-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowFaultInfo(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative w-full bg-[#17181c] rounded-t-3xl px-5 pt-3 pb-8 z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center pb-3">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>
            <h2 className="text-[22px] font-extrabold text-white">
              Understanding fault status
            </h2>

            <div className="mt-5">
              <h3 className="text-[16px] font-extrabold text-white">At fault</h3>
              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
                An accident or claim where you or your insurance company was
                responsible for covering the costs of any vehicle damage or
                injuries.
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-[16px] font-extrabold text-white">Not at fault</h3>
              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
                An accident or claim where another party was at fault and they
                or their insurance company paid out to cover the costs of any
                vehicle damage or injuries.
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-[16px] font-extrabold text-white">
                Joint fault or unresolved
              </h3>
              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
                An accident or claim where both parties were at fault, or an
                open claim where the fault status is still being decided.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFaultInfo(false)}
              className="w-full mt-8 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* "Add incident details?" confirmation sheet */}
      {showConfirmSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowConfirmSheet(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative w-full bg-[#17181c] rounded-t-3xl px-5 pt-3 pb-8 z-10 text-center">
            <div className="flex justify-center pb-3">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>
            <h2 className="text-[22px] font-extrabold text-white">
              Add incident details?
            </h2>
            <p className="text-[15px] text-[#9497a1] leading-relaxed mt-3">
              Once you add an incident, it's not possible to edit or delete
              it.
            </p>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full mt-6 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
            >
              Confirm incident details
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmSheet(false)}
              className="w-full mt-3 py-4 bg-[#242429] hover:bg-[#2c2c33] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
            >
              Keep editing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

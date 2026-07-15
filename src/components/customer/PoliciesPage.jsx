import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, ChevronRight, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyPolicies } from "../../app/api/policyApi";
import policyImg from "/policyimg.png";

/**
 * frontend/src/pages/customer/PoliciesPage.jsx
 *
 * Customer -> Policies tab
 * - Click from CustomerBottomNav => this page renders.
 * - Calls GET /api/policies/my (via getMyPolicies) — SAME working API
 *   call as before, untouched.
 * - UI redesigned to match the reference screenshot:
 *     1. Hero card ("Let's hit the road" / "Get insured in minutes" /
 *        "Get a quote" button + car illustration).
 *     2. "Past" section listing past/expired policies as cards showing
 *        registration, "1 hour · 5 Jun" style duration+date summary,
 *        and a chevron to view more (destination TBD — see note below).
 *
 * "Get a quote" navigates to the Get Insured search screen
 * (/customer, the home tab with PlateSearchBar) so the customer can
 * search a new plate immediately — no new route needed since that
 * search UI already exists on CustomerHome.jsx.
 */
export default function PoliciesPage() {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getMyPolicies();
        const list = res?.data?.policies || [];
        if (mounted) setPolicies(Array.isArray(list) ? list : []);
      } catch (e) {
        if (mounted) {
          setError(e);
          setPolicies([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // "Past" = anything not currently Active/Upcoming — i.e. Expired or
  // Cancelled policies, matching the reference screenshot's single
  // "Past" section (no separate Active/Upcoming groups shown there).
  const pastPolicies = useMemo(() => {
    return policies
      .filter((p) => p?.status === "Expired" || p?.status === "Cancelled")
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  }, [policies]);

  const handleGetQuote = () => {
    // Reuses the existing Get Insured search screen — no new page needed.
    navigate("/customer");
  };

  const handleOpenPolicy = (policy) => {
    // Full policy object is already in memory (fetched above via
    // getMyPolicies), so it's passed directly via router state — no
    // second network call needed. PolicyDetailPage.jsx renders the
    // full "Start/End · Policy summary · Start location · Payment
    // information · Get help · Buy again" screen from this.
    navigate("/customer/policies/detail", { state: { policy } });
  };

  // Combines a date-only field (e.g. "2026-06-17T00:00:00.000Z") with a
  // separate "HH:MM" time-of-day field (e.g. "01:59") into one real
  // Date/time. Your backend stores date and time-of-day separately
  // (startDate/endDate are date-only, startTime/endTime carry the
  // actual clock time), so they must be combined before diffing —
  // comparing startDate/endDate alone always produces 0, since both
  // are midnight on the same calendar date.
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

  const formatDurationAndDate = (policy) => {
    const start = combineDateAndTime(policy?.startDate, policy?.startTime);
    let end = combineDateAndTime(policy?.endDate, policy?.endTime);

    let durationLabel = "";
    if (start && end) {
      // Guard against an end time that's technically "earlier" than the
      // start time on the same date (e.g. a policy running past
      // midnight where endDate wasn't bumped to the next day) — treat
      // that as spanning into the next day instead of a negative/zero
      // duration.
      if (end <= start) {
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }

      const totalMinutes = Math.round((end - start) / (1000 * 60));

      if (totalMinutes < 60) {
        durationLabel = `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
      } else if (totalMinutes < 60 * 24) {
        const hours = Math.round(totalMinutes / 60);
        durationLabel = `${hours} hour${hours === 1 ? "" : "s"}`;
      } else {
        const days = Math.round(totalMinutes / (60 * 24));
        durationLabel = `${days} day${days === 1 ? "" : "s"}`;
      }
    }

    const dateLabel = start
      ? start.toLocaleDateString(undefined, { day: "numeric", month: "short" })
      : "";

    return [durationLabel, dateLabel].filter(Boolean).join(" · ");
  };

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header */}
      <div className="flex items-center justify-end px-4 pt-4">
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      </div>

      <div className="px-4 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight">Policies</h1>
      </div>

      {/* Hero: "Let's hit the road" */}
      <div className="px-4 pt-5">
        <div className="relative overflow-hidden rounded-2xl bg-[#1c1d22] p-5">
          <div className="max-w-[62%]">
            <h2 className="text-[19px] font-extrabold text-white leading-tight">
              Let's hit the road
            </h2>
            <p className="text-[14px] text-[#9497a1] mt-1">
              Get insured in minutes
            </p>
            <button
              type="button"
              onClick={handleGetQuote}
              className="mt-4 px-5 py-2.5 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[14px] font-bold text-white"
            >
              Get a quote
            </button>
          </div>

          {/* Car illustration (real PNG asset, background removed), absolutely positioned to the right */}
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[46%]">
            <img
              src={policyImg}
              alt="Speeding car"
              className="object-contain w-full h-auto pointer-events-none select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Past */}
      <div className="px-4 pt-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-5 w-14 rounded bg-[#17181c] animate-pulse" />
            <div className="h-[74px] rounded-2xl bg-[#17181c] border border-white/5 animate-pulse" />
          </div>
        ) : error ? (
          <p className="text-[14px] text-[#9497a1]">
            We couldn't load your policies.
          </p>
        ) : pastPolicies.length === 0 ? (
          <p className="text-[14px] text-[#9497a1]">
            You don't have any past policies yet.
          </p>
        ) : (
          <section>
            <h2 className="text-[15px] font-bold text-[#9497a1] mb-3">Past</h2>
            <div className="space-y-3">
              {pastPolicies.map((policy) => {
                const vehicle = policy?.vehicleId;
                const registration = vehicle?.registration;
                const ownerLabel =
                  vehicle?.make && vehicle?.model
                    ? `${vehicle.make} ${vehicle.model}`
                    : registration || "Vehicle";

                return (
                  <button
                    key={policy?._id || policy?.id || policy?.policyNumber}
                    type="button"
                    onClick={() => handleOpenPolicy(policy)}
                    className="w-full text-left px-4 py-4 rounded-2xl bg-[#17181c] border border-white/5 hover:bg-[#1d1e23] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[16px] font-bold text-white truncate">
                          {ownerLabel}
                        </p>
                        {registration && (
                          <p className="text-[13px] text-[#9497a1] mt-0.5 truncate">
                            {registration}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[#9497a1]">
                          <Timer size={13} className="text-[#9497a1]" />
                          <span>{formatDurationAndDate(policy)}</span>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-[#5c5e68] shrink-0"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

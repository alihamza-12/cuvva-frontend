import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, ChevronRight, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyPolicies } from "../../app/api/policyApi";
import policyImg from "/policyimg.png";

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

const STATUS_STYLES = {
  Upcoming: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  Active: "bg-green-500/10 text-green-400 border-green-500/30",
  Expired: "bg-red-500/10 text-red-400 border-red-500/30",
  Cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export default function PoliciesPage() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSupportNav = () => {
    setShowDropdown(false);
    navigate("/customer/support");
  };

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

  const sortedPolicies = useMemo(() => {

    return [...policies].sort(
      (a, b) => new Date(b.endDate) - new Date(a.endDate),
    );
  }, [policies]);

  const handleGetQuote = () => {

    navigate("/customer");
  };

  const handleOpenPolicy = (policy) => {

    navigate(`/customer/policies/${policy._id}`, { state: { policy } });
  };

  const formatDurationAndDate = (policy) => {
    const start = combineDateAndTime(policy?.startDate, policy?.startTime);
    let end = combineDateAndTime(policy?.endDate, policy?.endTime);

    let durationLabel = "";
    if (start && end) {

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

  const policySectionLabel =
    sortedPolicies.length > 0 &&
    sortedPolicies.every((policy) =>
      ["Expired", "Cancelled"].includes(policy?.status),
    )
      ? "Past"
      : "Your policies";

  return (
    <div className="text-white pb-32">

      <div className="flex items-start justify-end px-4 pt-3 min-h-12">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="More options"
            className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
          >
            <MoreHorizontal size={18} className="text-white" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-44 bg-[#17181c] rounded-xl shadow-2xl py-1.5 z-50 border border-white/10">
                <button
                  onClick={handleSupportNav}
                  className="w-full flex items-center px-4 py-2.5 text-left hover:bg-[#262626] transition-colors"
                >
                  <span className="text-[15px] font-semibold text-white">
                    Help centre
                  </span>
                </button>
                <button
                  onClick={handleSupportNav}
                  className="w-full flex items-center px-4 py-2.5 text-left hover:bg-[#262626] transition-colors"
                >
                  <span className="text-[15px] font-semibold text-white">
                    Chat to us
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pt-3">
        <h1 className="text-[26px] font-extrabold tracking-tight leading-none">Policies</h1>
      </div>

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

          {/* Car illustration, absolutely positioned to the right */}
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

      {/* Policies list */}
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
        ) : sortedPolicies.length === 0 ? (
          <p className="text-[14px] text-[#9497a1]">
            You don't have any active or upcoming policies right now.
          </p>
        ) : (
          <section>
            <h2 className="text-[15px] font-bold text-[#9497a1] mb-3">
              {policySectionLabel}
            </h2>
            <div className="space-y-3">
              {sortedPolicies.map((policy) => {
                const vehicle = policy?.vehicleId;
                const registration = vehicle?.registration;
                const ownerLabel =
                  vehicle?.make && vehicle?.model
                    ? `${vehicle.make} ${vehicle.model}`
                    : registration || "Vehicle";
                // Use the API's stored status field directly so the badge reflects

                const status = policy?.status || "Upcoming";

                const showBadge = status === "Active" || status === "Upcoming";

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

                      <div className="flex items-center gap-2 shrink-0">
          
                        {showBadge && (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[status] || STATUS_STYLES.Upcoming}`}
                          >
                            {status}
                          </span>
                        )}
                        <ChevronRight
                          size={18}
                          className="text-[#5c5e68] shrink-0"
                        />
                      </div>
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

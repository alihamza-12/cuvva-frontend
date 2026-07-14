import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyPolicies } from "../../app/api/policyApi";

/**
 * Customer -> Policies tab
 * - Click from CustomerBottomNav => this page renders.
 * - Calls GET /api/policies/my
 * - Mobile-first UI that matches the existing Cuvva dark theme pattern.
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

  const grouped = useMemo(() => {
    const buckets = {
      Active: [],
      Upcoming: [],
      Expired: [],
      Cancelled: [],
    };

    for (const p of policies) {
      const status = p?.status || "Unknown";
      if (buckets[status]) buckets[status].push(p);
      else buckets[status] = buckets[status] || [];
    }

    return buckets;
  }, [policies]);

  const SECTION_ORDER = ["Active", "Upcoming", "Expired", "Cancelled"];

  const handleOpenPolicy = () => {
    // Mobile-friendly: open the documents hub.
    // (If you have a customer policy detail route later, wire it here.)
    navigate("/customer/policies/documents");
  };

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header (match CustomerHome.jsx styling) */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">Policies</h1>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-[58px] rounded-2xl bg-[#17181c] border border-white/5 animate-pulse" />
            <div className="h-[58px] rounded-2xl bg-[#17181c] border border-white/5 animate-pulse" />
            <div className="h-[58px] rounded-2xl bg-[#17181c] border border-white/5 animate-pulse" />
          </div>
        ) : error ? (
          <div>
            <p className="text-[14px] text-[#9497a1]">
              We couldn’t load your policies.
            </p>
          </div>
        ) : policies.length === 0 ? (
          <div>
            <p className="text-[14px] text-[#9497a1]">
              You don’t have any policies yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {SECTION_ORDER.map((status) => {
              const items = grouped[status] || [];
              if (!items.length) return null;

              const headerColor =
                status === "Active"
                  ? "text-[#7c5bff]"
                  : status === "Upcoming"
                    ? "text-[#b5b6bd]"
                    : status === "Expired"
                      ? "text-[#9497a1]"
                      : "text-[#9497a1]";

              return (
                <section key={status}>
                  <h2
                    className={`text-[13px] font-semibold mb-3 ${headerColor}`}
                  >
                    {status}
                  </h2>

                  <div className="space-y-3">
                    {items.map((policy) => {
                      const vehicle = policy?.vehicleId;
                      const registration = vehicle?.registration;
                      const make = vehicle?.make;
                      const model = vehicle?.model;

                      return (
                        <button
                          key={
                            policy?._id || policy?.id || policy?.policyNumber
                          }
                          type="button"
                          onClick={() => handleOpenPolicy(policy)}
                          className="w-full text-left px-4 py-4 rounded-2xl bg-[#17181c] border border-white/5 hover:bg-[#1d1e23] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[15px] font-bold text-white truncate">
                                {registration ? registration : "Vehicle"}
                              </p>
                              <p className="text-[13px] text-[#9497a1] mt-1 truncate">
                                {make && model ? `${make} ${model}` : ""}
                              </p>

                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-[12px] px-2 py-1 rounded-full bg-white/5 text-[#c8c9d1]">
                                  {policy?.policyType || "Policy"}
                                </span>
                                <span className="text-[12px] px-2 py-1 rounded-full bg-white/5 text-[#c8c9d1]">
                                  {policy?.coverageType || "Coverage"}
                                </span>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

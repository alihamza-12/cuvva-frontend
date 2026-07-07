import React, { useEffect, useState, useCallback } from "react";
import { MoreHorizontal } from "lucide-react";

import PlateSearchBar from "../../components/customer/PlateSearchBar";
import RecentlyViewedSection from "../../components/customer/RecentlyViewedSection";
import BuyAgainSection from "../../components/customer/BuyAgainSection";

// import { httpClient } from "../../app/api/httpClient";

/**
 * frontend/src/pages/customer/CustomerHome.jsx
 *
 * "Get insured" landing page — the customer's default home screen.
 * Layout: header -> search -> Recently Viewed (horizontal scroll,
 * localStorage-backed) -> Buy Again (only if an expired-policy vehicle
 * exists, backend-driven).
 *
 * Rendered inside CustomerLayout.jsx, which supplies <CustomerBottomNav />.
 */

const RECENTLY_VIEWED_KEY = "customer_recently_viewed_vehicles";

export default function CustomerHome() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [buyAgainVehicles, setBuyAgainVehicles] = useState([]);
  const [buyAgainLoading, setBuyAgainLoading] = useState(true);

  // --- Recently Viewed: local, per-device convenience list -------------
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      setRecentlyViewed(Array.isArray(stored) ? stored : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  const handleDismissRecent = useCallback((vehicleId) => {
    setRecentlyViewed((prev) => {
      const next = prev.filter((v) => v._id !== vehicleId);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // --- Buy Again: server-driven, only vehicles with an EXPIRED policy --
  useEffect(() => {
    let mounted = true;

    const fetchExpiredPolicyVehicles = async () => {
      setBuyAgainLoading(true);
      try {
        // Replace with your real endpoint once available, e.g.:
        // const res = await httpClient.get("/api/customers/me/policies/expired-vehicles");
        // if (!mounted) return;
        // setBuyAgainVehicles(res.data?.vehicles || []);

        // Placeholder until backend endpoint exists — keep empty so the
        // section correctly hides itself when there are no expired policies.
        if (!mounted) return;
        setBuyAgainVehicles([]);
      } catch (err) {
        if (!mounted) return;
        setBuyAgainVehicles([]);
      } finally {
        if (!mounted) return;
        setBuyAgainLoading(false);
      }
    };

    fetchExpiredPolicyVehicles();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">Get insured</h1>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="pt-5">
        <PlateSearchBar />
      </div>

      {/* Recently Viewed */}
      <RecentlyViewedSection
        vehicles={recentlyViewed}
        onDismiss={handleDismissRecent}
      />

      {/* Buy Again — only rendered when expired-policy vehicles exist */}
      <BuyAgainSection vehicles={buyAgainVehicles} loading={buyAgainLoading} />
    </div>
  );
}

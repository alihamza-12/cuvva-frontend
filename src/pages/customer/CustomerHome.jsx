import React, { useEffect, useState, useCallback } from "react";
import { MoreHorizontal } from "lucide-react";

import PlateSearchBar from "../../components/customer/PlateSearchBar";
import RecentlyViewedSection from "../../components/customer/RecentlyViewedSection";
import BuyAgainSection from "../../components/customer/BuyAgainSection";

import { httpClient } from "../../app/api/httpClient";

const RECENTLY_VIEWED_KEY = "customer_recently_viewed_vehicles";
const MAX_RECENT = 10;

/**
 * frontend/src/pages/customer/CustomerHome.jsx
 *
 * "Get insured" landing page. No backend changes required:
 *  - Recently Viewed is 100% client-side, persisted in localStorage by
 *    PlateSearchBar.jsx on every successful search (survives refresh/
 *    relaunch on this device/browser).
 *  - Buy Again reuses your EXISTING "GET /api/policies/my" route (already
 *    in policies.js) and filters client-side for status === "Expired",
 *    deduping by vehicle — no new backend endpoint needed.
 */
export default function CustomerHome() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [buyAgainVehicles, setBuyAgainVehicles] = useState([]);
  const [buyAgainLoading, setBuyAgainLoading] = useState(true);

  // --- Recently Viewed: read from localStorage on mount ---
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      setRecentlyViewed(Array.isArray(stored) ? stored : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  // Called by PlateSearchBar the moment a search succeeds, so the new
  // vehicle appears instantly without re-reading localStorage.
  const handleVehicleFound = useCallback((vehicle) => {
    setRecentlyViewed((prev) =>
      [vehicle, ...prev.filter((v) => v._id !== vehicle._id)].slice(0, MAX_RECENT),
    );
  }, []);

  const handleDismissRecent = useCallback((vehicleId) => {
    setRecentlyViewed((prev) => {
      const next = prev.filter((v) => v._id !== vehicleId);
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // --- Buy Again: derived from your EXISTING "my policies" endpoint ----
  // No new backend route — reuses GET /api/policies/my, which already
  // returns this customer's policies populated with vehicleId details.
  useEffect(() => {
    let mounted = true;

    const fetchExpiredPolicyVehicles = async () => {
      setBuyAgainLoading(true);
      try {
        const res = await httpClient.get("/api/policies/my");
        if (!mounted) return;

        const policies = res.data?.policies || [];

        // Keep only Expired policies, then dedupe by vehicle, keeping
        // each vehicle's most recently expired policy.
        const expired = policies
          .filter((p) => p.status === "Expired" && p.vehicleId)
          .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

        const seen = new Set();
        const vehicles = [];
        for (const policy of expired) {
          const v = policy.vehicleId;
          if (seen.has(v._id)) continue;
          seen.add(v._id);
          vehicles.push({
            _id: v._id,
            registration: v.registration,
            make: v.make,
            model: v.model,
            ownerLabel: `${v.make} ${v.model}`,
            relationship: "Owner",
          });
        }

        setBuyAgainVehicles(vehicles);
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
        <PlateSearchBar onVehicleFound={handleVehicleFound} />
      </div>

      {/* Recently Viewed — localStorage backed */}
      <RecentlyViewedSection
        vehicles={recentlyViewed}
        onDismiss={handleDismissRecent}
      />

      {/* Buy Again — derived from existing GET /api/policies/my */}
      <BuyAgainSection vehicles={buyAgainVehicles} loading={buyAgainLoading} />
    </div>
  );
}

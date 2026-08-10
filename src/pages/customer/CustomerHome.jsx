import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import PlateSearchBar from "../../components/customer/PlateSearchBar";
import RecentlyViewedSection from "../../components/customer/RecentlyViewedSection";
import BuyAgainSection from "../../components/customer/BuyAgainSection";

import { httpClient } from "../../app/api/httpClient";

const RECENTLY_VIEWED_KEY = "customer_recently_viewed_vehicles";
const MAX_RECENT = 10;

export default function CustomerHome() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [buyAgainVehicles, setBuyAgainVehicles] = useState([]);
  const [buyAgainLoading, setBuyAgainLoading] = useState(true);

  const handleSupportNav = () => {
    setShowDropdown(false); 
    navigate("/customer/support"); 
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      setRecentlyViewed(Array.isArray(stored) ? stored : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

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

      }
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchExpiredPolicyVehicles = async () => {
      setBuyAgainLoading(true);
      try {
        const res = await httpClient.get("/api/policies/my");
        if (!mounted) return;

        const policies = res.data?.policies || [];

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

      {/* Top action stays near the status bar; the title sits lower like the app. */}
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
                  <span className="text-[15px] font-semibold text-white">Help centre</span>
                </button>

                <button
                  onClick={handleSupportNav}
                  className="w-full flex items-center px-4 py-2.5 text-left hover:bg-[#262626] transition-colors"
                >
                  <span className="text-[15px] font-semibold text-white">Chat to us</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h1 className="px-4 mt-3 text-[26px] font-extrabold tracking-tight leading-none">
        Get insured
      </h1>

      <div className="pt-5">
        <PlateSearchBar onVehicleFound={handleVehicleFound} />
      </div>

      <RecentlyViewedSection
        vehicles={recentlyViewed}
        onDismiss={handleDismissRecent}
      />

      <BuyAgainSection vehicles={buyAgainVehicles} loading={buyAgainLoading} />
    </div>
  );
}
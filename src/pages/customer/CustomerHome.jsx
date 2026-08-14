import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import PlateSearchBar from "../../components/customer/PlateSearchBar";
import RecentlyViewedSection from "../../components/customer/RecentlyViewedSection";
import BuyAgainSection from "../../components/customer/BuyAgainSection";

import { httpClient } from "../../app/api/httpClient";

const RECENTLY_VIEWED_KEY =
  "customer_recently_viewed_vehicles";

const MAX_RECENT = 50;

const getStoredRecentlyViewed = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]"
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export default function CustomerHome() {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [recentlyViewed, setRecentlyViewed] =
    useState(getStoredRecentlyViewed);

  const [buyAgainVehicles, setBuyAgainVehicles] =
    useState([]);

  const [buyAgainLoading, setBuyAgainLoading] =
    useState(true);

  const handleSupportNav = () => {
    setShowDropdown(false);
    navigate("/customer/support");
  };

  const handleVehicleFound = useCallback(
    (vehicle) => {
      setRecentlyViewed((previous) =>
        [
          vehicle,
          ...previous.filter(
            (item) => item._id !== vehicle._id
          ),
        ].slice(0, MAX_RECENT)
      );
    },
    []
  );

  const handleDismissRecent = useCallback(
    (vehicleId) => {
      setRecentlyViewed((previous) => {
        const next = previous.filter(
          (vehicle) =>
            vehicle._id !== vehicleId
        );

        try {
          localStorage.setItem(
            RECENTLY_VIEWED_KEY,
            JSON.stringify(next)
          );
        } catch {
          // Keep the UI working when storage is unavailable.
        }

        return next;
      });
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    const fetchExpiredPolicyVehicles =
      async () => {
        setBuyAgainLoading(true);

        try {
          const response =
            await httpClient.get(
              "/api/policies/my"
            );

          if (!mounted) {
            return;
          }

          const policies =
            response.data?.policies || [];

          const expiredPolicies = policies
            .filter(
              (policy) =>
                policy.status === "Expired" &&
                policy.vehicleId
            )
            .sort(
              (first, second) =>
                new Date(second.endDate) -
                new Date(first.endDate)
            );

          const seen = new Set();
          const vehicles = [];

          for (const policy of expiredPolicies) {
            const vehicle = policy.vehicleId;

            if (seen.has(vehicle._id)) {
              continue;
            }

            seen.add(vehicle._id);

            vehicles.push({
              _id: vehicle._id,
              registration:
                vehicle.registration,
              make: vehicle.make,
              model: vehicle.model,
              ownerLabel:
                `${vehicle.make} ${vehicle.model}`,
              relationship: "Owner",
            });
          }

          setBuyAgainVehicles(vehicles);
        } catch {
          if (!mounted) {
            return;
          }

          setBuyAgainVehicles([]);
        } finally {
          if (mounted) {
            setBuyAgainLoading(false);
          }
        }
      };

    fetchExpiredPolicyVehicles();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pb-32 text-white">
      {/*
       * The action button remains near the top.
       * The page heading is displayed underneath it.
       */}
      <div className="flex items-start justify-end px-4 pt-3 min-h-12">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowDropdown(
                (current) => !current
              )
            }
            aria-label="More options"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              border border-white/[0.08]
              bg-[#191a1f]
              transition-colors
              hover:bg-[#222329]
            "
          >
            <MoreHorizontal
              size={18}
              className="text-white"
            />
          </button>

          {showDropdown && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40"
                onClick={() =>
                  setShowDropdown(false)
                }
              />

              <div
                className="
                  absolute right-0 z-50
                  mt-2 w-44
                  overflow-hidden
                  rounded-xl
                  border border-white/10
                  bg-[#17181c]
                  py-1.5
                  shadow-2xl
                "
              >
                <button
                  type="button"
                  onClick={handleSupportNav}
                  className="
                    flex w-full
                    items-center
                    px-4 py-2.5
                    text-left
                    transition-colors
                    hover:bg-[#262626]
                  "
                >
                  <span className="text-[15px] font-semibold text-white">
                    Help centre
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSupportNav}
                  className="
                    flex w-full
                    items-center
                    px-4 py-2.5
                    text-left
                    transition-colors
                    hover:bg-[#262626]
                  "
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

      <h1
        className="
          mt-3 px-4
          text-[26px]
          font-extrabold
          leading-none
          tracking-tight
        "
      >
        Get insured
      </h1>

      {/*
       * Increased from pt-5 to pt-7 to create
       * more space between the heading and input.
       */}
      <div className="pt-7">
        <PlateSearchBar
          onVehicleFound={
            handleVehicleFound
          }
        />
      </div>

      <RecentlyViewedSection
        vehicles={recentlyViewed}
        onDismiss={handleDismissRecent}
      />

      <BuyAgainSection
        vehicles={buyAgainVehicles}
        loading={buyAgainLoading}
      />
    </div>
  );
}
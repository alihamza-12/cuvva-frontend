import { useEffect, useState } from "react";

import {
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getExternalVehicleByRegistration,
} from "../../app/api/vehicleApi";

const RECENTLY_VIEWED_KEY =
  "customer_recently_viewed_vehicles";

const MAX_RECENT = 10;

export default function PlateSearchBar({
  onVehicleFound,
}) {
  const navigate = useNavigate();

  const [plate, setPlate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showNotFoundModal, setShowNotFoundModal] =
    useState(false);

  useEffect(() => {
    if (!showNotFoundModal) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowNotFoundModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showNotFoundModal]);

  const saveToRecentlyViewed = (
    vehicle
  ) => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(
          RECENTLY_VIEWED_KEY
        ) || "[]"
      );

      const deduplicated =
        Array.isArray(stored)
          ? stored.filter(
              (item) =>
                item._id !== vehicle._id
            )
          : [];

      const next = [
        vehicle,
        ...deduplicated,
      ].slice(0, MAX_RECENT);

      localStorage.setItem(
        RECENTLY_VIEWED_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Continue normally if storage is unavailable.
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const cleaned = plate
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    if (!cleaned || loading) {
      return;
    }

    setLoading(true);
    setShowNotFoundModal(false);

    try {
      const response =
        await getExternalVehicleByRegistration(
          cleaned
        );

      const vehicle =
        response.data?.vehicle;

      if (!vehicle) {
        setShowNotFoundModal(true);
        return;
      }

      saveToRecentlyViewed(vehicle);

      onVehicleFound?.(vehicle);

      navigate(
        `/customer/policies/new?vehicleId=${vehicle._id}`,
        {
          state: {
            prefillVehicle: vehicle,
          },
        }
      );
    } catch {
      setShowNotFoundModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5">
      <form onSubmit={handleSubmit}>
        <div
          className="
            flex min-h-[58px]
            items-center
            gap-4
            rounded-full
            border border-white/[0.08]
            bg-[#1b1c21]
            px-5 py-4
            transition-colors
            focus-within:border-[#7c6bff]/50
          "
        >
          {loading ? (
            <Loader2
              size={21}
              className="
                shrink-0
                animate-spin
                text-[#7c6bff]
              "
            />
          ) : (
            <Search
              size={22}
              strokeWidth={2.2}
              className="
                shrink-0
                text-[#9698a2]
              "
            />
          )}

          <input
            value={plate}
            onChange={(event) =>
              setPlate(event.target.value)
            }
            placeholder="ENTER NUMBER PLATE"
            disabled={loading}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="
              min-w-0 flex-1
              bg-transparent
              text-[16px]
              font-extrabold
              uppercase
              tracking-[0.08em]
              text-white
              outline-none
              placeholder:font-extrabold
              placeholder:tracking-[0.08em]
              placeholder:text-[#8a8b94]
              disabled:opacity-60
            "
          />
        </div>
      </form>

      {showNotFoundModal && (
        <VehicleNotFoundModal
          onClose={() =>
            setShowNotFoundModal(false)
          }
        />
      )}
    </div>
  );
}

function VehicleNotFoundModal({ onClose }) {
  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/80
        px-6
        backdrop-blur-[2px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-not-found-title"
      aria-describedby="vehicle-not-found-description"
    >
      <div
        className="
          w-full max-w-[370px]
          rounded-[28px]
          border border-white/[0.04]
          bg-[#1d1d23]
          px-6 pb-6 pt-10
          text-center
          shadow-[0_24px_80px_rgba(0,0,0,0.55)]
        "
      >
        <div
          className="
            mx-auto
            flex h-[86px] w-[86px]
            items-center justify-center
            rounded-full
            bg-gradient-to-br
            from-[#9a6cff]
            to-[#633cff]
            shadow-[0_12px_0_-5px_#352485]
          "
        >
          <AlertCircle
            size={49}
            strokeWidth={2.5}
            className="text-white"
          />
        </div>

        <h2
          id="vehicle-not-found-title"
          className="mt-8 text-[25px] font-extrabold text-white"
        >
          Oh no!
        </h2>

        <p
          id="vehicle-not-found-description"
          className="mx-auto mt-5 max-w-[290px] text-[17px] leading-[1.45] text-[#b8b8c0]"
        >
          That reg plate doesn&apos;t look right. Please check it and try again.
        </p>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="
            mt-8 w-full
            rounded-full
            bg-[#7961ff]
            px-5 py-4
            text-[17px] font-bold text-white
            transition-colors
            hover:bg-[#846eff]
            active:bg-[#6c53ed]
          "
        >
          Close
        </button>
      </div>
    </div>
  );
}

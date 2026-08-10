import React, { useState } from "react";

import {
  Loader2,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getVehicleByRegistration,
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

  const [error, setError] =
    useState("");

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
    setError("");

    try {
      const response =
        await getVehicleByRegistration(
          cleaned
        );

      const vehicle =
        response.data?.vehicle;

      if (!vehicle) {
        setError(
          "We couldn't find that vehicle. Please check the plate and try again."
        );

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
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "We couldn't find that vehicle. Please check the plate and try again."
      );
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

      {error && (
        <div className="mt-2 px-1 text-[12px] text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
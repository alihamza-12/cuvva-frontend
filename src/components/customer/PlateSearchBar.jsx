import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVehicleByRegistration } from "../../app/api/vehicleApi";

const RECENTLY_VIEWED_KEY = "customer_recently_viewed_vehicles";
const MAX_RECENT = 10;

/**
 * frontend/src/components/customer/PlateSearchBar.jsx
 *
 * "ENTER NUMBER PLATE" search on the Get Insured landing page.
 * No backend changes required — reuses the existing
 * GET /api/vehicles/lookup/:registration route (via vehicleApi.js) that
 * already powers VehicleDetailPage.jsx, and persists the search result
 * entirely client-side in localStorage.
 *
 * On submit:
 *   1. Calls getVehicleByRegistration(plate) — existing route, no changes.
 *   2. On success, saves the vehicle into localStorage (de-duped, most
 *      recent first, capped at 10) so it survives refreshes/relaunches
 *      on this device.
 *   3. Notifies the parent (CustomerHome) so Recently Viewed updates
 *      immediately without re-reading localStorage.
 *   4. Navigates into the policy purchase flow, pre-filled with the vehicle.
 *
 * Props:
 *  - onVehicleFound: (vehicle) => void
 */
export default function PlateSearchBar({ onVehicleFound }) {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const saveToRecentlyViewed = (vehicle) => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      const deduped = Array.isArray(stored)
        ? stored.filter((v) => v._id !== vehicle._id)
        : [];
      const next = [vehicle, ...deduped].slice(0, MAX_RECENT);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable/full — fail silently, search still works.
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = plate.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleaned || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await getVehicleByRegistration(cleaned);
      const vehicle = res.data?.vehicle;

      if (!vehicle) {
        setError("We couldn't find that vehicle. Please check the plate and try again.");
        return;
      }

      saveToRecentlyViewed(vehicle);
      onVehicleFound?.(vehicle);

      navigate(`/customer/policies/new?vehicleId=${vehicle._id}`, {
        state: { prefillVehicle: vehicle },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't find that vehicle. Please check the plate and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 bg-[#17181c] rounded-full px-4 py-3.5 border border-white/5 focus-within:border-[#7c6bff]/40 transition-colors">
          {loading ? (
            <Loader2 size={18} className="text-[#7c6bff] shrink-0 animate-spin" />
          ) : (
            <Search size={18} className="text-[#8b8d98] shrink-0" />
          )}
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="ENTER NUMBER PLATE"
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-white placeholder:text-[#6b6d78] text-[15px] font-bold tracking-wider uppercase placeholder:tracking-wider disabled:opacity-60"
          />
        </div>
      </form>
      {error && (
        <div className="mt-2 text-[12px] text-red-400 px-1">{error}</div>
      )}
    </div>
  );
}

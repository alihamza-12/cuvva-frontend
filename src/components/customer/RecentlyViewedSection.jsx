import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CarBrandIcon from "./CarBrandIcon";

/**
 * frontend/src/components/customer/RecentlyViewedSection.jsx
 *
 * Horizontal-scroll row of vehicles the customer recently looked up via
 * the number-plate search (DVLA lookup), NOT necessarily insured yet.
 * Each card is dismissible via the "x" button.
 *
 * This is distinct from "Buy again": Recently Viewed = plates searched
 * (may have never bought a policy). Buy Again = vehicles with an expired
 * policy record.
 *
 * Suggested local persistence: store recently-viewed vehicles in
 * localStorage (or a lightweight `GET/DELETE /api/customers/me/recent-views`
 * endpoint if you want it synced across devices).
 *
 * Props:
 *  - vehicles: [{ _id, registration, make, model }]
 *  - onDismiss: (vehicleId) => void
 */
export default function RecentlyViewedSection({ vehicles = [], onDismiss }) {
  const navigate = useNavigate();

  if (!vehicles.length) return null;

  const handleSelect = (vehicle) => {
    navigate(`/customer/policies/new?vehicleId=${vehicle._id}`, {
      state: { prefillVehicle: vehicle },
    });
  };

  return (
    <section className="pt-5">
      <h2 className="px-4 text-[13px] font-semibold text-[#b5b6bd] mb-2">
        Recently viewed
      </h2>

      <div className="flex gap-3 px-4 pb-1 overflow-x-auto scrollbar-hide">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className="relative shrink-0 w-[220px]"
          >
            <button
              type="button"
              onClick={() => handleSelect(vehicle)}
              className="w-full flex items-center gap-2.5 bg-[#17181c] hover:bg-[#1d1e23] active:scale-[0.99] transition-all rounded-2xl p-3 text-left"
            >
              <CarBrandIcon make={vehicle.make} size={38} />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">
                  {vehicle.ownerLabel || `${vehicle.make} ${vehicle.model}`}
                </div>
                <div className="text-[12px] text-[#8b8d98] truncate">
                  {vehicle.registration}
                </div>
              </div>
            </button>

            <button
              type="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(vehicle._id);
              }}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center"
            >
              <X size={11} className="text-[#c8c9d1]" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

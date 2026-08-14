import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CarBrandIcon from "./CarBrandIcon";

export default function RecentlyViewedSection({ vehicles = [], onDismiss }) {
  const navigate = useNavigate();

  if (!vehicles.length) return null;

  const handleSelect = (vehicle) => {
    navigate("/customer/vehicles/lookup-result", {
      state: { vehicle },
    });
  };

  return (
    <section className="pt-7">
      <h2 className="px-7 text-[14px] font-medium text-[#a7a7ad] mb-3">
        Recently viewed
      </h2>

      <div className="flex gap-3 px-4 pb-1 overflow-x-auto scrollbar-hide">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className="relative shrink-0 w-[232px]"
          >
            <button
              type="button"
              onClick={() => handleSelect(vehicle)}
              className="w-full min-h-[76px] flex items-center gap-3 bg-[#1b1c21] hover:bg-[#202126] active:scale-[0.99] transition-all rounded-[22px] px-4 py-3.5 text-left"
            >
              <CarBrandIcon
                make={vehicle.make}
                imageUrl={vehicle.imageUrl}
                size={38}
              />
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

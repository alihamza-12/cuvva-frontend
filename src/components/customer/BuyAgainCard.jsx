import React from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import CarBrandIcon from "./CarBrandIcon";

/**
 * frontend/src/components/customer/BuyAgainCard.jsx
 */
export default function BuyAgainCard({ vehicle, onSelect }) {
  const { registration, ownerLabel, relationship = "Owner", make } = vehicle;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(vehicle)}
      className="w-full flex items-center gap-3 bg-[#17181c] hover:bg-[#1d1e23] active:scale-[0.99] transition-all rounded-2xl p-3.5 text-left"
    >
      <CarBrandIcon make={make} size={44} />

      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-white truncate">
          {ownerLabel}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#8b8d98]">
          <span className="tracking-wide">{registration}</span>
          <CheckCircle2 size={13} className="text-[#8b8d98]" />
          <span>{relationship}</span>
        </div>
      </div>

      <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
    </button>
  );
}

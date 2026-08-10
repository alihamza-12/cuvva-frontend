import React from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import CarBrandIcon from "./CarBrandIcon";

export default function BuyAgainCard({ vehicle, onSelect }) {
  const { registration, ownerLabel, relationship = "Owner", make } = vehicle;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(vehicle)}
      className="w-full min-h-[82px] flex items-center gap-4 bg-[#1b1c21] hover:bg-[#202126] active:scale-[0.99] transition-all rounded-[22px] px-4 py-4 text-left"
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

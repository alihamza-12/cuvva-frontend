import React from "react";
import { Car } from "lucide-react";

const BRAND_LOGOS = {

};

export default function CarBrandIcon({ make, size = 44 }) {
  const key = (make || "").trim().toLowerCase();
  const logoSrc = BRAND_LOGOS[key];

  return (
    <div
      className="shrink-0 rounded-xl bg-[#232429] flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {logoSrc ? (
        <img src={logoSrc} alt={make} className="object-contain w-6 h-6" />
      ) : (
        <Car size={size * 0.45} className="text-[#7c6bff]" strokeWidth={1.8} />
      )}
    </div>
  );
}

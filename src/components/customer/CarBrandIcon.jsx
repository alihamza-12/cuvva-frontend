import React from "react";
import { Car } from "lucide-react";

/**
 * frontend/src/components/customer/CarBrandIcon.jsx
 *
 * Small square icon tile used in Recently Viewed / Buy Again cards.
 * Falls back to a generic Car icon if no brand logo asset exists yet.
 *
 * To match the reference screenshots exactly (Toyota oval logo, BMW
 * roundel), drop brand SVGs into frontend/src/assets/brands/ and map
 * them here, e.g.:
 *   toyota: "/src/assets/brands/toyota.svg"
 *   bmw: "/src/assets/brands/bmw.svg"
 */
const BRAND_LOGOS = {
  // toyota: toyotaLogo,
  // bmw: bmwLogo,
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

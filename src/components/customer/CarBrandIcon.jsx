import { useState } from "react";
import { Car } from "lucide-react";

const BRAND_LOGOS = {

};

export default function CarBrandIcon({ make, imageUrl, size = 44 }) {
  const key = (make || "").trim().toLowerCase();
  const logoSrc = BRAND_LOGOS[key] || imageUrl;
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const canShowImage = logoSrc && failedImageUrl !== logoSrc;

  return (
    <div
      className="shrink-0 rounded-xl bg-[#232429] flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {canShowImage ? (
        <img
          src={logoSrc}
          alt={`${make || "Vehicle"} icon`}
          onError={() => setFailedImageUrl(logoSrc)}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <Car size={size * 0.45} className="text-[#7c6bff]" strokeWidth={1.8} />
      )}
    </div>
  );
}

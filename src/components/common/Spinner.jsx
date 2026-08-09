import React from "react";

export default function Spinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const borderWidth = {
    sm: "3px",
    md: "4px",
    lg: "5px",
  };

  const iconInset = {
    sm: "6px",
    md: "8px",
    lg: "10px",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizeClasses[size]} animate-spin`}>
        {/* Bold purple arc, rotates with the icon */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `${borderWidth[size]} solid transparent`,
            borderTopColor: "#7B5CFA",
          }}
        />
        {/* Icon, inset so there's visible space from the ring */}
        <img
          src="/favicon.png"
          alt="Loading"
          className="absolute object-contain"
          style={{
            inset: iconInset[size],
            width: `calc(100% - ${parseInt(iconInset[size]) * 2}px)`,
            height: `calc(100% - ${parseInt(iconInset[size]) * 2}px)`,
          }}
        />
      </div>
    </div>
  );
}
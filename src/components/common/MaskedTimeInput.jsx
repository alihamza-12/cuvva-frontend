import React, { useState, useEffect } from "react";

/**
 * frontend/src/components/common/MaskedTimeInput.jsx
 *
 * Reusable masked time input in HH:MM format.
 *
 * - Users can click/tab into any position and type over individual
 *   digits without clearing the whole field.
 * - Value contract: `value` is the "HH:MM" string (or ""). The display
 *   matches this format directly.
 */
export const maskTime = (raw) => {
  const digits = String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 4);
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  return digits;
};

export const isFullTime = (value) => /^\d{2}:\d{2}$/.test(value || "");

export default function MaskedTimeInput({
  label,
  value = "",
  onChange,
  required = false,
  className = "",
  accentClass = "focus:border-[#644aff]",
  name,
}) {
  const [display, setDisplay] = useState(value || "");

  useEffect(() => {
    setDisplay(value || "");
  }, [value]);

  const handleChange = (e) => {
    const formatted = maskTime(e.target.value);
    setDisplay(formatted);
    if (onChange) onChange(formatted);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        name={name}
        value={display}
        onChange={handleChange}
        required={required}
        placeholder="HH:MM"
        className={`w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-lg text-xs text-white outline-none ${accentClass} ${className}`}
      />
    </div>
  );
}

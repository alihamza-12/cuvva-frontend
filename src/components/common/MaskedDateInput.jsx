import React, { useState, useEffect } from "react";

export const isoToMasked = (iso) => {
  if (!iso) return "";
  const s = String(iso).split("T")[0];
  const parts = s.split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

export const maskedToIso = (masked) => {
  const digits = String(masked || "").replace(/\D/g, "");
  if (digits.length !== 8) return "";
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
};

export default function MaskedDateInput({
  label,
  value = "",
  onChange,
  required = false,
  className = "",
  accentClass = "focus:border-[#644aff]",
  name,
}) {
  const [display, setDisplay] = useState(isoToMasked(value));

  useEffect(() => {
    setDisplay(isoToMasked(value));
  }, [value]);

  const handleChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDisplay(formatted);
    if (onChange) onChange(maskedToIso(formatted));
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
        placeholder="DD/MM/YYYY"
        className={`w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-lg text-xs text-white outline-none ${accentClass} ${className}`}
      />
    </div>
  );
}

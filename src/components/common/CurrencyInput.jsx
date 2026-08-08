import React, { useState, useEffect } from "react";

/**
 * frontend/src/components/common/CurrencyInput.jsx
 *
 * Reusable formatted GBP currency input.
 *
 * - Display: shows a "£" prefix and formats the value to 2 decimal places
 *   on blur (e.g. typing `123` -> `£123.00`).
 * - Value contract: `value` is the *pounds* string/number (NOT pence).
 *   e.g. value="123" means £123. Use `currencyToPence(value)` before
 *   sending to the backend, and `penceToCurrency(value)` (pence -> pounds)
 *   when pre-filling an edit form from a stored pence amount.
 * - Styling: pass a `className` to match the surrounding dark theme
 *   (super-admin purple / sub-admin cyan). `accentClass` sets the
 *   focus border colour.
 */
export const currencyToPence = (value) => {
  const n = parseFloat(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.round(n * 100);
};

export const penceToCurrency = (pence) => {
  const n = Number(pence);
  if (!Number.isFinite(n) || n == null) return "";
  return (n / 100).toFixed(2);
};

export const formatCurrencyDisplay = (value) => {
  const n = parseFloat(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) return "";
  return n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function CurrencyInput({
  label,
  value = "",
  onChange,
  required = false,
  placeholder = "0.00",
  className = "",
  accentClass = "focus:border-[#644aff]",
  name,
}) {
  // Keep a local editable string so we don't fight the cursor while typing.
  const [display, setDisplay] = useState(value == null ? "" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(value == null ? "" : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/£/g, "");
    // Allow digits + at most one decimal point + up to 2 decimal places.
    raw = raw.replace(/[^\d.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) {
      raw = `${parts[0]}.${parts.slice(1).join("")}`;
    }
    if (parts.length === 2) {
      parts[1] = parts[1].slice(0, 2);
      raw = parts[1] ? `${parts[0]}.${parts[1]}` : parts[0];
    }
    // Limit integer part length to avoid absurd numbers.
    const intPart = raw.split(".")[0];
    if (intPart.length > 10) return;

    setDisplay(raw);
    if (onChange) onChange(raw);
  };

  const handleBlur = () => {
    setFocused(false);
    const formatted = formatCurrencyDisplay(display);
    setDisplay(formatted);
    if (onChange) onChange(formatted);
  };

  const handleFocus = () => {
    setFocused(true);
    // Strip the formatted ".00" while focused so the user can type over it.
    const plain = String(display).replace(/[^\d.]/g, "");
    setDisplay(plain);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b7280] pointer-events-none">
          £
        </span>
        <input
          type="text"
          inputMode="decimal"
          name={name}
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          placeholder={placeholder}
          className={`w-full pl-7 pr-3 py-2 bg-[#060814] border border-[#1e2238] rounded-lg text-xs text-white outline-none ${accentClass} ${className}`}
        />
      </div>
    </div>
  );
}

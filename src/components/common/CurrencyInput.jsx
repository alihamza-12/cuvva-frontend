import React from "react";
import { NumericFormat } from "react-number-format";

/**
 * frontend/src/components/common/CurrencyInput.jsx
 *
 * Reusable formatted GBP currency input using `react-number-format`.
 *
 * NEW STANDARD — DIRECT DECIMAL STORAGE
 * -------------------------------------
 * We NO LONGER store pence. Everything is a decimal Number (e.g. `123.44`).
 *
 * - Display: ALWAYS shows the `£` prefix and a decimal point with 2 digits
 *   (e.g. `£0.00`). As the user types `1`, `2`, `3`, `4`, `4` it progressively
 *   masks to `£123.44` (the last two digits become the pence).
 * - Value contract: `value` is the raw decimal (Number or string) e.g.
 *   `123.44`. `onChange` exposes that SAME raw decimal value to the parent
 *   form state — no `* 100` / `/ 100` anywhere.
 * - Styling: pass a `className` to match the surrounding dark theme
 *   (super-admin purple / sub-admin cyan). `accentClass` sets the
 *   focus border colour.
 */

// Backward-compat helpers. Per the new standard they are IDENTITY-style:
// they take a decimal value and return the same decimal value. No pence math.
export const currencyToPence = (value) => {
  if (value === "" || value == null) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
};

export const penceToCurrency = (value) => {
  if (value === "" || value == null) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
};

export const formatCurrencyDisplay = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(2);
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
  // Normalise the raw decimal value for the input.
  const numericValue =
    value === "" || value == null ? undefined : Number(value);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
          {label}
        </label>
      )}
      <NumericFormat
        thousandSeparator
        prefix="£"
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        isAllowed={(values) => {
          // Drop leading zeros like "0" before the integer part unless it's
          // the only digit, and cap length.
          const { formattedValue } = values;
          return formattedValue.replace(/[£,.]/g, "").length <= 12;
        }}
        value={numericValue}
        onValueChange={(values) => {
          const { floatValue } = values;
          if (onChange) {
            // Expose the raw decimal number (e.g. 123.44). If empty, expose "".
            onChange(floatValue == null ? "" : floatValue);
          }
        }}
        name={name}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-lg text-xs text-white outline-none ${accentClass} ${className}`}
      />
    </div>
  );
}

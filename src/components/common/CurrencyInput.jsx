import React from "react";
import { NumericFormat } from "react-number-format";

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

          const { formattedValue } = values;
          return formattedValue.replace(/[£,.]/g, "").length <= 12;
        }}
        value={numericValue}
        onValueChange={(values) => {
          const { floatValue } = values;
          if (onChange) {

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

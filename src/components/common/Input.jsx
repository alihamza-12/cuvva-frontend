import React from "react";

const Input = React.forwardRef(
  ({ label, type = "text", error, className = "", ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label className="text-xs font-semibold text-cuvva-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`cuvva-input ${error ? "border-cuvva-red focus:border-cuvva-red focus:ring-cuvva-red" : ""}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-cuvva-red font-medium mt-0.5">
            {error.message || error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;

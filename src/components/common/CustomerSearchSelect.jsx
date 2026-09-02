import { useEffect, useMemo, useRef, useState } from "react";
import { Search, User } from "lucide-react";

/*
 * Searchable customer dropdown used by the Create Policy screens.
 * Typing filters the customer list by name / email; the customer is always
 * picked from the dropdown (or left as the previously selected value).
 */
export default function CustomerSearchSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select customer",
  required = false,
  showIcon = true,
  restrictedSuffix = " — Policy creation restricted",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const selected = options.find((option) => option.value === value) || null;

  useEffect(() => {
    const onDocumentMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setEditing(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setEditing(false);
    setQuery("");
  };

  const inputText = editing ? query : selected ? selected.label : "";

  return (
    <div ref={rootRef} className="relative">
      {showIcon && (
        <User
          size={12}
          className="pointer-events-none absolute left-3.5 top-3.5 text-[#6b7280]"
        />
      )}
      <input
        type="text"
        required={required}
        value={inputText}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          setOpen(true);
          setEditing(true);
          setQuery("");
        }}
        onChange={(event) => {
          setEditing(true);
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        className={className}
      />
      {!showIcon && (
        <Search
          size={12}
          className="pointer-events-none absolute right-3 top-3.5 text-[#6b7280]"
        />
      )}

      {open && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[#1e2238] bg-[#0d0f1d] py-1 shadow-2xl">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-xs text-[#6b7280]">
              No customers match “{query}”
            </li>
          )}
          {filtered.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  disabled={option.disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.preventDefault(); // stop <label> wrappers re-focusing the input
                    if (option.disabled) return;
                    onChange(option.value);
                    close();
                  }}
                  className={
                    "block w-full px-3 py-2 text-left text-xs " +
                    (option.disabled
                      ? "cursor-not-allowed text-[#4b5563]"
                      : isSelected
                        ? "bg-[#644aff]/20 text-white"
                        : "text-[#c8c9d1] hover:bg-[#1e2238] hover:text-white")
                  }
                >
                  {option.label}
                  {option.disabled ? restrictedSuffix : ""}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

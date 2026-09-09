import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Car, Loader2, Search } from "lucide-react";

import { getCustomerVehicles } from "../../app/api/customerApi";
import {
  getVehicleByRegistration,
  searchVehicles,
} from "../../app/api/vehicleApi";

/*
 * Vehicle registration dropdown for the Create Policy screens.
 *
 * Built on the same pattern as CustomerSearchSelect (rootRef click-outside,
 * Escape to close, identical Tailwind classes) so it looks native to the app.
 *
 * THREE-LEVEL CASCADE — each level only runs if the previous one found nothing:
 *
 *   1. The customer's own vehicle history .... instant, already fetched
 *   2. Our Vehicle collection ................ GET /api/vehicles/search
 *   3. RegCheck .............................. handled by the parent, since it
 *                                              costs a paid credit per call
 *
 * Level 1 filtering is always synchronous. Levels 2 and 3 are debounced and
 * abortable so a slow stale response can never overwrite a newer one.
 */

const DEBOUNCE_MS = 400;

const cleanRegistration = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const formatLastUsed = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const describeVehicle = (vehicle) => {
  const parts = [vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  const year = vehicle?.yearOfManufacture
    ? ` (${vehicle.yearOfManufacture})`
    : "";
  return `${parts || "Unknown vehicle"}${year}`;
};

export default function VehicleRegistrationSelect({
  customerId,
  value = "",
  onSelectVehicle,
  onRegistrationChange,
  onRequestExternalLookup,
  disabled = false,
  accentBorder = "focus:border-[#644aff]",
  accentSelected = "bg-[#644aff]/20",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [historyState, setHistoryState] = useState("idle");
  const [historyError, setHistoryError] = useState("");
  const [dbMatches, setDbMatches] = useState([]);
  const [stage, setStage] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  /* ---------------- history load (resets whenever the customer changes) ---- */
  useEffect(() => {
    setQuery("");
    setHistory([]);
    setDbMatches([]);
    setHistoryError("");
    setActiveIndex(-1);

    if (!customerId) {
      setHistoryState("idle");
      return undefined;
    }

    const controller = new AbortController();
    setHistoryState("loading");

    getCustomerVehicles(customerId, { signal: controller.signal })
      .then((response) => {
        setHistory(response.data?.vehicles || []);
        setHistoryState("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted || error.code === "ERR_CANCELED") return;
        setHistoryState("error");
        setHistoryError(
          error.response?.data?.message ||
            "Could not load this customer's previous vehicles.",
        );
      });

    return () => controller.abort();
  }, [customerId]);

  /* ---------------- click outside / escape -------------------------------- */
  useEffect(() => {
    const onDocumentMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    },
    [],
  );

  /* ---------------- level 1: instant local filter -------------------------- */
  const filteredHistory = useMemo(() => {
    const q = cleanRegistration(query);
    if (!q) return history;
    return history.filter((vehicle) =>
      cleanRegistration(vehicle.registration).includes(q),
    );
  }, [history, query]);

  /* ---------------- levels 2 + 3: debounced, abortable --------------------- */
  const runCascade = useCallback(
    (rawQuery) => {
      const cleaned = cleanRegistration(rawQuery);
      if (abortRef.current) abortRef.current.abort();
      setDbMatches([]);

      if (!cleaned || cleaned.length < 2) {
        setStage("");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setStage("database");

      searchVehicles(cleaned, { signal: controller.signal })
        .then((response) => {
          if (controller.signal.aborted) return;
          const found = response.data?.vehicles || [];
          setDbMatches(found);
          setStage(found.length ? "" : "none");
        })
        .catch((error) => {
          if (controller.signal.aborted || error.code === "ERR_CANCELED") return;
          setDbMatches([]);
          setStage("none");
        });
    },
    [],
  );

  const handleQueryChange = (rawValue) => {
    const cleaned = cleanRegistration(rawValue);
    setQuery(cleaned);
    setOpen(true);
    setActiveIndex(-1);
    if (onRegistrationChange) onRegistrationChange(cleaned);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    // Level 1 is synchronous above. Only the network steps are debounced.
    const hasLocalMatch = history.some((vehicle) =>
      cleanRegistration(vehicle.registration).includes(cleaned),
    );
    if (!cleaned || hasLocalMatch) {
      setDbMatches([]);
      setStage("");
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    debounceRef.current = window.setTimeout(
      () => runCascade(cleaned),
      DEBOUNCE_MS,
    );
  };

  /* ---------------- selection --------------------------------------------- */
  const selectVehicle = (vehicle) => {
    if (!vehicle) return;
    setQuery(cleanRegistration(vehicle.registration));
    setOpen(false);
    setActiveIndex(-1);
    setStage("");
    // The vehicle already exists in MongoDB, so the parent can resolve it
    // straight away — no Search press, no "save vehicle details" step.
    if (onSelectVehicle) onSelectVehicle(vehicle);
  };

  /* Flat list backing keyboard navigation. */
  const options = useMemo(
    () => [
      ...filteredHistory.map((vehicle) => ({ vehicle, group: "history" })),
      ...dbMatches
        .filter(
          (vehicle) =>
            !filteredHistory.some(
              (existing) => String(existing._id) === String(vehicle._id),
            ),
        )
        .map((vehicle) => ({ vehicle, group: "database" })),
    ],
    [filteredHistory, dbMatches],
  );

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      if (activeIndex >= 0 && options[activeIndex]) {
        event.preventDefault();
        selectVehicle(options[activeIndex].vehicle);
        return;
      }
      // Nothing highlighted: fall through to the paid RegCheck lookup.
      if (query && onRequestExternalLookup) {
        event.preventDefault();
        setOpen(false);
        onRequestExternalLookup(cleanRegistration(query));
      }
    }
  };

  const isDisabled = disabled || !customerId;

  const renderRow = (vehicle, group, index) => {
    const lastUsed = formatLastUsed(vehicle.lastUsedAt);
    const isActive = index === activeIndex;
    return (
      <li key={`${group}-${vehicle._id}`} role="none">
        <button
          type="button"
          role="option"
          id={`vehicle-option-${index}`}
          aria-selected={isActive}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            selectVehicle(vehicle);
          }}
          className={
            "block w-full px-3 py-2 text-left text-xs " +
            (isActive
              ? `${accentSelected} text-white`
              : "text-[#c8c9d1] hover:bg-[#1e2238] hover:text-white")
          }
        >
          <span className="font-mono text-[13px] font-bold tracking-wider text-white">
            {vehicle.registration}
          </span>
          <span className="mt-0.5 block text-[11px] text-[#8a8fbc]">
            {describeVehicle(vehicle)}
            {vehicle.colour ? ` · ${vehicle.colour}` : ""}
          </span>
          {group === "history" && lastUsed && (
            <span className="mt-0.5 block text-[10px] text-[#6b7280]">
              Last insured {lastUsed}
              {vehicle.policyCount
                ? ` · ${vehicle.policyCount} ${
                    vehicle.policyCount === 1 ? "policy" : "policies"
                  }`
                : ""}
            </span>
          )}
        </button>
      </li>
    );
  };

  const historyRows = filteredHistory.map((vehicle, index) =>
    renderRow(vehicle, "history", index),
  );
  const dbRows = options
    .map((option, index) => ({ ...option, index }))
    .filter((option) => option.group === "database")
    .map((option) => renderRow(option.vehicle, "database", option.index));

  return (
    <div ref={rootRef} className="relative">
      <Car
        size={14}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]"
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="vehicle-registration-listbox"
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `vehicle-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        disabled={isDisabled}
        value={query || value || ""}
        placeholder={
          isDisabled ? "Select a customer first" : "ENTER REGISTRATION"
        }
        onFocus={() => !isDisabled && setOpen(true)}
        onChange={(event) => handleQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {stage === "database" && (
        <Loader2
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#6b7280]"
        />
      )}

      {open && !isDisabled && (
        <ul
          id="vehicle-registration-listbox"
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#1e2238] bg-[#0d0f1d] py-1 shadow-2xl"
        >
          {historyState === "loading" && (
            <li className="flex items-center gap-2 px-3 py-2 text-xs text-[#6b7280]">
              <Loader2 size={12} className="animate-spin" />
              Loading previous vehicles…
            </li>
          )}

          {historyState === "error" && (
            <li className="px-3 py-2 text-xs text-red-400">{historyError}</li>
          )}

          {historyState === "ready" && history.length === 0 && !query && (
            <li className="px-3 py-2 text-xs text-[#6b7280]">
              No previous vehicles for this customer — type a registration.
            </li>
          )}

          {historyRows.length > 0 && (
            <>
              <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                Previous vehicles
              </li>
              {historyRows}
            </>
          )}

          {query && historyRows.length === 0 && historyState === "ready" && (
            <li className="border-t border-[#1e2238] px-3 py-2 text-[11px] text-[#6b7280]">
              Not in this customer&apos;s history — press Enter or click Search
              to look further
            </li>
          )}

          {stage === "database" && (
            <li className="flex items-center gap-2 px-3 py-2 text-xs text-[#6b7280]">
              <Loader2 size={12} className="animate-spin" />
              Searching database…
            </li>
          )}

          {dbRows.length > 0 && (
            <>
              <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                Found in database
              </li>
              {dbRows}
            </>
          )}

          {stage === "none" && query && (
            <li className="border-t border-[#1e2238]">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  if (onRequestExternalLookup) {
                    onRequestExternalLookup(cleanRegistration(query));
                  }
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#c8c9d1] hover:bg-[#1e2238] hover:text-white"
              >
                <Search size={12} />
                Not found locally — check RegCheck for “{query}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

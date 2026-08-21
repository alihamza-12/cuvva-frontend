import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

export const isValidMaskedDate = (masked) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(
    String(masked || "").trim(),
  );
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12 || day < 1) return false;

  return day <= new Date(year, month, 0).getDate();
};

export const isoToMasked = (iso) => {
  if (!iso) return "";

  const datePart = String(iso).split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return "";

  const [year, month, day] = parts;
  if (
    !/^\d{4}$/.test(year) ||
    !/^\d{2}$/.test(month) ||
    !/^\d{2}$/.test(day)
  ) {
    return "";
  }

  const masked = `${day}/${month}/${year}`;
  return isValidMaskedDate(masked) ? masked : "";
};

export const maskedToIso = (masked) => {
  if (!isValidMaskedDate(masked)) return "";

  const digits = String(masked).replace(/\D/g, "");
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (iso) => {
  const datePart = String(iso || "").split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getCalendarCells = (month) => {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
};

const openPopovers = new Set();
let popoverSequence = 0;

export default function MaskedDateInput({
  label,
  value = "",
  onChange,
  required = false,
  className = "",
  accentClass = "focus:border-[#644aff]",
  name,
  disablePast = false,
}) {
  const [display, setDisplay] = useState(() => isoToMasked(value));
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => parseIsoDate(value) || new Date(),
  );
  const [placement, setPlacement] = useState({
    above: false,
    left: 0,
    width: 320,
  });

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const instanceRef = useRef(null);
  if (!instanceRef.current) {
    instanceRef.current = { id: ++popoverSequence, close: () => {} };
  }

  const isCyan = String(accentClass).includes("00f0ff");
  const selectedDate = parseIsoDate(value);
  const cells = useMemo(() => getCalendarCells(visibleMonth), [visibleMonth]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const typedDate = parseIsoDate(maskedToIso(display));
  const typedDateIsPast = Boolean(
    disablePast && typedDate && typedDate.getTime() < today.getTime(),
  );
  const showInvalid =
    display !== "" && (!isValidMaskedDate(display) || typedDateIsPast);
  const canGoToPreviousMonth =
    !disablePast ||
    startOfMonth(visibleMonth).getTime() > startOfMonth(today).getTime();
  const dateIsDisabled = (date) =>
    disablePast && date.getTime() < today.getTime();

  const close = useCallback(() => setIsOpen(false), []);

  const open = useCallback(() => {
    setVisibleMonth(parseIsoDate(valueRef.current) || new Date());

    const root = rootRef.current;
    if (root) {
      const rect = root.getBoundingClientRect();
      const popupWidth = Math.min(320, window.innerWidth - 16);
      const desiredLeft = Math.min(
        Math.max(rect.left, 8),
        window.innerWidth - popupWidth - 8,
      );
      const above =
        rect.bottom + 360 > window.innerHeight && rect.top > 360;

      setPlacement({
        above,
        left: desiredLeft - rect.left,
        width: popupWidth,
      });
    }

    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    instanceRef.current.close = close;
    openPopovers.forEach((entry) => {
      if (entry !== instanceRef.current) entry.close();
    });
    openPopovers.add(instanceRef.current);

    return () => {
      openPopovers.delete(instanceRef.current);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        close();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setDisplay(isoToMasked(value));
  }, [value]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.setCustomValidity(
      typedDateIsPast
        ? "Past dates cannot be selected for a policy."
        : showInvalid
          ? "Enter a valid date in DD/MM/YYYY format."
          : "",
    );
  }, [showInvalid, typedDateIsPast]);

  const handleChange = (event) => {
    const digits = String(event.target.value).replace(/\D/g, "").slice(0, 8);
    let formatted = digits;

    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    setDisplay(formatted);

    const iso = maskedToIso(formatted);
    const parsedDate = parseIsoDate(iso);
    if (onChange) {
      onChange(parsedDate && !dateIsDisabled(parsedDate) ? iso : "");
    }
  };

  const handleBlur = () => {
    if (!display) return;

    const iso = maskedToIso(display);
    const parsedDate = parseIsoDate(iso);
    if (iso && parsedDate && !dateIsDisabled(parsedDate)) {
      setDisplay(isoToMasked(iso));
      if (onChange) onChange(iso);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      return;
    }

    if (
      !isOpen &&
      (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      open();
    }
  };

  const restoreInputFocus = () => {
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSelect = (date) => {
    if (dateIsDisabled(date)) return;

    const iso = format(date, "yyyy-MM-dd");
    setDisplay(format(date, "dd/MM/yyyy"));
    if (onChange) onChange(iso);
    close();
    restoreInputFocus();
  };

  const handleToday = () => handleSelect(new Date());

  const handleClear = () => {
    setDisplay("");
    if (onChange) onChange("");
    close();
    restoreInputFocus();
  };

  const selectedClass = isCyan
    ? "bg-[#00f0ff] text-black"
    : "bg-[#644aff] text-white";
  const todayClass = isCyan
    ? "ring-1 ring-inset ring-[#00f0ff] text-[#9ff7ff]"
    : "ring-1 ring-inset ring-[#644aff] text-[#c4b5fd]";
  const focusRing = isCyan
    ? "focus-visible:ring-[#00f0ff]"
    : "focus-visible:ring-[#644aff]";
  const iconHover = isCyan
    ? "hover:text-[#00f0ff]"
    : "hover:text-[#644aff]";
  const dayBaseClass = `flex h-10 w-full items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d0f1d] ${focusRing}`;

  return (
    <div ref={rootRef} className="relative flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          name={name}
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          onClick={open}
          onKeyDown={handleInputKeyDown}
          required={required}
          aria-invalid={showInvalid || undefined}
          aria-label={label || undefined}
          placeholder="DD/MM/YYYY"
          className={`w-full min-h-[44px] rounded-lg border bg-[#060814] px-3 py-2 pr-10 text-xs text-white outline-none placeholder:text-[#4a4f7a] ${showInvalid ? "border-red-500/60" : "border-[#1e2238]"} ${accentClass} ${className}`}
        />

        <button
          type="button"
          aria-label={label ? `Open calendar for ${label}` : "Open calendar"}
          onClick={() => (isOpen ? close() : open())}
          className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8a8fbc] outline-none focus-visible:ring-2 ${iconHover} ${focusRing}`}
        >
          <CalendarDays size={16} aria-hidden="true" />
        </button>

        {isOpen && (
          <div
            role="dialog"
            aria-label="Choose date"
            className={`absolute z-50 ${placement.above ? "bottom-full mb-2" : "top-full mt-2"} rounded-xl border border-[#1e2238] bg-[#0d0f1d] p-3 shadow-2xl shadow-black/60`}
            style={{
              left: placement.left,
              width: placement.width,
              maxWidth: "calc(100vw - 1rem)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
                disabled={!canGoToPreviousMonth}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8fbc] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#8a8fbc] ${focusRing}`}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>

              <div className="text-xs font-bold tracking-wider text-white uppercase">
                {format(visibleMonth, "MMMM yyyy")}
              </div>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8fbc] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {WEEKDAY_LABELS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((date) => {
                const muted = !isSameMonth(date, visibleMonth);
                const isSelected = Boolean(
                  selectedDate && isSameDay(date, selectedDate),
                );
                const isTodayDate = isToday(date);
                const isDisabled = dateIsDisabled(date);

                let dayClass = muted
                  ? "text-[#4a4f7a] hover:bg-white/5"
                  : "text-white hover:bg-white/5";
                if (isTodayDate) dayClass = todayClass;
                if (isSelected) {
                  dayClass = `${selectedClass} hover:opacity-90`;
                }
                if (isDisabled) {
                  dayClass =
                    "cursor-not-allowed text-[#34384f] opacity-40 hover:bg-transparent";
                }

                return (
                  <button
                    key={format(date, "yyyy-MM-dd")}
                    type="button"
                    aria-label={format(date, "EEEE d MMMM yyyy")}
                    aria-pressed={isSelected || undefined}
                    aria-current={isTodayDate ? "date" : undefined}
                    aria-disabled={isDisabled || undefined}
                    disabled={isDisabled}
                    onClick={() => handleSelect(date)}
                    className={`${dayBaseClass} ${dayClass}`}
                  >
                    {format(date, "d")}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-[#1e2238] pt-2">
              <button
                type="button"
                onClick={handleToday}
                className={`min-h-[36px] rounded-lg px-3 text-[11px] font-bold uppercase tracking-wider text-[#8a8fbc] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={handleClear}
                className={`min-h-[36px] rounded-lg px-3 text-[11px] font-bold uppercase tracking-wider text-[#8a8fbc] transition-colors hover:bg-white/5 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


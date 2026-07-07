import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * frontend/src/components/customer/StartTimePickerSheet.jsx
 *
 * Bottom-sheet "Start" picker — mirrors DurationPickerSheet.jsx's pattern
 * (backdrop + slide-up sheet + scroll-snap wheels), but offers two modes:
 *
 *   1. "Immediately" — radio option, starts at time of payment (default).
 *   2. "Choose time"  — radio option, reveals a 3-column scroll-snap wheel
 *      (Date / Hour / Minute) letting the customer schedule a future
 *      start within the next 4 weeks, exactly like the reference screenshot.
 *
 * Props:
 *  - open: boolean
 *  - initialMode: "immediate" | "scheduled"
 *  - initialDate: Date | null   (only relevant when mode === "scheduled")
 *  - onClose: () => void
 *  - onConfirm: (result: { mode: "immediate" } | { mode: "scheduled", date: Date }) => void
 */

const ITEM_HEIGHT = 44;
const MINUTE_STEP = 15; // matches screenshot: :00, :15, :30, :45
const WEEKS_AHEAD = 4;

// Builds the scrollable date list: Today + next (WEEKS_AHEAD * 7) days.
function buildDateOptions() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < WEEKS_AHEAD * 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateLabel(date, isToday) {
  if (isToday) return "Today";
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString(undefined, { month: "short" });
  return `${weekday} ${day} ${month}`;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, i) => i * MINUTE_STEP,
);

function WheelColumn({ options, renderLabel, selectedIndex, onSettle, width }) {
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
      }
    });
    // Only run when selectedIndex changes externally (e.g. sheet open) —
    // internal scroll-driven updates shouldn't re-trigger this jump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const index = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.min(Math.max(index, 0), options.length - 1);
      onSettle(clamped);
      scrollRef.current.scrollTo({
        top: clamped * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }, 90);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
      style={{ height: ITEM_HEIGHT * 3, width, scrollBehavior: "smooth" }}
    >
      <div style={{ height: ITEM_HEIGHT }} />
      {options.map((opt, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center snap-center"
          style={{ height: ITEM_HEIGHT }}
        >
          <span
            className={`text-[17px] transition-all duration-150 ${
              idx === selectedIndex
                ? "text-white font-bold"
                : "text-white/30 font-medium"
            }`}
          >
            {renderLabel(opt)}
          </span>
        </div>
      ))}
      <div style={{ height: ITEM_HEIGHT }} />
    </div>
  );
}

export default function StartTimePickerSheet({
  open,
  initialMode = "immediate",
  initialDate = null,
  onClose,
  onConfirm,
}) {
  const [mode, setMode] = useState(initialMode);

  const dateOptions = useMemo(() => buildDateOptions(), [open]);

  const defaultDateIndex = 0; // "Today"
  const defaultHourIndex = new Date().getHours();
  const defaultMinuteIndex = 0;

  const [dateIndex, setDateIndex] = useState(defaultDateIndex);
  const [hourIndex, setHourIndex] = useState(defaultHourIndex);
  const [minuteIndex, setMinuteIndex] = useState(defaultMinuteIndex);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    if (initialDate) {
      const idx = dateOptions.findIndex(
        (d) => d.toDateString() === initialDate.toDateString(),
      );
      setDateIndex(idx >= 0 ? idx : 0);
      setHourIndex(initialDate.getHours());
      setMinuteIndex(Math.round(initialDate.getMinutes() / MINUTE_STEP));
    }
  }, [open, initialMode, initialDate, dateOptions]);

  const selectedDate = dateOptions[dateIndex];
  const selectedHour = HOUR_OPTIONS[hourIndex];
  const selectedMinute = MINUTE_OPTIONS[minuteIndex];

  const scheduledDate = useMemo(() => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate);
    d.setHours(selectedHour, selectedMinute, 0, 0);
    return d;
  }, [selectedDate, selectedHour, selectedMinute]);

  const handleNext = () => {
    if (mode === "immediate") {
      onConfirm?.({ mode: "immediate" });
    } else {
      onConfirm?.({ mode: "scheduled", date: scheduledDate });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[420px] bg-[#111216] rounded-t-3xl pb-6 animate-[slideUp_0.25s_ease-out]">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 rounded-full w-9 bg-white/20" />
        </div>

        <div className="px-5 pt-2 pb-4">
          <h2 className="text-[20px] font-extrabold text-white">Start</h2>
        </div>

        {/* Immediately option */}
        <button
          type="button"
          onClick={() => setMode("immediate")}
          className="w-full flex items-center gap-3 px-5 py-3.5"
        >
          <span className="text-lg">⚡</span>
          <div className="flex-1 text-left">
            <div className="text-[15px] font-semibold text-white">
              Immediately
            </div>
            <div className="text-[12px] text-[#8b8d98]">
              Starts at time of payment
            </div>
          </div>
          <RadioDot active={mode === "immediate"} />
        </button>

        <div className="h-px mx-5 bg-white/5" />

        {/* Choose time option */}
        <button
          type="button"
          onClick={() => setMode("scheduled")}
          className="w-full flex items-center gap-3 px-5 py-3.5"
        >
          <span className="text-lg">🕐</span>
          <div className="flex-1 text-left">
            <div className="text-[15px] font-semibold text-white">
              Choose time
            </div>
            <div className="text-[12px] text-[#8b8d98]">
              Starting within the next {WEEKS_AHEAD} weeks
            </div>
          </div>
          <RadioDot active={mode === "scheduled"} />
        </button>

        {/* Triple wheel: Date / Hour / Minute — only shown in scheduled mode */}
        {mode === "scheduled" && (
          <div className="relative px-5 mt-2">
            <div
              className="pointer-events-none absolute left-5 right-5 top-1/2 -translate-y-1/2 rounded-2xl bg-white/[0.06]"
              style={{ height: ITEM_HEIGHT }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#111216] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#111216] to-transparent z-10" />

            <div className="relative flex justify-center gap-1">
              <WheelColumn
                options={dateOptions}
                renderLabel={(d) =>
                  formatDateLabel(
                    d,
                    d.toDateString() === new Date().toDateString(),
                  )
                }
                selectedIndex={dateIndex}
                onSettle={setDateIndex}
                width={140}
              />
              <WheelColumn
                options={HOUR_OPTIONS}
                renderLabel={(h) => String(h).padStart(2, "0")}
                selectedIndex={hourIndex}
                onSettle={setHourIndex}
                width={70}
              />
              <WheelColumn
                options={MINUTE_OPTIONS}
                renderLabel={(m) => String(m).padStart(2, "0")}
                selectedIndex={minuteIndex}
                onSettle={setMinuteIndex}
                width={70}
              />
            </div>
          </div>
        )}

        <div className="px-5 pt-5">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[15px] font-bold text-white"
          >
            Next
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function RadioDot({ active }) {
  return (
    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        active ? "border-[#7c6bff]" : "border-white/30"
      }`}
    >
      {active && <span className="w-2.5 h-2.5 rounded-full bg-[#7c6bff]" />}
    </span>
  );
}

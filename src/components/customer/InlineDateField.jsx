import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

/**
 * frontend/src/components/customer/InlineDateField.jsx
 *
 * "Date" field for AddIncidentPage.jsx — matches the reference
 * screenshot exactly: a pill row showing the selected date, which
 * expands inline (not a bottom sheet) into a full month calendar grid
 * with a blue-circle highlight on the selected day and </> month
 * navigation arrows in both the field header row and the calendar
 * header row.
 *
 * Props:
 *  - value: Date
 *  - onChange: (date: Date) => void
 *  - open: boolean
 *  - onToggle: () => void
 */
const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function formatFieldLabel(date) {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function InlineDateField({ value, onChange, open, onToggle }) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePickDay = (day) => {
    if (!day) return;
    const picked = new Date(viewYear, viewMonth, day);
    // Incidents must be dated today or in the past (can't declare a
    // future incident) — clamp to today if somehow exceeded.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange(picked > today ? today : picked);
  };

  const cells = buildMonthGrid(viewYear, viewMonth);
  const isSameDay = (day) =>
    day === value.getDate() &&
    viewMonth === value.getMonth() &&
    viewYear === value.getFullYear();

  return (
    <div className="rounded-2xl bg-[#242429] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="text-left">
          <span className="block text-[12px] font-semibold text-[#7c6bff]">
            Date
          </span>
          <span className="block text-[16px] text-white mt-0.5">
            {formatFieldLabel(value)}
          </span>
        </div>
        <ChevronsUpDown size={16} className="text-[#5c5e68] shrink-0" />
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex items-center gap-1 text-[16px] font-bold text-white"
            >
              {monthLabel}
              <ChevronRight size={16} className="text-[#4a90ff]" />
            </button>
            <div className="flex items-center gap-4">
              <button type="button" onClick={goPrevMonth} aria-label="Previous month">
                <ChevronLeft size={18} className="text-[#4a90ff]" />
              </button>
              <button type="button" onClick={goNextMonth} aria-label="Next month">
                <ChevronRight size={18} className="text-[#4a90ff]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-3 mt-4">
            {WEEKDAY_LABELS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-bold text-[#8a8a92] text-center"
              >
                {wd}
              </span>
            ))}
            {cells.map((day, i) => (
              <div key={i} className="flex items-center justify-center">
                {day && (
                  <button
                    type="button"
                    onClick={() => handlePickDay(day)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] transition-colors ${
                      isSameDay(day)
                        ? "bg-[#3b82f6] text-white font-bold"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

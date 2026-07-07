import React, { useEffect, useMemo, useRef, useState } from "react";
import { calculatePremium } from "../../utils/calculatePremium";

/**
 * frontend/src/components/customer/DurationPickerSheet.jsx
 *
 * Bottom-sheet duration picker — an iOS-style scroll-snap "wheel" of
 * duration options (1 hour, 2 hours, 3 hours, 6 hours, 24 hours...).
 * The price shown at the bottom recalculates LIVE as the user scrolls
 * to a new option, using the same calculatePremium() engine that
 * powers QuoteReviewPage.jsx — so the number is never a guess, and the
 * two screens can never drift out of sync with each other.
 *
 * Props:
 *  - open: boolean
 *  - vehicle: { year, engineCapacityCC, powerBHP }
 *  - coverageType: "Comprehensive" | "Third Party Only"
 *  - initialHours: number (currently selected duration when the sheet opens)
 *  - onClose: () => void
 *  - onConfirm: (hours: number, premiumGBP: number) => void
 */
const DURATION_OPTIONS_HOURS = [1, 2, 3, 6, 24];
const ITEM_HEIGHT = 44; // px — must match the CSS below

export default function DurationPickerSheet({
  open,
  vehicle = {},
  coverageType = "Comprehensive",
  initialHours = 1,
  onClose,
  onConfirm,
}) {
  const [selectedHours, setSelectedHours] = useState(initialHours);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSelectedHours(initialHours);
    // Wait for the sheet to mount before scrolling to the initial position.
    requestAnimationFrame(() => {
      const index = DURATION_OPTIONS_HOURS.indexOf(initialHours);
      if (scrollRef.current && index >= 0) {
        scrollRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    });
  }, [open, initialHours]);

  const quote = useMemo(
    () => calculatePremium({ durationHours: selectedHours, vehicle, coverageType }),
    [selectedHours, vehicle, coverageType],
  );

  const endsAtLabel = useMemo(() => {
    const end = new Date(Date.now() + selectedHours * 60 * 60 * 1000);
    const isToday = end.toDateString() === new Date().toDateString();
    const time = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    return isToday ? `Ends today, ${time}` : `Ends ${end.toLocaleDateString()}, ${time}`;
  }, [selectedHours]);

  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const index = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.min(Math.max(index, 0), DURATION_OPTIONS_HOURS.length - 1);
      const hours = DURATION_OPTIONS_HOURS[clamped];
      setSelectedHours(hours);
      // Snap precisely in case of a partial scroll settle.
      scrollRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
    }, 90);
  };

  const formatDurationLabel = (h) => (h === 1 ? "1 hour" : `${h} hours`);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-[420px] bg-[#111216] rounded-t-3xl pb-6 animate-[slideUp_0.25s_ease-out]">
        {/* Grabber */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 rounded-full w-9 bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-white/5">
          <h2 className="text-[20px] font-extrabold text-white">Duration</h2>
          <span className="text-[14px] font-semibold text-white/90">{endsAtLabel}</span>
        </div>

        {/* Wheel picker */}
        <div className="relative py-3">
          {/* Center highlight band */}
          <div
            className="pointer-events-none absolute left-4 right-4 top-1/2 -translate-y-1/2 rounded-2xl bg-white/[0.06]"
            style={{ height: ITEM_HEIGHT }}
          />

          {/* Fade masks top/bottom */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#111216] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#111216] to-transparent z-10" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
            style={{
              height: ITEM_HEIGHT * 3, // shows 3 rows: prev / selected / next
              scrollBehavior: "smooth",
            }}
          >
            {/* Top spacer so the first item can scroll into the center band */}
            <div style={{ height: ITEM_HEIGHT }} />

            {DURATION_OPTIONS_HOURS.map((hours) => (
              <div
                key={hours}
                className="flex items-center justify-center snap-center"
                style={{ height: ITEM_HEIGHT }}
              >
                <span
                  className={`text-[17px] transition-all duration-150 ${
                    hours === selectedHours
                      ? "text-white font-bold"
                      : "text-white/30 font-medium"
                  }`}
                >
                  {formatDurationLabel(hours)}
                </span>
              </div>
            ))}

            {/* Bottom spacer so the last item can scroll into the center band */}
            <div style={{ height: ITEM_HEIGHT }} />
          </div>
        </div>

        {/* Footer: live price + Done */}
        <div className="flex items-center justify-between px-5 pt-4 mt-2 border-t border-white/5">
          <span className="text-[20px] font-extrabold text-white">
            £{quote.premiumGBP.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => onConfirm?.(selectedHours, quote.premiumGBP)}
            className="px-10 py-3.5 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[15px] font-bold text-white"
          >
            Done
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

import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

/**
 * frontend/src/components/customer/InlineWheelField.jsx
 *
 * Reusable "pill row that expands into an inline scroll-snap wheel"
 * field, matching the exact pattern seen throughout the reference
 * "Add incident" screenshots: "Type of incident", "Was anyone
 * injured?", "Who was at fault?", and "What was stolen?" all use this
 * same interaction — tap the collapsed pill -> it expands in place
 * (pushing content below it down, NOT a bottom-sheet overlay) into a
 * 3-row scroll-snap wheel with a translucent highlight band around
 * the center row -> tapping/scrolling to a value selects it and the
 * field can be tapped again to collapse.
 *
 * Props:
 *  - label: string — small label shown above the value once a value
 *    is chosen (purple, matches "Type of incident" reference styling)
 *  - placeholder: string — shown instead of label+value when nothing
 *    is selected yet
 *  - options: Array<{ value: string, label: string }>
 *  - value: string | null — currently selected option's value
 *  - onChange: (value: string) => void
 *  - open: boolean — controlled expand/collapse state
 *  - onToggle: () => void
 *
 * SELECTION IS TAP-ONLY (by explicit instruction) — scrolling the
 * wheel is purely for browsing/previewing options, it never fires
 * onChange by itself. Earlier version auto-selected whatever option
 * ended up centered ~90ms after scroll momentum stopped, which caused
 * two bugs: (1) values got selected accidentally just from scrolling
 * past them, and (2) that auto-select's own corrective
 * `scrollTo({behavior:"smooth"})` call was still animating when the
 * user's next tap landed, so the tap on a different option got
 * swallowed/ignored — making it look like you "couldn't reselect".
 * Removing the scroll-driven onChange fixes both: there's no
 * competing programmatic scroll animation to race against a tap
 * anymore, so every tap (first selection or changing your mind
 * afterwards) registers immediately and reliably.
 */
const ITEM_HEIGHT = 44;

export default function InlineWheelField({
  label,
  placeholder,
  options,
  value,
  onChange,
  open,
  onToggle,
}) {
  const scrollRef = useRef(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Tap-to-select: this is the ONLY place onChange is ever called.
  // Also gently re-centers the wheel on the tapped option — since
  // this scrollTo is triggered directly by the same user tap (not a
  // separate debounced timer racing the next interaction), it can't
  // block or swallow a subsequent tap the way the old auto-select did.
  const handleSelect = (opt, index) => {
    onChange(opt.value);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
    }
  };

  return (
    <div className="rounded-2xl bg-[#242429] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="text-left">
          {selectedOption ? (
            <>
              <span className="block text-[12px] font-semibold text-[#7c6bff]">
                {label}
              </span>
              <span className="block text-[16px] text-white mt-0.5">
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-[16px] text-[#8a8a92]">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown size={16} className="text-[#5c5e68] shrink-0" />
      </button>

      {open && (
        <div className="relative border-t border-white/5">
          {/* Center highlight band */}
          <div
            className="pointer-events-none absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/[0.06]"
            style={{ height: ITEM_HEIGHT }}
          />
          {/* Fade masks */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#242429] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#242429] to-transparent z-10" />

          <div
            ref={scrollRef}
            className="relative overflow-y-scroll snap-y snap-mandatory wheel-scrollbar-hide"
            style={{ height: ITEM_HEIGHT * 3, scrollBehavior: "smooth" }}
          >
            <div style={{ height: ITEM_HEIGHT }} />
            {options.map((opt, index) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt, index)}
                className="snap-center w-full flex items-center justify-center"
                style={{ height: ITEM_HEIGHT }}
              >
                <span
                  className={`text-[16px] transition-all duration-150 ${
                    opt.value === value
                      ? "text-white font-bold"
                      : "text-white/30 font-medium"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
            <div style={{ height: ITEM_HEIGHT }} />
          </div>
        </div>
      )}

      <style>{`
        .wheel-scrollbar-hide::-webkit-scrollbar { display: none; }
        .wheel-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

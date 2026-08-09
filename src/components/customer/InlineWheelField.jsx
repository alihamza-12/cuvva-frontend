import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

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

          <div
            className="pointer-events-none absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/[0.06]"
            style={{ height: ITEM_HEIGHT }}
          />
          
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

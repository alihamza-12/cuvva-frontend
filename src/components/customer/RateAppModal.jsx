import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Star, Sparkles } from "lucide-react";
import { getAppRating, saveAppRating } from "../../utils/profileLocalStorage";

export default function RateAppModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const existing = getAppRating();
    if (existing) setRating(existing);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const activeStar = hovered || rating;

  const captionForRating = (n) => {
    switch (n) {
      case 1:
        return "Sorry to hear that";
      case 2:
        return "We'll try to do better";
      case 3:
        return "Thanks for the feedback";
      case 4:
        return "Glad you're enjoying it";
      case 5:
        return "Amazing, thank you!";
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;

    saveAppRating(rating);
    setSubmitted(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative w-full bg-[#1c1d22] rounded-t-3xl px-6 pt-4 pb-8 z-10 text-center">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="w-14 h-14 rounded-full bg-[#7c6bff]/15 flex items-center justify-center mx-auto mt-1">
          <Sparkles size={24} className="text-[#7c6bff]" />
        </div>

        <h2 className="text-[22px] font-extrabold text-white mt-4">
          Enjoying Cuvva?
        </h2>
        <p className="text-[15px] text-[#9497a1] mt-2 leading-relaxed max-w-[280px] mx-auto">
          Let us know how we're doing — it only takes a second.
        </p>

        <div className="flex items-center justify-center gap-3 mt-7">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= activeStar;
            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setSubmitted(false);
                }}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                className="p-1 transition-transform active:scale-90"
                style={{ transform: filled ? "scale(1.08)" : "scale(1)" }}
              >
                <Star
                  size={38}
                  className={`transition-colors ${
                    filled ? "text-[#f5b400] drop-shadow-[0_0_6px_rgba(245,180,0,0.45)]" : "text-[#3a3a41]"
                  }`}
                  fill={filled ? "#f5b400" : "none"}
                  strokeWidth={filled ? 0 : 1.5}
                />
              </button>
            );
          })}
        </div>

        <div className="h-[20px] mt-3">
          {activeStar > 0 && (
            <p className="text-[14px] font-semibold text-[#c8c9d1]">
              {captionForRating(activeStar)}
            </p>
          )}
        </div>

        {submitted && (
          <p className="text-[13px] text-[#7fdba0] mt-3">
            Thanks for your feedback!
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full mt-6 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Submit
        </button>
      </div>
    </div>,
    document.body,
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion, ChevronRight, X, Construction } from "lucide-react";
import publicIcon from "/car-club-public-icon.png";
import privateIcon from "/car-club-private-icon.png";

/**
 * frontend/src/components/customer/CreateCarClubPage.jsx
 *
 * "What type of car club would you like to create?" — opened from
 * CarClubsPage.jsx's "Create your Cuvva car club" button (empty
 * state) or "+ Create car club" row (already-joined state). Matches
 * createcarclub1.jpeg exactly: back + help header, title + subtitle,
 * two option cards (Public — with a "Great for making money" pill
 * badge, and Private).
 *
 * Per instruction, the REAL club-creation flow isn't built yet —
 * tapping either "Public" or "Private" shows a "You can't create a
 * car club yet" info modal instead of proceeding, with a close
 * button. This keeps the screen visually complete and navigable
 * (matches the reference exactly) while being explicit that the
 * actual multi-step creation flow is a future pass, not silently
 * broken or faked.
 */
export default function CreateCarClubPage() {
  const navigate = useNavigate();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/car-clubs", { replace: true });
  };

  const handleOptionTap = () => {
    setShowComingSoonModal(true);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <MessageCircleQuestion size={18} className="text-white" />
        </button>
      </div>

      {/* Title */}
      <div className="px-4 pt-4">
        <h1 className="text-[22px] font-extrabold text-white leading-tight">
          What type of car club would you like to create?
        </h1>
        <p className="text-[14px] text-[#9497a1] mt-2">You can always change this later on.</p>
      </div>

      {/* Options */}
      <div className="px-4 pt-5 space-y-3">
        <button
          type="button"
          onClick={handleOptionTap}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#17181c] border border-white/5 text-left"
        >
          <img
            src={publicIcon}
            alt=""
            className="w-14 h-14 object-contain shrink-0"
            draggable={false}
          />
          <span className="flex-1 min-w-0">
            <span className="inline-block px-3 py-1 rounded-full bg-[#7c6bff]/20 text-[12px] font-semibold text-[#a897ff] mb-1.5">
              Great for making money
            </span>
            <span className="block text-[16px] font-bold text-white">Public</span>
            <span className="block text-[13px] text-[#9497a1] leading-relaxed mt-0.5">
              Let people who live in your local area find your club on Cuvva and ask to borrow your car.
            </span>
          </span>
          <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleOptionTap}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#17181c] border border-white/5 text-left"
        >
          <img
            src={privateIcon}
            alt=""
            className="w-14 h-14 object-contain shrink-0"
            draggable={false}
          />
          <span className="flex-1 min-w-0">
            <span className="block text-[16px] font-bold text-white">Private</span>
            <span className="block text-[13px] text-[#9497a1] leading-relaxed mt-0.5">
              Make your club invite only. Suggested for sharing your car with friends or family.
            </span>
          </span>
          <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
        </button>
      </div>

      {/* "You can't create a car club yet" modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowComingSoonModal(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative w-full max-w-[320px] bg-[#1b1c21] rounded-3xl px-6 pt-6 pb-6 text-center">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowComingSoonModal(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center -mt-1 -mr-1"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="flex justify-center -mt-2">
              <span className="w-14 h-14 rounded-full bg-[#7c6bff]/15 flex items-center justify-center">
                <Construction size={26} className="text-[#7c6bff]" />
              </span>
            </div>
            <h2 className="text-[18px] font-extrabold text-white mt-4">
              You can&rsquo;t create a car club yet
            </h2>
            <p className="text-[14px] text-[#9497a1] leading-relaxed mt-2">
              This part of car clubs is still being built. Check back soon to start sharing your car.
            </p>
            <button
              type="button"
              onClick={() => setShowComingSoonModal(false)}
              className="w-full mt-5 py-3.5 bg-[#242429] hover:bg-[#2c2c33] active:scale-[0.98] transition-all rounded-full text-[15px] font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

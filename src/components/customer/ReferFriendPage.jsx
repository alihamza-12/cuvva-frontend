import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import referIllustration from "/referillustration.png";

export default function ReferFriendPage() {
  const navigate = useNavigate();
  const [shareStatus, setShareStatus] = useState(null); 

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleHowReferralsWork = () => {
    console.log("How referrals work tapped — not wired up yet.");
  };

  const handleShareReferralLink = async () => {

    const referralUrl = "https://cuvva.example.com/refer/placeholder-code";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get £10 off your Cuvva insurance",
          text: "If you love Cuvva, tell your friends. You'll both get £10 off!",
          url: referralUrl,
        });
        setShareStatus("shared");
      } catch {

      }
      return;
    }

    try {
      await navigator.clipboard.writeText(referralUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }
  };

  return (
    <div className="flex flex-col text-white">

      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 pb-32 text-center">
        <h1 className="text-[22px] font-extrabold text-white leading-tight">
          Invite your friends to Cuvva
        </h1>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-3">
          If you love Cuvva, tell your friends. You'll both get £10 off when
          they use your link to buy their first ever policy. It's win-win.{" "}
          <button
            type="button"
            onClick={handleHowReferralsWork}
            className="font-bold text-[#7c6bff]"
          >
            How referrals work
          </button>
        </p>

        <img
          src={referIllustration}
          alt="Share your referral link with friends"
          className="w-[220px] h-auto object-contain mx-auto mt-10 select-none pointer-events-none"
          draggable={false}
        />

        <div className="mt-10 space-y-4 text-left max-w-[300px] mx-auto">
          <Step number="1" label="Invite your friends" />
          <Step number="2" label="They buy a policy" />
          <Step number="3" label="Both get £10 off 🎉" />
        </div>

        {shareStatus === "copied" && (
          <p className="text-[13px] text-[#7fdba0] mt-6">
            Referral link copied to clipboard.
          </p>
        )}
        {shareStatus === "failed" && (
          <p className="text-[13px] text-[#e05a5a] mt-6">
            Couldn't copy the link — try again.
          </p>
        )}
      </div>

      {/* Sticky footer — offset above CustomerBottomNav (bottom-24)
          rather than bottom-0, since this page now renders inside
          CustomerLayout (bottom nav visible) instead of full-screen. */}
      <div className="fixed z-40 bottom-24 left-4 right-4">
        <button
          type="button"
          onClick={handleShareReferralLink}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          Share a referral link
        </button>
      </div>
    </div>
  );
}

function Step({ number, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#7c6bff] flex items-center justify-center shrink-0">
        <span className="text-[14px] font-bold text-[#7c6bff]">{number}</span>
      </div>
      <span className="text-[15px] text-white">{label}</span>
    </div>
  );
}

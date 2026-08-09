import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { getAppliedDiscounts } from "../../utils/profileLocalStorage";
import referFriendImg from "/referillustration.png";

export default function YourDiscountsPage() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    setDiscounts(getAppliedDiscounts());
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleInviteFriends = () => {
    navigate("/customer/profile/refer");
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">

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

      <div className="flex-1 px-4 pt-4 pb-10">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Your discounts
        </h1>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-4">
          Here you can see all active, redeemed and expired discounts.
        </p>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-3">
          Want more? Just refer your friends. 🤝
        </p>

        {discounts.length === 0 ? (
          <p className="text-[13px] text-[#9497a1] mt-6">No active discounts</p>
        ) : (
          <div className="mt-6 space-y-2">
            {discounts.map((d, i) => (
              <div
                key={`${d.code}-${i}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#17181c] border border-white/5"
              >
                <span className="text-[14px] font-semibold text-white">{d.code}</span>
                <span className="text-[12px] text-[#9497a1]">
                  {new Date(d.appliedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-[#17181c] border border-white/5 p-4 relative overflow-hidden">
          <div className="max-w-[55%]">
            <p className="text-[16px] font-extrabold text-white leading-snug">
              Refer a friend and both get £10 off
            </p>
            <button
              type="button"
              onClick={handleInviteFriends}
              className="mt-3 px-5 py-2.5 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[14px] font-bold text-white"
            >
              Invite friends
            </button>
          </div>
          <img
            src={referFriendImg}
            alt=""
            className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-[46%] object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

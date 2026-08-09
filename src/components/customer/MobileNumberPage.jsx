import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, Check, Plus } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";

export default function MobileNumberPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const phone = data?.customer?.phone;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleNotWiredUp = (label) => {

    console.log(`${label} tapped — not wired up yet.`);
  };

  return (
    <div className="min-h-screen pb-10 text-white bg-black">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Your mobile number</h1>
        <button
          type="button"
onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="mt-2 border-b border-white/5" />

      <div className="px-4">
        <h2 className="text-[17px] font-extrabold text-white mt-5">
          Main mobile number
        </h2>
        <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
          We'll use this number in an emergency, or if we need to contact you
          for some other reason.
        </p>

        <button
          type="button"
          onClick={() => handleNotWiredUp("Edit main mobile number")}
          className="w-full flex items-center justify-between mt-4 py-3.5 border-b border-white/5"
        >
          <span className="text-[15px] text-white">{phone || "Not added yet"}</span>
          {phone && (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3ecf8e]">
              Verified
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </button>

        <h2 className="text-[17px] font-extrabold text-white mt-8">
          Also contact me on...
        </h2>
        <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
          You can add multiple mobile numbers in case you think we might not
          be able to contact you in an emergency.
        </p>

        <button
          type="button"
          onClick={() => navigate("/customer/profile/account/mobile/add")}
          className="w-full flex items-center justify-between mt-4 py-3.5 border-b border-white/5"
        >
          <span className="text-[15px] font-semibold text-[#7c6bff]">
            Add another mobile number
          </span>
          <span className="w-6 h-6 rounded-full bg-[#7c6bff] flex items-center justify-center shrink-0">
            <Plus size={14} className="text-white" strokeWidth={3} />
          </span>
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, Check, Plus } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";

export default function EmailAddressPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();

  const email = data?.customer?.email || "—";
  const additionalEmails = data?.customer?.additionalEmails || [];

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
  };

  return (
    <div className="text-white pb-10">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Your email address</h1>
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
          Main email
        </h2>
        <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
          We'll send your policy documents to this email address, and you can
          use it to sign in.
        </p>

        <button
          type="button"
          onClick={() => handleNotWiredUp("Edit main email")}
          className="w-full flex items-center justify-between mt-4 py-3.5 border-b border-white/5"
        >
          <span className="text-[15px] text-white">{email}</span>
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3ecf8e]">
            Verified
            <Check size={14} strokeWidth={3} />
          </span>
        </button>

        <h2 className="text-[17px] font-extrabold text-white mt-8">
          Your other email addresses
        </h2>
        <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
          You can sign in with these email addresses too.
        </p>

        {additionalEmails.length > 0 && (
          <div className="mt-2">
            {additionalEmails.map((addr, index) => (
              <div
                key={index}
                className="w-full flex items-center justify-between py-3.5 border-b border-white/5"
              >
                <span className="text-[15px] text-white">{addr}</span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/customer/profile/account/email/add")}
          className="w-full flex items-center justify-between mt-4 py-3.5 border-b border-white/5"
        >
          <span className="text-[15px] font-semibold text-[#7c6bff]">
            Add another email address
          </span>
          <span className="w-6 h-6 rounded-full bg-[#7c6bff] flex items-center justify-center shrink-0">
            <Plus size={14} className="text-white" strokeWidth={3} />
          </span>
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, Check, Plus } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/EmailAddressPage.jsx
 *
 * "Your email address" — opened from AccountDetailsPage.jsx's "Email"
 * row. Matches reference: header, "Main email" section showing the
 * real verified email with a green "Verified" checkmark, "Your other
 * email addresses" section listing any additional saved addresses,
 * plus an "Add another email address" row that now navigates to a
 * dedicated AddEmailPage.jsx (matching its own reference screenshot)
 * instead of a plain window.prompt().
 *
 * REAL DATA: customer.email and customer.additionalEmails from
 * GET /customers/me (same query already used elsewhere — RTK Query
 * dedupes it, no second network call). The "Verified" checkmark is a
 * static visual matching the reference — there's no real
 * `emailVerified` flag on User.js, so this is NOT based on actual
 * verification state. Flagged, not faked.
 *
 * Additional emails are stored in the database in the
 * `additionalEmails` array on the User model — added via
 * AddEmailPage.jsx's real backend call (useAddAdditionalEmailMutation).
 */
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
    <div className="min-h-screen bg-black text-white pb-10">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Your email address</h1>
        <button
          type="button"
          onClick={() => handleNotWiredUp("Help")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="border-b border-white/5 mt-2" />

      <div className="px-4">
        <h2 className="text-[17px] font-extrabold text-white mt-5">Main email</h2>
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

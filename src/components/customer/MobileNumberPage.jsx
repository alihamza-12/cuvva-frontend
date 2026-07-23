import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, Check, Plus } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/MobileNumberPage.jsx
 *
 * "Your mobile number" — opened from AccountDetailsPage.jsx's "Mobile
 * phone" row. Matches reference: header, "Main mobile number" section
 * showing the real phone with a green "Verified ✓" label, "Also
 * contact me on..." section with an "Add another mobile number" row.
 *
 * BACKEND GAP — User.js DOES have a `phone` field, but the
 * `/customers/me` route's current `.select(...)` list
 * ("fullName email role status expiresAt createdBy createdAt") does
 * NOT include `phone`, so `customer.phone` will be undefined until
 * that's fixed on the backend. Shows "Not added yet" instead of
 * fabricating a number when missing. The "Verified" label is a
 * static visual matching the reference — there's no real
 * `phoneVerified` flag on the schema.
 *
 * "Add another mobile number" navigates to AddMobileNumberPage.jsx,
 * which makes the real PATCH /customers/me call to save it (see that
 * file for the actual UK-mobile-format validation + backend wiring).
 */
export default function MobileNumberPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const phone = data?.customer?.phone;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleNotWiredUp = (label) => {
    // Was mangled to `console.log\`${label}...\`)` (missing opening
    // parenthesis) in a previous paste — fixed to a normal function
    // call, which would otherwise throw the moment this ran.
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
        <h1 className="text-[16px] font-bold text-white">Your mobile number</h1>
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

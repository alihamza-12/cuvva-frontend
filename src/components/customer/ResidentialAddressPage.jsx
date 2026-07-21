import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getResidentialAddress, saveResidentialAddress } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/ResidentialAddressPage.jsx
 *
 * "Residential address" — opened from AccountDetailsPage.jsx's
 * "Residential address" row. Matches reference: header (back only,
 * no help icon in this screenshot), title, 4 stacked pill inputs
 * (Address line 1, Address line 2 optional, City/town, Postcode),
 * sticky "Done" button.
 *
 * BACKEND GAP — User.js DOES have a real `address` object field
 * ({ line1, line2, city, county, postcode, country }), but there is
 * NO route exposing or editing it for a Customer: customers.js's only
 * PATCH route (`PATCH /:id`) is Super-Admin/Sub-Admin-only and only
 * accepts fullName/email/expiresAt/password — address isn't in that
 * accepted-fields list at all, and a Customer can't call that route
 * anyway (authorizeRoles excludes "Customer"). Saved 100% client-side
 * via localStorage (profileLocalStorage.js) until a real
 * PATCH /customers/me route supporting address is added.
 */
export default function ResidentialAddressPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
  });

  useEffect(() => {
    const existing = getResidentialAddress();
    if (existing) setForm((prev) => ({ ...prev, ...existing }));
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleDone = () => {
    // localStorage only — no backend route exposes address editing to
    // a Customer yet.
    saveResidentialAddress(form);
    handleBack();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Residential address
        </h1>

        <div className="mt-6 space-y-3">
          <FloatingPillInput
            label="Address line 1"
            value={form.line1}
            onChange={handleChange("line1")}
          />
          <FloatingPillInput
            label="Address line 2 (optional)"
            value={form.line2}
            onChange={handleChange("line2")}
          />
          <FloatingPillInput
            label="City / town"
            value={form.city}
            onChange={handleChange("city")}
          />
          <FloatingPillInput
            label="Postcode"
            value={form.postcode}
            onChange={handleChange("postcode")}
          />
        </div>
      </div>

      {/* Sticky footer — offset above CustomerBottomNav (bottom-24)
          rather than bottom-0, since this page now renders inside
          CustomerLayout (bottom nav visible) instead of full-screen. */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <button
          type="button"
          onClick={handleDone}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/**
 * Pill input with a small floating label above the value, matching
 * the reference's "Address line 1" (small grey label) + "293
 * Salisbury Avenue" (larger white value) stacked look.
 */
function FloatingPillInput({ label, value, onChange }) {
  return (
    <div className="w-full px-5 py-3 rounded-2xl bg-[#242429]">
      <span className="block text-[12px] text-[#8a8a92]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-white text-[16px] outline-none mt-0.5"
      />
    </div>
  );
}

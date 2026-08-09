import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getResidentialAddress, saveResidentialAddress } from "../../utils/profileLocalStorage";

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

    saveResidentialAddress(form);
    handleBack();
  };

  return (

    <div className="min-h-screen bg-black text-white pb-40">
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

      <div className="px-4 pt-4">
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

        <div className="mt-8">
          <button
            type="button"
            onClick={handleDone}
            className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

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

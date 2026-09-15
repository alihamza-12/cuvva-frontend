import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, Check, Plus } from "lucide-react";
import {
  useGetMyProfileQuery,
  useUpdatePhoneNumberMutation,
} from "../../app/api/profileApi";

export default function MobileNumberPage() {
  const navigate = useNavigate();
  const { data, refetch } = useGetMyProfileQuery();
  const phone = data?.customer?.phone;
  const additionalPhones = data?.customer?.additionalPhones || [];

  /*
   * The main number lives in MongoDB on the customer's own record — the same
   * value entered when the customer was created, and the one shown on the
   * policy certificate and emailed PDF. Editing here saves straight back to it.
   */
  const [editing, setEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updatePhoneNumber, { isLoading: isSaving }] =
    useUpdatePhoneNumberMutation();

  useEffect(() => {
    setPhoneInput(phone || "");
  }, [phone]);

  const handleSaveMain = async () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) {
      setErrorMessage("Enter your mobile number.");
      return;
    }

    setErrorMessage("");
    try {
      await updatePhoneNumber(trimmed).unwrap();
      await refetch();
      setEditing(false);
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "We couldn't save your number. Try again.",
      );
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
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

        {editing ? (
          <div className="mt-4">
            <input
              type="tel"
              inputMode="tel"
              value={phoneInput}
              onChange={(event) => setPhoneInput(event.target.value)}
              placeholder="07xxx xxxxxx"
              className="w-full px-5 py-3 rounded-2xl bg-[#242429] text-white text-[16px] outline-none"
            />
            {errorMessage && (
              <p className="mt-2 text-[13px] text-red-400">{errorMessage}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setPhoneInput(phone || "");
                  setErrorMessage("");
                }}
                className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 text-[15px] font-bold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMain}
                disabled={isSaving}
                className="flex-1 py-3 bg-[#7c6bff] hover:bg-[#6c5ae8] transition-all rounded-full text-[15px] font-bold text-white disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
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
        )}

        <h2 className="text-[17px] font-extrabold text-white mt-8">
          Also contact me on...
        </h2>
        <p className="text-[14px] text-[#9497a1] leading-relaxed mt-1.5">
          You can add multiple mobile numbers in case you think we might not
          be able to contact you in an emergency.
        </p>

        {additionalPhones.map((extraPhone) => (
          <div
            key={extraPhone}
            className="w-full flex items-center justify-between mt-4 py-3.5 border-b border-white/5"
          >
            <span className="text-[15px] text-white">{extraPhone}</span>
          </div>
        ))}

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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import {
  useGetMyProfileQuery,
  useUpdatePhoneNumberMutation,
} from "../../app/api/profileApi";

const UK_MOBILE_REGEX = /^(?:\+44\s?7|0044\s?7|07)\d{3}[\s-]?\d{6}$/;

export default function AddMobileNumberPage() {
  const navigate = useNavigate();
  const { refetch } = useGetMyProfileQuery();
  const [updatePhoneNumber, { isLoading: isSaving }] =
    useUpdatePhoneNumberMutation();

  const [phoneInput, setPhoneInput] = useState("");
  const [addedPhone, setAddedPhone] = useState("");
  const [status, setStatus] = useState(null); 
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedInput = phoneInput.trim();
  const isValidFormat = UK_MOBILE_REGEX.test(trimmedInput);
  const showFormatError = touched && trimmedInput.length > 0 && !isValidFormat;
  const canSubmit = isValidFormat && !isSaving;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account/mobile", { replace: true });
  };

  const handleHelp = () => {
    navigate("/customer/support");
  };

  const handleNext = async () => {
    const trimmed = phoneInput.trim();
    setTouched(true);

    if (!UK_MOBILE_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Enter a valid mobile number, like 075xx xxxxxx");
      return;
    }
    if (isSaving) return;

    setStatus(null);
    setErrorMessage("");

    try {
      await updatePhoneNumber(trimmed).unwrap();

      await refetch();
      setAddedPhone(trimmed);
      setPhoneInput("");
      setTouched(false);
      setStatus("success");
    } catch (error) {
      const message =
        error?.data?.message ||
        "Failed to add mobile number. Please try again.";
      setErrorMessage(message);
      setStatus("error");
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
          onClick={handleHelp}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <MessageCircleQuestion size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Add another mobile number
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          We'll use this number in an emergency, or if we need to contact you
          for some other reason.
        </p>

        <div className="mt-6">
          <input
            type="tel"
            placeholder="e.g. 075xx xxxxxx"
            value={phoneInput}
            onChange={(e) => {
              // Was mangled to `setPhoneInput([e.target](http://e.target).value)`
              // in a previous paste (markdown-link corruption) — fixed
              // to the plain e.target.value, which would otherwise
              // throw on every keystroke.
              setPhoneInput(e.target.value);
              setTouched(true);
              setStatus(null);
            }}
            onBlur={() => setTouched(true)}
            aria-invalid={showFormatError}
            className={`w-full px-5 py-4 rounded-full bg-[#242429] text-white placeholder:text-[#8a8a92] text-[15px] outline-none focus:ring-2 transition-shadow ${
              showFormatError
                ? "ring-2 ring-[#e05a5a]/60 focus:ring-[#e05a5a]/80"
                : "focus:ring-[#7c6bff]/50"
            }`}
          />
        </div>

        {/* Persistent format hint, shown whenever there's no error to
            display instead — so the expected format is visible even
            before the user starts typing, not just after a mistake. */}
        {!showFormatError && (
          <p className="text-[13px] text-[#8a8a92] mt-3">
            Mobile numbers only, e.g. 075xxx xxxxxx or +44 75xx xxxxxx
          </p>
        )}

        {showFormatError && (
          <p className="text-[13px] text-[#e05a5a] mt-3">
            Enter a valid UK mobile number, like 075xx xxxxxx
          </p>
        )}

        {status === "success" && (
          <p className="text-[13px] text-[#7fdba0] mt-4">
            Mobile number added successfully.
          </p>
        )}
        {status === "error" && (
          <p className="text-[13px] text-[#e05a5a] mt-4">{errorMessage}</p>
        )}

        {addedPhone && (
          <div className="mt-3">
            <span className="block text-[12px] text-[#8a8a92] px-1 mb-1.5">
              Added mobile number
            </span>
            <input
              type="tel"
              value={addedPhone}
              disabled
              readOnly
              className="w-full px-5 py-4 rounded-full bg-[#1a1a1e] text-[#8a8a92] text-[15px] outline-none cursor-not-allowed"
            />
          </div>
        )}
      </div>

      <div className="fixed z-40 bottom-24 left-4 right-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-full text-[16px] font-bold text-white transition-all shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
            canSubmit
              ? "bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98]"
              : "bg-[#3a3567] cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import {
  useGetMyProfileQuery,
  useAddAdditionalEmailMutation,
} from "../../app/api/profileApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AddEmailPage() {
  const navigate = useNavigate();
  const { refetch } = useGetMyProfileQuery();
  const [addAdditionalEmail, { isLoading: isAdding }] =
    useAddAdditionalEmailMutation();

  const [emailInput, setEmailInput] = useState("");
  const [addedEmail, setAddedEmail] = useState("");
  const [status, setStatus] = useState(null); 
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedInput = emailInput.trim();
  const isValidFormat = EMAIL_REGEX.test(trimmedInput);
  const showFormatError = touched && trimmedInput.length > 0 && !isValidFormat;
  const canSubmit = isValidFormat && !isAdding;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account/email", { replace: true });
  };

  const handleHelp = () => {
    navigate("/customer/support");
  };

  const handleNext = async () => {
    const trimmed = emailInput.trim();
    setTouched(true);

    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Enter a valid email address, like name@example.com");
      return;
    }
    if (isAdding) return;

    setStatus(null);
    setErrorMessage("");

    try {
      await addAdditionalEmail(trimmed).unwrap();

      await refetch();
      setAddedEmail(trimmed);
      setEmailInput("");
      setTouched(false);
      setStatus("success");
    } catch (error) {
      const message =
        error?.data?.message || "Failed to add email. Please try again.";
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
          Add another email address
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          We will send you a six digit number to verify it's yours
        </p>

        <div className="mt-6">
          <input
            type="email"
            placeholder="Enter your email address"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
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

        {/* Live format-validation error — separate from the
            backend/status error below, shown as soon as the user has
            typed something that isn't a valid email shape yet. */}
        {showFormatError && (
          <p className="text-[13px] text-[#e05a5a] mt-3">
            Enter a valid email address, like name@example.com
          </p>
        )}

        {status === "success" && (
          <p className="text-[13px] text-[#7fdba0] mt-4">
            Email added successfully.
          </p>
        )}
        {status === "error" && (
          <p className="text-[13px] text-[#e05a5a] mt-4">{errorMessage}</p>
        )}

        {addedEmail && (
          <div className="mt-3">
            <span className="block text-[12px] text-[#8a8a92] px-1 mb-1.5">
              Added email
            </span>
            <input
              type="email"
              value={addedEmail}
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
          {isAdding ? "Adding..." : "Next"}
        </button>
      </div>
    </div>
  );
}
